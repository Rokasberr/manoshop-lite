import Craving from "../models/Craving.js";
import DailyEntry from "../models/DailyEntry.js";
import Habit from "../models/Habit.js";
import Podcast from "../models/Podcast.js";
import User from "../models/User.js";
import { dateKey, localParts } from "../utils/dates.js";
import { buildProgress } from "./analyticsService.js";
import { buildResetEmail, sendTrackedEmail } from "./emailService.js";
import { buildProgramDay, getCurrentProgramDay } from "./programService.js";
import { buildRoutine } from "./routineService.js";

const matchesHour = (configuredTime, hour) => Number(String(configuredTime || "").split(":")[0]) === hour;

const sendMorning = async ({ user, now, forceKey = "" }) => {
  const key = dateKey(now, user.preferences.timeZone);
  const habits = await Habit.find({ userId: user._id, archived: false }).lean();
  const entry = await DailyEntry.findOne({ userId: user._id, date: key }).lean();
  const podcast = await Podcast.findOne({ active: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
  const routine = buildRoutine({ preferences: user.preferences, habits, existing: entry?.routine || [], date: now });
  const programDay = buildProgramDay(getCurrentProgramDay(user, now));
  const highlights = routine.slice(0, 6).map((item) => item.time ? `${item.time} — ${item.title}` : `${item.anchor} — ${item.title}`);
  const rows = [
    { label: "Wake time", value: user.preferences.wakeTime },
    { label: "Today's focus", value: programDay.focus },
    { label: "Routine", value: highlights.join(" · ") },
    user.preferences.goals.includes("smoking") ? { label: "Cigarette target", value: user.preferences.cigaretteTarget } : null,
    user.preferences.goals.includes("scroll") ? { label: "Screen-time target", value: `${user.preferences.screenTargetMinutes} min` } : null,
    { label: "Movement", value: `${user.preferences.exerciseFrequency}× per week` },
    { label: "Reading", value: `${user.preferences.readingMinutes} min` },
    podcast ? { label: "Listen instead of scrolling", value: `${podcast.title} — ${podcast.creator}` } : null,
    { label: "Bedtime", value: user.preferences.bedtime }
  ].filter(Boolean);
  return sendTrackedEmail({
    user,
    type: "morning",
    dedupeKey: forceKey || key,
    subject: `Your Reset Plan — Day ${programDay.day}`,
    content: buildResetEmail({
      preheader: "Your plan for a calmer, more intentional day.",
      eyebrow: `DAY ${programDay.day} · ${programDay.phaseLabel.toUpperCase()}`,
      title: "Your Reset Plan",
      intro: "Keep today simple. Complete the next useful action, then return for the one after it.",
      rows,
      cta: { label: "OPEN TODAY'S PLAN", url: `${process.env.RESET_APP_URL || "http://localhost:5173"}/today` }
    })
  });
};

const sendEvening = async ({ user, now, forceKey = "" }) => {
  const key = dateKey(now, user.preferences.timeZone);
  return sendTrackedEmail({
    user,
    type: "evening",
    dedupeKey: forceKey || key,
    subject: "Your evening RESET check-in",
    content: buildResetEmail({
      preheader: "A two-minute review helps tomorrow start cleaner.",
      title: "Close the day without judging it.",
      intro: "Log what happened, keep what worked, and make one small adjustment for tomorrow.",
      cta: { label: "COMPLETE CHECK-IN", url: `${process.env.RESET_APP_URL || "http://localhost:5173"}/today?checkin=1` }
    })
  });
};

const sendWeekly = async ({ user, now, forceKey = "" }) => {
  const key = dateKey(now, user.preferences.timeZone);
  const from = new Date(now.getTime() - 7 * 86_400_000);
  const entries = await DailyEntry.find({ userId: user._id, date: { $gte: dateKey(from, user.preferences.timeZone), $lte: key } }).sort({ date: 1 }).lean();
  const cravings = await Craving.find({ userId: user._id, createdAt: { $gte: from } }).lean();
  const report = buildProgress({ entries, cravings });
  return sendTrackedEmail({
    user,
    type: "weekly",
    dedupeKey: forceKey || key,
    subject: "Your Weekly Reset",
    content: buildResetEmail({
      preheader: "A neutral look at your week and the next useful adjustment.",
      title: "Your Weekly Reset",
      intro: "Progress is information, not a verdict. Use these numbers to make next week easier.",
      rows: [
        { label: "Routine completion", value: `${report.summary.averageCompletion || 0}%` },
        { label: "Average cigarettes/day", value: report.summary.averageCigarettes ?? "Not logged" },
        { label: "Average screen time", value: report.summary.averageScreenTimeMinutes == null ? "Not logged" : `${report.summary.averageScreenTimeMinutes} min` },
        { label: "Workouts", value: report.summary.workouts },
        { label: "Reading", value: `${report.summary.readingMinutes} min` },
        { label: "Current streak", value: `${report.summary.currentStreak} days` }
      ],
      cta: { label: "VIEW PROGRESS", url: `${process.env.RESET_APP_URL || "http://localhost:5173"}/progress` }
    })
  });
};

export const runHourlyEmails = async (now = new Date()) => {
  const users = await User.find({ onboardingComplete: true, deletedAt: null }).limit(500);
  const result = { checked: users.length, morning: 0, evening: 0, weekly: 0, failed: 0 };

  for (const user of users) {
    const parts = localParts(now, user.preferences.timeZone);
    try {
      if (user.emailPreferences.morningEnabled && matchesHour(user.emailPreferences.morningTime, parts.hour)) {
        const sent = await sendMorning({ user, now });
        if (sent.sent) result.morning += 1;
      }
      if (user.emailPreferences.eveningEnabled && matchesHour(user.emailPreferences.eveningTime, parts.hour)) {
        const sent = await sendEvening({ user, now });
        if (sent.sent) result.evening += 1;
      }
      if (user.emailPreferences.weeklyEnabled && parts.weekday === "Sun" && parts.hour === 18) {
        const sent = await sendWeekly({ user, now });
        if (sent.sent) result.weekly += 1;
      }
    } catch {
      result.failed += 1;
    }
  }
  return result;
};

export const sendEmailByType = async ({ user, type }) => {
  const now = new Date();
  const forceKey = `admin-${Date.now()}`;
  if (type === "morning") return sendMorning({ user, now, forceKey });
  if (type === "evening") return sendEvening({ user, now, forceKey });
  if (type === "weekly") return sendWeekly({ user, now, forceKey });
  throw new Error("Unsupported email type.");
};
