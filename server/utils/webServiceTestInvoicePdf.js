const sanitizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");

const escapePdfText = (value) =>
  sanitizeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} EUR`;
const formatDate = (value) => new Date(value || Date.now()).toISOString().slice(0, 10);

const buildTestInvoiceNumber = (request, paymentType = "deposit") => {
  const suffix = paymentType === "final" ? "FINAL" : "AVANSAS";
  return `TEST-${request.requestNumber}-${suffix}`;
};

const createWebServiceTestInvoicePdfBuffer = ({ request, paymentType = "deposit" }) => {
  const isFinal = paymentType === "final";
  const amount = isFinal
    ? Math.max(Number(request.proposalPrice || 0) - Number(request.depositAmount || 0), 0)
    : Number(request.depositAmount || 0);
  const paidAt = isFinal ? request.finalPaidAt : request.depositPaidAt;
  const invoiceNumber = buildTestInvoiceNumber(request, paymentType);
  const commands = [];
  const addText = (x, y, text, size = 11, font = "F1") => {
    commands.push(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`);
  };
  const addLine = (x1, y1, x2, y2) => commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);

  addText(48, 790, "STILLOAK WEB", 22, "F2");
  addText(48, 760, "TESTINE SASKAITA - NEGALIOJA", 17, "F2");
  addText(48, 738, "Skirta tik mokejimu sistemos testavimui. Tai nera apskaitos dokumentas.", 9);
  addLine(48, 720, 547, 720);

  addText(48, 690, `Numeris: ${invoiceNumber}`, 11, "F2");
  addText(48, 670, `Data: ${formatDate(paidAt)}`);
  addText(48, 650, `Uzsakymas: ${request.requestNumber}`);

  addText(48, 610, "Klientas", 13, "F2");
  addText(48, 588, request.company || request.name || "-");
  addText(48, 570, request.email || "-");

  addText(48, 525, "Paslauga", 12, "F2");
  addText(330, 525, "Suma", 12, "F2");
  addLine(48, 514, 547, 514);
  addText(48, 490, isFinal ? `Likusi suma uz ${request.packageName}` : `Avansas uz ${request.packageName}`);
  addText(330, 490, formatMoney(amount), 11, "F2");
  addLine(300, 460, 547, 460);
  addText(330, 435, "Is viso sumoketa", 12, "F2");
  addText(465, 435, formatMoney(amount), 12, "F2");

  addText(48, 380, "Mokejimo busena: APMOKETA", 11, "F2");
  addText(48, 360, "Mokejimo budas: Stripe testinis rezimas");
  addText(48, 320, "PVM neskaiciuojamas. Dokumentas neturi mokestines ar apskaitos galios.", 9);
  addText(48, 302, "Tikra saskaita bus galima generuoti tik suvedus registruotos veiklos rekvizitus.", 9);

  const content = commands.join("\n");
  const objects = [
    null,
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(pdf, "latin1");
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
};

module.exports = { buildTestInvoiceNumber, createWebServiceTestInvoicePdfBuffer };
