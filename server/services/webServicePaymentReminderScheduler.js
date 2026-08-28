const WebServiceRequest = require("../models/WebServiceRequest");
const { sendWebServicePaymentReminderEmail } = require("./webServiceLifecycleEmailService");

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_AFTER_DAYS = 3;
const REPEAT_AFTER_DAYS = 3;
let schedulerHandle = null;

const isDue = (startedAt, lastSentAt, now) =>
  startedAt &&
  now.getTime() - new Date(startedAt).getTime() >= REMINDER_AFTER_DAYS * DAY_MS &&
  (!lastSentAt || now.getTime() - new Date(lastSentAt).getTime() >= REPEAT_AFTER_DAYS * DAY_MS);

const runPendingWebServicePaymentReminders = async (now = new Date()) => {
  const requests = await WebServiceRequest.find({
    proposalStatus: "accepted",
    $or: [
      { depositStatus: { $ne: "paid" } },
      { finalPaymentStatus: { $in: ["requested", "pending"] } },
    ],
  }).limit(500);
  let sent = 0;

  for (const request of requests) {
    let paymentType = null;
    let field = null;
    let expectedValue = null;

    if (request.depositStatus !== "paid" && isDue(request.proposalAcceptedAt, request.depositReminderSentAt, now)) {
      paymentType = "deposit";
      field = "depositReminderSentAt";
      expectedValue = request.depositReminderSentAt || null;
    } else if (["requested", "pending"].includes(request.finalPaymentStatus) && isDue(request.finalPaymentRequestedAt, request.finalPaymentReminderSentAt, now)) {
      paymentType = "final";
      field = "finalPaymentReminderSentAt";
      expectedValue = request.finalPaymentReminderSentAt || null;
    }
    if (!paymentType) continue;

    const claim = await WebServiceRequest.findOneAndUpdate(
      { _id: request._id, [field]: expectedValue },
      { $set: { [field]: now } },
      { new: true }
    );
    if (!claim) continue;

    try {
      const delivery = await sendWebServicePaymentReminderEmail(claim, paymentType);
      if (!delivery.sent) {
        await WebServiceRequest.updateOne({ _id: claim._id, [field]: now }, { $set: { [field]: expectedValue } });
        continue;
      }
      sent += 1;
      claim.contactHistory.push({ type: "email", note: `Automatiškai išsiųstas ${paymentType === "final" ? "likučio" : "avanso"} mokėjimo priminimas.`, happenedAt: now });
      await claim.save();
    } catch (error) {
      await WebServiceRequest.updateOne({ _id: claim._id, [field]: now }, { $set: { [field]: expectedValue } });
      console.error(`[web-reminders] ${claim.requestNumber}: ${error.message}`);
    }
  }
  return { checked: requests.length, sent };
};

const startWebServicePaymentReminderScheduler = () => {
  if (String(process.env.WEB_PAYMENT_REMINDERS_ENABLED || "true").toLowerCase() === "false" || schedulerHandle) return;
  const run = () => runPendingWebServicePaymentReminders().catch((error) => console.error("[web-reminders] Scheduler klaida:", error.message));
  setTimeout(run, 20_000);
  schedulerHandle = setInterval(run, 60 * 60 * 1000);
};

module.exports = { isDue, runPendingWebServicePaymentReminders, startWebServicePaymentReminderScheduler };