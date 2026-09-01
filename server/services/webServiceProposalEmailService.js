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
const { buildWebServiceEmail } = require("./webServiceEmailTemplate");

const WEB_ORDERS_FROM_EMAIL =
  process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";

const formatPrice = (value) =>
  `${new Intl.NumberFormat("lt-LT", { maximumFractionDigits: 2 }).format(Number(value || 0))} €`;

const buildProposalEmail = ({ request, proposalUrl }) => {
  const subject = `Stilloak Web pasiūlymas — ${request.requestNumber}`;
  const price = formatPrice(request.proposalPrice);
  const splitDeposit = formatPrice(Number(request.proposalPrice || 0) * Number(request.splitPaymentPercent || 50) / 100);
  const expiresAt = request.proposalExpiresAt
    ? new Date(request.proposalExpiresAt).toLocaleDateString("lt-LT")
    : "";

  const text = [
    `Sveiki, ${request.name},`,
    "",
    "Paruošėme jūsų svetainės projekto komercinį pasiūlymą.",
    `Projektas: ${request.packageName}`,
    `Kaina: ${price}`,
    `Pagrindinis variantas: visa suma iškart – ${price}`,
    `Alternatyva: ${request.splitPaymentPercent || 50}% avansas – ${splitDeposit}, likutis užbaigus projektą`,
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

  const email = buildWebServiceEmail({
    subject,
    preheader: `Paruoštas pasiūlymas užklausai ${request.requestNumber}`,
    name: request.name,
    title: "Jūsų projekto pasiūlymas",
    intro: "Paruošėme jūsų svetainės projekto komercinį pasiūlymą.",
    body: request.proposalSummary || "",
    rows: [
      { label: "Užklausa", value: request.requestNumber },
      { label: "Projektas", value: request.packageName },
      { label: "Bendra kaina", value: price },
      { label: "Pagrindinis mokėjimas", value: `Visa suma iškart – ${price}` },
      { label: "Alternatyva dviem dalimis", value: `${request.splitPaymentPercent || 50}% avansas – ${splitDeposit}` },
      ...(expiresAt ? [{ label: "Pasiūlymas galioja iki", value: expiresAt }] : []),
    ],
    cta: { label: "Peržiūrėti ir patvirtinti pasiūlymą", url: proposalUrl },
    notice: "Nuoroda skirta tik šiam pasiūlymui. Nepersiųskite jos tretiesiems asmenims.",
  });

  return { subject, text, html: email.html };
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
