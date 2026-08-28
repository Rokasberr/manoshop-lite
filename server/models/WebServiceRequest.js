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

const CONTACT_TYPE_OPTIONS = ["note", "email", "call", "meeting", "proposal"];
const PROPOSAL_STATUS_OPTIONS = ["draft", "sent", "viewed", "accepted", "declined", "expired"];
const DEPOSIT_STATUS_OPTIONS = ["not_requested", "pending", "paid", "failed", "refunded"];
const DEPOSIT_PAYMENT_METHOD_OPTIONS = ["", "stripe", "bank_transfer"];

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

const contactHistorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: CONTACT_TYPE_OPTIONS, default: "note" },
    note: { type: String, required: true, trim: true, maxlength: 2000 },
    happenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
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
    proposalPrice: { type: Number, min: 0, default: null },
    proposalSummary: { type: String, trim: true, maxlength: 3000, default: "" },
    proposalScope: { type: String, trim: true, maxlength: 5000, default: "" },
    proposalTerms: { type: String, trim: true, maxlength: 5000, default: "" },
    proposalStatus: { type: String, enum: PROPOSAL_STATUS_OPTIONS, default: "draft", index: true },
    proposalTokenHash: { type: String, trim: true, maxlength: 128, default: "", index: true },
    proposalSentAt: { type: Date, default: null },
    proposalViewedAt: { type: Date, default: null },
    proposalAcceptedAt: { type: Date, default: null },
    proposalExpiresAt: { type: Date, default: null },
    proposalAcceptedName: { type: String, trim: true, maxlength: 160, default: "" },
    proposalTermsVersion: { type: String, trim: true, maxlength: 40, default: "2026-08" },
    depositPercent: { type: Number, min: 10, max: 100, default: 50 },
    depositAmount: { type: Number, min: 0, default: null },
    depositStatus: { type: String, enum: DEPOSIT_STATUS_OPTIONS, default: "not_requested", index: true },
    depositPaymentMethod: {
      type: String,
      enum: DEPOSIT_PAYMENT_METHOD_OPTIONS,
      default: "",
    },
    stripeDepositCheckoutSessionId: { type: String, trim: true, maxlength: 255, default: "" },
    stripeDepositPaymentIntentId: { type: String, trim: true, maxlength: 255, default: "" },
    depositPaidAt: { type: Date, default: null },
    finalPrice: { type: Number, min: 0, default: null },
    nextAction: { type: String, trim: true, maxlength: 500, default: "" },
    nextActionAt: { type: Date, default: null, index: true },
    dueDate: { type: Date, default: null },
    contactHistory: { type: [contactHistorySchema], default: [] },
    internalNotes: { type: String, trim: true, maxlength: 5000, default: "" },
  },
  { timestamps: true }
);

webServiceRequestSchema.index({ status: 1, createdAt: -1 });
webServiceRequestSchema.index({ email: 1, createdAt: -1 });
webServiceRequestSchema.index({ source: 1, createdAt: -1 });
webServiceRequestSchema.index({ nextActionAt: 1, status: 1 });
webServiceRequestSchema.index({ proposalStatus: 1, proposalSentAt: -1 });
webServiceRequestSchema.index({ depositStatus: 1, proposalAcceptedAt: -1 });

module.exports = mongoose.model("WebServiceRequest", webServiceRequestSchema);
module.exports.STATUS_OPTIONS = STATUS_OPTIONS;
module.exports.CONTACT_TYPE_OPTIONS = CONTACT_TYPE_OPTIONS;
module.exports.PROPOSAL_STATUS_OPTIONS = PROPOSAL_STATUS_OPTIONS;
module.exports.DEPOSIT_STATUS_OPTIONS = DEPOSIT_STATUS_OPTIONS;
module.exports.DEPOSIT_PAYMENT_METHOD_OPTIONS = DEPOSIT_PAYMENT_METHOD_OPTIONS;
