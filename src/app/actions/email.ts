"use server";

import nodemailer from "nodemailer";

export async function sendStaleKeywordsEmail(params: {
  articles: any[];
  toEmail?: string;
  customMessage?: string;
}) {
  const { articles, toEmail, customMessage } = params;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn(
      "SMTP_USER or SMTP_PASS is not defined in environment variables.",
    );
    return {
      success: false,
      message:
        "SMTP authentication credentials missing in environment configuration.",
    };
  }

  // Construct a premium HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Stale Strategy Briefs Alert</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          }
          .header {
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .logo {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.05em;
            margin-bottom: 4px;
          }
          .subtitle {
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.15em;
          }
          .title {
            font-size: 18px;
            font-weight: 800;
            color: #e11d48;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .desc {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 24px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            background-color: #fff;
          }
          .card-title {
            font-size: 14px;
            font-weight: 750;
            color: #0f172a;
            margin: 0 0 8px 0;
          }
          .meta-row {
            margin-bottom: 12px;
          }
          .badge {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 6px;
            text-transform: uppercase;
            display: inline-block;
            margin-right: 6px;
            margin-bottom: 6px;
          }
          .badge-job {
            background-color: #f1f5f9;
            color: #475569;
            font-family: monospace;
          }
          .badge-priority {
            background-color: #eff6ff;
            color: #1d4ed8;
          }
          .badge-volume {
            background-color: #fffbeb;
            color: #b45309;
          }
          .badge-overdue {
            background-color: #fff1f2;
            color: #e11d48;
          }
          .btn-action {
            display: inline-block;
            background-color: #0f172a;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 8px 16px;
            border-radius: 8px;
            margin-top: 8px;
          }
          .footer {
            margin-top: 32px;
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Posthinks</div>
            <div class="subtitle">Content Strategy Engine</div>
          </div>
          
          <div class="title">⚠️ Overdue Strategy Briefs ASAP</div>
          <div class="desc">
            The following content strategy keyword briefs are pending review and require immediate strategic approval to unblock the editorial writing cycle:
          </div>

          ${
            customMessage
              ? `
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Remarks from Administrator</h4>
              <p style="margin: 0; font-size: 13px; color: #78350f; font-style: italic; white-space: pre-wrap;">${customMessage}</p>
            </div>
          `
              : ""
          }

          ${articles
            .map((art) => {
              const priority = art.product_priority?.name || "General";
              const volume = art.demand
                ? `${art.demand.toLocaleString("id-ID")} Vol`
                : "0 Vol";
              const createdDate = new Date(art.created_at);
              const diffTime = Math.abs(Date.now() - createdDate.getTime());
              const daysPending = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              const editUrl = `http://localhost:3000/seo-keyword/edit/${art.id}`;

              return `
                <div class="card">
                  <h4 class="card-title">${art.title || "Untitled Strategy Brief"}</h4>
                  <div class="meta-row">
                    <span class="badge badge-job">${art.job_code || "—"}</span>
                    <span class="badge badge-priority">${priority}</span>
                    <span class="badge badge-volume">🔥 ${volume}</span>
                    <span class="badge badge-overdue">⚠️ Overdue (${daysPending}d)</span>
                  </div>
                  <a href="${editUrl}" class="btn-action">Open Sandbox Brief</a>
                </div>
              `;
            })
            .join("")}
            
          <div class="footer">
            This is an automated notification from the Posthinks CMS Portal.<br>
            Please do not reply directly to this email.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const devEmails = process.env.STALE_ALERTS_EMAIL_DEV || "";
    const prodEmails = process.env.STALE_ALERTS_EMAIL_PROD || "";

    const destination: string[] = devEmails
      ? devEmails.split(",").map((e) => e.trim())
      : [];

    if (process.env.NODE_ENV === "production" && prodEmails) {
      const prodList = prodEmails.split(",").map((e) => e.trim());
      destination.push(...prodList);
    }

    await transporter.sendMail({
      from: `"Posthinks Alerts" <${smtpUser}>`,
      to: destination.join(", "),
      subject: `🚨 Action Required: ${articles.length} Stale Strategy Briefs Pending`,
      html: htmlContent,
    });

    return { success: true, message: "Alerts dispatched successfully!" };
  } catch (err: any) {
    console.error("Failed sending SMTP email action:", err);
    return {
      success: false,
      message: err.message || "Failed to dispatch emails.",
    };
  }
}

export async function sendOTPEmail(params: { email: string; code: string }) {
  const { email, code } = params;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn(
      "SMTP_USER or SMTP_PASS is not defined in environment variables.",
    );
    return {
      success: false,
      message:
        "SMTP authentication credentials missing in environment configuration.",
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>CMS Posthinks 2FA Verification</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          }
          .header {
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 16px;
            margin-bottom: 24px;
            text-align: center;
          }
          .logo {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.04em;
          }
          .logo span {
            color: #ff6b00;
          }
          .title {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
            text-align: center;
          }
          .desc {
            font-size: 13px;
            color: #64748b;
            text-align: center;
            margin-bottom: 28px;
          }
          .otp-box {
            background-color: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            letter-spacing: 0.25em;
            color: #0f172a;
            margin-bottom: 28px;
          }
          .warning {
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
            line-height: 1.4;
          }
          .footer {
            margin-top: 32px;
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CMS Posthinks<span>.</span></div>
          </div>
          
          <div class="title">Secure 2FA Login Verification</div>
          <div class="desc">
            To finalize your admin dashboard sign-in, please input the following 6-digit verification code:
          </div>

          <div class="otp-box">${code}</div>

          <p class="warning">
            This verification code is confidential and will expire in 5 minutes. If you did not request this login attempt, please secure your credentials immediately.
          </p>
            
          <div class="footer">
            Posthinks CMS Security Portal<br>
            Please do not reply directly to this email.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"Posthinks Security" <${smtpUser}>`,
      to: email,
      subject: `🗝️ ${code} is your Posthinks verification code`,
      html: htmlContent,
    });

    return { success: true, message: "OTP code dispatched!" };
  } catch (err: any) {
    console.error("Failed sending OTP email:", err);
    return {
      success: false,
      message: err.message || "Failed to dispatch OTP code.",
    };
  }
}
