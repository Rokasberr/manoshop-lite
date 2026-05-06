const User = require("../models/User");

const ensureStripeCustomerForUser = async (stripe, user) => {
  const userId = user._id.toString();
  const existingCustomerId = user.subscription?.stripeCustomerId || "";

  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customers = await stripe.customers.list({
    email: user.email,
    limit: 10,
  });
  const matchedCustomer =
    customers.data.find((customer) => customer.metadata?.userId === userId) ||
    customers.data.find((customer) => customer.email?.toLowerCase() === user.email.toLowerCase());

  const customer =
    matchedCustomer ||
    (await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId,
      },
    }));

  await User.findByIdAndUpdate(user._id, {
    $set: {
      "subscription.stripeCustomerId": customer.id,
      "subscription.lastSyncedAt": new Date(),
    },
  });

  return customer.id;
};

module.exports = {
  ensureStripeCustomerForUser,
};
