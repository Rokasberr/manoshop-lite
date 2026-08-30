const crypto = require("crypto");

const getKey = () => {
  const secret = String(process.env.JWT_SECRET || "").trim();
  if (secret.length < 32) return null;
  return crypto.createHash("sha256").update(`web-project-token:${secret}`).digest();
};

const encryptProjectToken = (token) => {
  const key = getKey();
  if (!key || !token) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(token), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
};

const decryptProjectToken = (payload) => {
  try {
    const key = getKey();
    const [version, ivRaw, tagRaw, encryptedRaw] = String(payload || "").split(".");
    if (!key || version !== "v1" || !ivRaw || !tagRaw || !encryptedRaw) return "";
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivRaw, "base64url"));
    decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
};

module.exports = { decryptProjectToken, encryptProjectToken };
