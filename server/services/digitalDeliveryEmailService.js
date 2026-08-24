const User = require("../models/User");
const {
  EmailDeliveryRetryableError,
  ensureTransactionalEmailDelivery,
  isValidRecipientEmail,
  sanitizeErrorMessage,
} = require("./transactionalEmailDeliveryService");
const { buildTrustedFrontendUrl, escapeHtml, sanitizePublicText } = require("./transactionalEmailTemplateService");

const COMPANY_NAME = process.env.COMPANY_NAME?.trim() || "Stilloak Studio";
const SUPPORT_EMAIL = "hello@stilloak-studio.com";

const getDigitalOrderItems = (order) =>
  (order.items || []).filter((item) => item.productType === "digital");

const buildDigitalDeliveryEmail = ({ order, digitalItems }) => {
  const invoiceNumber = order.invoice?.number || `ORDER-${String(order._id).slice(-6).toUpperCase()}`;
  const productsUrl = buildTrustedFrontendUrl("/profile");
  const productList = digitalItems
    .map(
      (item) =>
        `<li style="margin:0 0 8px 0;"><strong>${escapeHtml(sanitizePublicText(item.name))}</strong> x ${escapeHtml(
          item.quantity
        )}</li>`
    )
    .join("");
  const subject = `${COMPANY_NAME}: skaitmeninis produktas paruoštas`;

  const html = `
    <!doctype html>
    <html lang="lt">
      <body style="margin:0;padding:24px;background:#f8f4ee;font-family:Arial,sans-serif;color:#2b241d;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:640px;max-width:100%;border-collapse:separate;background:#ffffff;border:1px solid #ece3d7;border-radius:18px;">
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 12px 0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#8a6c46;">Skaitmeninis pristatymas</p>
                    <h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.2;">Pirkimas patvirtintas.</h1>
                    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#6d5c4c;">
                      Mokėjimas patvirtintas, todėl skaitmeniniai produktai pasiekiami saugioje paskyros zonoje.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px 0;border-collapse:collapse;border-top:1px solid #ece3d7;border-bottom:1px solid #ece3d7;">
                      <tr>
                        <td style="padding:10px 0;color:#6d5c4c;font-size:14px;">Užsakymas</td>
                        <td style="padding:10px 0;color:#2b241d;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(invoiceNumber)}</td>
                      </tr>
                    </table>
                    <ul style="padding-left:20px;margin:0 0 22px 0;font-size:15px;line-height:1.7;color:#2b241d;">${productList}</ul>
                    <p style="margin:0 0 22px 0;">
                      <a href="${escapeHtml(productsUrl)}" style="display:inline-block;border-radius:999px;background:#2b241d;color:#ffffff;text-decoration:none;padding:12px 18px;font-weight:700;">
                        Atidaryti paskyrą
                      </a>
                    </p>
                    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#6d5c4c;">
                      Saugumo sumetimais šiame laiške nėra failų priedų, tiesioginių failo kelių ar ilgalaikių atsisiuntimo tokenų.
                    </p>
                    <p style="margin:18px 0 0 0;font-size:14px;line-height:1.7;color:#6d5c4c;">
                      Pagalba: <a href="mailto:${SUPPORT_EMAIL}" style="color:#8a6c46;text-decoration:none;">${SUPPORT_EMAIL}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = [
    COMPANY_NAME,
    "",
    "Pirkimas patvirtintas.",
    `Užsakymas: ${invoiceNumber}`,
    "",
    ...digitalItems.map((item) => `- ${sanitizePublicText(item.name)} x ${item.quantity}`),
    "",
    `Produktai pasiekiami saugioje paskyros zonoje: ${productsUrl}`,
    "Saugumo sumetimais šiame laiške nėra failų priedų, tiesioginių failo kelių ar ilgalaikių atsisiuntimo tokenų.",
    "",
    `Pagalba: ${SUPPORT_EMAIL}`,
  ].join("\n");

  return { subject, html, text };
};

const markDigitalDeliveryFailure = async (order, message) => {
  order.digitalDeliveryEmail = {
    status: "failed",
    sentAt: order.digitalDeliveryEmail?.sentAt || null,
    lastAttemptAt: new Date(),
    error: sanitizeErrorMessage(message || "Nepavyko išsiųsti skaitmeninio pristatymo laiško.").slice(0, 500),
  };

  await order.save();
  return order;
};

const getOrderUserId = (order) => {
  if (!order?.user) {
    return "";
  }

  if (typeof order.user === "object" && order.user._id) {
    return order.user._id.toString();
  }

  return order.user.toString?.() || String(order.user || "");
};

const getUserById = async (userId) => {
  if (!userId) {
    return null;
  }

  const query = User.findById(userId);
  return query?.select ? query.select("-password") : query;
};

const ensureDigitalDeliveryEmail = async (order, { emailSender } = {}) => {
  if (!order?.containsDigitalProducts || order.paymentStatus !== "paid") {
    return order;
  }

  if (order.digitalDeliveryEmail?.status === "sent") {
    return order;
  }

  const digitalItems = getDigitalOrderItems(order);

  if (!digitalItems.length) {
    return markDigitalDeliveryFailure(order, "Nerasti skaitmeniniai produktai šiam užsakymui.");
  }

  const orderUserId = getOrderUserId(order);

  if (!orderUserId) {
    return markDigitalDeliveryFailure(order, "Užsakymas neturi saugios vartotojo nuosavybės.");
  }

  const user = await getUserById(orderUserId);

  if (!user || user.isDeleted) {
    return markDigitalDeliveryFailure(order, "Užsakymo vartotojas nerastas arba ištrintas.");
  }

  if (user._id?.toString?.() !== orderUserId) {
    return markDigitalDeliveryFailure(order, "Užsakymo vartotojo nuosavybės patikra nepavyko.");
  }

  if (!isValidRecipientEmail(user.email)) {
    return markDigitalDeliveryFailure(order, "Užsakymo vartotojo el. paštas netinkamas.");
  }

  try {
    const result = await ensureTransactionalEmailDelivery({
      type: "order-digital-delivery",
      dedupeKey: order._id.toString(),
      userId: orderUserId,
      tags: ["order", "digital-delivery"],
      userModel: {
        findById: () => ({
          select: async () => user,
        }),
      },
      emailSender,
      emailBuilder: () => buildDigitalDeliveryEmail({ order, digitalItems }),
    });

    if (result?.duplicate && result?.status === "sent") {
      order.digitalDeliveryEmail = {
        status: "sent",
        sentAt: order.digitalDeliveryEmail?.sentAt || new Date(),
        lastAttemptAt: new Date(),
        error: "",
      };
      await order.save();
      return order;
    }

    if (!result?.sent && !result?.skipped) {
      return markDigitalDeliveryFailure(order, result?.reason || "El. pašto transportas nepatvirtino siuntimo.");
    }

    if (result?.skipped) {
      return order;
    }

    order.digitalDeliveryEmail = {
      status: "sent",
      sentAt: new Date(),
      lastAttemptAt: new Date(),
      error: "",
    };
    await order.save();
    return order;
  } catch (error) {
    if (error instanceof EmailDeliveryRetryableError || error?.retryable) {
      throw error;
    }

    console.error("[email] Digital order delivery failed.", {
      order: String(order._id || "").slice(-8),
      reason: error?.code || error?.statusCode || error?.name || "email-error",
    });

    return markDigitalDeliveryFailure(order, error);
  }
};

module.exports = {
  buildDigitalDeliveryEmail,
  ensureDigitalDeliveryEmail,
};
