import { completionPercent } from "./routineService.js";

const average = (values) => {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10 : null;
};

export const buildProgress = ({ entries, cravings = [] }) => {
  const points = entries.map((entry) => ({
    date: entry.date,
    completion: completionPercent(entry.routine || []),
    cigarettes: Number.isFinite(entry.cigarettes) ? entry.cigarettes : null,
    screenTimeMinutes: Number.isFinite(entry.screenTimeMinutes) ? entry.screenTimeMinutes : null,
    mood: Number.isFinite(entry.mood) ? entry.mood : null,
    workout: entry.workout === true ? 1 : 0,
    readingMinutes: Number.isFinite(entry.readingMinutes) ? entry.readingMinutes : null
  }));

  const completedDays = points.filter((point) => point.completion > 0);
  const bestDay = [...points].sort((a, b) => b.completion - a.completion)[0] || null;
  let currentStreak = 0;
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].completion < 60) break;
    currentStreak += 1;
  }

  const resolved = cravings.filter((craving) => craving.resolvedAt);
  const avoided = resolved.filter((craving) => craving.cigaretteAvoided);

  return {
    points,
    summary: {
      averageCompletion: average(points.map((point) => point.completion)),
      averageCigarettes: average(points.map((point) => point.cigarettes)),
      averageScreenTimeMinutes: average(points.map((point) => point.screenTimeMinutes)),
      averageMood: average(points.map((point) => point.mood)),
      workouts: points.reduce((sum, point) => sum + point.workout, 0),
      readingMinutes: points.reduce((sum, point) => sum + (point.readingMinutes || 0), 0),
      currentStreak,
      trackedDays: completedDays.length,
      bestDay,
      cravingsDelayed: resolved.length,
      cigarettesAvoided: avoided.length
    }
  };
};

export const buildHabitStats = ({ habit, entries }) => {
  const key = `habit:${habit._id}`;
  const checks = entries.map((entry) => entry.routine?.find((item) => item.key === key)?.status || "pending");
  const eligible = checks.filter((status) => status !== "skipped");
  const done = eligible.filter((status) => status === "done").length;
  let streak = 0;
  for (let index = checks.length - 1; index >= 0; index -= 1) {
    if (checks[index] !== "done") break;
    streak += 1;
  }
  return {
    streak,
    completion: eligible.length ? Math.round((done / eligible.length) * 100) : 0,
    completed: done
  };
};
