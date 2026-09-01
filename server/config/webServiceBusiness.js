const normalize = (value) => String(value || "").trim();

const WEB_SERVICE_BUSINESS = Object.freeze({
  legalName: "Rokas Bernotas",
  tradingName: "Stilloak Studio",
  email: "rokas@stilloak-studio.com",
});

const getWebServiceBusinessProfile = () => ({
  ...WEB_SERVICE_BUSINESS,
  individualActivityCertificateNumber: normalize(process.env.WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER),
  activityCode: normalize(process.env.WEB_SERVICE_ACTIVITY_CODE),
  address: normalize(process.env.WEB_SERVICE_BUSINESS_ADDRESS),
  vatCode: normalize(process.env.WEB_SERVICE_VAT_CODE),
  vatScheme: normalize(process.env.WEB_SERVICE_VAT_SCHEME || "svs_pending").toLowerCase(),
});

const getOfficialDocumentReadiness = () => {
  const profile = getWebServiceBusinessProfile();
  const missing = [];
  if (!profile.individualActivityCertificateNumber) missing.push("WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER");
  if (!profile.activityCode) missing.push("WEB_SERVICE_ACTIVITY_CODE");
  if (!profile.address) missing.push("WEB_SERVICE_BUSINESS_ADDRESS");
  if (profile.vatScheme !== "svs") missing.push("WEB_SERVICE_VAT_SCHEME");
  if (!profile.vatCode) missing.push("WEB_SERVICE_VAT_CODE");

  return {
    ready: missing.length === 0,
    missing,
    profile,
  };
};

const areOfficialWebServiceDocumentsEnabled = () =>
  String(process.env.WEB_SERVICE_OFFICIAL_DOCUMENTS_ENABLED || "").trim().toLowerCase() === "true" &&
  getOfficialDocumentReadiness().ready;

module.exports = {
  WEB_SERVICE_BUSINESS,
  areOfficialWebServiceDocumentsEnabled,
  getOfficialDocumentReadiness,
  getWebServiceBusinessProfile,
};
