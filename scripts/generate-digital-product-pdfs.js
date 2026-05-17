const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const outputRoot = path.join(rootDir, "client", "public", "resources", "digital-products");
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
  panel: "#ffffff",
  gold: "#b28445",
  goldSoft: "#f1dfbd",
  green: "#1d5443",
};

const logoDataUri = `data:image/svg+xml;base64,${fs.readFileSync(logoPath).toString("base64")}`;

const resources = [
  {
    dir: "bazinis",
    fileName: "stilloak-finansu-aiskumo-starter-kit.pdf",
    plan: "Visiems nariams",
    title: "Mėnesio finansų aiškumo starter kit",
    subtitle: "Ramus mėnesio finansų planas su pajamų, išlaidų, taupymo ir savaitės veiksmų struktūra.",
    sections: [
      {
        title: "Mėnesio finansų apžvalga",
        intro: "Pradėk nuo vieno aiškaus vaizdo. Šis puslapis skirtas pamatyti, kiek pinigų ateina, kur jie išeina ir kokį sprendimą verta priimti pirmiausia.",
        table: {
          headers: ["Sritis", "Planas", "Faktas", "Pastaba"],
          rows: [
            ["Pajamos", "", "", ""],
            ["Būtinos išlaidos", "", "", ""],
            ["Kintamos išlaidos", "", "", ""],
            ["Taupymas", "", "", ""],
            ["Laisvas rezervas", "", "", ""],
          ],
        },
      },
      {
        title: "Taupymo tikslų blokas",
        intro: "Vienas mėnesio tikslas dažnai veikia geriau nei penki neaiškūs norai. Pasirink tikslą, sumą ir pirmą įnašą.",
        worksheet: ["Tikslas", "Reikalinga suma", "Kiek jau turiu", "Mėnesio įnašas", "Kodėl tai svarbu dabar"],
      },
      {
        title: "5 klausimai mėnesio refleksijai",
        checklist: [
          "Kur šį mėnesį pinigai dažniausiai išeina be aiškaus sprendimo?",
          "Kuri išlaida suteikia realią vertę ir gali likti be kaltės?",
          "Ką galiu sumažinti nepakenkdamas gyvenimo kokybei?",
          "Koks vienas įprotis padėtų mėnesį užbaigti ramiau?",
          "Ką darysiu pirmąją kito mėnesio savaitę?",
        ],
      },
      {
        title: "Savaitės veiksmų planas",
        table: {
          headers: ["Savaitė", "Fokusas", "Veiksmas", "Rezultatas"],
          rows: [
            ["1 savaitė", "Skaičiai", "Peržiūrėti pajamas ir būtinas išlaidas", ""],
            ["2 savaitė", "Išlaidos", "Pažymėti 3 mažinamas vietas", ""],
            ["3 savaitė", "Taupymas", "Atlikti suplanuotą įnašą", ""],
            ["4 savaitė", "Refleksija", "Įvertinti mėnesio sprendimus", ""],
          ],
        },
      },
    ],
  },
  {
    dir: "bazinis",
    fileName: "stilloak-islaidu-audito-checklist.pdf",
    plan: "Visiems nariams",
    title: "Asmeninių išlaidų audito checklist",
    subtitle: "Greitas, praktiškas būdas rasti pasikartojančius mokėjimus, nereikalingas išlaidas ir pinigų nutekėjimo vietas.",
    sections: [
      {
        title: "Prenumeratų peržiūra",
        checklist: [
          "Pažymėk visas prenumeratas ir narystes.",
          "Patikrink, kurių nenaudojai per pastarąsias 14 dienų.",
          "Atskirk būtinas paslaugas nuo patogumo paslaugų.",
          "Pasirink vieną mokėjimą, kurį sustabdysi šiandien.",
        ],
      },
      {
        title: "Kasdienių išlaidų auditavimas",
        table: {
          headers: ["Kategorija", "Suma", "Ar būtina?", "Sprendimas"],
          rows: [
            ["Maistas / kava", "", "", ""],
            ["Transportas", "", "", ""],
            ["Pristatymas", "", "", ""],
            ["Maži impulsiniai pirkiniai", "", "", ""],
          ],
        },
      },
      {
        title: "Impulsyvių pirkinių analizė",
        worksheet: ["Pirkinių situacija", "Kas paskatino?", "Ar pirkčiau po 24 val.?", "Ką rinkčiausi vietoje to?"],
      },
      {
        title: "Veiksmo planas šiam mėnesiui",
        checklist: [
          "Sumažinsiu vieną pasikartojantį mokėjimą.",
          "Vienai kategorijai nustatysiu savaitės ribą.",
          "Prieš nebūtiną pirkinį palauksiu 24 valandas.",
          "Mėnesio pabaigoje palyginsiu sutaupytą sumą.",
        ],
      },
    ],
  },
  {
    dir: "bazinis",
    fileName: "stilloak-taupymo-tikslu-planavimo-sablonas.pdf",
    plan: "Visiems nariams",
    title: "Taupymo tikslų planavimo šablonas",
    subtitle: "Premium worksheet taupymo tikslams, mėnesiniams įnašams, progresui ir prioritetams sekti.",
    sections: [
      {
        title: "Tikslo aprašymas",
        worksheet: ["Tikslo pavadinimas", "Reikalinga suma", "Terminas", "Mėnesinis įnašas", "Pirmas veiksmas"],
      },
      {
        title: "Progreso sekimo lentelė",
        table: {
          headers: ["Mėnuo", "Įnašas", "Bendra suma", "Pastaba"],
          rows: [
            ["1 mėnuo", "", "", ""],
            ["2 mėnuo", "", "", ""],
            ["3 mėnuo", "", "", ""],
            ["4 mėnuo", "", "", ""],
            ["5 mėnuo", "", "", ""],
          ],
        },
      },
      {
        title: "Motyvacijos ir prioriteto klausimai",
        checklist: [
          "Kodėl šis tikslas svarbus būtent dabar?",
          "Ką šis tikslas pakeis mano kasdienybėje?",
          "Kokios išlaidos gali laikinai tapti mažesniu prioritetu?",
          "Kaip žinosiu, kad judu pakankamu tempu?",
        ],
      },
    ],
  },
  {
    dir: "asmeninis",
    fileName: "stilloak-premium-finansiniu-tikslu-sistema.pdf",
    plan: "Asmeninis+",
    title: "Premium finansinių tikslų sistema",
    subtitle: "90 dienų finansinių tikslų, įpročių, sprendimų ir progreso sistema.",
    sections: [
      {
        title: "90 dienų tikslų struktūra",
        table: {
          headers: ["Tikslas", "Kodėl svarbu", "90 dienų rezultatas", "Pirmas žingsnis"],
          rows: [
            ["Rezervas", "", "", ""],
            ["Skolos / įsipareigojimai", "", "", ""],
            ["Augimas / investavimas", "", "", ""],
          ],
        },
      },
      {
        title: "Finansinių įpročių planas",
        checklist: [
          "Kartą per savaitę peržiūrėti išlaidas.",
          "Mėnesio pradžioje atlikti taupymo įnašą.",
          "Prieš didesnį pirkinį atsakyti į sprendimų klausimus.",
          "Mėnesio pabaigoje įvertinti progresą, ne tik likutį.",
        ],
      },
      {
        title: "Mėnesio sprendimų framework",
        worksheet: ["Sprendimas", "Kokią problemą sprendžia?", "Ką reikės atidėti?", "Ar verta po 7 dienų?", "Galutinis pasirinkimas"],
      },
      {
        title: "Progreso tracker ir analizė",
        table: {
          headers: ["Savaitė", "Kas pajudėjo?", "Kas trukdė?", "Kitas sprendimas"],
          rows: [["1", "", "", ""], ["2", "", "", ""], ["3", "", "", ""], ["4", "", "", ""]],
        },
      },
    ],
  },
  {
    dir: "asmeninis",
    fileName: "stilloak-skaitmeniniu-produktu-ideju-framework.pdf",
    plan: "Asmeninis+",
    title: "Skaitmeninių produktų idėjų vertinimo framework",
    subtitle: "Strateginis worksheet produkto idėjai įvertinti pagal paklausą, vertę, aiškumą ir pardavimo potencialą.",
    sections: [
      {
        title: "Idėjos aprašymas",
        worksheet: ["Produkto idėja", "Auditorija", "Problema", "Vertės pažadas", "Konkurencinis skirtumas"],
      },
      {
        title: "Vertinimo matrica",
        table: {
          headers: ["Kriterijus", "Klausimas", "Balas 1-5", "Pastaba"],
          rows: [
            ["Paklausa", "Ar žmonės jau ieško sprendimo?", "", ""],
            ["Vertė", "Ar rezultatas pakankamai svarbus?", "", ""],
            ["MVP paprastumas", "Ar galima sukurti pirmą versiją greitai?", "", ""],
            ["Kainodaros potencialas", "Ar vertė pagrindžia kainą?", "", ""],
          ],
        },
      },
      {
        title: "Galutinis idėjos balas",
        checklist: [
          "18-20 balų: verta testuoti pirmą versiją.",
          "14-17 balų: reikia patikslinti auditoriją arba pažadą.",
          "Iki 13 balų: idėją verta supaprastinti arba atidėti.",
        ],
      },
    ],
  },
  {
    dir: "asmeninis",
    fileName: "stilloak-pajamu-ir-islaidu-optimizavimo-planas.pdf",
    plan: "Asmeninis+",
    title: "Pajamų ir išlaidų optimizavimo planas",
    subtitle: "30 dienų planas pajamų šaltiniams, išlaidų kategorijoms ir prioritetams optimizuoti.",
    sections: [
      {
        title: "Pajamų šaltinių apžvalga",
        table: {
          headers: ["Šaltinis", "Stabilumas", "Augimo galimybė", "Kitas veiksmas"],
          rows: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
        },
      },
      {
        title: "Išlaidų kategorijų analizė",
        table: {
          headers: ["Kategorija", "Suma", "Vertė", "Sprendimas"],
          rows: [["Būtinos", "", "", ""], ["Patogumo", "", "", ""], ["Augimo", "", "", ""], ["Impulsinės", "", "", ""]],
        },
      },
      {
        title: "30 dienų veiksmo planas",
        checklist: [
          "1 savaitė: peržiūrėti prenumeratas ir pasikartojančius mokėjimus.",
          "2 savaitė: nustatyti ribą vienai kintamų išlaidų kategorijai.",
          "3 savaitė: atlikti vieną pajamų stiprinimo veiksmą.",
          "4 savaitė: įvertinti rezultatą ir pasirinkti kitą optimizavimą.",
        ],
      },
      {
        title: "Mėnesio rezultatų sekimas",
        worksheet: ["Sutaupyta suma", "Papildomos pajamos", "Svarbiausias sprendimas", "Ką kartosiu kitą mėnesį"],
      },
    ],
  },
  {
    dir: "privatus-verslas",
    fileName: "stilloak-mini-verslo-paleidimo-blueprint.pdf",
    plan: "Privatus verslas",
    title: "Mini verslo paleidimo blueprint",
    subtitle: "Nuo idėjos iki pirmo pasiūlymo per aiškią auditorijos, problemos, sprendimo ir veiksmų struktūrą.",
    sections: [
      {
        title: "Idėja, auditorija ir problema",
        worksheet: ["Idėja", "Kam skirta", "Kokią problemą sprendžia", "Kodėl tai svarbu dabar"],
      },
      {
        title: "Sprendimas ir pasiūlymas",
        worksheet: ["Sprendimas", "Pagrindinė nauda", "Kas įtraukta", "Pirmas produktas", "Pirkimo veiksmas"],
      },
      {
        title: "14 dienų veiksmų planas",
        table: {
          headers: ["Dienos", "Fokusas", "Veiksmas", "Rezultatas"],
          rows: [
            ["1-3", "Aiškumas", "Aprašyti auditoriją ir problemą", ""],
            ["4-6", "Pasiūlymas", "Sukurti pirmo produkto struktūrą", ""],
            ["7-10", "Pristatymas", "Paruošti puslapio tekstus", ""],
            ["11-14", "Paleidimas", "Pakviesti pirmus pirkėjus", ""],
          ],
        },
      },
    ],
  },
  {
    dir: "privatus-verslas",
    fileName: "stilloak-digital-product-launch-kit.pdf",
    plan: "Privatus verslas",
    title: "Digital Product Launch Kit",
    subtitle: "Produkto struktūra, launch checklist, timeline, puslapio tekstai ir final kontrolinis sąrašas.",
    sections: [
      {
        title: "Produkto struktūra",
        worksheet: ["Produkto pažadas", "Kam skirta", "Kas įtraukta", "Greitas rezultatas", "Bonusas arba papildoma vertė"],
      },
      {
        title: "Launch checklist",
        checklist: [
          "Aiškus produkto pavadinimas.",
          "Vieno sakinio vertės pažadas.",
          "3-5 konkrečios naudos.",
          "Kaina ir kas įtraukta.",
          "Puslapio CTA ir atsakymai į dažnus klausimus.",
        ],
      },
      {
        title: "Launch timeline",
        table: {
          headers: ["Laikas", "Veiksmas", "Pastaba"],
          rows: [
            ["0-6 val.", "Paruošti produkto struktūrą", ""],
            ["6-18 val.", "Parašyti puslapio tekstus", ""],
            ["18-30 val.", "Pakviesti pirmus žmones", ""],
            ["30-48 val.", "Atnaujinti pagal klausimus", ""],
          ],
        },
      },
      {
        title: "CTA pavyzdžiai",
        checklist: ["Atrakinti resursą", "Gauti pilną sistemą", "Pradėti aiškiau", "Atsisiųsti launch kit"],
      },
    ],
  },
  {
    dir: "privatus-verslas",
    fileName: "stilloak-premium-produkto-pasiulymo-framework.pdf",
    plan: "Privatus verslas",
    title: "Premium produkto pasiūlymo framework",
    subtitle: "Pasiūlymo dizainas: pavadinimas, auditorija, problema, nauda, kainodara ir CTA tekstai.",
    sections: [
      {
        title: "Pasiūlymo branduolys",
        worksheet: ["Produkto pavadinimas", "Kam skirta", "Kokią problemą sprendžia", "Pagrindinė nauda", "Kas įtraukta"],
      },
      {
        title: "Kainodaros logika",
        checklist: [
          "Kiek laiko klientas sutaupo?",
          "Kokios klaidos padedamos išvengti?",
          "Kokį aiškumą arba rezultatą sukuria produktas?",
          "Ar kaina jaučiasi pagrįsta pagal rezultatą?",
        ],
      },
      {
        title: "CTA tekstų pavyzdžiai",
        table: {
          headers: ["Tonacija", "CTA", "Kada naudoti"],
          rows: [
            ["Tiesioginė", "Atrakinti resursą", "Kai produktas aiškus"],
            ["Premium", "Gauti pilną sistemą", "Kai akcentuojama vertė"],
            ["Švelni", "Pradėti aiškiau", "Kai reikia mažiau spaudimo"],
          ],
        },
      },
    ],
  },
  {
    dir: "privatus-verslas",
    fileName: "stilloak-store-page-copy-kit.pdf",
    plan: "Privatus verslas",
    title: "Store Page Copy Kit",
    subtitle: "Premium tekstų struktūra produkto arba store puslapiui: hero, aprašymas, naudos, FAQ, CTA ir pasitikėjimas.",
    sections: [
      {
        title: "Hero section copy",
        worksheet: ["Pagrindinis pavadinimas", "Vieno sakinio pažadas", "Kam skirta", "Pagrindinis CTA"],
      },
      {
        title: "Produkto aprašymo struktūra",
        checklist: [
          "Pradėk nuo situacijos, kurioje yra klientas.",
          "Aiškiai įvardink problemą ir norimą rezultatą.",
          "Parodyk, kas įtraukta į produktą.",
          "Užbaik vienu aiškiu pirkimo veiksmu.",
        ],
      },
      {
        title: "Naudos blokai ir FAQ",
        table: {
          headers: ["Blokas", "Teksto kryptis", "Pavyzdys"],
          rows: [
            ["Nauda", "Ką klientas galės padaryti", ""],
            ["FAQ", "Klausimas prieš pirkimą", ""],
            ["Pasitikėjimas", "Kas vyksta po paspaudimo", ""],
            ["CTA", "Vienas aiškus veiksmas", ""],
          ],
        },
      },
      {
        title: "Pasitikėjimo tekstai",
        checklist: [
          "Aiškiai parašyk, ką žmogus gaus po pirkimo.",
          "Paaiškink, kiek laiko užtruks pradėti.",
          "Nurodyk, kam produktas tinka geriausiai.",
          "Venk perteklinių pažadų, kurių produktas neišpildo.",
        ],
      },
    ],
  },
];

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const renderTable = (table) => `
  <table>
    <thead><tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>
      ${table.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell || " ")}</td>`).join("")}</tr>`)
        .join("")}
    </tbody>
  </table>
`;

