const windows = new Map();

const buildKey = (prefix, req) => {
  const userKey = req.user?._id?.toString();
  const ipKey =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.ip ||
    "anonymous";

  return `${prefix}:${userKey || ipKey}`;
};

const createWindowRateLimiter = ({
  keyPrefix = "global",
  max = 30,
  windowMs = 60_000,
  message = "Per daug užklausų per trumpą laiką.",
}) => {
  return (req, res, next) => {
    const key = buildKey(keyPrefix, req);
    const now = Date.now();
    const bucket = windows.get(key) || [];
    const freshEntries = bucket.filter((timestamp) => now - timestamp < windowMs);

    if (freshEntries.length >= max) {
      res.status(429);
      return next(new Error(message));
    }

    freshEntries.push(now);
    windows.set(key, freshEntries);
    next();
  };
};

module.exports = {
  createWindowRateLimiter,
};
