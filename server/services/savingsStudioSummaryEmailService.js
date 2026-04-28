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

const buildAiCommentary = ({ frequency, summary }) => {
  const strongestInsight =
    (summary.insights || []).find((insight) => insight.tone === "danger") ||
    (summary.insights || []).find((insight) => insight.tone === "warning") ||
    summary.insights?.[0] ||
    null;

  const biggestWeek = (summary.weeklyTotalsCurrentMonth || [])
    .filter((entry) => Number(entry.total) > 0)
    .sort((left, right) => Number(right.total) - Number(left.total))[0];

  const lines = [];

  if (frequency === "weekly") {
    lines.push("Pagal šios savaitės vaizdą svarbiausia žiūrėti ne į visų išlaidų kiekį, o į vietą, kur mėnesis greičiausiai praranda kontrolę.");
  } else {
    lines.push("Pagal šio mėnesio vaizdą verta vertinti ne tik kiek išleidai, bet ir ar dabartinis tempas leidžia pasiekti taupymo tikslus be papildomo spaudimo kitą mėnesį.");
  }

  if (strongestInsight) {
    lines.push(`Ryškiausias signalas dabar yra „${strongestInsight.title.toLowerCase()}${strongestInsight.metric ? `“ (${strongestInsight.metric})` : "“"}.`);
  } else if (summary.topCategory) {
    lines.push(`Šiuo metu ryškiausiai išsiskiria kategorija „${summary.topCategory.toLowerCase()}“, todėl būtent ji turi didžiausią įtaką bendram mėnesio balansui.`);
  }

  if (biggestWeek) {
    lines.push(`${biggestWeek.label} šiame mėnesyje kol kas yra brangiausia (${money.format(biggestWeek.total)}), todėl verta peržiūrėti, kokie pirkiniai susikoncentravo būtent tame ruože.`);
  }

  if (summary.recurringMonthlyTotal > 0) {
    lines.push(`Vien pastovios išlaidos sudaro apie ${money.format(summary.recurringMonthlyTotal)}, todėl net ir geras einamasis ritmas atrodys silpniau, jei recurring dalis nebus aiškiai kontroliuojama.`);
  }

  if (summary.goalPace?.recommendedMonthly) {
    if (summary.goalPace.status === "behind") {
      lines.push(`Pagal dabartinį tikslų tempą reikėtų atsidėti bent ${money.format(summary.goalPace.recommendedMonthly)} per mėnesį, todėl dabartinę išlaidų struktūrą verta koreguoti agresyviau.`);
    } else if (summary.goalPace.status === "tight") {
      lines.push(`Tikslas dar pasiekiamas, bet tempas jau įtemptas: orientyras yra apie ${money.format(summary.goalPace.recommendedMonthly)} per mėnesį.`);
    } else {
      lines.push(`Gera žinia ta, kad dabartinis tikslų tempas atrodo tvarus: orientyras išlieka apie ${money.format(summary.goalPace.recommendedMonthly)} per mėnesį.`);
    }
  } else if (summary.safeToSaveAfterRecurring !== null && summary.safeToSaveAfterRecurring !== undefined) {
    lines.push(`Po pastovių išlaidų taupymui šiuo metu dar lieka apie ${money.format(summary.safeToSaveAfterRecurring)}, todėl svarbiausia neišbarstyti šios laisvos sumos smulkiais spontaniškais pirkimais.`);
  }

  const nextStep =
    strongestInsight?.tone === "danger"
      ? "Pirmas veiksmas: peržiūrėk viršytą kategoriją ir sustabdyk nebūtinus pirkinius dar šią savaitę."
      : strongestInsight?.tone === "warning"
      ? "Pirmas veiksmas: pristabdyk ribą pasiekiančią kategoriją ir dar kartą palygink ją su pastoviomis išlaidomis."
      : summary.goalPace?.status === "behind"
      ? "Pirmas veiksmas: padidink mėnesio atsidėjimą arba nukelk tikslą į realesnį terminą."
      : "Pirmas veiksmas: tęsk įrašų pildymą nuosekliai ir kartą per savaitę peržiūrėk didžiausią kategoriją.";

  return {
    title: frequency === "monthly" ? "AI mėnesio komentaras" : "AI savaitės komentaras",
    body: lines.join(" "),
    nextStep,
  };
};

