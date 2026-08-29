const crypto = require("crypto");
const { gzip } = require("zlib");
const { promisify } = require("util");
const mongoose = require("mongoose");

const { recordOperationalEvent } = require("./operationalAlertService");

const gzipAsync = promisify(gzip);
let schedulerHandle = null;

const getEncryptionKey = () => {
  const raw = process.env.DATABASE_BACKUP_ENCRYPTION_KEY?.trim() || "";
  if (/^[a-f\d]{64}$/i.test(raw)) return Buffer.from(raw, "hex");
  const decoded = Buffer.from(raw, "base64");
  return decoded.length === 32 ? decoded : null;
};

const isDatabaseBackupConfigured = () => {
  try {
    return new URL(process.env.DATABASE_BACKUP_UPLOAD_URL || "").protocol === "https:" && Boolean(getEncryptionKey()) && Boolean(process.env.DATABASE_BACKUP_UPLOAD_TOKEN?.trim());
  } catch (_error) {
    return false;
  }
};

const createEncryptedDatabaseSnapshot = async () => {
  const key = getEncryptionKey();
  if (!key) throw new Error("DATABASE_BACKUP_ENCRYPTION_KEY turi būti 32 baitų base64 arba 64 hex reikšmė.");
  const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
  const data = {};
  for (const { name } of collections) data[name] = await mongoose.connection.db.collection(name).find({}).toArray();
  const compressed = await gzipAsync(Buffer.from(JSON.stringify({ schemaVersion: "stilloak-db-backup.v1", createdAt: new Date().toISOString(), data })));
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  return Buffer.from(JSON.stringify({ algorithm: "aes-256-gcm", iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: encrypted.toString("base64") }));
};

const runDatabaseBackup = async () => {
  if (!isDatabaseBackupConfigured()) throw new Error("Išorinė šifruotų DB kopijų saugykla nesukonfigūruota.");
  try {
    const body = await createEncryptedDatabaseSnapshot();
    const response = await fetch(process.env.DATABASE_BACKUP_UPLOAD_URL, {
      method: "POST",
      headers: { "content-type": "application/octet-stream", "authorization": `Bearer ${process.env.DATABASE_BACKUP_UPLOAD_TOKEN || ""}`, "x-backup-filename": `stilloak-${new Date().toISOString().slice(0, 10)}.json.enc` },
      body,
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok) throw new Error(`Kopijos saugykla grąžino HTTP ${response.status}.`);
    await recordOperationalEvent({ type: "backup_success", severity: "info", message: `Užšifruota DB kopija išsaugota (${body.length} baitų).` });
    return { ok: true, bytes: body.length };
  } catch (error) {
    await recordOperationalEvent({ type: "backup_failed", severity: "critical", message: error.message, notify: true });
    throw error;
  }
};

const startDatabaseBackupScheduler = () => {
  if (String(process.env.DATABASE_BACKUP_ENABLED || "false").toLowerCase() !== "true" || schedulerHandle) return;
  const run = () => runDatabaseBackup().catch(() => {});
  setTimeout(run, 30000);
  schedulerHandle = setInterval(run, 24 * 60 * 60 * 1000);
};

module.exports = { createEncryptedDatabaseSnapshot, isDatabaseBackupConfigured, runDatabaseBackup, startDatabaseBackupScheduler };
