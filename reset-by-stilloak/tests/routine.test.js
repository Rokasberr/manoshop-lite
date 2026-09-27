import test from "node:test";
import assert from "node:assert/strict";
import { buildDefaultHabits, buildRoutine, completionPercent, boredomSuggestions } from "../server/services/routineService.js";

const preferences = { wakeTime: "08:00", bedtime: "23:30", readingMinutes: 20, scheduleMode: "exact" };

test("builds an exact routine around wake and bedtime", () => {
  const routine = buildRoutine({ preferences, habits: [], existing: [], date: new Date("2026-09-27T08:00:00Z") });
  assert.equal(routine.find((item) => item.key === "wake").time, "08:00");
  assert.equal(routine.find((item) => item.key === "sleep").time, "23:30");
  assert.equal(routine.find((item) => item.key === "no-social").time, "22:00");
});

test("flexible mode uses anchors without fake exact times", () => {
  const routine = buildRoutine({ preferences: { ...preferences, scheduleMode: "flexible" }, habits: [], existing: [] });
  assert.ok(routine.every((item) => item.time === ""));
  assert.ok(routine.some((item) => item.anchor === "Before bed"));
});

test("default onboarding habits are unique and free-plan safe", () => {
  const habits = buildDefaultHabits(["scroll", "smoking", "sleep", "exercise", "reading", "routine"], "flexible");
  assert.ok(habits.length <= 5);
  assert.equal(new Set(habits.map((habit) => habit.title)).size, habits.length);
});

test("completion excludes explicitly skipped actions", () => {
  const routine = [{ status: "done" }, { status: "pending" }, { status: "skipped" }];
  assert.equal(completionPercent(routine), 50);
});

test("bored flow supports every promised time window", () => {
  assert.deepEqual(Object.keys(boredomSuggestions), ["5", "15", "30", "60", "120"]);
  assert.ok(Object.values(boredomSuggestions).every((items) => items.length >= 3));
});
