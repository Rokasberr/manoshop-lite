const assert = require("node:assert/strict");
const test = require("node:test");

const WebServiceRequest = require("../models/WebServiceRequest");

const validRequest = () => ({
  requestNumber: "WEB-2026-ABC12345",
  name: "Test Client",
  email: "client@example.com",
  packageId: "business",
  packageName: "Business",
  basePrice: 599,
  message: "Reikia profesionalios verslo svetainės su kontaktų forma.",
});

test("WebServiceRequest accepts the approved package and pipeline status", () => {
  const request = new WebServiceRequest(validRequest());
  const error = request.validateSync();

  assert.equal(error, undefined);
  assert.equal(request.status, "new");
  assert.equal(request.basePrice, 599);
});

test("WebServiceRequest rejects an unknown package", () => {
  const request = new WebServiceRequest({ ...validRequest(), packageId: "fake-package" });
  const error = request.validateSync();

  assert.ok(error);
  assert.ok(error.errors.packageId);
});

test("WebServiceRequest rejects a negative final price", () => {
  const request = new WebServiceRequest({ ...validRequest(), finalPrice: -1 });
  const error = request.validateSync();

  assert.ok(error);
  assert.ok(error.errors.finalPrice);
});

test("WebServiceRequest validates structured client project tasks", () => {
  const valid = new WebServiceRequest({
    ...validRequest(),
    projectTasks: [
      { title: "Paruošti dizainą", status: "completed", plannedDate: new Date("2026-09-05"), reviewUrl: "https://preview.example.com", clientDecision: "approved", clientComments: [{ message: "Tinka" }] },
      { title: "Sukurti mobilią versiją", status: "in_progress" },
    ],
  });
  assert.equal(valid.validateSync(), undefined);
  assert.equal(valid.projectTasks.length, 2);
  assert.equal(valid.projectTasks[0].clientDecision, "approved");
  assert.equal(valid.projectTasks[0].reviewUrl, "https://preview.example.com");

  const invalid = new WebServiceRequest({
    ...validRequest(),
    projectTasks: [{ title: "Netinkama būsena", status: "blocked" }],
  });
  const error = invalid.validateSync();
  assert.ok(error);
  assert.ok(error.errors["projectTasks.0.status"]);
});

test("WebServiceRequest tracks limited correction rounds", () => {
  const request = new WebServiceRequest({
    ...validRequest(),
    revisionLimit: 3,
    revisionRounds: [{ number: 1, note: "Pagrindinio puslapio korekcijos" }],
  });
  assert.equal(request.validateSync(), undefined);
  assert.equal(request.revisionLimit, 3);
  assert.equal(request.revisionRounds.length, 1);

  const invalid = new WebServiceRequest({ ...validRequest(), revisionLimit: 11 });
  assert.ok(invalid.validateSync()?.errors.revisionLimit);
});
