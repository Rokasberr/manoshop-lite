const BREVO_TRANSACTIONAL_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const parseEmailIdentity = (rawValue = "") => {
  const value = String(rawValue || "").trim();

  if (!value) {
    return { email: "", name: "" };
  }

  const match = value.match(/^(.*?)<([^>]+)>$/);

  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, ""),
      email: match[2].trim(),
    };
  }

  return {
    email: value,
    name: "",
  };
};

const getBrevoEmailConfig = () => {
  const apiKey = process.env.BREVO_API_KEY?.trim() || "";
  const sender = parseEmailIdentity(process.env.EMAIL_FROM);
  const timeoutMs = Number(process.env.BREVO_API_TIMEOUT || 15000);

  return {
    apiKey,
    sender,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 15000,
  };
};

const isBrevoEmailConfigured = () => {
  const { apiKey, sender } = getBrevoEmailConfig();
  return Boolean(apiKey && sender.email);
};

const normalizeBrevoEmailError = (error) => {
  const message = String(error?.message || "");
  const response = String(error?.response || "");
  const detailsMessage = String(error?.details?.message || "");
  const detailsCode = String(error?.details?.code || "");
  const combined = `${message}\n${response}\n${detailsMessage}\n${detailsCode}`.toLowerCase();

  if (error?.name === "AbortError" || /timeout|timed out|aborted/.test(combined)) {
    error.statusCode = 504;
    error.message = "Brevo API per ilgai neatsako. Patikrink tinklą arba Brevo būseną.";
    return error;
  }

  if (/unauthorized|invalid api key|authentication failed|not allowed|permission/.test(combined)) {
    error.statusCode = 401;
    error.message = "Brevo API raktas neteisingas. Patikrink BREVO_API_KEY.";
    return error;
  }

  if (/sender.*not.*verified|sender.*invalid|from.*invalid|not a valid sender|unauthorized sender/.test(combined)) {
    error.statusCode = 400;
    error.message =
      "Siuntėjas dar nepatvirtintas. Brevo pusėje patvirtink domeną arba senderį hello@stilloak-studio.com.";
    return error;
  }

  if (/too many requests|rate limit|quota|credits/.test(combined)) {
    error.statusCode = 429;
    error.message = "Brevo laikinai riboja siuntimą. Pabandyk dar kartą po kelių minučių.";
    return error;
  }

  return error;
};

const normalizeRecipients = (recipients) => {
  const list = Array.isArray(recipients) ? recipients : [recipients];

  return list
    .map((recipient) => {
      if (!recipient) {
        return null;
      }

      if (typeof recipient === "string") {
        const { email, name } = parseEmailIdentity(recipient);
        return email ? { email, ...(name ? { name } : {}) } : null;
      }

      const email = String(recipient.email || "").trim();
      const name = String(recipient.name || "").trim();
      return email ? { email, ...(name ? { name } : {}) } : null;
    })
    .filter(Boolean);
};

const sendBrevoTransactionalEmail = async ({
  to,
  subject,
  html,
  text,
  replyTo = null,
  tags = [],
}) => {
  const { apiKey, sender, timeoutMs } = getBrevoEmailConfig();

  if (!apiKey || !sender.email) {
    const error = new Error("Brevo API nėra sukonfigūruotas. Užpildyk BREVO_API_KEY ir EMAIL_FROM.");
    error.statusCode = 503;
    throw error;
  }

  const recipients = normalizeRecipients(to);

  if (!recipients.length) {
    const error = new Error("Nėra galiojančio gavėjo Brevo laiškui.");
    error.statusCode = 400;
    throw error;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      sender: {
        email: sender.email,
        ...(sender.name ? { name: sender.name } : {}),
      },
      to: recipients,
      subject,
      htmlContent: html,
      textContent: text,
      ...(replyTo ? { replyTo } : {}),
      ...(tags.length ? { tags } : {}),
    };

    const response = await fetch(BREVO_TRANSACTIONAL_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        responseBody?.message || responseBody?.code || "Brevo negalėjo išsiųsti laiško šiuo metu."
      );
      error.statusCode = response.status;
      error.details = responseBody;
      throw error;
    }

    return responseBody || {};
  } catch (error) {
    throw normalizeBrevoEmailError(error);
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  getBrevoEmailConfig,
  isBrevoEmailConfigured,
  normalizeBrevoEmailError,
  parseEmailIdentity,
  sendBrevoTransactionalEmail,
};
