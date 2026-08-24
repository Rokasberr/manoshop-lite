const {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
  normalizeEmailTransportError,
} = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");

const COMPANY_NAME = process.env.COMPANY_NAME?.trim() || "Stilloak Studio";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildVerificationEmail = ({ verificationUrl, userName, ttlHours = 24 }) => {
  const safeUrl = escapeHtml(verificationUrl);
  const greetingName = escapeHtml(userName?.trim() || "nary");
  const safeHours = Number.isFinite(Number(ttlHours)) ? Number(ttlHours) : 24;
  const subject = `${COMPANY_NAME}: patvirtink el. pašto adresą`;
  const text = [
    COMPANY_NAME,
    "",
    `Sveiki, ${userName?.trim() || "nary"},`,
    "",
    "Patvirtinkite Stilloak Studio paskyros el. pašto adresą.",
    `Nuoroda galioja ${safeHours} val. ir gali būti panaudota tik vieną kartą:`,
    verificationUrl,
    "",
    "Jei registracijos neatlikote, galite ignoruoti šį laišką.",
  ].join("\n");
  const html = `
    <div style="margin:0;padding:24px;background:#f8f4ee;font-family:Arial,sans-serif;color:#2b241d;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #ece3d7;border-radius:18px;padding:32px;">
        <p style="margin:0 0 12px 0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#8a6c46;">El. pašto patvirtinimas</p>
        <h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.2;">Sveiki, ${greetingName}.</h1>
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#6d5c4c;">
          Patvirtinkite Stilloak Studio paskyros el. pašto adresą. Nuoroda galioja ${safeHours} val. ir gali būti panaudota tik vieną kartą.
        </p>
        <p style="margin:0 0 22px 0;">
          <a href="${safeUrl}" style="display:inline-block;border-radius:999px;background:#2b241d;color:#ffffff;text-decoration:none;padding:12px 18px;font-weight:700;">
            Patvirtinti el. paštą
          </a>
        </p>
        <p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#6d5c4c;">
          Jei mygtukas neveikia, nukopijuokite šią nuorodą į naršyklę:<br />
          <a href="${safeUrl}" style="color:#8a6c46;word-break:break-all;">${safeUrl}</a>
        </p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6d5c4c;">
          Jei registracijos neatlikote, galite ignoruoti šį laišką.
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
};

const sendVerificationThroughSmtp = async ({ to, email }) => {
  const { from, socketTimeout = 15000 } = getTransportConfig();
  const transport = getEmailTransport();
  const maxWaitMs = Math.max(socketTimeout, 15000);
  let timeoutId = null;

  try {
    await Promise.race([
      transport.sendMail({
        from,
        to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error("SMTP timeout");
          error.statusCode = 504;
          reject(error);
        }, maxWaitMs);
      }),
    ]);
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (typeof transport.close === "function") {
      transport.close();
    }
    throw normalizeEmailTransportError(error);
  }

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  return { sent: true, provider: "smtp" };
};

const sendEmailVerificationEmail = async ({ to, verificationUrl, userName, ttlHours }) => {
  const email = buildVerificationEmail({ verificationUrl, userName, ttlHours });

  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({
      to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      tags: ["auth", "email-verification"],
    });
    return { sent: true, provider: "brevo-api", messageId: result?.messageId || null };
  }

  if (!isEmailTransportConfigured()) {
    return { sent: false, skipped: true, reason: "email-not-configured" };
  }

  return sendVerificationThroughSmtp({ to, email });
};

module.exports = {
  buildVerificationEmail,
  sendEmailVerificationEmail,
};
