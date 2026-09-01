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
const { buildWebServiceEmail } = require("./webServiceEmailTemplate");

const WEB_ORDERS_FROM_EMAIL =
  process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";

const sendWebServiceTestInvoiceEmail = async ({ request, paymentType = "deposit" }) => {
  const invoiceNumber = buildTestInvoiceNumber(request, paymentType);
  const filename = `${invoiceNumber}.pdf`.replace(/[^\w.-]/g, "_");
  const pdf = createWebServiceTestInvoicePdfBuffer({ request, paymentType });
  const paymentLabel = paymentType === "final" ? "likusios projekto sumos" : request.paymentPlan === "full" ? "visos projekto sumos" : "projekto avanso";
  const subject = `TESTINĖ sąskaita po ${paymentLabel} — ${request.requestNumber}`;
  const { text, html } = buildWebServiceEmail({ subject, name: request.name, title: "Mokėjimas gautas", intro: `Gavome ${paymentLabel} testinį mokėjimą. PDF dokumentą rasite laiško priede.`, rows: [{ label: "Užsakymas", value: request.requestNumber }, { label: "Dokumento numeris", value: invoiceNumber }], notice: "Prisegtas PDF yra testinis, negalioja ir nėra apskaitos dokumentas." });
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

const deliverWebServiceTestInvoice = async ({ request, paymentType = "deposit" }) => {
  const prefix = paymentType === "final" ? "final" : "deposit";
  const statusField = `${prefix}TestInvoiceStatus`;
  request[statusField] = "processing";
  await request.save();

  try {
    const delivery = await sendWebServiceTestInvoiceEmail({ request, paymentType });
    request[`${prefix}TestInvoiceNumber`] = delivery.invoiceNumber;
    request[statusField] = "sent";
    request[`${prefix}TestInvoiceSentAt`] = new Date();
    await request.save();
    return delivery;
  } catch (error) {
    request[statusField] = "failed";
    await request.save();
    throw error;
  }
};

module.exports = { deliverWebServiceTestInvoice, sendWebServiceTestInvoiceEmail };
