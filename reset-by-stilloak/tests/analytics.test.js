import test from "node:test";
import assert from "node:assert/strict";
import { buildProgress } from "../server/services/analyticsService.js";

test("progress summarizes routines, wellbeing logs, and cravings", () => {
  const entries = [
    { date: "2026-09-25", routine: [{ status: "done" }, { status: "done" }], cigarettes: 8, screenTimeMinutes: 250, mood: 3, workout: false, readingMinutes: 10 },
    { date: "2026-09-26", routine: [{ status: "done" }, { status: "pending" }], cigarettes: 6, screenTimeMinutes: 210, mood: 4, workout: true, readingMinutes: 20 },
    { date: "2026-09-27", routine: [{ status: "done" }, { status: "done" }], cigarettes: 5, screenTimeMinutes: 170, mood: 4, workout: true, readingMinutes: 25 }
  ];
  const cravings = [{ resolvedAt: new Date(), cigaretteAvoided: true }, { resolvedAt: new Date(), cigaretteAvoided: false }];
  const result = buildProgress({ entries, cravings });
  assert.equal(result.summary.averageCigarettes, 6.3);
  assert.equal(result.summary.workouts, 2);
  assert.equal(result.summary.readingMinutes, 55);
  assert.equal(result.summary.cravingsDelayed, 2);
  assert.equal(result.summary.cigarettesAvoided, 1);
});
