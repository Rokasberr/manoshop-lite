import mongoose from "mongoose";

const podcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    creator: { type: String, required: true, trim: true, maxlength: 120 },
    category: {
      type: String,
      enum: ["Discipline", "Business", "Habits", "Focus", "Health", "Sleep", "Money", "Psychology"],
      required: true
    },
    duration: { type: String, default: "", maxlength: 40 },
    spotifyUrl: { type: String, required: true, maxlength: 500 },
    description: { type: String, default: "", maxlength: 500 },
    recommendedContext: { type: String, default: "Listen instead of scrolling", maxlength: 160 },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.ResetPodcast || mongoose.model("ResetPodcast", podcastSchema);
