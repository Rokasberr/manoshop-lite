const BREVO_CONTACTS_ENDPOINT = "https://api.brevo.com/v3/contacts";

const getBrevoConfig = () => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listIdRaw = process.env.BREVO_LAUNCH_SOON_LIST_ID?.trim();
  const listId = listIdRaw ? Number(listIdRaw) : null;

  return {
    apiKey,
    listId: Number.isFinite(listId) ? listId : null,
  };
};

const addEmailToBrevoWaitlist = async ({ email }) => {
  const { apiKey, listId } = getBrevoConfig();

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
