const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) => EMAIL_PATTERN.test(normalizeEmail(email));

const getPasswordPolicyError = (password) => {
  const value = String(password || "");

  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    return "Slaptažodis turi būti 6-128 simbolių.";
  }

  return "";
};

module.exports = {
  EMAIL_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  getPasswordPolicyError,
  isValidEmail,
  normalizeEmail,
};
