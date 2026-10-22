import express from "express";
import Podcast from "../models/Podcast.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute } from "../utils/http.js";

const router = express.Router();

const toSpotifyEmbed = (value) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "open.spotify.com") return "";
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed") return url.toString();
    if (!parts[0] || !parts[1]) return "";
    return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}`;
  } catch {
    return "";
  }
};

router.get(
  "/podcasts",
  requireAuth,
  asyncRoute(async (request, response) => {
    const query = { active: true };
    if (request.query.category) query.category = request.query.category;
    const podcasts = await Podcast.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
    response.json({ podcasts: podcasts.map((podcast) => ({ ...podcast, embedUrl: toSpotifyEmbed(podcast.spotifyUrl) })) });
  })
);

export { toSpotifyEmbed };
export default router;
