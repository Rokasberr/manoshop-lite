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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const buildPremiumEvaluation = ({ frequency, summary }) => {
  const strongestInsight =
    (summary.insights || []).find((insight) => insight.tone === "danger") ||
    (summary.insights || []).find((insight) => insight.tone === "warning") ||
    summary.insights?.[0] ||
    null;

  const biggestWeek = (summary.weeklyTotalsCurrentMonth || [])
    .filter((entry) => Number(entry.total) > 0)
    .sort((left, right) => Number(right.total) - Number(left.total))[0];

  const lines = [];
  const strengths = [];
  const risks = [];
  const actions = [];
  const fixedProjected = Number(summary.fixedVsFlexible?.fixedProjected || 0);
  const flexibleSpent = Number(summary.fixedVsFlexible?.flexibleSpent || 0);
  const projectedTotal = Number(summary.projectedMonthTotal || summary.monthTotal || 0);
  const fixedShare = projectedTotal > 0 ? (fixedProjected / projectedTotal) * 100 : 0;
  const biggestPressure = summary.categoryPressure?.[0] || null;
  const safeToSaveAfterRecurring = Number(summary.safeToSaveAfterRecurring || 0);
  const change = summary.change;
  const dangerCount = (summary.insights || []).filter((insight) => insight.tone === "danger").length;
  const warningCount = (summary.insights || []).filter((insight) => insight.tone === "warning").length;
  const successCount = (summary.insights || []).filter((insight) => insight.tone === "success").length;
  let score = 74;

  score += successCount * 4;
  score -= dangerCount * 12;
  score -= warningCount * 6;

  if (typeof change === "number") {
    if (change <= -8) {
      score += 6;
    } else if (change >= 10) {
      score -= 8;
    }
  }

  if (summary.goalPace?.status === "on-track") {
    score += 7;
  } else if (summary.goalPace?.status === "tight") {
    score -= 4;
  } else if (summary.goalPace?.status === "behind") {
    score -= 10;
  }

  if (fixedShare >= 55) {
    score -= 6;
  } else if (fixedShare <= 28 && projectedTotal > 0) {
    score += 3;
  }

  if (safeToSaveAfterRecurring > 0) {
    score += 5;
  } else if (projectedTotal > 0) {
    score -= 8;
  }

  if (biggestPressure?.status === "over") {
    score -= 8;
  } else if (biggestPressure?.status === "warning") {
    score -= 4;
  }

  score = clamp(Math.round(score), 28, 96);

  const level =
    score >= 88
      ? "Elite control"
      : score >= 76
      ? "Strong control"
      : score >= 62
      ? "Needs tightening"
      : "Critical review";

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
    risks.push(`${biggestWeek.label} dabar yra brangiausia savaitė (${money.format(biggestWeek.total)}), todėl mėnesio spaudimas pas tave koncentruojasi ne tolygiai, o bangomis.`);
    actions.push(`Peržiūrėk ${biggestWeek.label.toLowerCase()} pirkinius ir išskirk 2–3 išlaidas, kurias gali nukirpti kitą ciklą.`);
  }

  if (summary.recurringMonthlyTotal > 0) {
    lines.push(`Vien pastovios išlaidos sudaro apie ${money.format(summary.recurringMonthlyTotal)}, todėl net ir geras einamasis ritmas atrodys silpniau, jei recurring dalis nebus aiškiai kontroliuojama.`);
    if (fixedShare >= 45) {
      risks.push(`Pastovios išlaidos jau užima apie ${Math.round(fixedShare)}% projekcinio mėnesio, todėl lankstumo taupymui lieka mažiau nei norėtųsi.`);
    } else {
      strengths.push(`Pastovios išlaidos yra aiškiai matomos, todėl turi gerą pagrindą planuoti taupymą ne aklai, o pagal realią mėnesio struktūrą.`);
    }
  }

  if (summary.goalPace?.recommendedMonthly) {
    if (summary.goalPace.status === "behind") {
      lines.push(`Pagal dabartinį tikslų tempą reikėtų atsidėti bent ${money.format(summary.goalPace.recommendedMonthly)} per mėnesį, todėl dabartinę išlaidų struktūrą verta koreguoti agresyviau.`);
      risks.push(`Taupymo tikslas „${summary.goalPace.title}“ dabar juda per lėtai, nes reikalingas tempas yra ${money.format(summary.goalPace.recommendedMonthly)} per mėnesį.`);
      actions.push(`Šią savaitę perskirstyk bent ${money.format(summary.goalPace.recommendedMonthly)} dydžio rezervą arba pakoreguok tikslą į realesnį terminą.`);
    } else if (summary.goalPace.status === "tight") {
      lines.push(`Tikslas dar pasiekiamas, bet tempas jau įtemptas: orientyras yra apie ${money.format(summary.goalPace.recommendedMonthly)} per mėnesį.`);
      risks.push(`Tikslas „${summary.goalPace.title}“ dar pasiekiamas, bet dabar jis jau priklauso nuo disciplinos, ne nuo laisvo rezervo.`);
      actions.push(`Užfiksuok automatinį atsidėjimą bent ${money.format(summary.goalPace.recommendedMonthly)} per mėnesį, kad tikslas neliktų tik intencija.`);
    } else {
      lines.push(`Gera žinia ta, kad dabartinis tikslų tempas atrodo tvarus: orientyras išlieka apie ${money.format(summary.goalPace.recommendedMonthly)} per mėnesį.`);
      strengths.push(`Taupymo tikslas „${summary.goalPace.title}“ juda tvariu tempu, todėl šiuo metu turi ne tik planą, bet ir realų jo įvykdymo rezervą.`);
    }
  } else if (summary.safeToSaveAfterRecurring !== null && summary.safeToSaveAfterRecurring !== undefined) {
    lines.push(`Po pastovių išlaidų taupymui šiuo metu dar lieka apie ${money.format(summary.safeToSaveAfterRecurring)}, todėl svarbiausia neišbarstyti šios laisvos sumos smulkiais spontaniškais pirkimais.`);
  }

  if (typeof change === "number") {
    if (change <= -8) {
      strengths.push(`Palyginti su ankstesniu laikotarpiu, išlaidų ritmas gerėja (${change}%), vadinasi, tavo finansinis elgesys jau juda teisinga kryptimi.`);
    } else if (change >= 10) {
      risks.push(`Išlaidos kyla greičiau nei įprasta (+${change}%), todėl be korekcijos kitą etapą spaudimas taupymui tik didės.`);
    }
  }

  if (safeToSaveAfterRecurring > 0) {
    strengths.push(`Po projekcijų tau vis dar lieka apie ${money.format(safeToSaveAfterRecurring)} laisvos vietos taupymui, todėl mėnuo dar nėra prarastas.`);
  } else if (projectedTotal > 0) {
    risks.push("Po faktinių ir pasikartojančių išlaidų taupymui beveik nelieka laisvos erdvės, todėl dabartinį tempą verta peržiūrėti kuo anksčiau.");
  }

  if (biggestPressure?.status === "over") {
    risks.push(`Didžiausias biudžeto spaudimas dabar ateina iš kategorijos „${biggestPressure.category}“, kuri jau peržengė planuotą ribą.`);
    actions.push(`Iki kitos suvestinės sustabdyk nebūtinus pirkinius kategorijoje „${biggestPressure.category}“ ir stebėk, kiek tai atlaisvina mėnesio rezervą.`);
  } else if (biggestPressure?.status === "healthy") {
    strengths.push(`Svarbiausios biudžeto kategorijos kol kas laikosi tvarkingai, todėl mėnesio struktūra išlieka valdoma.`);
  }

  if (flexibleSpent > fixedProjected && flexibleSpent > 0) {
    risks.push(`Lankstus išleidimas (${money.format(flexibleSpent)}) šiuo metu didesnis už fiksuotą projekciją, todėl didžiausias taupymo potencialas slypi įpročiuose, o ne sąskaitose.`);
    actions.push("Artimiausias 7 dienas fiksuok kiekvieną nebūtiną pirkimą atskirai, kad aiškiai pamatytum, kurie įpročiai labiausiai išbarsto rezervą.");
  } else if (flexibleSpent > 0) {
    strengths.push("Lanksti išlaidų dalis dar atrodo kontroliuojama, todėl korekcijai gali užtekti kelių tikslių įpročių pakeitimų.");
  }

  const nextStep =
    strongestInsight?.tone === "danger"
      ? "Pirmas veiksmas: peržiūrėk viršytą kategoriją ir sustabdyk nebūtinus pirkinius dar šią savaitę."
      : strongestInsight?.tone === "warning"
      ? "Pirmas veiksmas: pristabdyk ribą pasiekiančią kategoriją ir dar kartą palygink ją su pastoviomis išlaidomis."
      : summary.goalPace?.status === "behind"
      ? "Pirmas veiksmas: padidink mėnesio atsidėjimą arba nukelk tikslą į realesnį terminą."
      : "Pirmas veiksmas: tęsk įrašų pildymą nuosekliai ir kartą per savaitę peržiūrėk didžiausią kategoriją.";

  if (!actions.length) {
    actions.push(nextStep);
    actions.push("Dar kartą peržiūrėk didžiausią kategoriją ir palik tik tas išlaidas, kurios kuria realią vertę.");
    actions.push("Prieš kitą suvestinę bent kartą eksportuok backup arba peržiūrėk recurring mokėjimus, kad kontrolė liktų nuosekli.");
  }

  if (!strengths.length) {
    strengths.push("Turi pakankamai duomenų, kad sistema jau gali parodyti realų vaizdą, o ne tik bendrą jausmą apie išlaidas.");
  }

  if (!risks.length) {
    risks.push("Didžiausia rizika šiuo metu yra ne viena katastrofiška kategorija, o smulkūs nepastebėti nukrypimai, kurie per mėnesį susideda į didesnį spaudimą.");
  }

  const verdict =
    score >= 88
      ? "Bendras vaizdas atrodo labai stiprus: finansinė disciplina jau matosi ne tik skaičiuose, bet ir stabilume po recurring bei tikslų tempe."
      : score >= 76
      ? "Bendras vaizdas atrodo tvirtas, bet didžiausią skirtumą dabar kurs ne dideli sprendimai, o keli tikslūs koregavimai."
      : score >= 62
      ? "Bendras vaizdas dar valdomas, tačiau jau reikia aiškesnės ribų kontrolės, kad mėnesis neperaugtų į nuolatinį spaudimą."
      : "Bendras vaizdas signalizuoja, kad mėnesio struktūrą reikia peržiūrėti iš esmės, nes dabartinis tempas nepalieka pakankamai erdvės tikslams ir rezervui.";

  return {
    title: frequency === "monthly" ? "AI mėnesio komentaras" : "AI savaitės komentaras",
    body: lines.join(" "),
    nextStep,
    score,
    level,
    verdict,
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
    actions: actions.slice(0, 3),
  };
};

