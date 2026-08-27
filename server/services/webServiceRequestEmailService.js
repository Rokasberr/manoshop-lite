const {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
  normalizeEmailTransportError,
} = require("../utils/emailTransport");
const {
  getBrevoEmailConfig,
  isBrevoEmailConfigured,
  parseEmailIdentity,
  sendBrevoTransactionalEmail,
} = require("../utils/brevoEmail");

const COMPANY_NAME = process.env.COMPANY_NAME?.trim() || "Stilloak Studio";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Pagal poreikius";
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return String(value);
  }

  return `${new Intl.NumberFormat("lt-LT", { maximumFractionDigits: 2 }).format(number)} €`;
};

const getNotificationRecipient = () => {
  const configuredRecipient = process.env.WEB_ORDERS_NOTIFY_EMAIL?.trim() || "";
  if (configuredRecipient) {
    return parseEmailIdentity(configuredRecipient).email;
  }

  const brevoSender = getBrevoEmailConfig().sender;
  if (brevoSender?.email) {
    return brevoSender.email;
  }

  return parseEmailIdentity(getTransportConfig().from).email;
};

const buildCustomerEmail = (request) => {
  const requestNumber = String(request.requestNumber || "").trim();
  const customerName = String(request.name || "").trim() || "kliente";
  const packageName = String(request.packageName || "").trim() || "Svetainės kūrimas";
  const basePrice = formatPrice(request.basePrice);
  const subject = `Stilloak Web: užsakymas ${requestNumber} gautas`;
  const text = [
    `Sveiki, ${customerName},`,
    "",
    "Ačiū už jūsų užklausą. Ją sėkmingai gavome ir užregistravome.",
    "",
    `Užklausos numeris: ${requestNumber}`,
    `Paketas: ${packageName}`,
    `Bazinė kaina: ${basePrice}`,
    request.budget ? `Nurodytas biudžetas: ${request.budget}` : null,
    "",
    "Peržiūrėsime projekto informaciją ir susisieksime dėl kitų žingsnių.",
    "",
    "Stilloak Web",
    COMPANY_NAME,
  ]
    .filter(Boolean)
    .join("\n");

  const safeName = escapeHtml(customerName);
  const safeNumber = escapeHtml(requestNumber);
  const safePackage = escapeHtml(packageName);
  const safePrice = escapeHtml(basePrice);
  const safeBudget = escapeHtml(request.budget || "");

  const html = `
    <div style="margin:0;padding:24px;background:#f7f5f2;font-family:Arial,sans-serif;color:#201d19;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e8e2da;border-radius:18px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#806b50;">Stilloak Web</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;">Užsakymas gautas</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#655b50;">Sveiki, ${safeName}. Ačiū už jūsų užklausą — ją sėkmingai gavome ir užregistravome.</p>
        <div style="margin:0 0 22px;padding:18px;border-radius:14px;background:#f7f5f2;">
          <p style="margin:0 0 8px;"><strong>Užklausos numeris:</strong> ${safeNumber}</p>
          <p style="margin:0 0 8px;"><strong>Paketas:</strong> ${safePackage}</p>
          <p style="margin:0${safeBudget ? " 0 8px" : ""};"><strong>Bazinė kaina:</strong> ${safePrice}</p>
          ${safeBudget ? `<p style="margin:0;"><strong>Nurodytas biudžetas:</strong> ${safeBudget}</p>` : ""}
        </div>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#655b50;">Peržiūrėsime projekto informaciją ir susisieksime dėl kitų žingsnių.</p>
      </div>
    </div>
  `;

  return { subject, text, html };
};

