const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { pathToFileURL } = require("url");

const rootDir = path.resolve(__dirname, "..");
const outputRoot = path.join(rootDir, "client", "public", "resources", "productivity");
const logoPath = path.join(rootDir, "client", "public", "favicon.svg");
const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\Application\\msedge.exe",
];

const brand = {
  studio: "StillOak Studio",
  dark: "#081410",
  text: "#211b16",
  muted: "#75695d",
  line: "#e2d8ca",
  paper: "#fbf8f2",
  gold: "#b28445",
  green: "#1d5443",
};

const logoDataUri = `data:image/svg+xml;base64,${fs.readFileSync(logoPath).toString("base64")}`;
const table = (headers, rows) => ({ headers, rows });
const worksheet = (fields) => fields;
const checklist = (items) => items;

const pdfResources = [
  {
    fileName: "stilloak-productivity-starter-kit.pdf",
    title: "Produktyvumo Starter Kit",
    subtitle: "Dienos, savaitės, tikslų ir įpročių planavimo pradžios rinkinys.",
    sections: [
      {
        title: "Dienos planavimo puslapis",
        intro: "Pradėk nuo vieno aiškaus dienos fokuso. Geras planas nėra ilgas darbų sąrašas, o pasirinkimas, kas šiandien svarbiausia.",
        worksheet: worksheet(["Šiandienos fokusas", "3 svarbiausi darbai", "Vienas darbas, kurį galima atidėti", "Dienos pabaigos pastaba"]),
      },
      {
        title: "Savaitės planavimo sistema",
        intro: "Savaitė tampa lengvesnė, kai darbai suskirstomi pagal rezultatą, terminą ir energijos lygį.",
        table: table(["Sritis", "Tikslas", "Svarbiausias veiksmas", "Kada atliksiu"], [["Darbas / mokslai", "", "", ""], ["Asmeniniai tikslai", "", "", ""], ["Poilsis", "", "", ""], ["Namai / administravimas", "", "", ""]]),
      },
      {
        title: "Prioritetų matrica",
        intro: "Matrica padeda pasirinkti, ką atlikti dabar, ką suplanuoti, ką deleguoti ir ką pašalinti.",
        table: table(["Užduotis", "Svarbu?", "Skubu?", "Sprendimas"], [["", "Taip / ne", "Taip / ne", ""], ["", "Taip / ne", "Taip / ne", ""], ["", "Taip / ne", "Taip / ne", ""], ["", "Taip / ne", "Taip / ne", ""]]),
      },
      {
        title: "Tikslų išskaidymas",
        intro: "Didelis tikslas tampa lengviau valdomas, kai jis išskaidomas į savaitės rezultatą ir pirmą mažą veiksmą.",
        worksheet: worksheet(["30 dienų tikslas", "Kodėl svarbu?", "Savaitės rezultatas", "Pirmas 20 minučių veiksmas", "Kas gali sutrukdyti?"]),
      },
      {
        title: "Įpročių ritmas",
        intro: "Pasirink vieną įprotį, kuris palaiko produktyvumą. Ritmas turi būti toks mažas, kad jį galėtum kartoti ir užimtesnę dieną.",
        table: table(["Įprotis", "Dažnumas", "Minimalus variantas", "Kaip žymėsiu"], [["Planavimas", "Kasdien", "3 minutės", ""], ["Pertrauka", "Kasdien", "10 minučių", ""], ["Savaitės peržiūra", "1 kartą per savaitę", "15 minučių", ""]]),
      },
      {
        title: "30 dienų veiksmų planas",
        intro: "Produktyvumas stiprėja, kai mažas veiksmas kartojamas pakankamai ilgai.",
        table: table(["Laikas", "Fokusas", "Veiksmas", "Pažyma"], [["1 savaitė", "Aiškumas", "Išsirinkti vieną ritmą", ""], ["2 savaitė", "Nuoseklumas", "Kartoti dienos fokusą", ""], ["3 savaitė", "Peržiūra", "Pamatyti, kas stringa", ""], ["4 savaitė", "Užtvirtinimas", "Palikti tik veikiančią sistemą", ""]]),
      },
      {
        title: "Refleksijos klausimai",
        intro: "Refleksija padeda planą paversti mokymusi, o ne vien užpildytu lapu.",
        checklist: checklist(["Kas šią savaitę davė daugiausia aiškumo?", "Kuri užduotis kartojosi be realios vertės?", "Kada dirbau lengviausiai?", "Ką kitą savaitę supaprastinsiu?", "Koks vienas veiksmas pajudins svarbiausią tikslą?"]),
      },
      {
        title: "Pabaigos santrauka",
        intro: "Užbaik rinkinį vienu aiškiu pasirinkimu: ką tęsi, ką stabdysi ir kokį ritmą paliksi kitam mėnesiui.",
        worksheet: worksheet(["Ką tęsiu?", "Ką sustabdysiu?", "Ką supaprastinsiu?", "Kitas savaitės tikslas", "Peržiūros data"]),
      },
    ],
  },
  {
    fileName: "stilloak-30-day-productivity-planner.pdf",
    title: "30 dienų produktyvumo planuoklis",
    subtitle: "Kasdieniai prioritetai, dienos fokusas, savaitės refleksija ir veiksmo planas.",
    sections: [
      {
        title: "Mėnesio kryptis",
        intro: "Prieš pildant dienas, pasirink vieną mėnesio kryptį. Ji padės spręsti, kurioms užduotims sakyti taip, o kurioms ne.",
        worksheet: worksheet(["30 dienų kryptis", "Svarbiausias rezultatas", "Kodėl dabar?", "Kaip matuosiu progresą"]),
      },
      {
        title: "Kasdieniai prioritetai",
        intro: "Kiekvienai dienai pasirink iki trijų prioritetų. Tai padeda neužpildyti dienos darbu, kuris atrodo užimtas, bet nejuda į rezultatą.",
        worksheet: worksheet(["Diena", "Pagrindinis prioritetas", "Antras prioritetas", "Trečias prioritetas", "Kas neturi užimti mano dienos?"]),
      },
      {
        title: "Dienos fokusas",
        intro: "Dienos fokusas yra trumpas sakinys, kuris primena, kodėl šie darbai svarbūs.",
        table: table(["Diena", "Fokusas", "Energijos lygis", "Pabaigos pastaba"], [["1", "", "", ""], ["2", "", "", ""], ["3", "", "", ""], ["4", "", "", ""], ["5", "", "", ""]]),
      },
      {
        title: "Savaitės refleksija",
        intro: "Kas septynias dienas sustok ir įvertink, kas veikė. Refleksija turi būti trumpa, kad ją būtų lengva kartoti.",
        worksheet: worksheet(["Kas pavyko?", "Kas užėmė per daug laiko?", "Kuris įprotis padėjo?", "Ką keisiu kitą savaitę?"]),
      },
      {
        title: "Produktyvumo balas",
        intro: "Balas nėra savikritikai. Jis padeda pastebėti ritmą ir laiku koreguoti sistemą.",
        table: table(["Savaitė", "Fokusas 1-5", "Užbaigimas 1-5", "Ramybė 1-5", "Pastaba"], [["1", "", "", "", ""], ["2", "", "", "", ""], ["3", "", "", "", ""], ["4", "", "", "", ""]]),
      },
      {
        title: "Trukdžių peržiūra",
        intro: "Produktyvumas dažnai stringa ne dėl valios, o dėl pasikartojančių trukdžių. Pažymėk, ką verta keisti pirmiausia.",
        table: table(["Trukdis", "Kada kartojasi", "Ką keisiu?", "Poveikis"], [["Per dažnas perjungimas", "", "", ""], ["Neaiškus prioritetas", "", "", ""], ["Per mažai poilsio", "", "", ""], ["Per platus darbų sąrašas", "", "", ""]]),
      },
      {
        title: "Veiksmo planas kitai savaitei",
        intro: "Užbaik savaitę ne dideliu pažadu, o vienu aiškiu veiksmu, kurį tikrai atliksi.",
        checklist: checklist(["Pasirinkti vieną svarbiausią savaitės rezultatą.", "Iš kalendoriaus išimti bent vieną nereikalingą bloką.", "Palikti vietos poilsiui.", "Pirmadienį pradėti nuo svarbiausio veiksmo."]),
      },
      {
        title: "30 dienų santrauka",
        intro: "Mėnesio pabaigoje svarbiausia pamatyti ne tik atliktų darbų kiekį, bet ir kokią sistemą verta kartoti.",
        worksheet: worksheet(["Kas labiausiai veikė?", "Ką kartosiu kitą mėnesį?", "Ką mažinsiu?", "Koks kitas 30 dienų fokusas?"]),
      },
    ],
  },
  {
    fileName: "stilloak-weekly-planner-pro.pdf",
    title: "Weekly Planner Pro",
    subtitle: "Savaitės planavimo šablonas darbams, projektams, mokslams ir asmeniniams tikslams.",
    sections: [
      {
        title: "Savaitės tikslai",
        intro: "Savaitės tikslai turi būti pakankamai konkretūs, kad penktadienį būtų aišku, ar jie pajudėjo.",
        worksheet: worksheet(["Pagrindinis savaitės rezultatas", "Antras rezultatas", "Trečias rezultatas", "Kodėl ši savaitė svarbi?"]),
      },
      {
        title: "Pagrindiniai prioritetai",
        intro: "Prioritetai turi tilpti į realų kalendorių, o ne tik į norų sąrašą.",
        table: table(["Prioritetas", "Rezultatas", "Laiko blokas", "Rizika"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]),
      },
      {
        title: "Užduočių lentelė",
        intro: "Užduotis lengviau užbaigti, kai jos turi terminą, būseną ir aiškią kitą akciją.",
        table: table(["Užduotis", "Projektas", "Terminas", "Būsena", "Kitas veiksmas"], [["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""]]),
      },
      {
        title: "Terminų blokas",
        intro: "Terminai matomi vienoje vietoje saugo nuo paskutinės minutės skubos.",
        table: table(["Data", "Terminas", "Pasiruošimas", "Ar suplanuota?"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]),
      },
      {
        title: "Energijos planas",
        intro: "Ne visi darbai reikalauja tos pačios energijos. Sunkiausius darbus dėk ten, kur paprastai turi daugiausia dėmesio.",
        table: table(["Dienos dalis", "Energija", "Tinkami darbai", "Pastaba"], [["Rytas", "Aukšta / vidutinė", "", ""], ["Diena", "Vidutinė", "", ""], ["Vakaras", "Žema / rami", "", ""]]),
      },
      {
        title: "Savaitės rezultatų peržiūra",
        intro: "Peržiūra uždaro savaitę ir leidžia kitą pradėti švariau.",
        worksheet: worksheet(["Kas užbaigta?", "Kas liko?", "Kas pasikeitė?", "Ką kartosiu?", "Ką sustabdysiu?"]),
      },
      {
        title: "Kitos savaitės perkėlimas",
        intro: "Ne viską, kas liko, reikia perkelti. Perkelk tik tai, kas vis dar svarbu.",
        checklist: checklist(["Išbraukti užduotis be aiškios vertės.", "Perkelti tik svarbius likučius.", "Nustatyti naują terminą.", "Pažymėti pirmą veiksmą."]),
      },
      {
        title: "Savaitės santrauka",
        intro: "Pabaigoje užrašyk vieną pamoką ir vieną sprendimą kitai savaitei.",
        worksheet: worksheet(["Svarbiausia pamoka", "Geriausias sprendimas", "Kas trukdė?", "Ką darysiu kitaip?"]),
      },
    ],
  },
  {
    fileName: "stilloak-habit-tracker.pdf",
    title: "Habit Tracker",
    subtitle: "Įpročių sekimo sistema 30 dienų progresui, ritmui ir refleksijai.",
    sections: [
      {
        title: "Įpročio aprašymas",
        intro: "Geras įprotis turi būti konkretus, mažas ir aiškiai susietas su situacija.",
        worksheet: worksheet(["Įpročio pavadinimas", "Kodėl svarbu?", "Kada kartosiu?", "Koks minimalus veiksmas?", "Kas primins?"]),
      },
      {
        title: "Dažnumas ir ritmas",
        intro: "Pasirink realų dažnumą. Geriau 3 kartai per savaitę, kurie įvyksta, nei kasdienis pažadas, kuris nutrūksta po trijų dienų.",
        table: table(["Įprotis", "Dažnumas", "Geriausias laikas", "Atsarginis laikas"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]),
      },
      {
        title: "30 dienų sekimas",
        intro: "Žymėk atlikimą trumpai. Tikslas yra matyti ritmą, ne sukurti dar vieną sudėtingą sistemą.",
        table: table(["Įprotis", "1-7", "8-14", "15-21", "22-30", "Progresas"], [["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""]]),
      },
      {
        title: "Progreso procentas",
        intro: "Procentas padeda įvertinti sistemą. Jei progresas žemas, mažink įpročio dydį arba keisk laiką.",
        worksheet: worksheet(["Atlikta dienų", "Planuota dienų", "Procentas", "Kas padėjo?", "Ką keisiu?"]),
      },
      {
        title: "Trukdžių analizė",
        intro: "Įprotis dažniausiai nutrūksta dėl pasikartojančios kliūties. Įvardink ją prieš planuodamas didesnį tikslą.",
        table: table(["Kliūtis", "Kada atsiranda", "Ką darysiu?", "Minimalus variantas"], [["Nuovargis", "", "", ""], ["Nėra laiko", "", "", ""], ["Pamirštu", "", "", ""], ["Per didelis įprotis", "", "", ""]]),
      },
      {
        title: "Motyvacijos klausimai",
        intro: "Motyvacija sustiprėja, kai įprotis susiejamas su realiu gyvenimo pokyčiu.",
        checklist: checklist(["Ką šis įprotis palengvina?", "Kokį rezultatą noriu jausti po 30 dienų?", "Kokį mažą signalą matysiu po savaitės?", "Kas man padės tęsti?"]),
      },
      {
        title: "Savaitės peržiūra",
        intro: "Kartą per savaitę pažymėk ne tik atlikimą, bet ir tai, kas padėjo išlaikyti ritmą.",
        worksheet: worksheet(["Kiek kartų atlikau?", "Kas padėjo?", "Kas trukdė?", "Ką keisiu kitą savaitę?"]),
      },
      {
        title: "Pabaigos santrauka",
        intro: "Įprotis laikosi tada, kai jis dera su gyvenimu, o ne kovoja prieš jį.",
        checklist: checklist(["Pasirinkti įprotį, kurį tęsiu.", "Sumažinti įprotį, kuris per didelis.", "Pasirinkti kitą 30 dienų fokusą.", "Pasidžiaugti tęstinumu, ne tobulybe."]),
      },
    ],
  },
];

const makeDayRows = (days) =>
  Array.from({ length: days }, (_, index) => [
    String(index + 1),
    "",
    "",
    "",
    "Ne",
    "",
    "",
  ]);

const csvResources = [
  {
    fileName: "stilloak-productivity-starter-kit.csv",
    rows: [
      ["Diena", "Dienos fokusas", "3 svarbiausi darbai", "Įprotis", "Atlikta?", "Produktyvumo balas 1-5", "Refleksijos pastaba"],
      ["1", "Aiškiai pradėti dieną", "Užrašyti prioritetus; atlikti svarbiausią darbą; suplanuoti pertrauką", "10 min planavimas", "Ne", "", ""],
      ...makeDayRows(30).slice(1),
    ],
  },
  {
    fileName: "stilloak-weekly-planner-pro.csv",
    rows: [
      ["Savaitė", "Tikslas", "Prioritetas", "Užduotis", "Terminas", "Būsena", "Energijos lygis", "Rezultato pastaba"],
      ["1", "Užbaigti svarbiausią savaitės darbą", "Aukštas", "Skirti 90 min fokuso bloką", "Penktadienis", "Planuojama", "Aukštas", ""],
      ["1", "", "Vidutinis", "", "", "Planuojama", "Vidutinis", ""],
      ["1", "", "Žemas", "", "", "Planuojama", "Žemas", ""],
      ["2", "", "Aukštas", "", "", "Planuojama", "", ""],
      ["2", "", "Vidutinis", "", "", "Planuojama", "", ""],
      ["3", "", "Aukštas", "", "", "Planuojama", "", ""],
      ["4", "", "Aukštas", "", "", "Planuojama", "", ""],
    ],
  },
  {
    fileName: "stilloak-habit-tracker.csv",
    rows: [
      ["Įprotis", "Dažnumas", ...Array.from({ length: 30 }, (_, index) => String(index + 1)), "Atlikta kartų", "Progreso procentas", "Refleksija"],
      ["10 min planavimas", "Kasdien", ...Array.from({ length: 30 }, () => "Ne"), "0", "0%", ""],
      ["Judėjimas", "3 kartai per savaitę", ...Array.from({ length: 30 }, () => "Ne"), "0", "0%", ""],
      ["Skaitymas", "5 kartai per savaitę", ...Array.from({ length: 30 }, () => "Ne"), "0", "0%", ""],
      ["Poilsio ritualas", "Kasdien", ...Array.from({ length: 30 }, () => "Ne"), "0", "0%", ""],
    ],
  },
  {
    fileName: "stilloak-time-blocking-template.csv",
    rows: [
      ["Data", "Laiko blokas", "Užduotis", "Kategorija", "Prioritetas", "Energijos lygis", "Statusas", "Dienos santrauka"],
      ["", "06:00-07:00", "Rytinis pasiruošimas", "Asmeninis ritmas", "Vidutinis", "Žemas", "Neatlikta", ""],
      ["", "07:00-08:00", "Planavimas ir fokusas", "Planavimas", "Aukštas", "Vidutinis", "Neatlikta", ""],
      ["", "08:00-10:00", "Gilus darbas", "Darbas / mokslai", "Aukštas", "Aukštas", "Neatlikta", ""],
      ["", "10:00-11:00", "Žinutės ir administravimas", "Administravimas", "Vidutinis", "Vidutinis", "Neatlikta", ""],
      ["", "11:00-12:00", "Projektas", "Darbas / mokslai", "Aukštas", "Aukštas", "Neatlikta", ""],
      ["", "12:00-13:00", "Pietūs / poilsis", "Poilsis", "Vidutinis", "Žemas", "Neatlikta", ""],
      ["", "13:00-15:00", "Antras fokuso blokas", "Darbas / mokslai", "Aukštas", "Vidutinis", "Neatlikta", ""],
      ["", "15:00-16:00", "Peržiūra ir korekcijos", "Planavimas", "Vidutinis", "Vidutinis", "Neatlikta", ""],
      ["", "16:00-17:00", "Lengvesnės užduotys", "Užduotys", "Žemas", "Žemas", "Neatlikta", ""],
      ["", "17:00-18:00", "Judėjimas / perėjimas", "Poilsis", "Vidutinis", "Žemas", "Neatlikta", ""],
    ],
  },
];

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);

const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
const writeCsv = ({ fileName, rows }) => {
  const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
  fs.writeFileSync(path.join(outputRoot, fileName), csv, "utf8");
};

const renderTable = (data) => `
  <table>
    <thead><tr>${data.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>${data.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell ? escapeHtml(cell) : "&nbsp;"}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
`;

const renderWorksheet = (fields) => `
  <div class="worksheet">${fields.map((field) => `<div><span>${escapeHtml(field)}</span><i></i></div>`).join("")}</div>
`;

const renderChecklist = (items) => `
  <div class="checklist">${items.map((item) => `<p><span></span>${escapeHtml(item)}</p>`).join("")}</div>
`;

const renderSection = (section, index, total) => `
  <section class="page">
    <header><div class="brand"><img src="${logoDataUri}" alt="" /><b>${brand.studio}</b></div><em>Sekcija ${index + 1}</em></header>
    <main>
      <small>Produktyvumo resursai</small>
      <h2>${escapeHtml(section.title)}</h2>
      <p class="intro">${escapeHtml(section.intro)}</p>
      ${section.table ? renderTable(section.table) : ""}
      ${section.worksheet ? renderWorksheet(section.worksheet) : ""}
      ${section.checklist ? renderChecklist(section.checklist) : ""}
    </main>
    <footer><span>${brand.studio}</span><span>${index + 3} / ${total}</span></footer>
  </section>
`;

const buildHtml = (resource) => {
  const total = resource.sections.length + 2;
  return `<!doctype html>
<html lang="lt">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(resource.title)}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; color: ${brand.text}; background: ${brand.paper}; font-family: "Segoe UI", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { position: relative; width: 210mm; min-height: 297mm; page-break-after: always; overflow: hidden; padding: 18mm 17mm 16mm; background: radial-gradient(circle at 18% 8%, rgba(178,132,69,.16), transparent 32%), linear-gradient(135deg, #fffdf8, #f8f1e6 58%, #eef3ed); }
    .page:last-child { page-break-after: auto; }
    .cover { display: flex; flex-direction: column; justify-content: space-between; color: #fffaf0; background: linear-gradient(140deg, rgba(8,20,16,.96), rgba(29,84,67,.92)); }
    .cover:after { content: ""; position: absolute; inset: 22mm 16mm; border: 1px solid rgba(241,223,189,.34); }
    header, footer, .brand { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    header { color: ${brand.muted}; font-size: 11px; }
    footer { position: absolute; left: 17mm; right: 17mm; bottom: 11mm; padding-top: 5mm; border-top: 1px solid ${brand.line}; color: ${brand.muted}; font-size: 11px; }
    .brand { justify-content: flex-start; color: ${brand.dark}; }
    .brand img { width: 24px; height: 24px; }
    .cover .brand { color: #fffaf0; }
    .cover .brand img { width: 32px; height: 32px; }
    h1, h2, h3, p { margin: 0; }
    h1 { max-width: 155mm; font-family: Georgia, serif; font-size: 50px; line-height: 1.02; font-weight: 600; }
    h2 { max-width: 155mm; margin-top: 4mm; margin-bottom: 6mm; color: ${brand.dark}; font-family: Georgia, serif; font-size: 34px; line-height: 1.08; font-weight: 600; }
    small { color: ${brand.gold}; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    .cover p, .intro, .guide p { color: ${brand.muted}; font-size: 15px; line-height: 1.65; }
    .cover p { max-width: 132mm; margin-top: 8mm; color: rgba(255,250,240,.78); font-size: 17px; }
    .badge { display: inline-flex; margin-bottom: 16mm; border: 1px solid rgba(241,223,189,.45); border-radius: 999px; padding: 7px 13px; color: #f1dfbd; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    .cover-meta span { border-radius: 999px; padding: 8px 12px; background: rgba(255,250,240,.11); border: 1px solid rgba(241,223,189,.34); color: #fffaf0; font-size: 12px; font-weight: 700; }
    main { margin-top: 16mm; }
    .guide { display: grid; grid-template-columns: .9fr 1.1fr; gap: 9mm; margin-top: 17mm; }
    .card, table, .worksheet div, .checklist p { border: 1px solid ${brand.line}; background: rgba(255,253,248,.84); border-radius: 14px; box-shadow: 0 14px 34px rgba(33,27,22,.07); }
    .card { padding: 9mm; }
    ol { margin: 0; padding-left: 18px; color: ${brand.text}; font-size: 13px; line-height: 1.75; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; margin-top: 7mm; }
    th, td { border-right: 1px solid ${brand.line}; border-bottom: 1px solid ${brand.line}; padding: 4.2mm 4mm; text-align: left; vertical-align: top; font-size: 12px; line-height: 1.35; }
    th { color: ${brand.dark}; background: rgba(241,223,189,.48); font-weight: 800; }
    td { min-height: 12mm; }
    th:last-child, td:last-child { border-right: 0; }
    tr:last-child td { border-bottom: 0; }
    .worksheet { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5mm; margin-top: 7mm; }
    .worksheet div { min-height: 25mm; padding: 5mm; }
    .worksheet span { display: block; color: ${brand.dark}; font-size: 12px; font-weight: 800; }
    .worksheet i { display: block; height: 1px; margin-top: 8mm; background: repeating-linear-gradient(90deg, rgba(117,105,93,.42), rgba(117,105,93,.42) 12px, transparent 12px, transparent 18px); }
    .checklist { display: grid; gap: 3.4mm; margin-top: 7mm; }
    .checklist p { display: grid; grid-template-columns: 7mm 1fr; gap: 3.5mm; align-items: start; padding: 3.6mm 4mm; color: ${brand.text}; font-size: 12.5px; line-height: 1.45; }
    .checklist span { width: 5mm; height: 5mm; margin-top: .5mm; border: 1.5px solid ${brand.gold}; border-radius: 4px; }
  </style>
</head>
<body>
  <section class="page cover">
    <header><div class="brand"><img src="${logoDataUri}" alt="" /><b>${brand.studio}</b></div></header>
    <main><span class="badge">Nemokamas premium resursas</span><h1>${escapeHtml(resource.title)}</h1><p>${escapeHtml(resource.subtitle)}</p></main>
    <footer class="cover-meta"><span>Produktyvumas</span><span>${total} puslapiai</span><span>1 / ${total}</span></footer>
  </section>
  <section class="page">
    <header><div class="brand"><img src="${logoDataUri}" alt="" /><b>${brand.studio}</b></div><em>Naudojimo gidas</em></header>
    <main class="guide">
      <article class="card"><h2>Kaip naudoti</h2><p>Skirk 20-30 minučių pirmam užpildymui. Pradėk nuo mažo, aiškaus veiksmo ir grįžk prie šio resurso savaitės pabaigoje.</p></article>
      <article class="card"><h2>Turinio struktūra</h2><ol>${resource.sections.map((section) => `<li>${escapeHtml(section.title)}</li>`).join("")}</ol></article>
    </main>
    <footer><span>${brand.studio}</span><span>2 / ${total}</span></footer>
  </section>
  ${resource.sections.map((section, index) => renderSection(section, index, total)).join("")}
</body>
</html>`;
};

const findEdgeExecutable = () => edgeCandidates.find((candidate) => fs.existsSync(candidate));

const removeDirIfInsideRoot = (dirPath) => {
  const resolved = path.resolve(dirPath);
  if (!resolved.startsWith(rootDir)) {
    throw new Error(`Refusing to remove path outside project: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
};

const printPdf = (edgeExecutable, htmlPath, pdfPath, profileDir) => {
  const result = spawnSync(edgeExecutable, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--disable-extensions",
    `--user-data-dir=${profileDir}`,
    "--print-to-pdf-no-header",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], { cwd: rootDir, encoding: "utf8", stdio: "pipe" });

  if (result.status !== 0) {
    throw new Error(`PDF generation failed for ${path.basename(pdfPath)}: ${result.stderr || result.stdout}`);
  }
};

const main = () => {
  const edgeExecutable = findEdgeExecutable();
  if (!edgeExecutable) {
    throw new Error("Microsoft Edge executable was not found. PDF files were not generated.");
  }

  fs.mkdirSync(outputRoot, { recursive: true });
  const tempRoot = path.join(outputRoot, "_tmp-html");
  const profileDir = path.join(rootDir, ".tmp-edge-productivity-profile");
  fs.mkdirSync(tempRoot, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });

  try {
    csvResources.forEach(writeCsv);

    for (const resource of pdfResources) {
      const htmlPath = path.join(tempRoot, resource.fileName.replace(/\.pdf$/, ".html"));
      const pdfPath = path.join(outputRoot, resource.fileName);
      fs.writeFileSync(htmlPath, buildHtml(resource), "utf8");
      printPdf(edgeExecutable, htmlPath, pdfPath, profileDir);
      console.log(`Generated ${path.relative(rootDir, pdfPath)} (${resource.sections.length + 2} pages)`);
    }
  } finally {
    removeDirIfInsideRoot(tempRoot);
    removeDirIfInsideRoot(profileDir);
  }
};

main();