const buildSummaryEmail = ({ frequency, summary, userName }) => {
  const periodLabel = frequency === "monthly" ? "Mėnesio suvestinė" : "Savaitės suvestinė";
  const greetingName = userName?.trim() || "nary";
  const premiumEvaluation = buildPremiumEvaluation({ frequency, summary });
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

  const subject = `${COMPANY_NAME}: ${periodLabel.toLowerCase()} iš Stilloak`;
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
                  <h1 style="margin:0 0 18px 0;font-size:32px;line-height:1.1;color:#2b241d;">${greetingName}, štai tavo Stilloak vaizdas.</h1>
                    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#6d5c4c;">
                      Žemiau matai pagrindinius signalus: kiek šį mėnesį išleidai, kas labiausiai spaudžia biudžetą ir kur verta pradėti taupyti pirmiausia.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;border-collapse:separate;background:#f3ede3;border:1px solid #e5d8c4;border-radius:16px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#8a6c46;">
                            ${premiumEvaluation.title}
                          </p>
                          <p style="margin:0;font-size:15px;line-height:1.75;color:#2b241d;">
                            ${premiumEvaluation.body}
                          </p>
                          <p style="margin:12px 0 0 0;font-size:14px;line-height:1.7;color:#6d5c4c;">
                            <strong>Ką daryti toliau:</strong> ${premiumEvaluation.nextStep}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;border-collapse:separate;background:#2b241d;border-radius:16px;">
                      <tr>
                        <td style="padding:20px;color:#f7efe2;">
                          <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#d9bc93;">
                            Ultra pro evaluation
                          </p>
                          <p style="margin:0 0 6px 0;font-size:34px;font-weight:700;color:#ffffff;">${premiumEvaluation.score}/100</p>
                          <p style="margin:0 0 14px 0;font-size:16px;font-weight:700;color:#f3d9b0;">${premiumEvaluation.level}</p>
                          <p style="margin:0;font-size:15px;line-height:1.75;color:#f7efe2;">
                            ${premiumEvaluation.verdict}
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

                    <h2 style="margin:0 0 12px 0;font-size:20px;color:#2b241d;">Kas dabar veikia tavo naudai</h2>
                    <ul style="padding-left:20px;margin:0 0 22px 0;font-size:15px;line-height:1.7;color:#2b241d;">
                      ${premiumEvaluation.strengths.map((item) => `<li style="margin:0 0 10px 0;">${item}</li>`).join("")}
                    </ul>

                    <h2 style="margin:0 0 12px 0;font-size:20px;color:#2b241d;">Kur slypi pagrindinė rizika</h2>
                    <ul style="padding-left:20px;margin:0 0 22px 0;font-size:15px;line-height:1.7;color:#2b241d;">
                      ${premiumEvaluation.risks.map((item) => `<li style="margin:0 0 10px 0;">${item}</li>`).join("")}
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

                    <h2 style="margin:0 0 12px 0;font-size:20px;color:#2b241d;">7 dienų veiksmų planas</h2>
                    <ol style="padding-left:20px;margin:0 0 10px 0;font-size:15px;line-height:1.7;color:#2b241d;">
                      ${premiumEvaluation.actions.map((item) => `<li style="margin:0 0 10px 0;">${item}</li>`).join("")}
                    </ol>

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
    `${premiumEvaluation.title}:`,
    premiumEvaluation.body,
    `Ką daryti toliau: ${premiumEvaluation.nextStep}`,
    "",
    `Ultra Pro Evaluation: ${premiumEvaluation.score}/100 (${premiumEvaluation.level})`,
    premiumEvaluation.verdict,
    "",
    "Kas dabar veikia tavo naudai:",
    ...premiumEvaluation.strengths.map((item) => `- ${item}`),
    "",
    "Kur slypi pagrindinė rizika:",
    ...premiumEvaluation.risks.map((item) => `- ${item}`),
    "",
    "Svarbiausios įžvalgos:",
    ...(summary.insights || []).map((insight) => `- ${insight.title}${insight.metric ? ` (${insight.metric})` : ""}: ${insight.body}`),
    "",
    "7 dienų veiksmų planas:",
    ...premiumEvaluation.actions.map((item, index) => `${index + 1}. ${item}`),
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
