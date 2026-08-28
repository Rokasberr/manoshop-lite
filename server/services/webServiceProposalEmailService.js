const {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
  normalizeEmailTransportError,
} = require("../utils/emailTransport");
const {
  isBrevoEmailConfigured,
  sendBrevoTransactionalEmail,
} = require("../utils/brevoEmail");

const WEB_ORDERS_FROM_EMAIL =
  process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value) =>
  `${new Intl.NumberFormat("lt-LT", { maximumFractionDigits: 2 }).format(Number(value || 0))} €`;

const buildProposalEmail = ({ request, proposalUrl }) => {
  const subject = `Stilloak Web pasiūlymas — ${request.requestNumber}`;
  const price = formatPrice(request.proposalPrice);
  const deposit = formatPrice(request.depositAmount);
  const expiresAt = request.proposalExpiresAt
    ? new Date(request.proposalExpiresAt).toLocaleDateString("lt-LT")
    : "";

  const text = [
    `Sveiki, ${request.name},`,
    "",
    "Paruošėme jūsų svetainės projekto komercinį pasiūlymą.",
    `Projektas: ${request.packageName}`,
    `Kaina: ${price}`,
    `Pradinis avansas (${request.depositPercent}%): ${deposit}`,
    expiresAt ? `Pasiūlymas galioja iki: ${expiresAt}` : null,
    "",
    request.proposalSummary || null,
    "",
    `Peržiūrėti ir patvirtinti pasiūlymą: ${proposalUrl}`,
    "",
    "Stilloak Web",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="margin:0;padding:24px;background:#f7f5f2;font-family:Arial,sans-serif;color:#201d19;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:18px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#806b50;">Stilloak Web</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;">Jūsų projekto pasiūlymas</h1>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#655b50;">Sveiki, ${escapeHtml(request.name)}. Paruošėme jūsų svetainės projekto komercinį pasiūlymą.</p>
        <div style="margin:0 0 22px;padding:18px;border-radius:14px;background:#f7f5f2;">
          <p style="margin:0 0 8px;"><strong>Užklausa:</strong> ${escapeHtml(request.requestNumber)}</p>
          <p style="margin:0 0 8px;"><strong>Projektas:</strong> ${escapeHtml(request.packageName)}</p>
          <p style="margin:0 0 8px;"><strong>Kaina:</strong> ${escapeHtml(price)}</p>
          <p style="margin:0${expiresAt ? " 0 8px" : ""};"><strong>Pradinis avansas (${escapeHtml(request.depositPercent)}%):</strong> ${escapeHtml(deposit)}</p>
          ${expiresAt ? `<p style="margin:0;"><strong>Galioja iki:</strong> ${escapeHtml(expiresAt)}</p>` : ""}
        </div>
        ${request.proposalSummary ? `<p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#655b50;">${escapeHtml(request.proposalSummary)}</p>` : ""}
        <a href="${escapeHtml(proposalUrl)}" style="display:inline-block;padding:13px 20px;border-radius:12px;background:#201d19;color:#fff;text-decoration:none;font-weight:700;">Peržiūrėti ir patvirtinti</a>
        <p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#8a8177;">Nuoroda skirta tik šiam pasiūlymui. Nepersiųskite jos tretiesiems asmenims.</p>
      </div>
    </div>
  `;

  return { subject, text, html };
};

const sendWebServiceProposalEmail = async ({ request, proposalUrl }) => {
  const email = buildProposalEmail({ request, proposalUrl });

  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({
      to: request.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
      tags: ["web-orders", "proposal"],
      senderOverride: WEB_ORDERS_FROM_EMAIL,
    });
    return { sent: true, provider: "brevo-api", messageId: result?.messageId || null };
  }

  if (!isEmailTransportConfigured()) {
    return { sent: false, skipped: true, reason: "email-not-configured" };
  }

  const { from } = getTransportConfig();
  const transport = getEmailTransport();

  try {
    const info = await transport.sendMail({
      from: WEB_ORDERS_FROM_EMAIL || from,
      to: request.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    return { sent: true, provider: "smtp", messageId: info?.messageId || null };
  } catch (error) {
    if (typeof transport.close === "function") transport.close();
    throw normalizeEmailTransportError(error);
  }
};

module.exports = {
  buildProposalEmail,
  sendWebServiceProposalEmail,
};
