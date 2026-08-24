const { getPrimaryClientUrl } = require("../utils/originMatcher");

const COMPANY_NAME = process.env.COMPANY_NAME?.trim() || "Stilloak Studio";
const SUPPORT_EMAIL = "hello@stilloak-studio.com";
const TRUSTED_PRODUCTION_URL = "https://www.stilloak-studio.com";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizePublicText = (value) =>
  String(value || "")
    .replace(/sk_(live|test)_[A-Za-z0-9_]+/g, "[paslėpta]")
    .replace(/whsec_[A-Za-z0-9_]+/g, "[paslėpta]")
    .replace(/\b(pi|in|sub|cus|cs)_[A-Za-z0-9_]+\b/g, "[paslėpta]")
    .replace(/[A-Z]:\\[^\s<]+/gi, "[apsaugotas failas]");

const isSafeHttpUrl = (value) => {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:");
  } catch (_error) {
    return false;
  }
};

const getTrustedFrontendBaseUrl = () => {
  const configuredUrl = getPrimaryClientUrl();

  if (process.env.NODE_ENV === "production") {
    return TRUSTED_PRODUCTION_URL;
  }

  return isSafeHttpUrl(configuredUrl) ? configuredUrl.replace(/\/+$/, "") : "http://localhost:5173";
};

const buildTrustedFrontendUrl = (pathname = "/profile") => {
  const baseUrl = getTrustedFrontendBaseUrl();
  const normalizedPath = String(pathname || "/profile").startsWith("/")
    ? String(pathname || "/profile")
    : `/${pathname}`;

  return new URL(normalizedPath, baseUrl).toString();
};

const formatMoney = ({ amount, currency }) => {
  const numericAmount = Number(amount);
  const normalizedCurrency = String(currency || "eur").toUpperCase();

  if (!Number.isFinite(numericAmount)) {
    return "";
  }

  try {
    return new Intl.NumberFormat("lt-LT", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (_error) {
    return `${numericAmount.toFixed(2)} ${normalizedCurrency}`;
  }
};

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
};

const getLogoHtml = () => {
  const logoUrl = process.env.EMAIL_LOGO_URL?.trim() || "";

  if (!logoUrl || !isSafeHttpUrl(logoUrl)) {
    return "";
  }

  return `
    <td style="vertical-align:middle;padding-right:12px;">
      <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(COMPANY_NAME)} logo" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:12px;" />
    </td>
  `;
};

const buildBaseEmail = ({ subject, preheader, title, intro, rows = [], cta = null, footerNote = "" }) => {
  const safeSubject = String(subject || "").trim();
  const safePreheader = escapeHtml(sanitizePublicText(preheader));
  const safeTitle = escapeHtml(sanitizePublicText(title));
  const safeIntro = escapeHtml(sanitizePublicText(intro));
  const rowHtml = rows
    .filter((row) => row?.label && row?.value)
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0;color:#6d5c4c;font-size:14px;">${escapeHtml(sanitizePublicText(row.label))}</td>
          <td style="padding:10px 0;color:#2b241d;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(sanitizePublicText(row.value))}</td>
        </tr>
      `
    )
    .join("");
  const ctaHtml = cta?.url
    ? `
      <p style="margin:24px 0;">
        <a href="${escapeHtml(cta.url)}" style="display:inline-block;border-radius:999px;background:#2b241d;color:#ffffff;text-decoration:none;padding:12px 18px;font-weight:700;">
          ${escapeHtml(sanitizePublicText(cta.label || "Atidaryti paskyrą"))}
        </a>
      </p>
    `
    : "";

  const html = `
    <!doctype html>
    <html lang="lt">
      <body style="margin:0;padding:24px;background:#f8f4ee;font-family:Arial,sans-serif;color:#2b241d;">
        <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${safePreheader}</span>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:640px;max-width:100%;border-collapse:separate;background:#ffffff;border:1px solid #ece3d7;border-radius:18px;">
                <tr>
                  <td style="padding:32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;border-collapse:collapse;">
                      <tr>
                        ${getLogoHtml()}
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:18px;font-weight:700;color:#2b241d;">${escapeHtml(COMPANY_NAME)}</p>
                          <p style="margin:4px 0 0 0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8a6c46;">Paskyros pranešimas</p>
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.2;color:#2b241d;">${safeTitle}</h1>
                    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#6d5c4c;">${safeIntro}</p>
                    ${
                      rowHtml
                        ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px 0;border-collapse:collapse;border-top:1px solid #ece3d7;border-bottom:1px solid #ece3d7;">${rowHtml}</table>`
                        : ""
                    }
                    ${ctaHtml}
                    ${
                      footerNote
                        ? `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#6d5c4c;">${escapeHtml(sanitizePublicText(footerNote))}</p>`
                        : ""
                    }
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
    sanitizePublicText(title),
    "",
    sanitizePublicText(intro),
    "",
    ...rows
      .filter((row) => row?.label && row?.value)
      .map((row) => `${sanitizePublicText(row.label)}: ${sanitizePublicText(row.value)}`),
    ...(cta?.url ? ["", `${sanitizePublicText(cta.label || "Atidaryti paskyrą")}: ${cta.url}`] : []),
    ...(footerNote ? ["", sanitizePublicText(footerNote)] : []),
    "",
    `Pagalba: ${SUPPORT_EMAIL}`,
  ].join("\n");

  return {
    subject: safeSubject,
    html,
    text,
  };
};

