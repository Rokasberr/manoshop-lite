const assert = require("node:assert/strict");
const test = require("node:test");

const {
  WEB_SERVICE_BUSINESS,
  getOfficialDocumentReadiness,
} = require("../config/webServiceBusiness");

const ENV_KEYS = ["WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER", "WEB_SERVICE_ACTIVITY_CODE", "WEB_SERVICE_BUSINESS_ADDRESS", "WEB_SERVICE_VAT_CODE", "WEB_SERVICE_VAT_SCHEME"];

const withEnv = (values, callback) => {
  const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
  try {
    callback();
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
};

test("official Stilloak Web identity keeps private registration details outside source", () => {
  assert.deepEqual(WEB_SERVICE_BUSINESS, {
    legalName: "Rokas Bernotas",
    tradingName: "Stilloak Studio",
    email: "rokas@stilloak-studio.com",
  });
});

test("official documents stay blocked while address and VMI VAT decision are missing", () => {
  withEnv(
    {
      WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER: undefined,
      WEB_SERVICE_ACTIVITY_CODE: undefined,
      WEB_SERVICE_BUSINESS_ADDRESS: undefined,
      WEB_SERVICE_VAT_CODE: undefined,
      WEB_SERVICE_VAT_SCHEME: "svs_pending",
    },
    () => {
      const readiness = getOfficialDocumentReadiness();
      assert.equal(readiness.ready, false);
      assert.deepEqual(readiness.missing, [
        "WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER",
        "WEB_SERVICE_ACTIVITY_CODE",
        "WEB_SERVICE_BUSINESS_ADDRESS",
        "WEB_SERVICE_VAT_SCHEME",
        "WEB_SERVICE_VAT_CODE",
      ]);
    }
  );
});

test("official documents become ready only with address and confirmed VAT scheme", () => {
  withEnv(
    {
      WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER: "IV-TEST-0001",
      WEB_SERVICE_ACTIVITY_CODE: "TEST-CODE",
      WEB_SERVICE_BUSINESS_ADDRESS: "Veiklos adresas",
      WEB_SERVICE_VAT_CODE: "LT100000000000",
      WEB_SERVICE_VAT_SCHEME: "svs",
    },
    () => {
      const readiness = getOfficialDocumentReadiness();
      assert.equal(readiness.ready, true);
      assert.deepEqual(readiness.missing, []);
    }
  );
});
