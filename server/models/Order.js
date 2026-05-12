const mongoose = require("mongoose");

const digitalAssetSchema = new mongoose.Schema(
  {
    storagePath: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    downloadLabel: {
      type: String,
      default: "",
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    productType: {
      type: String,
      enum: ["physical", "digital"],
      default: "physical",
    },
    digitalAsset: {
      type: digitalAssetSchema,
      default: undefined,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const digitalDeliveryEmailSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["not_required", "pending", "sent", "failed"],
      default: "not_required",
    },
    sentAt: {
      type: Date,
      default: null,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    buyerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
    storeOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "eur",
      trim: true,
      lowercase: true,
    },
    platformCommission: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellerEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
    requiresShipping: {
      type: Boolean,
      default: true,
    },
    containsDigitalProducts: {
      type: Boolean,
      default: false,
    },
    digitalDeliveryEmail: {
      type: digitalDeliveryEmailSchema,
      default: () => ({}),
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled", "refunded"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: "",
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
    },
    stripeCustomerId: {
      type: String,
      default: "",
      index: true,
    },
    stripeRefundId: {
      type: String,
      default: "",
    },
    stockReserved: {
      type: Boolean,
      default: false,
    },
    checkoutExpiresAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    itemsPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
    },
    taxPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "fulfilled", "canceled"],
      default: "pending",
    },
    invoice: {
      number: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
      },
      issuedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ stripeCheckoutSessionId: 1 });
orderSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model("Order", orderSchema);
