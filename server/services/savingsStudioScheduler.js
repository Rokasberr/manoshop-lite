const SavingsStudioProfile = require("../models/SavingsStudioProfile");
const User = require("../models/User");
const { isEmailTransportConfigured } = require("../utils/emailTransport");
const { sendSavingsSummaryEmail } = require("./savingsStudioSummaryEmailService");
const { logSavingsAuditSafe } = require("./savingsStudioAuditService");
const { buildSavingsSummaryPayload } = require("../controllers/savingsStudioController");

const DEFAULT_INTERVAL_MINUTES = 15;
let schedulerHandle = null;

const hasActiveMembership = (user) => {
  if (!user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  const plan = user.subscription?.plan || "free";
  const status = user.subscription?.status || "inactive";

  return plan !== "free" && ["active", "trialing"].includes(status);
};

const getSchedulerIntervalMs = () => {
  const rawMinutes = Number(process.env.SAVINGS_STUDIO_SUMMARY_INTERVAL_MINUTES || DEFAULT_INTERVAL_MINUTES);
  return Math.max(rawMinutes, 5) * 60 * 1000;
};

const isSchedulerEnabled = () =>
  String(process.env.SAVINGS_STUDIO_SUMMARY_SCHEDULER_ENABLED || "true").toLowerCase() !== "false";

const getMonthKeyFromDate = (value) => new Date(value).toISOString().slice(0, 7);

const isSummaryDue = ({ frequency, lastSentAt, now }) => {
  if (!lastSentAt) {
    return true;
  }

  if (frequency === "monthly") {
    return getMonthKeyFromDate(lastSentAt) !== getMonthKeyFromDate(now);
  }

  return now.getTime() - new Date(lastSentAt).getTime() >= 7 * 24 * 60 * 60 * 1000;
};

const runPendingSavingsStudioSummaries = async () => {
  if (!isSchedulerEnabled() || !isEmailTransportConfigured()) {
    return { checked: 0, sent: 0, skipped: 0 };
  }

  const now = new Date();
  const profiles = await SavingsStudioProfile.find({ summaryEmailsEnabled: true });
  let checked = 0;
  let sent = 0;
  let skipped = 0;

  for (const profile of profiles) {
    checked += 1;

    if (!isSummaryDue({ frequency: profile.summaryEmailFrequency, lastSentAt: profile.summaryEmailLastSentAt, now })) {
      skipped += 1;
      continue;
    }

    const user = await User.findById(profile.user).select("-password");

    if (!user || !user.email || !hasActiveMembership(user)) {
      skipped += 1;
      continue;
    }

    try {
      const { summary } = await buildSavingsSummaryPayload(user._id);
      const result = await sendSavingsSummaryEmail({
        frequency: profile.summaryEmailFrequency,
        profile,
        summary,
        user,
      });

      if (result.sent) {
        sent += 1;
        await logSavingsAuditSafe({
          userId: user._id,
          action: "summary-email-scheduled",
          entityType: "summary-email",
          metadata: {
            frequency: profile.summaryEmailFrequency,
          },
        });
      } else {
        skipped += 1;
      }
    } catch (error) {
      skipped += 1;
      await logSavingsAuditSafe({
        userId: user._id,
        action: "summary-email-scheduled-failed",
        entityType: "summary-email",
        metadata: {
          frequency: profile.summaryEmailFrequency,
          message: error.message,
        },
      });
    }
  }

  return { checked, sent, skipped };
};

const startSavingsStudioSummaryScheduler = () => {
  if (!isSchedulerEnabled()) {
    console.log("Savings Studio scheduler išjungtas per env.");
    return;
  }

  if (schedulerHandle) {
    return;
  }

  const intervalMs = getSchedulerIntervalMs();
  console.log(`Savings Studio scheduler paleistas. Intervalas: ${Math.round(intervalMs / 60000)} min.`);

  const runSafely = async () => {
    try {
      const result = await runPendingSavingsStudioSummaries();
      if (result.sent > 0) {
        console.log(`Savings Studio scheduler išsiuntė ${result.sent} suvestinių.`);
      }
    } catch (error) {
      console.error("Savings Studio scheduler klaida:", error.message);
    }
  };

  setTimeout(runSafely, 10_000);
  schedulerHandle = setInterval(runSafely, intervalMs);
};

module.exports = {
  startSavingsStudioSummaryScheduler,
  runPendingSavingsStudioSummaries,
};
