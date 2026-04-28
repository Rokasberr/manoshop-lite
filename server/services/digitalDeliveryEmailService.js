const path = require("path");
const fs = require("fs/promises");

const { resolveDigitalAssetPath, resolveDigitalAssetMimeType } = require("../utils/digitalAsset");
const { getEmailTransport, getTransportConfig, isEmailTransportConfigured } = require("../utils/emailTransport");

const COMPANY_NAME = process.env.COMPANY_NAME?.trim() || "Stilloak Studio";

const getDigitalOrderItems = (order) =>
  order.items.filter(
    (item) => item.productType === "digital" && item.digitalAsset?.storagePath?.trim()
  );

const buildDigitalDeliveryEmail = ({ order, digitalItems, from }) => {
  const invoiceNumber = order.invoice?.number || `ORDER-${String(order._id).slice(-6).toUpperCase()}`;
  const subject = `${COMPANY_NAME}: tavo skaitmeniniai produktai paruošti`;
  const downloadSummary = digitalItems
    .map(
      (item) =>
        `<li style="margin:0 0 8px 0;"><strong>${item.name}</strong> x ${item.quantity} - failas pridėtas prie šio laiško.</li>`
    )
    .join("");

  const html = `
    <div style="margin:0;padding:24px;background:#f8f4ee;font-family:Arial,sans-serif;color:#2b241d;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #ece3d7;">
        <p style="margin:0 0 12px 0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#8a6c46;">
          Digital delivery
        </p>
        <h1 style="margin:0 0 18px 0;font-size:32px;line-height:1.1;">Tavo skaitmeniniai produktai jau paruošti.</h1>
        <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#6d5c4c;">
          Ačiū už pirkimą. Failai pridėti prie šio laiško kaip attachments, o taip pat liks pasiekiami tavo paskyroje.
        </p>
        <div style="margin:0 0 20px 0;padding:18px;border-radius:14px;background:#faf7f2;">
          <p style="margin:0 0 10px 0;font-size:13px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Užsakymas</p>
          <p style="margin:0;font-size:24px;font-weight:700;">${invoiceNumber}</p>
        </div>
        <ul style="padding-left:20px;margin:0 0 22px 0;font-size:15px;line-height:1.7;color:#2b241d;">
          ${downloadSummary}
        </ul>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#6d5c4c;">
          Jei nori, vėliau šiuos failus galėsi bet kada rasti ir savo profilyje prie užsakymų istorijos.
        </p>
        <p style="margin:18px 0 0 0;font-size:14px;line-height:1.7;color:#6d5c4c;">
          ${COMPANY_NAME}<br />
          <a href="mailto:${from}" style="color:#8a6c46;text-decoration:none;">${from}</a>
        </p>
      </div>
    </div>
  `;

  const textLines = [
    `${COMPANY_NAME}`,
    "",
    "Tavo skaitmeniniai produktai jau paruošti.",
    `Užsakymas: ${invoiceNumber}`,
    "",
    ...digitalItems.map((item) => `- ${item.name} x ${item.quantity} (failas pridėtas prie laiško)`),
    "",
    "Failai taip pat liks pasiekiami tavo paskyroje prie užsakymų istorijos.",
  ];

  return {
    subject,
    html,
    text: textLines.join("\n"),
  };
};

const buildAttachments = async (digitalItems) => {
  const attachments = [];
  const seenStoragePaths = new Set();

  for (const item of digitalItems) {
    if (seenStoragePaths.has(item.digitalAsset.storagePath)) {
      continue;
    }

    const filePath = resolveDigitalAssetPath(item.digitalAsset.storagePath);
    await fs.access(filePath);

    const fileName = (item.digitalAsset.fileName || path.basename(filePath)).replace(/[^\w.\- ]/g, "_");

    attachments.push({
      filename: fileName,
      path: filePath,
      contentType: resolveDigitalAssetMimeType(item.digitalAsset),
    });
    seenStoragePaths.add(item.digitalAsset.storagePath);
  }

  return attachments;
};

const markDigitalDeliveryFailure = async (order, message) => {
  order.digitalDeliveryEmail = {
    status: "failed",
    sentAt: order.digitalDeliveryEmail?.sentAt || null,
    lastAttemptAt: new Date(),
    error: String(message || "Digital delivery email failed.").slice(0, 500),
  };

  await order.save();
  return order;
};

const ensureDigitalDeliveryEmail = async (order) => {
  if (!order?.containsDigitalProducts) {
    return order;
  }

  if (order.paymentStatus !== "paid") {
    return order;
  }

  if (order.digitalDeliveryEmail?.status === "sent") {
    return order;
  }

  const digitalItems = getDigitalOrderItems(order);

  if (!digitalItems.length) {
    order.digitalDeliveryEmail = {
      status: "failed",
      sentAt: null,
      lastAttemptAt: new Date(),
      error: "Nerasti skaitmeninių produktų failai šiam užsakymui.",
    };
    await order.save();
    return order;
  }

  if (!isEmailTransportConfigured()) {
    return markDigitalDeliveryFailure(
      order,
      "SMTP nėra sukonfigūruotas. Užpildyk SMTP_HOST, SMTP_PORT, EMAIL_FROM ir, jei reikia, SMTP_USER/SMTP_PASS."
    );
  }

  const { from } = getTransportConfig();

  try {
    const transport = getEmailTransport();
    const attachments = await buildAttachments(digitalItems);
    const email = buildDigitalDeliveryEmail({
      order,
      digitalItems,
      from,
    });

    await transport.sendMail({
      from,
      to: order.customerEmail,
      subject: email.subject,
      text: email.text,
      html: email.html,
      attachments,
    });

    order.digitalDeliveryEmail = {
      status: "sent",
      sentAt: new Date(),
      lastAttemptAt: new Date(),
      error: "",
    };
    await order.save();
    return order;
  } catch (error) {
    console.error("Digital delivery email klaida:", error.message);
    return markDigitalDeliveryFailure(order, error.message);
  }
};

module.exports = {
  ensureDigitalDeliveryEmail,
};
