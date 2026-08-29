const {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
  isFullEmailTransportConfigured,
  normalizeEmailTransportError,
} = require("../utils/emailTransport");
const {
  getBrevoEmailConfig,
  isBrevoEmailConfigured,
  parseEmailIdentity,
  sendBrevoTransactionalEmail,
} = require("../utils/brevoEmail");

const COMPANY_NAME = process.env.COMPANY_NAME?.trim() || "Stilloak Studio";
const WEB_ORDERS_FROM_EMAIL =
  process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";
const WEB_PUBLIC_URL = (process.env.WEB_PUBLIC_URL?.trim() || "https://web.stilloak-studio.com").replace(/\/+$/, "");
const WEB_ADMIN_ORDERS_URL =
  process.env.WEB_ORDERS_ADMIN_URL?.trim() || "https://stilloak-studio.com/admin/web-orders";
const WEB_LOGO_URL = `${WEB_PUBLIC_URL}/stilloak-logo.svg`;

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

const buildBrandHeader = (eyebrow) => `
  <table role="presentation" align="center" style="width:100%;border-collapse:collapse;margin:0 0 28px;text-align:center;">
    <tr>
      <td style="width:54px;vertical-align:middle;">
        <img src="${escapeHtml(WEB_LOGO_URL)}" width="44" height="44" alt="Stilloak Web" style="display:block;width:44px;height:44px;border:0;outline:none;text-decoration:none;" />
      </td>
      <td style="vertical-align:middle;padding-left:12px;text-align:center;">
        <div style="font-size:19px;line-height:1.1;font-weight:700;letter-spacing:-0.03em;color:#201d19;">Stilloak <span style="color:#8a5a39;font-weight:600;">Web</span></div>
        <div style="margin-top:5px;font-size:10px;line-height:1.3;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8b7b6c;">${escapeHtml(eyebrow)}</div>
      </td>
    </tr>
  </table>
`;

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
    <div style="margin:0;padding:28px 14px;background:#f5f0e9;font-family:Arial,Helvetica,sans-serif;color:#201d19;text-align:center;">
      <div style="max-width:640px;margin:0 auto;overflow:hidden;background:#fffdf9;border:1px solid #e5dbcf;border-radius:22px;box-shadow:0 14px 40px rgba(74,51,33,.08);text-align:center;">
        <div style="padding:30px 32px 10px;text-align:center;">
          ${buildBrandHeader("Užklausa sėkmingai gauta")}
          <div style="display:inline-block;margin:0 0 14px;padding:7px 11px;border-radius:999px;background:#f0e4d7;color:#765039;font-size:11px;font-weight:700;letter-spacing:.04em;">${safeNumber}</div>
          <h1 style="margin:0;font-size:30px;line-height:1.2;letter-spacing:-.035em;color:#201d19;text-align:center;">Ačiū, ${safeName}.</h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.75;color:#665e56;text-align:center;">Jūsų svetainės kūrimo užklausa jau mūsų sistemoje. Peržiūrėsime informaciją ir susisieksime dėl projekto apimties, termino bei kitų žingsnių.</p>
        </div>

        <div style="padding:20px 32px 30px;text-align:center;">
          <table role="presentation" style="width:100%;border-collapse:collapse;background:#f7f2ec;border:1px solid #ebe1d6;border-radius:16px;">
            <tr>
              <td style="padding:18px 20px 9px;color:#82766b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;text-align:center;">Pasirinktas paketas</td>
              <td style="padding:18px 20px 9px;color:#82766b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;text-align:center;">Kaina</td>
            </tr>
            <tr>
              <td style="padding:0 20px 18px;font-size:16px;font-weight:700;color:#2c2723;text-align:center;">${safePackage}</td>
              <td style="padding:0 20px 18px;font-size:16px;font-weight:700;color:#2c2723;text-align:center;">${safePrice}</td>
            </tr>
            ${safeBudget ? `<tr><td colspan="2" style="padding:14px 20px;border-top:1px solid #e7dbcf;font-size:13px;color:#665e56;text-align:center;"><strong>Nurodytas biudžetas:</strong> ${safeBudget}</td></tr>` : ""}
          </table>

          <div style="margin-top:22px;padding:18px 20px;border-left:3px solid #9a6744;background:#fbf7f2;border-radius:0 13px 13px 0;text-align:center;">
            <div style="font-size:12px;font-weight:700;color:#4c4037;">Kas toliau?</div>
            <div style="margin-top:6px;font-size:13px;line-height:1.7;color:#74685e;">1. Peržiūrime užklausą · 2. Susisiekiame · 3. Paruošiame konkretų pasiūlymą.</div>
          </div>
        </div>

        <div style="padding:18px 32px;background:#201d19;color:#d9cec2;font-size:11px;line-height:1.6;text-align:center;">
          Stilloak Web · ${escapeHtml(COMPANY_NAME)} · <a href="${escapeHtml(WEB_PUBLIC_URL)}" style="color:#f0d9c4;text-decoration:none;">web.stilloak-studio.com</a>
        </div>
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
    ["Klientas", customerName || "-"],
    ["El. paštas", request.email || "-"],
    ["Telefonas", request.phone || "-"],
    ["Įmonė", request.company || "-"],
    ["Paketas", packageName],
    ["Bazinė kaina", basePrice],
    ...(request.budget ? [["Biudžetas", request.budget]] : []),
  ];

  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:9px 12px 9px 0;color:#81756a;font-size:12px;vertical-align:top;border-bottom:1px solid #eee5dc;">${escapeHtml(label)}</td>
          <td style="padding:9px 0;font-size:13px;font-weight:700;color:#2d2824;word-break:break-word;border-bottom:1px solid #eee5dc;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="margin:0;padding:28px 14px;background:#f5f0e9;font-family:Arial,Helvetica,sans-serif;color:#201d19;text-align:left;">
      <div style="max-width:680px;margin:0 auto;overflow:hidden;background:#fffdf9;border:1px solid #e5dbcf;border-radius:22px;box-shadow:0 14px 40px rgba(74,51,33,.08);text-align:left;">
        <div style="padding:30px 32px;text-align:left;">
          ${buildBrandHeader("Naujas potencialus klientas")}

          <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr>
              <td style="vertical-align:middle;">
                <div style="display:inline-block;padding:7px 11px;border-radius:999px;background:#e9f3eb;color:#346142;font-size:11px;font-weight:700;">Nauja užklausa</div>
              </td>
              <td style="vertical-align:middle;text-align:right;font-family:monospace;font-size:12px;font-weight:700;color:#76685d;">${escapeHtml(requestNumber)}</td>
            </tr>
          </table>

          <h1 style="margin:0;font-size:28px;line-height:1.2;letter-spacing:-.035em;color:#201d19;text-align:left;">${escapeHtml(customerName || "Naujas klientas")}</h1>
          <p style="margin:10px 0 22px;font-size:14px;line-height:1.65;color:#6c6259;text-align:left;">Gauta nauja svetainės kūrimo užklausa. Žemiau — svarbiausia informacija vienoje vietoje.</p>

          <div style="padding:4px 20px 8px;background:#f8f3ed;border:1px solid #e9dfd4;border-radius:16px;">
            <table role="presentation" style="width:100%;border-collapse:collapse;">${htmlRows}</table>
          </div>

          <div style="margin-top:20px;padding:19px 20px;background:#211e1a;border-radius:16px;color:#fffaf5;">
            <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#cbb9aa;">Projekto aprašymas</div>
            <div style="margin-top:9px;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#f0e7df;text-align:left;word-break:break-word;">${escapeHtml(request.message || "-")}</div>
          </div>

          <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:22px;">
            <tr>
              <td style="padding-right:8px;">
                <a href="${escapeHtml(WEB_ADMIN_ORDERS_URL)}" style="display:block;padding:13px 16px;border-radius:11px;background:#68462f;color:#fffaf5;text-align:center;text-decoration:none;font-size:13px;font-weight:700;">Atidaryti CRM</a>
              </td>
              <td style="padding-left:8px;">
                <a href="mailto:${escapeHtml(request.email || "")}" style="display:block;padding:12px 16px;border:1px solid #d8c9bb;border-radius:11px;background:#fffdf9;color:#5a4638;text-align:center;text-decoration:none;font-size:13px;font-weight:700;">Atsakyti klientui</a>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding:18px 32px;background:#f3ece4;color:#786d63;font-size:11px;line-height:1.6;">
          Stilloak Web pardavimų pranešimas · ${escapeHtml(COMPANY_NAME)}
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
};