const buildSubscriptionPaymentSucceededEmail = ({ planName, amount, currency, paidAt, status }) =>
  buildBaseEmail({
    subject: `${COMPANY_NAME}: prenumeratos mokėjimas patvirtintas`,
    preheader: "Stilloak Studio patvirtino tavo prenumeratos mokėjimą.",
    title: "Prenumeratos mokėjimas patvirtintas.",
    intro: "Stripe patvirtino mokėjimą, todėl tavo prenumeratos būsena atnaujinta paskyroje.",
    rows: [
      { label: "Planas", value: planName },
      { label: "Suma", value: formatMoney({ amount, currency }) },
      { label: "Mokėjimo data", value: formatDate(paidAt) },
      { label: "Prenumeratos būsena", value: status },
    ],
    cta: { label: "Peržiūrėti profilį ir sąskaitas", url: buildTrustedFrontendUrl("/profile") },
  });

const buildSubscriptionPaymentIssueEmail = ({ actionRequired = false, planName, amount, currency, date, status }) =>
  buildBaseEmail({
    subject: actionRequired
      ? `${COMPANY_NAME}: reikia patvirtinti prenumeratos mokėjimą`
      : `${COMPANY_NAME}: prenumeratos mokėjimas nepavyko`,
    preheader: actionRequired
      ? "Stripe nurodo, kad mokėjimui reikia papildomo veiksmo."
      : "Stripe nurodo, kad prenumeratos mokėjimas nepavyko.",
    title: actionRequired ? "Reikia patvirtinti mokėjimą." : "Prenumeratos mokėjimas nepavyko.",
    intro: actionRequired
      ? "Stripe nurodo, kad šiam mokėjimui reikia papildomo veiksmo. Prisijunk prie profilio ir atidaryk prenumeratos valdymą."
      : "Stripe nurodo, kad šio mokėjimo nepavyko apdoroti. Prisijunk prie profilio ir atnaujink mokėjimo informaciją.",
    rows: [
      { label: "Planas", value: planName },
      { label: "Suma", value: formatMoney({ amount, currency }) },
      { label: "Data", value: formatDate(date) },
      { label: "Prenumeratos būsena", value: status },
    ],
    cta: { label: "Atidaryti profilį", url: buildTrustedFrontendUrl("/profile") },
    footerNote: "Laiške nerodome techninių mokėjimo ID. Tikslią informaciją matysi profilyje arba Stripe savitarnoje.",
  });

const buildSubscriptionCancelScheduledEmail = ({ planName, currentPeriodEnd, status }) =>
  buildBaseEmail({
    subject: `${COMPANY_NAME}: prenumeratos atšaukimas suplanuotas`,
    preheader: "Tavo prenumerata pažymėta atšaukti laikotarpio pabaigoje.",
    title: "Prenumeratos atšaukimas suplanuotas.",
    intro: "Tavo mokama prenumerata pažymėta atšaukti dabartinio laikotarpio pabaigoje.",
    rows: [
      { label: "Planas", value: planName },
      { label: "Prenumeratos būsena", value: status },
      { label: "Prieiga iki", value: formatDate(currentPeriodEnd) },
    ],
    cta: { label: "Atidaryti profilį", url: buildTrustedFrontendUrl("/profile") },
  });

const buildSubscriptionCanceledEmail = ({ planName, canceledAt, status }) =>
  buildBaseEmail({
    subject: `${COMPANY_NAME}: mokama prenumerata atšaukta`,
    preheader: "Tavo mokama Stilloak Studio prieiga baigėsi.",
    title: "Mokama prenumerata atšaukta.",
    intro: "Tavo mokama prieiga baigėsi. Profilio puslapyje gali peržiūrėti dabartinę paskyros būseną ir pasirinkti kitą planą.",
    rows: [
      { label: "Planas", value: planName },
      { label: "Prenumeratos būsena", value: status },
      { label: "Atšaukimo data", value: formatDate(canceledAt) },
    ],
    cta: { label: "Atidaryti profilį", url: buildTrustedFrontendUrl("/profile") },
  });

const buildDigitalProductDeliveredEmail = ({ productName, purchasedAt }) =>
  buildBaseEmail({
    subject: `${COMPANY_NAME}: skaitmeninis produktas paruoštas`,
    preheader: "Pirkimas patvirtintas, produktas pasiekiamas tavo paskyroje.",
    title: "Skaitmeninis produktas paruoštas.",
    intro: "Stripe mokėjimas patvirtintas, o teisėto pirkimo įrašas sukurtas. Produktą rasi saugioje paskyros produktų zonoje.",
    rows: [
      { label: "Produktas", value: productName },
      { label: "Pirkimo data", value: formatDate(purchasedAt) },
    ],
    cta: { label: "Atidaryti produktų zoną", url: buildTrustedFrontendUrl("/digital-products") },
    footerNote: "Saugumo sumetimais šiame laiške nėra failų priedų, tiesioginių failo kelių ar ilgalaikių atsisiuntimo tokenų.",
  });

module.exports = {
  buildDigitalProductDeliveredEmail,
  buildSubscriptionCanceledEmail,
  buildSubscriptionCancelScheduledEmail,
  buildSubscriptionPaymentIssueEmail,
  buildSubscriptionPaymentSucceededEmail,
  buildTrustedFrontendUrl,
  escapeHtml,
  formatDate,
  formatMoney,
  getTrustedFrontendBaseUrl,
  sanitizePublicText,
};