const renderChecklist = (items) => `
  <div class="checklist">
    ${items.map((item) => `<div class="check-item"><span></span><p>${escapeHtml(item)}</p></div>`).join("")}
  </div>
`;

const renderWorksheet = (items) => `
  <div class="worksheet">
    ${items.map((item) => `<div class="field"><label>${escapeHtml(item)}</label><div></div></div>`).join("")}
  </div>
`;

const renderSection = (section) => `
  <section class="section-block">
    <h2>${escapeHtml(section.title)}</h2>
    ${section.intro ? `<p class="intro">${escapeHtml(section.intro)}</p>` : ""}
    ${section.table ? renderTable(section.table) : ""}
    ${section.checklist ? renderChecklist(section.checklist) : ""}
    ${section.worksheet ? renderWorksheet(section.worksheet) : ""}
  </section>
`;

const renderPage = (resource, pageNumber, totalPages, body, extraClass = "") => `
  <div class="page ${extraClass}">
    ${body}
    <footer>
      <span>${brand.studio}</span>
      <span>${pageNumber} / ${totalPages}</span>
    </footer>
  </div>
`;

const buildHtml = (resource) => {
  const contentPages = [];
  const sectionsPerPage = 2;
  for (let index = 0; index < resource.sections.length; index += sectionsPerPage) {
    contentPages.push(resource.sections.slice(index, index + sectionsPerPage));
  }

  const totalPages = contentPages.length + 2;
  const pages = [
    renderPage(
      resource,
      1,
      totalPages,
      `
        <div class="cover-mark"><img src="${logoDataUri}" alt="" /><strong>${brand.studio}</strong></div>
        <div class="cover-content">
          <p class="kicker">${escapeHtml(resource.plan)} · Premium PDF resursas</p>
          <h1>${escapeHtml(resource.title)}</h1>
          <p class="subtitle">${escapeHtml(resource.subtitle)}</p>
        </div>
        <div class="cover-card">
          <span>PDF</span>
          <p>Paruošta spausdinimui, planavimui ir ramesniems sprendimams.</p>
        </div>
      `,
      "cover"
    ),
    renderPage(
      resource,
      2,
      totalPages,
      `
        <header class="page-header">
          <div><img src="${logoDataUri}" alt="" /><span>${brand.studio}</span></div>
          <p>${escapeHtml(resource.plan)}</p>
        </header>
        <main>
          <p class="kicker dark">Kaip naudoti</p>
          <h1 class="inside-title">${escapeHtml(resource.title)}</h1>
          <p class="lead">${escapeHtml(resource.subtitle)}</p>
          <div class="usage-grid">
            <div><strong>1</strong><p>Atsispausdink arba naudok skaitmeniniame užrašų įrankyje.</p></div>
            <div><strong>2</strong><p>Pildyk trumpais atsakymais. Tikslas yra aiškumas, ne tobula forma.</p></div>
            <div><strong>3</strong><p>Mėnesio pabaigoje pažymėk vieną sprendimą, kurį kartosi.</p></div>
          </div>
          <div class="note">
            <h2>StillOak Studio principas</h2>
            <p>Mažiau triukšmo, daugiau struktūros. Šis resursas sukurtas tam, kad svarbūs sprendimai tilptų į aiškią, ramią darbo vietą.</p>
          </div>
        </main>
      `
    ),
    ...contentPages.map((sections, index) =>
      renderPage(
        resource,
        index + 3,
        totalPages,
        `
          <header class="page-header">
            <div><img src="${logoDataUri}" alt="" /><span>${brand.studio}</span></div>
            <p>${escapeHtml(resource.title)}</p>
          </header>
          <main>${sections.map(renderSection).join("")}</main>
        `
      )
    ),
  ];

  return `<!doctype html>
<html lang="lt">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(resource.title)}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #ede7dc;
      color: ${brand.text};
      font-family: Inter, Manrope, Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      padding: 21mm 19mm 18mm;
      background:
        radial-gradient(circle at 16% 0%, rgba(178,132,69,0.16), transparent 34%),
        linear-gradient(180deg, ${brand.paper}, #f8f1e6);
      page-break-after: always;
    }
    .cover {
      color: white;
      background:
        radial-gradient(circle at 18% 12%, rgba(241,223,189,0.24), transparent 34%),
        linear-gradient(135deg, #06100d, #17382d 56%, #070c0a);
    }
    .cover:after {
      content: "";
      position: absolute;
      inset: 21mm;
      border: 1px solid rgba(241,223,189,0.22);
      border-radius: 18px;
      pointer-events: none;
    }
    .cover-mark, .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: relative;
      z-index: 2;
    }
    .cover-mark {
      justify-content: flex-start;
    }
    .cover-mark img, .page-header img {
      width: 34px;
      height: 34px;
      border-radius: 10px;
    }
    .cover-mark strong {
      font-size: 14px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.82);
    }
    .cover-content {
      position: relative;
      z-index: 2;
      margin-top: 46mm;
      max-width: 148mm;
    }
    .kicker {
      margin: 0 0 14px;
      color: ${brand.goldSoft};
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .kicker.dark {
      color: ${brand.gold};
    }
    h1 {
      margin: 0;
      font-size: 42px;
      line-height: 1.04;
      letter-spacing: -0.02em;
    }
    .inside-title {
      color: ${brand.dark};
      font-size: 34px;
      max-width: 150mm;
    }
    .subtitle, .lead {
      margin: 20px 0 0;
      font-size: 16px;
      line-height: 1.7;
      color: rgba(255,255,255,0.72);
      max-width: 145mm;
    }
    .lead {
      color: ${brand.muted};
    }
    .cover-card {
      position: absolute;
      z-index: 2;
      left: 19mm;
      right: 19mm;
      bottom: 34mm;
      display: grid;
      grid-template-columns: 34mm 1fr;
      gap: 18px;
      align-items: center;
      padding: 18px;
      border: 1px solid rgba(241,223,189,0.22);
      border-radius: 16px;
      background: rgba(255,255,255,0.07);
    }
    .cover-card span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 22mm;
      border-radius: 14px;
      background: rgba(241,223,189,0.14);
      color: ${brand.goldSoft};
      font-size: 22px;
      font-weight: 900;
    }
    .cover-card p {
      margin: 0;
      color: rgba(255,255,255,0.72);
      line-height: 1.55;
      font-size: 13px;
    }
    .page-header {
      margin-bottom: 18mm;
      padding-bottom: 12px;
      border-bottom: 1px solid ${brand.line};
    }
    .page-header div {
      display: flex;
      align-items: center;
      gap: 10px;
      color: ${brand.green};
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-size: 11px;
    }
    .page-header p {
      max-width: 78mm;
      margin: 0;
      color: ${brand.muted};
      font-size: 10px;
      text-align: right;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    main {
      position: relative;
      z-index: 1;
    }
    .usage-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 20mm;
    }
    .usage-grid div, .note, .section-block {
      border: 1px solid ${brand.line};
      border-radius: 16px;
      background: rgba(255,255,255,0.78);
      box-shadow: 0 18px 42px rgba(37,28,18,0.05);
    }
    .usage-grid div {
      padding: 14px;
      min-height: 46mm;
    }
    .usage-grid strong {
      display: flex;
      width: 30px;
      height: 30px;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: ${brand.green};
      color: white;
    }
    .usage-grid p, .note p, .intro {
      color: ${brand.muted};
      font-size: 12px;
      line-height: 1.62;
    }
    .note {
      margin-top: 16mm;
      padding: 18px;
    }
    .note h2, .section-block h2 {
      margin: 0 0 10px;
      color: ${brand.dark};
      font-size: 22px;
      line-height: 1.18;
    }
    .section-block {
      margin-bottom: 12mm;
      padding: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      overflow: hidden;
      border-radius: 12px;
      font-size: 11px;
    }
    th {
      background: ${brand.dark};
      color: white;
      text-align: left;
      padding: 9px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td {
      height: 30px;
      border: 1px solid ${brand.line};
      padding: 8px;
      color: ${brand.muted};
      background: rgba(255,255,255,0.72);
      vertical-align: top;
    }
    .checklist {
      display: grid;
      gap: 9px;
      margin-top: 12px;
    }
    .check-item {
      display: grid;
      grid-template-columns: 18px 1fr;
      gap: 10px;
      align-items: start;
      padding: 10px;
      border: 1px solid ${brand.line};
      border-radius: 12px;
      background: rgba(255,255,255,0.68);
    }
    .check-item span {
      width: 16px;
      height: 16px;
      border: 1.5px solid ${brand.gold};
      border-radius: 5px;
      margin-top: 2px;
    }
    .check-item p {
      margin: 0;
      color: ${brand.muted};
      font-size: 12px;
      line-height: 1.45;
    }
    .worksheet {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }
    .field {
      display: grid;
      grid-template-columns: 45mm 1fr;
      gap: 12px;
      align-items: center;
      padding: 9px 0;
      border-bottom: 1px solid ${brand.line};
    }
    .field label {
      color: ${brand.green};
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .field div {
      height: 16px;
      border-bottom: 1px solid #c8bba8;
    }
    footer {
      position: absolute;
      left: 19mm;
      right: 19mm;
      bottom: 10mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid rgba(143,124,100,0.26);
      color: ${brand.muted};
      font-size: 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .cover footer {
      color: rgba(255,255,255,0.58);
      border-top-color: rgba(241,223,189,0.22);
    }
  </style>
</head>
<body>${pages.join("")}</body>
</html>`;
};