const sendThroughSmtp = async ({ to, replyTo, email, fromOverride = "" }) => {
  const { from, socketTimeout = 15000 } = getTransportConfig();
  const transport = getEmailTransport();
  const maxWaitMs = Math.max(socketTimeout, 15000);
  const effectiveFrom = fromOverride || from;
  let timeoutId = null;

  try {
    await Promise.race([
      transport.sendMail({
        from: effectiveFrom,
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

const sendTransactional = async ({ to, replyTo, email, tags, senderOverride = null }) => {
  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({
      to,
      replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
      tags,
      senderOverride,
    });

    return { sent: true, provider: "brevo-api", messageId: result?.messageId || null };
  }

  if (!isEmailTransportConfigured()) {
    return { sent: false, skipped: true, reason: "email-not-configured" };
  }

  return sendThroughSmtp({ to, replyTo, email });
};

const sendAdminNotification = async ({ to, replyTo, email, tags }) => {
  if (isBrevoEmailConfigured()) {
    try {
      const result = await sendBrevoTransactionalEmail({
        to,
        replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
        tags: [...tags, "branded-html"],
        senderOverride: WEB_ORDERS_FROM_EMAIL,
      });

      return {
        sent: true,
        provider: "brevo-api",
        messageId: result?.messageId || null,
      };
    } catch (brevoError) {
      if (!isFullEmailTransportConfigured()) {
        throw brevoError;
      }
    }
  }

  if (isFullEmailTransportConfigured()) {
    const { user, from } = getTransportConfig();
    return sendThroughSmtp({
      to,
      replyTo,
      email,
      fromOverride: user || from,
    });
  }

  return sendTransactional({
    to,
    replyTo,
    email,
    tags,
    senderOverride: WEB_ORDERS_FROM_EMAIL,
  });
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
      senderOverride: WEB_ORDERS_FROM_EMAIL,
    }),
  ];

  if (adminRecipient) {
    tasks.push(
      sendAdminNotification({
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
