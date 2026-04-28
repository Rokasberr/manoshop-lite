const { getEmailTransport, getTransportConfig, isEmailTransportConfigured } = require("../utils/emailTransport");

const COMPANY_NAME = process.env.COMPANY_NAME?.trim() || "Stilloak Studio";

const money = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const toneLabelMap = {
  success: "Gera kryptis",
  warning: "Reikia dėmesio",
  danger: "Skubu peržiūrėti",
  info: "Signalas",
};

const buildSummaryEmail = ({ frequency, summary, userName }) => {
  const periodLabel = frequency === "monthly" ? "Mėnesio suvestinė" : "Savaitės suvestinė";
  const greetingName = userName?.trim() || "nary";
  const insightItems = (summary.insights || [])
    .map(
      (insight) => `
        <li style="margin:0 0 12px 0;">
          <strong>${toneLabelMap[insight.tone] || "Signalas"}:</strong> ${insight.title}
          ${insight.metric ? ` <span style="color:#8a6c46;">(${insight.metric})</span>` : ""}
          <div style="margin-top:4px;color:#6d5c4c;">${insight.body}</div>
        </li>
      `
    )
    .join("");

  const categoryItems = (summary.categoryTotals || [])
    .slice(0, 4)
    .map(
      (entry) => `
        <tr>
          <td style="padding:8px 0;color:#2b241d;">${entry.category}</td>
          <td style="padding:8px 0;color:#2b241d;text-align:right;">${money.format(entry.total)}</td>
        </tr>
      `
    )
    .join("");

  const subject = `${COMPANY_NAME}: ${periodLabel.toLowerCase()} iš Savings Studio`;
  const html = `
    <div style="margin:0;padding:24px;background:#f8f4ee;font-family:Arial,sans-serif;color:#2b241d;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #ece3d7;">
        <p style="margin:0 0 12px 0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#8a6c46;">
          ${periodLabel}
        </p>
        <h1 style="margin:0 0 18px 0;font-size:32px;line-height:1.1;">${greetingName}, štai tavo Savings Studio vaizdas.</h1>
        <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#6d5c4c;">
          Žemiau matai pagrindinius signalus: kiek šį mėnesį išleidai, kas labiausiai spaudžia biudžetą ir kur verta pradėti taupyti pirmiausia.
        </p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0 0 22px 0;">
          <div style="padding:16px;border-radius:14px;background:#faf7f2;">
            <p style="margin:0 0 8px 0;font-size:12px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Šis mėnuo</p>
            <p style="margin:0;font-size:24px;font-weight:700;">${money.format(summary.monthTotal || 0)}</p>
          </div>
          <div style="padding:16px;border-radius:14px;background:#faf7f2;">
            <p style="margin:0 0 8px 0;font-size:12px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Po recurring</p>
            <p style="margin:0;font-size:24px;font-weight:700;">${money.format(summary.safeToSaveAfterRecurring || 0)}</p>
          </div>
          <div style="padding:16px;border-radius:14px;background:#faf7f2;">
            <p style="margin:0 0 8px 0;font-size:12px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Top kategorija</p>
            <p style="margin:0;font-size:20px;font-weight:700;">${summary.topCategory || "Dar nėra duomenų"}</p>
          </div>
        </div>
        <h2 style="margin:0 0 12px 0;font-size:20px;">Svarbiausios įžvalgos</h2>
        <ul style="padding-left:20px;margin:0 0 22px 0;font-size:15px;line-height:1.7;color:#2b241d;">
          ${insightItems || "<li>Kol kas dar trūksta duomenų, kad sistema galėtų parodyti aiškias rekomendacijas.</li>"}
        </ul>
        <h2 style="margin:0 0 12px 0;font-size:20px;">Didžiausios kategorijos</h2>
        <table style="width:100%;border-collapse:collapse;margin:0 0 22px 0;font-size:15px;">
          <tbody>
            ${categoryItems || "<tr><td style='padding:8px 0;color:#6d5c4c;'>Dar nėra pakankamai įrašų.</td><td></td></tr>"}
          </tbody>
        </table>
        ${
          summary.goalPace
            ? `<div style="margin:0 0 22px 0;padding:18px;border-radius:14px;background:#faf7f2;">
                <p style="margin:0 0 10px 0;font-size:13px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Taupymo tikslas</p>
                <p style="margin:0 0 8px 0;font-size:24px;font-weight:700;">${summary.goalPace.title}</p>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#6d5c4c;">
                  Rekomenduojamas tempas: ${money.format(summary.goalPace.recommendedMonthly || 0)} / mėn.
                </p>
              </div>`
            : ""
        }
        <p style="margin:18px 0 0 0;font-size:14px;line-height:1.7;color:#6d5c4c;">
          ${COMPANY_NAME}
        </p>
      </div>
    </div>
  `;

  const text = [
    `${COMPANY_NAME}`,
    "",
    `${periodLabel}`,
    `Šis mėnuo: ${money.format(summary.monthTotal || 0)}`,
    `Po recurring: ${money.format(summary.safeToSaveAfterRecurring || 0)}`,
    `Top kategorija: ${summary.topCategory || "Dar nėra duomenų"}`,
    "",
    "Svarbiausios įžvalgos:",
    ...(summary.insights || []).map((insight) => `- ${insight.title}${insight.metric ? ` (${insight.metric})` : ""}: ${insight.body}`),
  ].join("\n");

  return { subject, html, text };
};

const sendSavingsSummaryEmail = async ({ frequency = "weekly", profile, summary, user }) => {
  if (!isEmailTransportConfigured()) {
    return { sent: false, skipped: true, reason: "smtp-not-configured" };
  }

  const { from } = getTransportConfig();
  const transport = getEmailTransport();
  const email = buildSummaryEmail({
    frequency,
    summary,
    userName: user?.name,
  });

  await transport.sendMail({
    from,
    to: user.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  profile.summaryEmailLastSentAt = new Date();
  await profile.save();

  return { sent: true };
};

module.exports = {
  sendSavingsSummaryEmail,
};
