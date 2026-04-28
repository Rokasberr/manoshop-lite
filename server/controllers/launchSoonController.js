const { addEmailToBrevoWaitlist } = require("../services/brevoWaitlistService");

const allowedFocusValues = new Set(["default", "digital", "journal"]);

const notifyLaunchSoonInterest = async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const focus = req.body?.focus?.trim().toLowerCase() || "default";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400);
    throw new Error("Įvesk tvarkingą el. pašto adresą.");
  }

  if (!allowedFocusValues.has(focus)) {
    res.status(400);
    throw new Error("Neteisinga launch sekcijos reikšmė.");
  }

  await addEmailToBrevoWaitlist({ email });

  res.status(201).json({
    message: "Susidomėjimas išsaugotas. Parašysime, kai ši sekcija atsidarys.",
    focus,
  });
};

module.exports = {
  notifyLaunchSoonInterest,
};
