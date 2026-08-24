const BREVO_CONTACTS_ENDPOINT = "https://api.brevo.com/v3/contacts";
const BREVO_ATTRIBUTE_NAME_PATTERN = /^[A-Z][A-Z0-9_]{0,63}$/;

const normalizeBrevoAttributeName = (value) => {
  const attributeName = String(value || "").trim();
  return BREVO_ATTRIBUTE_NAME_PATTERN.test(attributeName) ? attributeName : "";
};

const getBrevoConfig = () => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listIdRaw = process.env.BREVO_LAUNCH_SOON_LIST_ID?.trim();
  const listId = listIdRaw ? Number(listIdRaw) : null;
  const focusAttributeName = normalizeBrevoAttributeName(process.env.BREVO_LAUNCH_FOCUS_ATTRIBUTE);

  return {
    apiKey,
    focusAttributeName,
    listId: Number.isFinite(listId) ? listId : null,
  };
};

const addEmailToBrevoWaitlist = async ({ email, focus = "default" }) => {
  const { apiKey, focusAttributeName, listId } = getBrevoConfig();

  if (!apiKey) {
    const error = new Error("Brevo waitlist is not configured yet.");
    error.statusCode = 503;
    throw error;
  }

  const payload = {
    email,
    emailBlacklisted: false,
    updateEnabled: true,
  };

  if (focusAttributeName) {
    payload.attributes = {
      [focusAttributeName]: focus,
    };
  }

  if (listId) {
    payload.listIds = [listId];
  }

  const response = await fetch(BREVO_CONTACTS_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const body = await response.json().catch(() => ({}));
    return {
      ok: true,
      id: body.id || null,
      listId,
    };
  }

  const errorBody = await response.json().catch(() => null);
  const brevoMessage =
    errorBody?.message ||
    errorBody?.code ||
    "Brevo could not save this contact right now.";

  const error = new Error(brevoMessage);
  error.statusCode = response.status;
  error.details = errorBody;
  throw error;
};

module.exports = {
  addEmailToBrevoWaitlist,
};
