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

const areWebStripeDepositsEnabled = () =>
  isEnabledFlag(process.env.WEB_STRIPE_DEPOSITS_ENABLED);

module.exports = {
  areWebStripeDepositsEnabled,
  getWebBankTransferDetails,
};
