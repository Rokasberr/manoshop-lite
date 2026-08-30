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
      { title: "Paruošti dizainą", status: "completed" },
      { title: "Sukurti mobilią versiją", status: "in_progress" },
    ],
  });
  assert.equal(valid.validateSync(), undefined);
  assert.equal(valid.projectTasks.length, 2);

  const invalid = new WebServiceRequest({
    ...validRequest(),
    projectTasks: [{ title: "Netinkama būsena", status: "blocked" }],
  });
  const error = invalid.validateSync();
  assert.ok(error);
  assert.ok(error.errors["projectTasks.0.status"]);
});
