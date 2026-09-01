const { areOfficialWebServiceDocumentsEnabled, getWebServiceBusinessProfile } = require("../config/webServiceBusiness");
const { allocateWebServiceInvoiceNumber } = require("./webServiceInvoiceNumberService");
const { createWebServiceOfficialInvoicePdfBuffer } = require("../utils/webServiceOfficialInvoicePdf");
const { buildWebServiceEmail } = require("./webServiceEmailTemplate");
const { getEmailTransport, getTransportConfig, isEmailTransportConfigured, normalizeEmailTransportError } = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");

const FROM = process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <rokas@stilloak-studio.com>";

const assertRealPayment = (request, paymentType) => {
  const method = paymentType === "final" ? request.finalPaymentMethod : request.depositPaymentMethod;
  const liveStripe = process.env.WEB_SERVICE_STRIPE_LIVE_ENABLED === "true" && String(process.env.STRIPE_WEB_SERVICE_SECRET_KEY || "").startsWith("sk_live_");
  if (method !== "bank_transfer" && !(method === "stripe" && liveStripe)) {
    const error = new Error("Oficiali sąskaita negali būti išrašyta testiniam mokėjimui.");
    error.statusCode = 409;
    throw error;
  }
};

const deliverWebServiceOfficialInvoice = async ({ request, paymentType = "deposit" }) => {
  if (!areOfficialWebServiceDocumentsEnabled()) {
    const error = new Error("Oficialios sąskaitos dar neaktyvuotos.");
    error.statusCode = 409;
    throw error;
  }
  assertRealPayment(request, paymentType);
  const prefix = paymentType === "final" ? "final" : "deposit";
  const numberField = `${prefix}InvoiceNumber`;
  const statusField = `${prefix}InvoiceStatus`;
  const issuedAtField = `${prefix}InvoiceIssuedAt`;
  const snapshotField = `${prefix}InvoiceSnapshot`;
  if (!request[numberField]) request[numberField] = await allocateWebServiceInvoiceNumber(new Date());
  if (!request[issuedAtField]) request[issuedAtField] = new Date();
  if (!request[snapshotField]) {
    const seller = getWebServiceBusinessProfile();
    const isFinal = paymentType === "final";
    const amount = isFinal
      ? Number(request.finalPaymentAmount ?? Math.max(Number(request.proposalPrice || 0) - Number(request.depositAmount || 0), 0))
      : Number(request.depositAmount || 0);
    request[snapshotField] = {
      seller: {
        legalName: seller.legalName,
        tradingName: seller.tradingName,
        certificateNumber: seller.individualActivityCertificateNumber,
        activityCode: seller.activityCode,
        vatCode: seller.vatCode,
        address: seller.address,
        email: seller.email,
        vatScheme: seller.vatScheme,
      },
      buyer: {
        name: request.billingName || request.company || request.name,
        companyCode: request.companyCode || "",
        vatCode: request.vatCode || "",
        address: request.billingAddress,
        email: request.email,
      },
      description: isFinal ? `Galutinis atsiskaitymas uz ${request.packageName}` : request.paymentPlan === "full" ? `Pilnas apmokejimas uz ${request.packageName}` : `Avansas uz ${request.packageName}`,
      amount,
      paymentMethod: isFinal ? request.finalPaymentMethod : request.depositPaymentMethod,
      requestNumber: request.requestNumber,
    };
  }
  request[statusField] = "processing";
  await request.save();

  const invoiceNumber = request[numberField];
  const filename = `${invoiceNumber}.pdf`;
  const pdf = createWebServiceOfficialInvoicePdfBuffer({ request, paymentType, invoiceNumber, issuedAt: request[issuedAtField] });
  const subject = `Sąskaita ${invoiceNumber} — ${request.requestNumber}`;
  const { text, html } = buildWebServiceEmail({
    subject,
    name: request.name,
    title: "Mokėjimas gautas",
    intro: "Prisegame oficialią apmokėto projekto sąskaitą.",
    rows: [{ label: "Užsakymas", value: request.requestNumber }, { label: "Sąskaita", value: invoiceNumber }],
  });
  const attachments = [{ filename, content: pdf }];

  try {
    let result;
    if (isBrevoEmailConfigured()) {
      result = await sendBrevoTransactionalEmail({ to: request.email, subject, text, html, tags: ["web-orders", "invoice", paymentType], senderOverride: FROM, attachments });
    } else {
      if (!isEmailTransportConfigured()) throw Object.assign(new Error("El. pašto transportas nesukonfigūruotas oficialiai sąskaitai."), { statusCode: 503 });
      const { from } = getTransportConfig();
      const transport = getEmailTransport();
      try {
        result = await transport.sendMail({ from: FROM || from, to: request.email, subject, text, html, attachments });
      } catch (error) {
        if (typeof transport.close === "function") transport.close();
        throw normalizeEmailTransportError(error);
      }
    }
    request[statusField] = "sent";
    request[`${prefix}InvoiceSentAt`] = new Date();
    await request.save();
    return { sent: true, provider: isBrevoEmailConfigured() ? "brevo-api" : "smtp", messageId: result?.messageId || "", invoiceNumber, official: true };
  } catch (error) {
    request[statusField] = "failed";
    await request.save();
    throw error;
  }
};

module.exports = { assertRealPayment, deliverWebServiceOfficialInvoice };
