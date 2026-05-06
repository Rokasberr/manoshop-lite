const mongoose = require("mongoose");

const { createHttpError } = require("../utils/httpError");

const validateObjectId = (fieldName) => (req, _res, next) => {
  const value = req.params[fieldName];

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return next(createHttpError("Netinkamas įrašo identifikatorius.", 400));
  }

  next();
};

const validateBillingSessionPayload = (req, _res, next) => {
  const planId = String(req.body?.planId || "").trim().toLowerCase();
  const provider = String(req.body?.provider || "stripe").trim().toLowerCase();

  if (!planId) {
    return next(createHttpError("Pasirink planą.", 400));
  }

  if (provider !== "stripe") {
    return next(createHttpError("Šiuo metu palaikomas tik Stripe apmokėjimas.", 400));
  }

  req.body.planId = planId;
  req.body.provider = provider;
  next();
};

const validateOrderPayload = (req, _res, next) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!items.length || items.length > 50) {
    return next(createHttpError("Krepšelyje turi būti 1-50 prekių.", 400));
  }

  const normalizedItems = items.map((item) => ({
    product: String(item.product || "").trim(),
    quantity: Number(item.quantity),
  }));

  if (
    normalizedItems.some(
      (item) =>
        !mongoose.Types.ObjectId.isValid(item.product) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
    )
  ) {
    return next(createHttpError("Netinkami krepšelio duomenys.", 400));
  }

  const shippingAddress = req.body?.shippingAddress || {};
  req.body.items = normalizedItems;
  req.body.shippingAddress = {
    fullName: String(shippingAddress.fullName || "").trim(),
    address: String(shippingAddress.address || "").trim(),
    city: String(shippingAddress.city || "").trim(),
    postalCode: String(shippingAddress.postalCode || "").trim(),
    country: String(shippingAddress.country || "").trim(),
    phone: String(shippingAddress.phone || "").trim(),
  };

  next();
};

module.exports = {
  validateBillingSessionPayload,
  validateObjectId,
  validateOrderPayload,
};
