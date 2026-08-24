const assert = require("node:assert/strict");
const test = require("node:test");

const servicePath = require.resolve("../services/brevoWaitlistService");

const withBrevoEnvAndFetch = async (env, callback) => {
  const originalEnv = {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_LAUNCH_FOCUS_ATTRIBUTE: process.env.BREVO_LAUNCH_FOCUS_ATTRIBUTE,
    BREVO_LAUNCH_SOON_LIST_ID: process.env.BREVO_LAUNCH_SOON_LIST_ID,
  };
  const originalFetch = global.fetch;
  const calls = [];

  process.env.BREVO_API_KEY = env.BREVO_API_KEY || "test_brevo_key";

  if (Object.prototype.hasOwnProperty.call(env, "BREVO_LAUNCH_FOCUS_ATTRIBUTE")) {
    process.env.BREVO_LAUNCH_FOCUS_ATTRIBUTE = env.BREVO_LAUNCH_FOCUS_ATTRIBUTE;
  } else {
    delete process.env.BREVO_LAUNCH_FOCUS_ATTRIBUTE;
  }

  if (Object.prototype.hasOwnProperty.call(env, "BREVO_LAUNCH_SOON_LIST_ID")) {
    process.env.BREVO_LAUNCH_SOON_LIST_ID = env.BREVO_LAUNCH_SOON_LIST_ID;
  } else {
    delete process.env.BREVO_LAUNCH_SOON_LIST_ID;
  }

  global.fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return {
      ok: true,
      json: async () => ({ id: 123 }),
    };
  };

  delete require.cache[servicePath];

  try {
    await callback({
      calls,
      service: require("../services/brevoWaitlistService"),
    });
  } finally {
    delete require.cache[servicePath];
    global.fetch = originalFetch;

    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};

test("waitlist payload omits attributes without configured focus attribute", async () => {
  await withBrevoEnvAndFetch({}, async ({ calls, service }) => {
    const result = await service.addEmailToBrevoWaitlist({
      email: "user@example.test",
      focus: "business",
    });

    assert.equal(result.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.brevo.com/v3/contacts");
    assert.equal(calls[0].body.email, "user@example.test");
    assert.equal(calls[0].body.updateEnabled, true);
    assert.equal(calls[0].body.attributes, undefined);
  });
});

test("valid configured focus attribute is sent with business value", async () => {
  await withBrevoEnvAndFetch(
    {
      BREVO_LAUNCH_FOCUS_ATTRIBUTE: "STILLOAK_LAUNCH_FOCUS",
      BREVO_LAUNCH_SOON_LIST_ID: "42",
    },
    async ({ calls, service }) => {
      const result = await service.addEmailToBrevoWaitlist({
        email: "user@example.test",
        focus: "business",
      });

      assert.equal(result.listId, 42);
      assert.deepEqual(calls[0].body.attributes, {
        STILLOAK_LAUNCH_FOCUS: "business",
      });
      assert.deepEqual(calls[0].body.listIds, [42]);
    }
  );
});

test("invalid configured focus attribute is not sent", async () => {
  await withBrevoEnvAndFetch(
    {
      BREVO_LAUNCH_FOCUS_ATTRIBUTE: "bad-name;attributes[ROLE]",
    },
    async ({ calls, service }) => {
      await service.addEmailToBrevoWaitlist({
        email: "user@example.test",
        focus: "business",
      });

      assert.equal(calls[0].body.attributes, undefined);
    }
  );
});

test("focus value cannot create an arbitrary Brevo attribute name", async () => {
  await withBrevoEnvAndFetch(
    {
      BREVO_LAUNCH_FOCUS_ATTRIBUTE: "STILLOAK_LAUNCH_FOCUS",
    },
    async ({ calls, service }) => {
      await service.addEmailToBrevoWaitlist({
        email: "user@example.test",
        focus: "EVIL_ATTRIBUTE",
      });

      assert.deepEqual(Object.keys(calls[0].body.attributes), ["STILLOAK_LAUNCH_FOCUS"]);
      assert.equal(calls[0].body.attributes.STILLOAK_LAUNCH_FOCUS, "EVIL_ATTRIBUTE");
      assert.equal(calls[0].body.attributes.EVIL_ATTRIBUTE, undefined);
    }
  );
});

test("waitlist tests stub fetch and never use the real Brevo API client", async () => {
  await withBrevoEnvAndFetch({}, async ({ calls, service }) => {
    await service.addEmailToBrevoWaitlist({
      email: "user@example.test",
      focus: "business",
    });

    assert.equal(calls.length, 1);
    assert.equal(typeof calls[0].options.headers["api-key"], "string");
  });
});
