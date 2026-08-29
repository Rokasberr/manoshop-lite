const OperationalEvent = require("../models/OperationalEvent");
const WebServiceRequest = require("../models/WebServiceRequest");
const EmailDelivery = require("../models/EmailDelivery");
const { isDatabaseBackupConfigured, runDatabaseBackup } = require("../services/databaseBackupService");

const getAdminOperations = async (_req, res) => {
  const [events, failedDeliveries, latestBackup, emailDeliveries] = await Promise.all([
    OperationalEvent.find({ resolvedAt: null }).sort({ createdAt: -1 }).limit(30).lean(),
    WebServiceRequest.find({ $or: [
      { contractTestStatus: "failed" }, { depositTestInvoiceStatus: "failed" },
      { finalTestInvoiceStatus: "failed" }, { handoverEmailStatus: "failed" },
    ] }).sort({ updatedAt: -1 }).limit(30).select("requestNumber name email contractTestStatus depositTestInvoiceStatus finalTestInvoiceStatus handoverEmailStatus updatedAt").lean(),
    OperationalEvent.findOne({ type: "backup_success" }).sort({ createdAt: -1 }).lean(),
    EmailDelivery.find({}).sort({ updatedAt: -1 }).limit(50).select("type status deliveryStatus provider sentAt deliveryStatusAt updatedAt").lean(),
  ]);
  res.json({ backup: { enabled: String(process.env.DATABASE_BACKUP_ENABLED || "false").toLowerCase() === "true", configured: isDatabaseBackupConfigured(), lastSuccessAt: latestBackup?.createdAt || null }, events, failedDeliveries, emailDeliveries });
};

const runAdminDatabaseBackup = async (_req, res) => res.json(await runDatabaseBackup());

const resolveAdminOperationalEvent = async (req, res) => {
  const event = await OperationalEvent.findByIdAndUpdate(req.params.id, { resolvedAt: new Date() }, { new: true });
  if (!event) return res.status(404).json({ message: "Operacijų įvykis nerastas." });
  return res.json(event);
};

module.exports = { getAdminOperations, resolveAdminOperationalEvent, runAdminDatabaseBackup };
