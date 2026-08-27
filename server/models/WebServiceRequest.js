const mongoose = require("mongoose");

const { WEB_SERVICE_PLAN_IDS } = require("../config/webServicePlans");

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "qualifying",
  "proposal_sent",
  "accepted",
  "in_progress",
  "completed",
  "lost",
];

const attributionSchema = new mongoose.Schema(
  {
    source: { type: String, trim: true, maxlength: 100, default: "direct" },
    medium: { type: String, trim: true, maxlength: 100, default: "none" },
    campaign: { type: String, trim: true, maxlength: 160, default: "" },
    content: { type: String, trim: true, maxlength: 160, default: "" },
    term: { type: String, trim: true, maxlength: 160, default: "" },
    referrer: { type: String, trim: true, maxlength: 500, default: "" },
    landingPage: { type: String, trim: true, maxlength: 500, default: "" },
    gclid: { type: String, trim: true, maxlength: 200, default: "" },
    fbclid: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: false }
);

const webServiceRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 60, default: "" },
    company: { type: String, trim: true, maxlength: 160, default: "" },
    packageId: { type: String, required: true, enum: WEB_SERVICE_PLAN_IDS, index: true },
    packageName: { type: String, required: true, trim: true, maxlength: 80 },
    basePrice: { type: Number, min: 0, default: null },
    budget: { type: String, trim: true, maxlength: 80, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    source: { type: String, trim: true, maxlength: 100, default: "direct" },
    attribution: { type: attributionSchema, default: () => ({}) },
    status: { type: String, enum: STATUS_OPTIONS, default: "new", index: true },
    finalPrice: { type: Number, min: 0, default: null },
    internalNotes: { type: String, trim: true, maxlength: 5000, default: "" },
  },
  { timestamps: true }
);

webServiceRequestSchema.index({ status: 1, createdAt: -1 });
webServiceRequestSchema.index({ email: 1, createdAt: -1 });
webServiceRequestSchema.index({ source: 1, createdAt: -1 });

module.exports = mongoose.model("WebServiceRequest", webServiceRequestSchema);
module.exports.STATUS_OPTIONS = STATUS_OPTIONS;
