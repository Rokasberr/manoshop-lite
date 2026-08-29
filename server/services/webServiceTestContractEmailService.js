const { getEmailTransport, getTransportConfig, isEmailTransportConfigured, normalizeEmailTransportError } = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");
const { buildTestContractNumber, createWebServiceTestContractPdfBuffer } = require("../utils/webServiceTestContractPdf");
const { buildWebServiceEmail } = require("./webServiceEmailTemplate");

const FROM = process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";

const sendWebServiceTestContractEmail = async (request) => {
  const contractNumber = buildTestContractNumber(request);
  const attachment = { filename: `${contractNumber}.pdf`, content: createWebServiceTestContractPdfBuffer({ request }) };
  const subject = `TESTINĖ projekto sutartis — ${request.requestNumber}`;
  const { text, html } = buildWebServiceEmail({ subject, name: request.name, title: "Pasiūlymas patvirtintas", intro: "Prisegame pagal patvirtintą pasiūlymą sugeneruotą testinę projekto sutartį.", rows: [{ label: "Užsakymas", value: request.requestNumber }, { label: "Sutarties numeris", value: contractNumber }], notice: "Dokumentas negalioja, nėra teisinė sutartis ir skirtas tik sistemos testavimui." });

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
