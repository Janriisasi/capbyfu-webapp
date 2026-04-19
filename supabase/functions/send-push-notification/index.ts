// supabase/functions/send-push-notification/index.ts
// Deploy with: npx supabase functions deploy send-push-notification

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Google OAuth2 token via service account ──────────────────────────────────
async function getGoogleAccessToken(serviceAccount: Record<string, string>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const header = { alg: "RS256", typ: "JWT" };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const signingInput = `${encode(header)}.${encode(payload)}`;

  const pemKey = serviceAccount.private_key.replace(/\\n/g, "\n");
  const binaryKey = Uint8Array.from(
    atob(pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "")),
    (c) => c.charCodeAt(0)
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = `${signingInput}.${sigB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.error("[FCM] Failed to get access token:", JSON.stringify(tokenData));
    throw new Error("Failed to get Google access token");
  }

  console.log("[FCM] Got access token successfully");
  return tokenData.access_token;
}

// @ts-ignore
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, url, image_url } = await req.json();
    console.log("[FCM] Sending notification:", { title, body, url });

    const supabase = createClient(
      // @ts-ignore
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subscribers, error: dbError } = await supabase
      .from("push_subscriptions")
      .select("fcm_token");

    if (dbError) throw dbError;
    if (!subscribers || subscribers.length === 0) {
      console.log("[FCM] No subscribers found");
      return new Response(JSON.stringify({ sent: 0, message: "No subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[FCM] Found ${subscribers.length} subscriber(s)`);

    // @ts-ignore
    const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY")!);
    // @ts-ignore
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;
    const accessToken = await getGoogleAccessToken(serviceAccount);

    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    // ── Full absolute URL is required for webpush link ─────────────────────
    const appOrigin = "https://capbyfu.vercel.app";
    const notifLink = url?.startsWith("http") ? url : `${appOrigin}${url || "/announcements"}`;

    const results = await Promise.allSettled(
      subscribers.map(async ({ fcm_token }: any) => {
        const message: Record<string, unknown> = {
          token: fcm_token,
          // ── Top-level notification (required for background delivery) ────
          notification: {
            title,
            body,
          },
          // ── Webpush-specific config for Chrome on Android ────────────────
          webpush: {
            headers: {
              Urgency: "high",
            },
            notification: {
              title,
              body,
              icon: `${appOrigin}/favicon.svg`,
              badge: `${appOrigin}/favicon.svg`,
              requireInteraction: false,
              ...(image_url ? { image: image_url } : {}),
            },
            fcm_options: {
              link: notifLink,
            },
          },
          // ── Data payload for SW to use on click ──────────────────────────
          data: {
            url: notifLink,
            ...(image_url ? { image_url } : {}),
          },
        };

        console.log(`[FCM] Sending to token: ${fcm_token.substring(0, 20)}...`);

        const res = await fetch(fcmUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ message }),
        });

        const responseData = await res.json();

        if (!res.ok) {
          console.error(`[FCM] Send failed for token ${fcm_token.substring(0, 20)}:`, JSON.stringify(responseData));

          // Clean up invalid tokens
          if (
            responseData?.error?.details?.some((d: { errorCode: string }) =>
              ["UNREGISTERED", "INVALID_ARGUMENT"].includes(d.errorCode)
            )
          ) {
            console.log(`[FCM] Removing stale token: ${fcm_token.substring(0, 20)}...`);
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("fcm_token", fcm_token);
          }
          throw new Error(JSON.stringify(responseData?.error) || "FCM send failed");
        }

        console.log(`[FCM] Success for token ${fcm_token.substring(0, 20)}:`, JSON.stringify(responseData));
        return responseData;
      })
    );

    const sent = results.filter((r: any) => r.status === "fulfilled").length;
    const failed = results.filter((r: any) => r.status === "rejected").length;
    const errors = results
      .filter((r: any) => r.status === "rejected")
      .map((r: any) => r.reason?.message);

    console.log(`[FCM] Done — sent: ${sent}, failed: ${failed}`);
    if (errors.length > 0) console.error("[FCM] Errors:", errors);

    return new Response(
      JSON.stringify({ sent, failed, total: subscribers.length, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[FCM] Fatal error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});