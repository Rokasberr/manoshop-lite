import legalDocuments from "../../../shared/legalDocuments.cjs";

const readEnv = (key) => String(import.meta.env[key] || "").trim();

const canonicalLegalVersion = legalDocuments.LEGAL_DOCUMENT_VERSION;
const configuredLegalVersion = readEnv("VITE_LEGAL_VERSION");

if (configuredLegalVersion && configuredLegalVersion !== canonicalLegalVersion) {
  throw new Error("VITE_LEGAL_VERSION must match the canonical legal document version.");
}

export const LEGAL_DOCUMENT_VERSION = canonicalLegalVersion;
export const LEGAL_EFFECTIVE_DATE = readEnv("VITE_LEGAL_EFFECTIVE_DATE") || "2026-08-24";

export const serviceProvider = {
  name: readEnv("VITE_SERVICE_PROVIDER_NAME"),
  type: readEnv("VITE_SERVICE_PROVIDER_TYPE"),
  code: readEnv("VITE_SERVICE_PROVIDER_CODE"),
  vatCode: readEnv("VITE_SERVICE_PROVIDER_VAT_CODE"),
  address: readEnv("VITE_SERVICE_PROVIDER_ADDRESS"),
  email: readEnv("VITE_SERVICE_PROVIDER_EMAIL") || "hello@stilloak-studio.com",
  supportEmail: readEnv("VITE_SUPPORT_EMAIL") || readEnv("VITE_SERVICE_PROVIDER_EMAIL") || "hello@stilloak-studio.com",
  phone: readEnv("VITE_SERVICE_PROVIDER_PHONE"),
  website: readEnv("VITE_SERVICE_PROVIDER_WEBSITE") || "https://www.stilloak-studio.com",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  documentVersion: LEGAL_DOCUMENT_VERSION,
};

export const missingRequiredProviderFields = [
  ["name", "paslaugos teikėjo pilnas vardas arba juridinio asmens pavadinimas"],
  ["type", "veiklos forma"],
  ["code", "juridinio asmens arba individualios veiklos numeris"],
  ["address", "registruotos veiklos adresas"],
  ["email", "viešas kontaktinis el. paštas"],
  ["supportEmail", "pagalbos el. paštas"],
].filter(([key]) => !serviceProvider[key]);

export const formatLegalDate = (value = LEGAL_EFFECTIVE_DATE) => value;
