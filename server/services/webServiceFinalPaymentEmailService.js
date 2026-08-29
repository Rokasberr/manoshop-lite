const { getEmailTransport, getTransportConfig, isEmailTransportConfigured, normalizeEmailTransportError } = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");

const FROM = process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";
const { buildWebServiceEmail } = require("./webServiceEmailTemplate");
const money = (value) => `${new Intl.NumberFormat("lt-LT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))} €`;

const buildFinalPaymentEmail = ({ request, proposalUrl }) => {
  const subject = `Likusios projekto sumos apmokėjimas — ${request.requestNumber}`;
  const amount = money(request.finalPaymentAmount);
  return buildWebServiceEmail({ subject, preheader: `Likutis ${amount}`, name: request.name, title: "Galutinis projekto apmokėjimas", intro: "Projektas paruoštas galutiniam atsiskaitymui.", rows: [{ label: "Užsakymas", value: request.requestNumber }, { label: "Likutis", value: amount }], cta: { label: "Apmokėti saugiai per Stripe", url: proposalUrl }, notice: "Tai nauja privati nuoroda. Ankstesnė pasiūlymo nuoroda nebegalioja." });
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
