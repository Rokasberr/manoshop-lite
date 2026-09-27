import test from "node:test";
import assert from "node:assert/strict";
import { buildProgram, buildProgramDay } from "../server/services/programService.js";

test("builds complete 7/30/60/90 day programs", () => {
  for (const duration of [7, 30, 60, 90]) {
    const program = buildProgram(duration);
    assert.equal(program.length, duration);
    assert.equal(program[0].day, 1);
    assert.equal(program.at(-1).day, duration);
    assert.ok(program.every((day) => day.focus && day.challenge && day.reflection));
  }
});

test("uses progressive Reset, Build, and Sustain phases", () => {
  assert.equal(buildProgramDay(1).phaseLabel, "Reset");
  assert.equal(buildProgramDay(31).phaseLabel, "Build");
  assert.equal(buildProgramDay(61).phaseLabel, "Sustain");
});
