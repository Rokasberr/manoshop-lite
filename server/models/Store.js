const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: "",
    },
    theme: {
      type: String,
      enum: ["oak", "sage", "linen", "charcoal"],
      default: "oak",
    },
    selectedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

storeSchema.index({ owner: 1, updatedAt: -1 });
storeSchema.index({ slug: 1, isPublished: 1 });

module.exports = mongoose.model("Store", storeSchema);
