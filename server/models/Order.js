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

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

module.exports = mongoose.model("Order", orderSchema);