const buildAdminEmail = (request) => {
  const requestNumber = String(request.requestNumber || "").trim();
  const customerName = String(request.name || "").trim();
  const packageName = String(request.packageName || "").trim() || "Svetainės kūrimas";
  const basePrice = formatPrice(request.basePrice);
  const subject = `Naujas Stilloak Web užsakymas — ${requestNumber}`;
  const text = [
    "Naujas Stilloak Web užsakymas.",
    "",
    `Numeris: ${requestNumber}`,
    `Klientas: ${customerName}`,
    `El. paštas: ${request.email || "-"}`,
    `Telefonas: ${request.phone || "-"}`,
    `Įmonė: ${request.company || "-"}`,
    `Paketas: ${packageName}`,
    `Bazinė kaina: ${basePrice}`,
    request.budget ? `Biudžetas: ${request.budget}` : null,
    "",
    "Projekto aprašymas:",
    String(request.message || "-").trim(),
    "",
    "Užsakymas taip pat matomas Stilloak administravimo sistemoje.",
  ]
    .filter(Boolean)
    .join("\n");

  const rows = [
    ["Numeris", requestNumber],
    ["Klientas", customerName],
    ["El. paštas", request.email || "-"],
    ["Telefonas", request.phone || "-"],
    ["Įmonė", request.company || "-"],
    ["Paketas", packageName],
    ["Bazinė kaina", basePrice],
    ...(request.budget ? [["Biudžetas", request.budget]] : []),
  ];

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:7px 12px 7px 0;color:#766a5e;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:7px 0;font-weight:600;word-break:break-word;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="margin:0;padding:24px;background:#f7f5f2;font-family:Arial,sans-serif;color:#201d19;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e8e2da;border-radius:18px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#806b50;">Stilloak Web · Naujas užsakymas</p>
        <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;">${escapeHtml(requestNumber)}</h1>
        <table style="width:100%;border-collapse:collapse;margin:0 0 22px;font-size:14px;">${htmlRows}</table>
        <div style="padding:18px;border-radius:14px;background:#f7f5f2;">
          <p style="margin:0 0 8px;font-weight:700;">Projekto aprašymas</p>
          <p style="margin:0;white-space:pre-wrap;line-height:1.65;color:#655b50;">${escapeHtml(request.message || "-")}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
};

const sendThroughSmtp = async ({ to, replyTo, email }) => {
  const { from, socketTimeout = 15000 } = getTransportConfig();
  const transport = getEmailTransport();
  const maxWaitMs = Math.max(socketTimeout, 15000);
  let timeoutId = null;

  try {
    await Promise.race([
      transport.sendMail({
        from,
        to,
        ...(replyTo ? { replyTo } : {}),
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error("SMTP serveris per ilgai neatsako.");
          error.statusCode = 504;
          reject(error);
        }, maxWaitMs);
      }),
    ]);
  } catch (error) {
    if (typeof transport.close === "function") {
      transport.close();
    }
    throw normalizeEmailTransportError(error);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  return { sent: true, provider: "smtp" };
};

const sendTransactional = async ({ to, replyTo, email, tags }) => {
  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({
      to,
      replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
      tags,
    });

    return { sent: true, provider: "brevo-api", messageId: result?.messageId || null };
  }

  if (!isEmailTransportConfigured()) {
    return { sent: false, skipped: true, reason: "email-not-configured" };
  }

  return sendThroughSmtp({ to, replyTo, email });
};

const sendWebServiceRequestEmails = async (request) => {
  const adminRecipient = getNotificationRecipient();
  const adminReplyTo = adminRecipient ? { email: adminRecipient, name: "Stilloak Web" } : null;
  const customerEmail = buildCustomerEmail(request);
  const adminEmail = buildAdminEmail(request);

  const tasks = [
    sendTransactional({
      to: request.email,
      replyTo: adminReplyTo,
      email: customerEmail,
      tags: ["web-orders", "customer-confirmation"],
    }),
  ];

  if (adminRecipient) {
    tasks.push(
      sendTransactional({
        to: adminRecipient,
        replyTo: request.email ? { email: request.email, name: request.name || "" } : null,
        email: adminEmail,
        tags: ["web-orders", "admin-notification"],
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length) {
    const error = new Error(`Nepavyko išsiųsti ${failures.length} web užsakymo laiško(-ų).`);
    error.causes = failures.map((result) => result.reason);
    throw error;
  }

  return {
    sent: results.some((result) => result.value?.sent),
    results: results.map((result) => result.value),
  };
};

module.exports = {
  buildAdminEmail,
  buildCustomerEmail,
  formatPrice,
  getNotificationRecipient,
  sendWebServiceRequestEmails,
};
