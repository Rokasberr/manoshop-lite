const { getEmailTransport, getTransportConfig, isEmailTransportConfigured, normalizeEmailTransportError } = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");

const FROM = process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";
const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const money = (value) => `${new Intl.NumberFormat("lt-LT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))} €`;

const buildFinalPaymentEmail = ({ request, proposalUrl }) => {
  const subject = `Likusios projekto sumos apmokėjimas — ${request.requestNumber}`;
  const amount = money(request.finalPaymentAmount);
  const text = `Sveiki, ${request.name},\n\nProjektas paruoštas galutiniam atsiskaitymui. Likutis: ${amount}.\n\nApmokėti saugiai per Stripe: ${proposalUrl}\n\nStilloak Web`;
  const html = `<div style="margin:0;padding:24px;background:#f7f5f2;font-family:Arial,sans-serif;color:#201d19"><div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e8e2da;border-radius:18px;padding:32px"><p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#806b50">Stilloak Web</p><h1>Galutinis projekto apmokėjimas</h1><p>Sveiki, ${escapeHtml(request.name)}. Projektas paruoštas galutiniam atsiskaitymui.</p><p style="padding:18px;background:#f7f5f2;border-radius:14px"><strong>Likutis: ${escapeHtml(amount)}</strong></p><a href="${escapeHtml(proposalUrl)}" style="display:inline-block;padding:13px 20px;border-radius:12px;background:#201d19;color:#fff;text-decoration:none;font-weight:700">Apmokėti per Stripe</a><p style="font-size:12px;color:#8a8177">Tai nauja privati nuoroda. Ankstesnė pasiūlymo nuoroda nebegalioja.</p></div></div>`;
  return { subject, text, html };
};

const sendWebServiceFinalPaymentEmail = async ({ request, proposalUrl }) => {
  const email = buildFinalPaymentEmail({ request, proposalUrl });
  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({ to: request.email, ...email, tags: ["web-orders", "final-payment"], senderOverride: FROM });
    return { sent: true, provider: "brevo-api", messageId: result?.messageId || null };
  }
  if (!isEmailTransportConfigured()) return { sent: false, skipped: true, reason: "email-not-configured" };
  const { from } = getTransportConfig();
  const transport = getEmailTransport();
  try {
    const info = await transport.sendMail({ from: FROM || from, to: request.email, ...email });
    return { sent: true, provider: "smtp", messageId: info?.messageId || null };
  } catch (error) {
    if (typeof transport.close === "function") transport.close();
    throw normalizeEmailTransportError(error);
  }
};

module.exports = { buildFinalPaymentEmail, sendWebServiceFinalPaymentEmail };
