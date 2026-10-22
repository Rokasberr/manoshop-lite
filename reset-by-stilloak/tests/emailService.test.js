import assert from "node:assert/strict";
import test from "node:test";
import { redactEmailLogValue } from "../server/services/emailService.js";

test("email provider log values redact addresses, credentials, and URLs", () => {
  const value = redactEmailLogValue(
    "Invalid sender noreply@stilloak-studio.com; api-key=secret-value token abc123 https://example.com/reset?token=secret"
  );

  assert.doesNotMatch(value, /noreply@stilloak-studio\.com/);
  assert.doesNotMatch(value, /secret-value|abc123|example\.com/);
  assert.match(value, /\[redacted-email\]/);
  assert.match(value, /api-key=\[redacted\]/);
  assert.match(value, /token \[redacted\]/);
  assert.match(value, /\[redacted-url\]/);
});

test("email provider log values have a bounded length", () => {
  assert.equal(redactEmailLogValue("x".repeat(500)).length, 300);
});
