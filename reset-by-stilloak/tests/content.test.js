import test from "node:test";
import assert from "node:assert/strict";
import { toSpotifyEmbed } from "../server/routes/content.js";

test("accepts only safe Spotify URLs and builds embed URLs", () => {
  assert.equal(
    toSpotifyEmbed("https://open.spotify.com/episode/abc123?si=test"),
    "https://open.spotify.com/embed/episode/abc123"
  );
  assert.equal(toSpotifyEmbed("https://evil.example/episode/abc123"), "");
  assert.equal(toSpotifyEmbed("javascript:alert(1)"), "");
});
