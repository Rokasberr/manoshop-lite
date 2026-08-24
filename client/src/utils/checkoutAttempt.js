const bytesToHex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

export const createCheckoutAttemptKey = () => {
  const secureCrypto = globalThis.crypto;

  if (typeof secureCrypto?.randomUUID === "function") {
    return secureCrypto.randomUUID();
  }

  if (typeof secureCrypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    secureCrypto.getRandomValues(bytes);
    return `attempt-${bytesToHex(bytes)}`;
  }

  throw new Error("Nepavyko saugiai paruošti checkout bandymo. Atnaujinkite naršyklę ir bandykite dar kartą.");
};
