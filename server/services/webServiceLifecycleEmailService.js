const {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
  normalizeEmailTransportError,
} = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");

const FROM = process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";
const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const money = (value) => `${new Intl.NumberFormat("lt-LT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))} €`;

const buildMessage = ({ request, type }) => {
  const isHandover = type === "handover";
  const isFinal = type === "final";
  const amount = isFinal ? request.finalPaymentAmount : request.depositAmount;
  const subject = isHandover
    ? `Jūsų projektas užbaigtas — ${request.requestNumber}`
    : `Primename apie ${isFinal ? "likusios sumos" : "avanso"} apmokėjimą — ${request.requestNumber}`;
  const handoverDetails = [
    request.projectLiveUrl ? `Svetainė: ${request.projectLiveUrl}` : null,
    request.warrantyEndsAt ? `Garantija iki: ${new Date(request.warrantyEndsAt).toLocaleDateString("lt-LT")}` : null,
    request.carePlan ? `Priežiūra: ${request.carePlan}` : null,
    request.handoverItems?.length ? `Perduota: ${request.handoverItems.join(", ")}` : null,
  ].filter(Boolean);
  const action = isHandover
    ? ["Projektas apmokėtas pilnai ir pažymėtas užbaigtu.", ...handoverDetails].join("\n")
    : `Laukiame ${isFinal ? "likusios projekto sumos" : "projekto avanso"}: ${money(amount)}. Mokėjimo nuorodą rasite ankstesniame Stilloak Web laiške.`;
  return {
    subject,
    text: `Sveiki, ${request.name},\n\n${action}\n\nStilloak Web`,
    html: `<div style="font-family:Arial,sans-serif;color:#201d19"><h1>${escapeHtml(subject)}</h1><p>Sveiki, ${escapeHtml(request.name)}.</p>${action.split("\n").map((line) => `<p>${escapeHtml(line)}</p>`).join("")}<p>Stilloak Web</p></div>`,
  };
};

const send = async ({ request, type }) => {
  const email = buildMessage({ request, type });
  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({ to: request.email, ...email, tags: ["web-orders", type], senderOverride: FROM });
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

const deliverWebServiceHandoverEmail = async (request) => {
  if (request.handoverEmailStatus === "sent") return { sent: true, duplicate: true };
  request.handoverEmailStatus = "processing";
  await request.save();
  try {
    const result = await send({ request, type: "handover" });
    if (!result.sent) throw new Error("Projekto perdavimo el. paštas nesukonfigūruotas.");
    request.handoverEmailStatus = "sent";
    request.handoverEmailSentAt = new Date();
    request.contactHistory.push({ type: "email", note: "Išsiųstas projekto užbaigimo ir perdavimo laiškas.", happenedAt: new Date() });
    await request.save();
    return result;
  } catch (error) {
    request.handoverEmailStatus = "failed";
    await request.save();
    throw error;
  }
};

module.exports = {
  deliverWebServiceHandoverEmail,
  sendWebServicePaymentReminderEmail: (request, paymentType) => send({ request, type: paymentType === "final" ? "final" : "deposit" }),
};
