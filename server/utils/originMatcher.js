const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");

const getConfiguredOrigins = () =>
  (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

const patternToRegex = (pattern) => {
  const normalizedPattern = normalizeOrigin(pattern);
  const escaped = normalizedPattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`);
};

const matchesOriginPattern = (origin, pattern) => {
  const normalizedOrigin = normalizeOrigin(origin);
  const normalizedPattern = normalizeOrigin(pattern);

  if (!normalizedPattern) {
    return false;
  }

  if (!normalizedPattern.includes("*")) {
    return normalizedOrigin === normalizedPattern;
  }

  return patternToRegex(normalizedPattern).test(normalizedOrigin);
};

const isAllowedOrigin = (origin, configuredOrigins = getConfiguredOrigins()) => {
  if (!origin) {
    return true;
  }

  if (!configuredOrigins.length) {
    return true;
  }

  return configuredOrigins.some((pattern) => matchesOriginPattern(origin, pattern));
};

const getPrimaryClientUrl = (configuredOrigins = getConfiguredOrigins()) =>
  configuredOrigins.find((origin) => !origin.includes("*")) || "http://localhost:5173";

module.exports = {
  getConfiguredOrigins,
  getPrimaryClientUrl,
  isAllowedOrigin,
  normalizeOrigin,
};
