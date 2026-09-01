const WebServiceRequest = require("../models/WebServiceRequest");
const { sendWebServicePaymentReminderEmail } = require("./webServiceLifecycleEmailService");

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_DAYS = [2, 5, 10];
let schedulerHandle = null;

const isDue = (startedAt, reminderCount, now) => {
  const count = Math.max(0, Number(reminderCount) || 0);
  return Boolean(startedAt) && count < REMINDER_DAYS.length &&
    now.getTime() - new Date(startedAt).getTime() >= REMINDER_DAYS[count] * DAY_MS;
};

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
    let countField = null;
    let expectedCount = 0;

    if (request.depositStatus !== "paid" && isDue(request.proposalAcceptedAt, request.depositReminderCount, now)) {
      paymentType = "deposit";
      field = "depositReminderSentAt";
      countField = "depositReminderCount";
      expectedCount = Number(request.depositReminderCount) || 0;
    } else if (["requested", "pending"].includes(request.finalPaymentStatus) && isDue(request.finalPaymentRequestedAt, request.finalPaymentReminderCount, now)) {
      paymentType = "final";
      field = "finalPaymentReminderSentAt";
      countField = "finalPaymentReminderCount";
      expectedCount = Number(request.finalPaymentReminderCount) || 0;
    }
    if (!paymentType) continue;

    const claim = await WebServiceRequest.findOneAndUpdate(
      { _id: request._id, [countField]: expectedCount },
      { $set: { [field]: now }, $inc: { [countField]: 1 } },
      { new: true }
    );
    if (!claim) continue;

    try {
      const delivery = await sendWebServicePaymentReminderEmail(claim, paymentType);
      if (!delivery.sent) {
        await WebServiceRequest.updateOne({ _id: claim._id, [field]: now }, { $set: { [field]: request[field] || null }, $inc: { [countField]: -1 } });
        continue;
      }
      sent += 1;
      const paymentLabel = paymentType === "final" ? "likučio" : claim.paymentPlan === "full" ? "pilno mokėjimo" : "avanso";
      claim.contactHistory.push({ type: "email", note: `Automatiškai išsiųstas ${REMINDER_DAYS[expectedCount]} dienos ${paymentLabel} priminimas.`, happenedAt: now });
      await claim.save();
    } catch (error) {
      await WebServiceRequest.updateOne({ _id: claim._id, [field]: now }, { $set: { [field]: request[field] || null }, $inc: { [countField]: -1 } });
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

module.exports = { REMINDER_DAYS, isDue, runPendingWebServicePaymentReminders, startWebServicePaymentReminderScheduler };
