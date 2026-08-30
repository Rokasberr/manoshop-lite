const { getEmailTransport, getTransportConfig, isEmailTransportConfigured, normalizeEmailTransportError } = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");
const { buildWebServiceEmail } = require("./webServiceEmailTemplate");

const FROM = process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";
const statusLabels = { pending: "Laukia", in_progress: "Vykdoma", completed: "Atlikta" };

const buildProjectUpdateEmail = ({ request, changedTasks, projectUrl = "" }) => {
  const rows = changedTasks.slice(0, 12).map((task) => ({
    label: statusLabels[task.status] || "Atnaujinta",
    value: task.title,
  }));
  const subject = `Atnaujinta jūsų projekto eiga — ${request.requestNumber}`;
  const email = buildWebServiceEmail({
    subject,
    preheader: `Atnaujinti ${changedTasks.length} projekto darbai`,
    name: request.name,
    title: "Projekto darbai atnaujinti",
    intro: changedTasks.length === 1 ? "Atnaujinome vieno jūsų projekto darbo būseną." : `Atnaujinome ${changedTasks.length} jūsų projekto darbus.`,
    rows,
    cta: projectUrl ? { label: "Peržiūrėti projekto eigą", url: projectUrl } : null,
    notice: projectUrl ? "Nuoroda privati — nepersiųskite jos tretiesiems asmenims." : "Projekto eigą atidarykite per anksčiau gautą privačią projekto nuorodą.",
  });
  return { subject, text: [email.subject, ...rows.map((row) => `${row.label}: ${row.value}`), projectUrl || "Naudokite ankstesnę privačią projekto nuorodą."].join("\n"), html: email.html };
};

const sendWebServiceProjectUpdateEmail = async ({ request, changedTasks, projectUrl }) => {
  if (!changedTasks.length) return { sent: false, skipped: true, reason: "no-changes" };
  const email = buildProjectUpdateEmail({ request, changedTasks, projectUrl });
  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({ to: request.email, ...email, tags: ["web-orders", "project-update"], senderOverride: FROM });
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

module.exports = { buildProjectUpdateEmail, sendWebServiceProjectUpdateEmail };
