import assert from "node:assert/strict";
import test from "node:test";
import { isDateKey } from "../server/utils/dates.js";

test("matches an event to the user's local day instead of UTC midnight", () => {
  const lateUtcEvent = new Date("2026-09-27T22:45:00.000Z");

  assert.equal(isDateKey(lateUtcEvent, "2026-09-28", "Europe/Vilnius"), true);
  assert.equal(isDateKey(lateUtcEvent, "2026-09-27", "Europe/Vilnius"), false);
});

test("handles negative UTC offsets when matching a local day", () => {
  const earlyUtcEvent = new Date("2026-09-28T02:30:00.000Z");

  assert.equal(isDateKey(earlyUtcEvent, "2026-09-27", "America/New_York"), true);
  assert.equal(isDateKey(earlyUtcEvent, "2026-09-28", "America/New_York"), false);
});

test("rejects invalid event dates", () => {
  assert.equal(isDateKey("not-a-date", "2026-09-28", "Europe/Vilnius"), false);
});
