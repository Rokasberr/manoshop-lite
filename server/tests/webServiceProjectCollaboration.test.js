const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { buildProjectUpdateEmail } = require("../services/webServiceProjectUpdateEmailService");
const { buildProjectFeedbackEmail } = require("../services/webServiceProjectFeedbackEmailService");
const { decryptProjectToken, encryptProjectToken } = require("../services/webServiceProjectTokenService");

const readRepoFile = (...parts) => fs.readFileSync(path.resolve(__dirname, "..", "..", ...parts), "utf8");

test("private project tokens are encrypted at rest and fail closed when modified", () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-project-token-encryption";
  try {
    const token = "a".repeat(64);
    const encrypted = encryptProjectToken(token);
    assert.match(encrypted, /^v1\./);
    assert.doesNotMatch(encrypted, new RegExp(token));
    assert.equal(decryptProjectToken(encrypted), token);
    assert.equal(decryptProjectToken(`${encrypted}broken`), "");
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test("project update email groups changed tasks and links to the private portal", () => {
  const email = buildProjectUpdateEmail({
    request: { name: "Klientas", requestNumber: "WEB-2026-TEST" },
    changedTasks: [
      { title: "Dizainas", status: "completed" },
      { title: "Mobilioji versija", status: "in_progress" },
    ],
    projectUrl: "https://web.stilloak-studio.com/pasiulymas/private-token",
  });
  assert.match(email.subject, /WEB-2026-TEST/);
  assert.match(email.text, /Atlikta: Dizainas/);
  assert.match(email.text, /Vykdoma: Mobilioji versija/);
  assert.match(email.html, /Peržiūrėti projekto eigą/);
});

test("project feedback email tells the owner what the client changed", () => {
  const email = buildProjectFeedbackEmail({
    request: { name: "Emilija", email: "emilija@example.com", requestNumber: "WEB-2026-TEST" },
    task: { title: "Pagrindinio puslapio dizainas" },
    action: "changes_requested",
    message: "Pakeiskime pagrindinę nuotrauką.",
  });

  assert.match(email.subject, /Paprašė pataisymų/);
  assert.match(email.text, /Emilija/);
  assert.match(email.text, /Pagrindinio puslapio dizainas/);
  assert.match(email.text, /Pakeiskime pagrindinę nuotrauką/);
  assert.match(email.html, /Atidaryti projektų valdymą/);
});

test("private portal supports dated tasks, comments, approval and revision requests", () => {
  const model = readRepoFile("server", "models", "WebServiceRequest.js");
  const controller = readRepoFile("server", "controllers", "webServiceRequestController.js");
  const routes = readRepoFile("server", "routes", "webServiceRequestRoutes.js");
  const admin = readRepoFile("client", "src", "pages", "admin", "WebProposalsPage.jsx");
  const portal = readRepoFile("web-services", "src", "ProposalPage.tsx");

  assert.match(model, /plannedDate:/);
  assert.match(model, /clientDecision:/);
  assert.match(model, /clientComments:/);
  assert.match(controller, /submitPublicWebServiceTaskFeedback/);
  assert.match(controller, /proposalStatus !== "accepted"/);
  assert.match(routes, /tasks\/:taskId\/feedback/);
  assert.match(admin, /Kliento sprendimas/);
  assert.match(admin, /Kliento pastaba/);
  assert.match(portal, /Reikia pataisymų/);
  assert.match(portal, /Patvirtinti/);
  assert.match(portal, /Jūsų pastaba/);
  assert.match(admin, /web-project-search/);
});
