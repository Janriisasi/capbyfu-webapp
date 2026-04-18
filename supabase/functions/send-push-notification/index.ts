// supabase/functions/send-push-notification/index.ts
// Deploy with: npx supabase functions deploy send-push-notification
//
// Set these secrets via Supabase dashboard or CLI:
//   npx supabase secrets set FIREBASE_PROJECT_ID=your-project-id
//   npx supabase secrets set FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// ─── Google OAuth2 token via service account (no Firebase Admin SDK needed) ──
async function getGoogleAccessToken(serviceAccount: Record<string, string>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Create JWT header + payload
  const header = { alg: "RS256", typ: "JWT" };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Import private key
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

  // Sign
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = `${signingInput}.${sigB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

// @ts-ignore
serve(async (req: Request) => {
  // ── CORS ──
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const { title, body, url, image_url } = await req.json();

    // ── Init Supabase to fetch subscriber tokens ───────────────────────────
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
      return new Response(JSON.stringify({ sent: 0, message: "No subscribers" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Get Firebase access token ──────────────────────────────────────────
    // @ts-ignore
    const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY")!);
    // @ts-ignore
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;
    const accessToken = await getGoogleAccessToken(serviceAccount);

    // ── Send to each token via FCM HTTP v1 API ─────────────────────────────
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const results = await Promise.allSettled(
      subscribers.map(async ({ fcm_token }: any) => {
        const message: Record<string, unknown> = {
          token: fcm_token,
          notification: { title, body },
          webpush: {
            notification: {
              title,
              body,
              icon: "/assets/logo.png",
              badge: "/assets/logo.png",
              ...(image_url ? { image: image_url } : {}),
            },
            fcm_options: {
              link: url || "/announcements",
            },
          },
          data: {
            url: url || "/announcements",
            ...(image_url ? { image_url } : {}),
          },
        };

        const res = await fetch(fcmUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ message }),
        });

        if (!res.ok) {
          const errData = await res.json();
          // Remove invalid/expired tokens from DB
          if (
            errData?.error?.details?.some((d: { errorCode: string }) =>
              ["UNREGISTERED", "INVALID_ARGUMENT"].includes(d.errorCode)
            )
          ) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("fcm_token", fcm_token);
          }
          throw new Error(errData?.error?.message || "FCM send failed");
        }

        return res.json();
      })
    );

    const sent = results.filter((r: any) => r.status === "fulfilled").length;
    const failed = results.filter((r: any) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ sent, failed, total: subscribers.length }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    console.error("send-push-notification error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});