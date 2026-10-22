export const httpError = (message, statusCode = 500, code = "REQUEST_FAILED") =>
  Object.assign(new Error(message), { statusCode, code });

export const asyncRoute = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

export const passwordError = (value) => {
  const password = String(value || "");
  if (password.length < 10) return "Use at least 10 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Use an uppercase letter, a lowercase letter, and a number.";
  }
  return "";
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export const cleanText = (value, maxLength = 240) =>
  String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
