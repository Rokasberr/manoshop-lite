import express from "express";
import DailyEntry from "../models/DailyEntry.js";
import Podcast from "../models/Podcast.js";
import ProgramDay from "../models/ProgramDay.js";
import User from "../models/User.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { sendEmailByType } from "../services/cronService.js";
import { asyncRoute, cleanText, httpError } from "../utils/http.js";
import { toSpotifyEmbed } from "./content.js";

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get(
  "/users",
  asyncRoute(async (_request, response) => {
    const users = await User.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(500).lean();
    const ids = users.map((user) => user._id);
    const usage = await DailyEntry.aggregate([
      { $match: { userId: { $in: ids } } },
      { $group: { _id: "$userId", trackedDays: { $sum: 1 }, lastCheckIn: { $max: "$updatedAt" } } }
    ]);
    const usageMap = new Map(usage.map((item) => [String(item._id), item]));
    response.json({
      users: users.map((user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        lifetimeActive: Boolean(user.lifetime?.active),
        paymentStatus: user.lifetime?.paymentStatus || "not_started",
        active: Date.now() - new Date(user.lastActiveAt || user.updatedAt).getTime() < 30 * 86_400_000,
        signupDate: user.createdAt,
        trackedDays: usageMap.get(String(user._id))?.trackedDays || 0,
        lastCheckIn: usageMap.get(String(user._id))?.lastCheckIn || null
      }))
    });
  })
);

const categories = ["Discipline", "Business", "Habits", "Focus", "Health", "Sleep", "Money", "Psychology"];
const parsePodcast = (body) => {
  const spotifyUrl = cleanText(body.spotifyUrl, 500);
  if (!toSpotifyEmbed(spotifyUrl)) throw httpError("Use a valid open.spotify.com episode or show URL.", 400);
  if (!categories.includes(body.category)) throw httpError("Choose a valid category.", 400);
  return {
    title: cleanText(body.title, 160),
    creator: cleanText(body.creator, 120),
    category: body.category,
    duration: cleanText(body.duration, 40),
    spotifyUrl,
    description: cleanText(body.description, 500),
    recommendedContext: cleanText(body.recommendedContext || "Listen instead of scrolling", 160),
    active: body.active !== false,
    sortOrder: Number(body.sortOrder) || 0
  };
};

router.get("/podcasts", asyncRoute(async (_request, response) => response.json({ podcasts: await Podcast.find().sort({ sortOrder: 1 }) })));
router.post("/podcasts", asyncRoute(async (request, response) => response.status(201).json({ podcast: await Podcast.create(parsePodcast(request.body)) })));
router.patch(
  "/podcasts/:id",
  asyncRoute(async (request, response) => {
    const podcast = await Podcast.findByIdAndUpdate(request.params.id, { $set: parsePodcast(request.body) }, { new: true, runValidators: true });
    if (!podcast) throw httpError("Podcast not found.", 404);
    response.json({ podcast });
  })
);
router.delete(
  "/podcasts/:id",
  asyncRoute(async (request, response) => {
    const podcast = await Podcast.findByIdAndUpdate(request.params.id, { $set: { active: false } }, { new: true });
    if (!podcast) throw httpError("Podcast not found.", 404);
    response.json({ ok: true });
  })
);

router.put(
  "/programs/:duration/:day",
  asyncRoute(async (request, response) => {
    const duration = Number(request.params.duration);
    const day = Number(request.params.day);
    if (![7, 30, 60, 90].includes(duration) || day < 1 || day > duration) throw httpError("Invalid program day.", 400);
    const programDay = await ProgramDay.findOneAndUpdate(
      { duration, day },
      {
        $set: {
          focus: cleanText(request.body.focus, 160),
          challenge: cleanText(request.body.challenge, 300),
          reflection: cleanText(request.body.reflection, 300),
          active: true
        }
      },
      { new: true, upsert: true, runValidators: true }
    );
    response.json({ programDay });
  })
);

router.post(
  "/users/:id/resend",
  asyncRoute(async (request, response) => {
    const user = await User.findById(request.params.id);
    if (!user || user.deletedAt) throw httpError("User not found.", 404);
    if (!["morning", "evening", "weekly"].includes(request.body.type)) throw httpError("Unknown email type.", 400);
    const originalEmail = user.email;
    const result = await sendEmailByType({ user, type: request.body.type });
    response.json({ sent: Boolean(result.sent), recipient: originalEmail });
  })
);

export default router;
