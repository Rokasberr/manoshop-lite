const { getEmailTransport, getTransportConfig, isEmailTransportConfigured, normalizeEmailTransportError } = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");
const { buildTestContractNumber, createWebServiceTestContractPdfBuffer } = require("../utils/webServiceTestContractPdf");

const FROM = process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";

const sendWebServiceTestContractEmail = async (request) => {
  const contractNumber = buildTestContractNumber(request);
  const attachment = { filename: `${contractNumber}.pdf`, content: createWebServiceTestContractPdfBuffer({ request }) };
  const subject = `TESTINĖ projekto sutartis — ${request.requestNumber}`;
  const text = `Sveiki, ${request.name},\n\nPrisegame pagal patvirtintą pasiūlymą sugeneruotą testinę projekto sutartį. Dokumentas negalioja ir nėra teisinė sutartis.\n\nStilloak Web`;
  const html = `<p>Sveiki, ${String(request.name || "").replace(/[<>&]/g, "")},</p><p>Prisegame pagal patvirtintą pasiūlymą sugeneruotą testinę projekto sutartį.</p><p><strong>Dokumentas negalioja ir nėra teisinė sutartis.</strong></p><p>Stilloak Web</p>`;

  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({ to: request.email, subject, text, html, tags: ["web-orders", "test-contract"], senderOverride: FROM, attachments: [attachment] });
    return { sent: true, provider: "brevo-api", messageId: result?.messageId || "", contractNumber };
  }
  if (!isEmailTransportConfigured()) throw Object.assign(new Error("El. pašto transportas nesukonfigūruotas testinei sutarčiai."), { statusCode: 503 });
  const { from } = getTransportConfig();
  const transport = getEmailTransport();
  try {
    const info = await transport.sendMail({ from: FROM || from, to: request.email, subject, text, html, attachments: [attachment] });
    return { sent: true, provider: "smtp", messageId: info?.messageId || "", contractNumber };
  } catch (error) {
    if (typeof transport.close === "function") transport.close();
    throw normalizeEmailTransportError(error);
  }
};

const deliverWebServiceTestContract = async (request) => {
  request.contractTestStatus = "processing";
  await request.save();
  try {
    const result = await sendWebServiceTestContractEmail(request);
    request.contractTestNumber = result.contractNumber;
    request.contractTestStatus = "sent";
    request.contractTestSentAt = new Date();
    await request.save();
    return result;
  } catch (error) {
    request.contractTestStatus = "failed";
    await request.save();
    throw error;
  }
};

module.exports = { deliverWebServiceTestContract, sendWebServiceTestContractEmail };
