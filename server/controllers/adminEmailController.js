const { buildVerificationEmail } = require("../services/emailVerificationEmailService");
const { buildPasswordResetEmail } = require("../services/passwordResetEmailService");
const {
  buildSubscriptionPaymentIssueEmail,
  buildSubscriptionPaymentSucceededEmail,
  buildSubscriptionCancelScheduledEmail,
  buildDigitalProductDeliveredEmail,
} = require("../services/transactionalEmailTemplateService");
const { buildWebServiceEmail } = require("../services/webServiceEmailTemplate");
const { sendTransactionalEmail, isValidRecipientEmail } = require("../services/transactionalEmailDeliveryService");
const { createHttpError } = require("../utils/httpError");

const TEMPLATE_OPTIONS = [
  "web_project",
  "email_verification",
  "password_reset",
  "subscription_paid",
  "subscription_failed",
  "subscription_cancel",
  "digital_product",
];

const buildTestEmail = (type) => {
  const testUrl = "https://www.stilloak-studio.com/profile";
  if (type === "email_verification") return buildVerificationEmail({ verificationUrl: testUrl, userName: "Rokai", ttlHours: 24 });
  if (type === "password_reset") return buildPasswordResetEmail({ resetUrl: testUrl, userName: "Rokai" });
  if (type === "subscription_paid") return buildSubscriptionPaymentSucceededEmail({ planName: "Asmeninis", amount: 14.99, currency: "eur", paidAt: new Date(), status: "Aktyvi" });
  if (type === "subscription_failed") return buildSubscriptionPaymentIssueEmail({ planName: "Asmeninis", amount: 14.99, currency: "eur", date: new Date(), status: "Nepavyko" });
  if (type === "subscription_cancel") return buildSubscriptionCancelScheduledEmail({ planName: "Asmeninis", currentPeriodEnd: new Date(Date.now() + 30 * 86400000), status: "Atšaukimas suplanuotas" });
  if (type === "digital_product") return buildDigitalProductDeliveredEmail({ productName: "Stilloak planavimo rinkinys", purchasedAt: new Date() });
  return buildWebServiceEmail({
    subject: "Stilloak Web: projekto atnaujinimas",
    name: "Rokai",
    title: "Projektas juda pirmyn",
    intro: "Paruošėme naujausią jūsų projekto atnaujinimą.",
    rows: [{ label: "Būsena", value: "Darbai vykdomi" }, { label: "Terminas", value: "2026-09-15" }],
    cta: { label: "Atidaryti projekto puslapį", url: "https://web.stilloak-studio.com" },
  });
};

const sendAdminTestEmail = async (req, res) => {
  const to = String(req.body?.to || "").trim().toLowerCase();
  const template = String(req.body?.template || "").trim();
  if (!isValidRecipientEmail(to)) throw createHttpError("Įrašykite teisingą gavėjo el. paštą.", 400);
  if (!TEMPLATE_OPTIONS.includes(template)) throw createHttpError("Pasirinkite galiojantį laiško tipą.", 400);
  const result = await sendTransactionalEmail({ to, email: buildTestEmail(template), tags: ["admin-test", template] });
  res.json({ sent: true, provider: result.provider || "", messageId: result.messageId || "" });
};

module.exports = { TEMPLATE_OPTIONS, buildTestEmail, sendAdminTestEmail };
