const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildBaseFilename,
  buildCaption,
  normalizeInstagramPostPayload,
  resolveGeneratedInstagramPath,
} = require("../services/instagramPostGeneratorService");

test("normalizes supported Instagram generator payloads", () => {
  const payload = normalizeInstagramPostPayload({
    postType: "privatus-verslas",
    format: "story",
    outputType: "png",
    headline: "Premium sprendimas verslo augimui.",
    subtitle: "Skirta rimtesniems poreikiams ir profesionaliam naudojimui.",
    badge: "PRIVATUS VERSLAS",
    features: ["Verslo lygio funkcijos", "Daugiau kontrolės", "Prioritetinis aptarnavimas"],
    website: "stilloak-studio.com",
  });

  assert.equal(payload.template, "template-plan");
  assert.equal(payload.width, 1080);
  assert.equal(payload.height, 1920);
  assert.equal(payload.outputType, "png");
  assert.equal(payload.slug, "privatus-verslas");
});

test("rejects unsupported output types and unsafe downloads", async () => {
  assert.throws(
    () =>
      normalizeInstagramPostPayload({
        postType: "brand-intro",
        format: "square",
        outputType: "webp",
        headline: "Headline",
        subtitle: "Subtitle",
        badge: "Badge",
        features: ["One", "Two", "Three"],
      }),
    /Nepalaikomas failo tipas/
  );

  await assert.rejects(() => resolveGeneratedInstagramPath("../stilloak-brand-intro-20260506-1200.jpg"), {
    statusCode: 400,
  });
});

test("builds clean filenames and caption templates", () => {
  const payload = normalizeInstagramPostPayload({
    postType: "bazinis-planas",
    format: "square",
    outputType: "jpg",
    headline: "Pradėk paprastai su Baziniu planu.",
    subtitle: "Skirta aiškiai pradžiai.",
    badge: "BAZINIS PLANAS",
    features: ["Pagrindinės funkcijos", "Aiški pradžia", "Lengvas naudojimas"],
    website: "stilloak-studio.com",
  });
  const filename = buildBaseFilename(payload, new Date("2026-05-06T08:09:00"));
  const caption = buildCaption(payload);

  assert.equal(filename, "stilloak-bazinis-20260506-0809");
  assert.match(caption, /Bazinis planas/);
  assert.match(caption, /stilloak-studio\.com$/);
});
