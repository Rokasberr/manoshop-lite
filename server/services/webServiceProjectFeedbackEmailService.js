const { buildWebServiceEmail } = require("./webServiceEmailTemplate");
const {
  getNotificationRecipient,
  sendAdminNotification,
} = require("./webServiceRequestEmailService");

const WEB_ADMIN_ORDERS_URL =
  process.env.WEB_ORDERS_ADMIN_URL?.trim() || "https://stilloak-studio.com/admin/web-orders";

const actionLabels = {
  approved: "Patvirtino darbą",
  changes_requested: "Paprašė pataisymų",
  comment: "Paliko pastabą",
};

const buildProjectFeedbackEmail = ({ request, task, action, message = "" }) => {
  const actionLabel = actionLabels[action] || "Atnaujino projektą";
  const subject = `${actionLabel} — ${request.requestNumber}`;
  const rows = [
    { label: "Klientas", value: request.name || request.email },
    { label: "Darbas", value: task.title },
    { label: "Veiksmas", value: actionLabel },
    ...(message ? [{ label: "Pastaba", value: message }] : []),
  ];
  const email = buildWebServiceEmail({
    subject,
    preheader: `${request.name || "Klientas"}: ${task.title}`,
    name: "Rokai",
    title: "Naujas kliento veiksmas",
    intro: `${request.name || "Klientas"} atnaujino projekto darbą „${task.title}“.`,
    rows,
    cta: { label: "Atidaryti projektų valdymą", url: WEB_ADMIN_ORDERS_URL },
    notice: "Atsakykite klientui per projektų valdymą arba tiesiogiai el. paštu.",
  });

  return {
    subject,
    text: [subject, ...rows.map((row) => `${row.label}: ${row.value}`), WEB_ADMIN_ORDERS_URL].join("\n"),
    html: email.html,
  };
};

const sendWebServiceProjectFeedbackEmail = async ({ request, task, action, message }) => {
  const recipient = getNotificationRecipient();
  if (!recipient) {
    return { sent: false, skipped: true, reason: "notification-recipient-not-configured" };
  }

  return sendAdminNotification({
    to: recipient,
    replyTo: request.email ? { email: request.email, name: request.name || "" } : null,
    email: buildProjectFeedbackEmail({ request, task, action, message }),
    tags: ["web-orders", "project-feedback"],
  });
};

module.exports = {
  buildProjectFeedbackEmail,
  sendWebServiceProjectFeedbackEmail,
};
