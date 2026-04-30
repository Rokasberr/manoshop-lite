const getTransportConfig = () => {
  const host = process.env.SMTP_HOST?.trim() || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS || "";
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;
  const from = process.env.EMAIL_FROM?.trim() || "";
  const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000);
  const greetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT || 8000);
  const socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT || 15000);
  const dnsTimeout = Number(process.env.SMTP_DNS_TIMEOUT || 10000);

  return {
    host,
    port,
    user,
    pass,
    secure,
    from,
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    dnsTimeout,
  };
};

const isEmailTransportConfigured = () => {
  const { host, port, from } = getTransportConfig();
  return Boolean(host && port && from);
};

const normalizeEmailTransportError = (error) => {
  const message = String(error?.message || "");
  const response = String(error?.response || "");
  const combined = `${message}\n${response}`.toLowerCase();

  if (/invalid login|authentication unsuccessful|auth failed|invalid credentials|535/.test(combined)) {
    error.statusCode = 401;
    error.message = "SMTP prisijungimo duomenys neteisingi. Patikrink SMTP_USER ir SMTP_PASS.";
    return error;
  }

  if (/sender.*not.*verified|sender has not been verified|from address.*not verified/.test(combined)) {
    error.statusCode = 400;
    error.message =
      "Siuntėjas dar nepatvirtintas. Brevo pusėje patvirtink domeną arba senderį hello@stilloak-studio.com.";
    return error;
  }

  if (/connection timeout|timeout|timed out|greeting/i.test(combined)) {
    error.statusCode = 504;
    error.message = "SMTP serveris per ilgai neatsako. Patikrink SMTP_HOST, SMTP_PORT ir SMTP_SECURE.";
    return error;
  }

  if (/enotfound|getaddrinfo|dns/.test(combined)) {
    error.statusCode = 503;
    error.message = "SMTP hostas nepasiekiamas. Patikrink SMTP_HOST reikšmę.";
    return error;
  }

  return error;
};

const getEmailTransport = () => {
  let nodemailer;

  try {
    nodemailer = require("nodemailer");
  } catch (_error) {
    const error = new Error(
      "Nodemailer paketas neįdiegtas. Paleisk npm install root kataloge arba pridėk dependency server workspace."
    );
    error.statusCode = 503;
    throw error;
  }

  const {
    host,
    port,
    user,
    pass,
    secure,
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    dnsTimeout,
  } = getTransportConfig();

  if (!host || !port) {
    const error = new Error("SMTP_HOST arba SMTP_PORT nėra sukonfigūruotas.");
    error.statusCode = 503;
    throw error;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    dnsTimeout,
    ...(user ? { auth: { user, pass } } : {}),
  });
};

module.exports = {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
  normalizeEmailTransportError,
};