const findEdge = () => edgeCandidates.find((candidate) => fs.existsSync(candidate));

const ensureDirs = () => {
  fs.mkdirSync(outputRoot, { recursive: true });
  for (const resource of resources) {
    fs.mkdirSync(path.join(outputRoot, resource.dir), { recursive: true });
  }
};

const printPdf = (edgePath, htmlPath, pdfPath) => {
  const profileDir = path.join(rootDir, ".tmp-edge-pdf-profile");
  fs.mkdirSync(profileDir, { recursive: true });

  const result = spawnSync(
    edgePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-extensions",
      `--user-data-dir=${profileDir}`,
      "--print-to-pdf-no-header",
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { encoding: "utf8" }
  );

  if (result.status !== 0) {
    throw new Error(`PDF export failed for ${path.basename(pdfPath)}\n${result.stderr || result.stdout}`);
  }
};

const main = () => {
  const edgePath = findEdge();
  if (!edgePath) {
    throw new Error("Microsoft Edge executable was not found. PDF export cannot run without adding a dependency.");
  }

  ensureDirs();

  for (const resource of resources) {
    const outDir = path.join(outputRoot, resource.dir);
    const pdfPath = path.join(outDir, resource.fileName);
    const htmlPath = path.join(outDir, resource.fileName.replace(/\.pdf$/i, ".print.html"));

    fs.writeFileSync(htmlPath, buildHtml(resource), "utf8");
    printPdf(edgePath, htmlPath, pdfPath);
    fs.rmSync(htmlPath, { force: true });
    console.log(`Created ${path.relative(rootDir, pdfPath)}`);
  }
};

main();
