const SavingsStudioAuditLog = require("../models/SavingsStudioAuditLog");

const sanitizeMetadata = (value) => {
  if (!value || typeof value !== "object") {
    return {};
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return {};
  }
};

const logSavingsAudit = async ({
  userId,
  action,
  entityType,
  entityId = "",
  metadata = {},
}) => {
  if (!userId || !action || !entityType) {
    return null;
  }

  return SavingsStudioAuditLog.create({
    user: userId,
    action: String(action).trim().slice(0, 80),
    entityType: String(entityType).trim().slice(0, 80),
    entityId: String(entityId || "").trim().slice(0, 120),
    metadata: sanitizeMetadata(metadata),
  });
};

const logSavingsAuditSafe = async (payload) => {
  try {
    await logSavingsAudit(payload);
  } catch (_error) {
    // Audit logging should never break the main user action.
  }
};

module.exports = {
  logSavingsAudit,
  logSavingsAuditSafe,
};
