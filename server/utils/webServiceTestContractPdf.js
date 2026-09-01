const sanitizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\n]/g, "?");

const escapePdfText = (value) =>
  sanitizeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const wrapText = (value, maxLength = 88) => {
  const output = [];
  for (const paragraph of sanitizeText(value).split(/\r?\n/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      output.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      if (!line || `${line} ${word}`.length <= maxLength) line = line ? `${line} ${word}` : word;
      else {
        output.push(line);
        line = word;
      }
    }
    if (line) output.push(line);
  }
  return output;
};

const buildTestContractNumber = (request) => `TEST-${request.requestNumber}-SUTARTIS`;

const createWebServiceTestContractPdfBuffer = ({ request }) => {
  const number = buildTestContractNumber(request);
  const date = new Date(request.proposalAcceptedAt || Date.now()).toISOString().slice(0, 10);
  const money = (value) => `${Number(value || 0).toFixed(2)} EUR`;
  const lines = [
    ["F2", 20, "STILLOAK WEB"],
    ["F2", 16, "TESTINE PASLAUGU SUTARTIS - NEGALIOJA"],
    ["F1", 9, "Tik sistemos testavimui. Tai nera teisine sutartis ar apskaitos dokumentas."],
    ["F1", 10, ""],
    ["F2", 11, `Numeris: ${number}`],
    ["F1", 10, `Data: ${date}`],
    ["F1", 10, `Uzsakymas: ${request.requestNumber}`],
    ["F1", 10, ""],
    ["F2", 13, "1. Salys"],
    ["F1", 10, "Paslaugos teikejas: Stilloak Web (testinis sistemos pavadinimas)"],
    ["F1", 10, `Klientas: ${request.billingName || request.company || request.name || "-"}`],
    ["F1", 10, `Imones kodas: ${request.companyCode || "-"}`],
    ["F1", 10, `PVM kodas: ${request.vatCode || "-"}`],
    ["F1", 10, `Adresas: ${request.billingAddress || "-"}`],
    ["F1", 10, `El. pastas: ${request.email || "-"}`],
    ["F1", 10, ""],
    ["F2", 13, "2. Projektas ir kaina"],
    ["F1", 10, `Paslauga: ${request.packageName || "-"}`],
    ["F1", 10, `Bendra kaina: ${money(request.proposalPrice)}`],
    ["F1", 10, request.paymentPlan === "full" ? `Mokejimas: visa suma iskart (${money(request.depositAmount)})` : `Avansas (${request.depositPercent || 0}%): ${money(request.depositAmount)}`],
    ["F1", 10, ""],
    ["F2", 13, "3. Darbu apimtis"],
    ...wrapText(request.proposalScope || "-", 88).map((line) => ["F1", 10, line]),
    ["F1", 10, ""],
    ["F2", 13, "4. Salygos"],
    ...wrapText(request.proposalTerms || "-", 88).map((line) => ["F1", 10, line]),
    ["F1", 10, ""],
    ["F2", 13, "5. Testinis patvirtinimas"],
    ...wrapText(`Klientas ${request.proposalAcceptedName || request.name || "-"} ${date} patvirtino pasiulymo apimti, kaina ir salygas. Salygu versija: ${request.proposalTermsVersion || "-"}.`, 88).map((line) => ["F1", 10, line]),
    ["F1", 10, ""],
    ["F2", 11, "DOKUMENTAS NEGALIOJA - TIK TESTAVIMUI"],
  ];

  const pageLineLimit = 45;
  const pages = [];
  for (let index = 0; index < lines.length; index += pageLineLimit) pages.push(lines.slice(index, index + pageLineLimit));
  const objects = [null];
  const pageObjectIds = [];
  objects.push("");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  pages.forEach((pageLines, pageIndex) => {
    const commands = [];
    let y = 790;
    if (pageIndex > 0) {
      commands.push(`BT /F2 10 Tf 1 0 0 1 48 810 Tm (${escapePdfText(`${number} - tesinys`)}) Tj ET`);
    }
    pageLines.forEach(([font, size, text]) => {
      commands.push(`BT /${font} ${size} Tf 1 0 0 1 48 ${y} Tm (${escapePdfText(text)}) Tj ET`);
      y -= text ? Math.max(size + 5, 15) : 9;
    });
    commands.push(`BT /F1 8 Tf 1 0 0 1 48 28 Tm (Puslapis ${pageIndex + 1} is ${pages.length} - TESTINIS DOKUMENTAS) Tj ET`);
    const content = commands.join("\n");
    const contentId = objects.length;
    objects.push(`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`);
    const pageId = objects.length;
    pageObjectIds.push(pageId);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`);
  });

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(pdf, "latin1");
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
};

module.exports = { buildTestContractNumber, createWebServiceTestContractPdfBuffer };
