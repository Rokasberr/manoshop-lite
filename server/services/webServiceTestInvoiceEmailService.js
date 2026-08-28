const {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
  normalizeEmailTransportError,
} = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");
const {
  buildTestInvoiceNumber,
  createWebServiceTestInvoicePdfBuffer,
} = require("../utils/webServiceTestInvoicePdf");

const WEB_ORDERS_FROM_EMAIL =
  process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";

const sendWebServiceTestInvoiceEmail = async ({ request, paymentType = "deposit" }) => {
  const invoiceNumber = buildTestInvoiceNumber(request, paymentType);
  const filename = `${invoiceNumber}.pdf`.replace(/[^\w.-]/g, "_");
  const pdf = createWebServiceTestInvoicePdfBuffer({ request, paymentType });
  const paymentLabel = paymentType === "final" ? "likusios projekto sumos" : "projekto avanso";
  const subject = `TESTINĖ sąskaita po ${paymentLabel} — ${request.requestNumber}`;
  const text = [
    `Sveiki, ${request.name},`,
    "",
    `Gavome ${paymentLabel} testinį mokėjimą. Prisegame testinę PDF sąskaitą.`,
    "Dokumentas pažymėtas kaip negaliojantis ir nėra apskaitos dokumentas.",
    "",
    "Stilloak Web",
  ].join("\n");
  const html = `<p>Sveiki, ${String(request.name || "").replace(/[<>&]/g, "")},</p><p>Gavome ${paymentLabel} testinį mokėjimą.</p><p><strong>Prisegtas PDF yra testinis ir nėra apskaitos dokumentas.</strong></p><p>Stilloak Web</p>`;
  const attachments = [{ filename, content: pdf }];

  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({
      to: request.email,
      subject,
      text,
      html,
      tags: ["web-orders", "test-invoice", paymentType],
      senderOverride: WEB_ORDERS_FROM_EMAIL,
      attachments,
    });
    return { sent: true, provider: "brevo-api", messageId: result?.messageId || "", invoiceNumber };
  }

  if (!isEmailTransportConfigured()) {
    const error = new Error("El. pašto transportas nesukonfigūruotas testinei sąskaitai.");
    error.statusCode = 503;
    throw error;
  }
  const { from } = getTransportConfig();
  const transport = getEmailTransport();
  try {
    const info = await transport.sendMail({
      from: WEB_ORDERS_FROM_EMAIL || from,
      to: request.email,
      subject,
      text,
      html,
      attachments,
    });
    return { sent: true, provider: "smtp", messageId: info?.messageId || "", invoiceNumber };
  } catch (error) {
    if (typeof transport.close === "function") transport.close();
    throw normalizeEmailTransportError(error);
  }
};

module.exports = { sendWebServiceTestInvoiceEmail };
