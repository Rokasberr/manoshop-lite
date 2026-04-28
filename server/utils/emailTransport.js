const getTransportConfig = () => {
  const host = process.env.SMTP_HOST?.trim() || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS || "";
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;
  const from = process.env.EMAIL_FROM?.trim() || "";

  return {
    host,
    port,
    user,
    pass,
    secure,
    from,
  };
};

const isEmailTransportConfigured = () => {
  const { host, port, from } = getTransportConfig();
  return Boolean(host && port && from);
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

  const { host, port, user, pass, secure } = getTransportConfig();

  if (!host || !port) {
    const error = new Error("SMTP_HOST arba SMTP_PORT nėra sukonfigūruotas.");
    error.statusCode = 503;
    throw error;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user ? { auth: { user, pass } } : {}),
  });
};

module.exports = {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
};
