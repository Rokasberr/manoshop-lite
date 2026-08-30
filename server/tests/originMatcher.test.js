const assert = require("node:assert/strict");
const test = require("node:test");

const {
  isAllowedOrigin,
  isTrustedVercelPreviewOrigin,
} = require("../utils/originMatcher");

test("allows only the Stilloak client project previews from the owner's Vercel team", () => {
  const branchPreview =
    "https://manoshop-lite-client-git-feat-web-cl-290257-rokasberrs-projects.vercel.app";
  const deploymentPreview =
    "https://manoshop-lite-client-f86zpd0t2-rokasberrs-projects.vercel.app";

  assert.equal(isTrustedVercelPreviewOrigin(branchPreview), true);
  assert.equal(isTrustedVercelPreviewOrigin(deploymentPreview), true);
  assert.equal(isAllowedOrigin(branchPreview, ["https://www.stilloak-studio.com"]), true);
});

test("rejects lookalike, insecure and unrelated Vercel origins", () => {
  const configuredOrigins = ["https://www.stilloak-studio.com"];

  assert.equal(
    isAllowedOrigin("https://manoshop-lite-client-evil-other-team.vercel.app", configuredOrigins),
    false
  );
  assert.equal(
    isAllowedOrigin(
      "http://manoshop-lite-client-git-main-rokasberrs-projects.vercel.app",
      configuredOrigins
    ),
    false
  );
  assert.equal(
    isAllowedOrigin(
      "https://manoshop-lite-client-git-main-rokasberrs-projects.vercel.app.evil.test",
      configuredOrigins
    ),
    false
  );
  assert.equal(isAllowedOrigin("https://unrelated.vercel.app", configuredOrigins), false);
});
