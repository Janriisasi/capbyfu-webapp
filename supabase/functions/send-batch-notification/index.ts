// @ts-ignore: Deno environments support HTTPS imports directly
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore: Deno environments support HTTPS imports directly
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @ts-ignore: Deno supports npm specifiers
import nodemailer from "npm:nodemailer@6.9.13";

const ADMIN_EMAILS = [
  "cdfalco@up.edu.ph",
  "xmartin@usa.edu.ph",
  "jetheljoyruto@gmail.com",
  "baskogcapbyfupage@gmail.com",
  "janreylecita@gmail.com"
];

serve(async (req: Request) => {
  try {
    const supabaseClient = createClient(
      // @ts-ignore: Deno is a global available in Supabase Edge Functions
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore: Deno is a global available in Supabase Edge Functions
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate time frame (e.g., last 24 hours) for the "recent updates"
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Fetch newly registered delegates in the last 24h
    const { data: newDelegates, error: delegatesError } = await supabaseClient
      .from("delegates")
      .select("id, payment_status, created_at, church_id, churches!inner(name, circuit)")
      .gte("created_at", oneDayAgo);

    if (delegatesError) throw delegatesError;

    // 2. Aggregate information
    const totalNew = newDelegates.length;
    const paidNew = newDelegates.filter((d: any) => d.payment_status === "Paid").length;
    
    // Group by church
    const churchCounts: Record<string, number> = {};
    const visitingChurches = new Set<string>();

    newDelegates.forEach((d: any) => {
      const churchName = d.churches?.name || "Unknown";
      if (!churchCounts[churchName]) {
        churchCounts[churchName] = 0;
      }
      churchCounts[churchName]++;
      
      if (d.churches?.circuit === "Visiting") {
        visitingChurches.add(churchName);
      }
    });

    // 3. Compose HTML Email
    const dateStr = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

    const churchRows = Object.entries(churchCounts).length > 0
      ? Object.entries(churchCounts)
          .map(([name, count], i) => `
            <tr${i % 2 === 0 ? ' style="background:#F1F1F1;"' : ''}>
              <td style="padding:10px 12px;color:#010101;">${name}</td>
              <td style="padding:10px 12px;text-align:right;font-weight:600;color:#0A1614;">${count}</td>
            </tr>`)
          .join("")
      : `<tr><td colspan="2" style="padding:10px 12px;color:#C5C5C5;">No new delegates registered.</td></tr>`;

    const visitingTags = visitingChurches.size > 0
      ? Array.from(visitingChurches)
          .map(name => `<span style="background:#F1F1F1;color:#0A1614;font-size:13px;padding:5px 12px;border-radius:20px;font-weight:500;">${name}</span>`)
          .join(" ")
      : `<p style="font-size:14px;color:#C5C5C5;margin:0;">No visiting churches in the last 24 hours.</p>`;

    let html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Manrope',Arial,sans-serif;">

      <div style="background:#0A1614;border-radius:12px 12px 0 0;padding:28px 32px 24px;text-align:center;">
        <p style="color:#C5C5C5;font-size:12px;font-weight:600;letter-spacing:1.5px;margin:0 0 6px;text-transform:uppercase;">CapBYFU Camp Registration</p>
        <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 4px;">Daily Admin Summary</h1>
        <p style="color:#C5C5C5;font-size:13px;margin:0;">Last 24 hours &nbsp;·&nbsp; ${dateStr}</p>
      </div>

      <div style="background:#ffffff;border:1px solid #d9d9d9;padding:28px 32px;">
        <p style="font-size:14px;color:#555;margin:0 0 24px;">Here's your registration snapshot for the past 24 hours. Review pending delegates or check financials from the dashboard.</p>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px;">
          <div style="background:#F1F1F1;border-radius:10px;padding:16px;text-align:center;">
            <p style="font-size:11px;color:#555;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 6px;">New Delegates</p>
            <p style="font-size:28px;font-weight:700;color:#0A1614;margin:0;">${totalNew}</p>
          </div>
          <div style="background:#f0faf4;border-radius:10px;padding:16px;text-align:center;">
            <p style="font-size:11px;color:#2e7d51;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 6px;">Paid</p>
            <p style="font-size:28px;font-weight:700;color:#1b5c35;margin:0;">${paidNew}</p>
          </div>
          <div style="background:#fff8f0;border-radius:10px;padding:16px;text-align:center;">
            <p style="font-size:11px;color:#b06020;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 6px;">Pending</p>
            <p style="font-size:28px;font-weight:700;color:#8a3e0c;margin:0;">${totalNew - paidNew}</p>
          </div>
        </div>

        <h3 style="font-size:13px;font-weight:700;color:#010101;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid #eee;">Breakdown by Church</h3>
        <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:24px;">
          ${churchRows}
        </table>

        <h3 style="font-size:13px;font-weight:700;color:#010101;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid #eee;">Visiting Churches</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;">
          ${visitingTags}
        </div>

        <a href="https://capbyfu.vercel.app/admin?access_key=capbyfu@admin2026"
           style="display:block;background:#0A1614;color:#ffffff;text-align:center;text-decoration:none;padding:14px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:8px;">
          Go to Admin Dashboard →
        </a>
        <p style="font-size:12px;color:#aaa;text-align:center;margin:12px 0 0;">
          or copy: https://capbyfu.vercel.app/admin?access_key=capbyfu@admin2026
        </p>
      </div>

      <div style="background:#F1F1F1;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;border:1px solid #d9d9d9;border-top:none;">
        <p style="font-size:12px;color:#aaa;margin:0;">Automated notification · Sent 3× daily via Supabase cron</p>
      </div>

    </div>
    `;

    // @ts-ignore: Deno is a global available in Supabase Edge Functions
    const gmailUser = Deno.env.get("GMAIL_USER");
    // @ts-ignore: Deno is a global available in Supabase Edge Functions
    const gmailPass = Deno.env.get("GMAIL_PASS");

    if (!gmailUser || !gmailPass) {
      console.warn("GMAIL_USER or GMAIL_PASS is not set. Simulating email send.");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email simulated (No Gmail credentials provided)"
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Connect securely using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,       // Secure port
      secure: true,    // Use TLS
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"CapBYFU Alerts" <${gmailUser}>`,
      to: ADMIN_EMAILS.join(", "),
      subject: "Camp Registration - Daily Updates",
      html: html,
    });

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
