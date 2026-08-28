const normalize = (value) => String(value || "").trim();

const isEnabledFlag = (value) => ["1", "true", "yes", "on"].includes(normalize(value).toLowerCase());

const getWebBankTransferDetails = (requestNumber = "") => {
  const beneficiary = normalize(process.env.WEB_BANK_TRANSFER_BENEFICIARY);
  const iban = normalize(process.env.WEB_BANK_TRANSFER_IBAN);
  const bic = normalize(process.env.WEB_BANK_TRANSFER_BIC);
  const bankName = normalize(process.env.WEB_BANK_TRANSFER_BANK_NAME);

  if (!beneficiary || !iban) return null;

  return {
    beneficiary,
    iban,
    bic,
    bankName,
    currency: "EUR",
    reference: `Stilloak Web avansas – ${normalize(requestNumber)}`,
  };
};

const getWebStripeKeyMode = () => {
  const secretKey = normalize(process.env.STRIPE_SECRET_KEY);
  if (secretKey.startsWith("sk_test_")) return "test";
  if (secretKey.startsWith("sk_live_")) return "live";
  return "unconfigured";
};

const isWebStripeLiveEnabled = () =>
  isEnabledFlag(process.env.WEB_SERVICE_STRIPE_LIVE_ENABLED);

const getWebStripeDepositStatus = () => {
  const depositsEnabled = isEnabledFlag(process.env.WEB_STRIPE_DEPOSITS_ENABLED);
  const mode = getWebStripeKeyMode();
  const liveEnabled = isWebStripeLiveEnabled();

  if (!depositsEnabled) {
    return { enabled: false, mode, liveEnabled, reason: "deposits_disabled" };
  }

  if (mode === "test") {
    return { enabled: true, mode, liveEnabled: false, reason: "test_mode" };
  }

  if (mode === "live") {
    return {
      enabled: liveEnabled,
      mode,
      liveEnabled,
      reason: liveEnabled ? "live_enabled" : "live_locked",
    };
  }

  return { enabled: false, mode, liveEnabled, reason: "stripe_key_unconfigured" };
};

const areWebStripeDepositsEnabled = () => getWebStripeDepositStatus().enabled;

module.exports = {
  areWebStripeDepositsEnabled,
  getWebBankTransferDetails,
  getWebStripeDepositStatus,
  getWebStripeKeyMode,
  isWebStripeLiveEnabled,
};