const buildSummaryEmail = ({ frequency, summary, userName }) => {
  const periodLabel = frequency === "monthly" ? "Mėnesio suvestinė" : "Savaitės suvestinė";
  const greetingName = userName?.trim() || "nary";
  const aiCommentary = buildAiCommentary({ frequency, summary });
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
    <!doctype html>
    <html lang="lt">
      <body style="margin:0;padding:24px;background:#f8f4ee;font-family:Arial,sans-serif;color:#2b241d;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="width:680px;max-width:100%;border-collapse:separate;background:#ffffff;border:1px solid #ece3d7;border-radius:18px;">
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 12px 0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#8a6c46;">
                      ${periodLabel}
                    </p>
                    <h1 style="margin:0 0 18px 0;font-size:32px;line-height:1.1;color:#2b241d;">${greetingName}, štai tavo Savings Studio vaizdas.</h1>
                    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#6d5c4c;">
                      Žemiau matai pagrindinius signalus: kiek šį mėnesį išleidai, kas labiausiai spaudžia biudžetą ir kur verta pradėti taupyti pirmiausia.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;border-collapse:separate;background:#f3ede3;border:1px solid #e5d8c4;border-radius:16px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#8a6c46;">
                            ${aiCommentary.title}
                          </p>
                          <p style="margin:0;font-size:15px;line-height:1.75;color:#2b241d;">
                            ${aiCommentary.body}
                          </p>
                          <p style="margin:12px 0 0 0;font-size:14px;line-height:1.7;color:#6d5c4c;">
                            <strong>Ką daryti toliau:</strong> ${aiCommentary.nextStep}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;border-collapse:collapse;">
                      <tr>
                        <td width="33.33%" style="padding:0 6px 0 0;vertical-align:top;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#faf7f2;border-radius:14px;">
                            <tr>
                              <td style="padding:16px;">
                                <p style="margin:0 0 8px 0;font-size:12px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Šis mėnuo</p>
                                <p style="margin:0;font-size:24px;font-weight:700;color:#2b241d;">${money.format(summary.monthTotal || 0)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="33.33%" style="padding:0 3px;vertical-align:top;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#faf7f2;border-radius:14px;">
                            <tr>
                              <td style="padding:16px;">
                                <p style="margin:0 0 8px 0;font-size:12px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Po recurring</p>
                                <p style="margin:0;font-size:24px;font-weight:700;color:#2b241d;">${money.format(summary.safeToSaveAfterRecurring || 0)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="33.33%" style="padding:0 0 0 6px;vertical-align:top;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#faf7f2;border-radius:14px;">
                            <tr>
                              <td style="padding:16px;">
                                <p style="margin:0 0 8px 0;font-size:12px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Top kategorija</p>
                                <p style="margin:0;font-size:20px;font-weight:700;color:#2b241d;">${summary.topCategory || "Dar nėra duomenų"}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <h2 style="margin:0 0 12px 0;font-size:20px;color:#2b241d;">Svarbiausios įžvalgos</h2>
                    <ul style="padding-left:20px;margin:0 0 22px 0;font-size:15px;line-height:1.7;color:#2b241d;">
                      ${insightItems || "<li>Kol kas dar trūksta duomenų, kad sistema galėtų parodyti aiškias rekomendacijas.</li>"}
                    </ul>

                    <h2 style="margin:0 0 12px 0;font-size:20px;color:#2b241d;">Didžiausios kategorijos</h2>
                    <table style="width:100%;border-collapse:collapse;margin:0 0 22px 0;font-size:15px;">
                      <tbody>
                        ${categoryItems || "<tr><td style='padding:8px 0;color:#6d5c4c;'>Dar nėra pakankamai įrašų.</td><td></td></tr>"}
                      </tbody>
                    </table>

                    ${
                      summary.goalPace
                        ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;border-collapse:separate;background:#faf7f2;border-radius:14px;">
                            <tr>
                              <td style="padding:18px;">
                                <p style="margin:0 0 10px 0;font-size:13px;color:#8a6c46;text-transform:uppercase;letter-spacing:0.18em;">Taupymo tikslas</p>
                                <p style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#2b241d;">${summary.goalPace.title}</p>
                                <p style="margin:0;font-size:15px;line-height:1.7;color:#6d5c4c;">
                                  Rekomenduojamas tempas: ${money.format(summary.goalPace.recommendedMonthly || 0)} / mėn.
                                </p>
                              </td>
                            </tr>
                          </table>`
                        : ""
                    }

                    <p style="margin:18px 0 0 0;font-size:14px;line-height:1.7;color:#6d5c4c;">
                      ${COMPANY_NAME}
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
    `${COMPANY_NAME}`,
    "",
    `${periodLabel}`,
    `Šis mėnuo: ${money.format(summary.monthTotal || 0)}`,
    `Po recurring: ${money.format(summary.safeToSaveAfterRecurring || 0)}`,
    `Top kategorija: ${summary.topCategory || "Dar nėra duomenų"}`,
    "",
    `${aiCommentary.title}:`,
    aiCommentary.body,
    `Ką daryti toliau: ${aiCommentary.nextStep}`,
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
