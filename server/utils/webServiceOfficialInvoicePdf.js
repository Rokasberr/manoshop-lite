const sanitizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");

const escapePdfText = (value) =>
  sanitizeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} EUR`;
const formatDate = (value) => new Date(value || Date.now()).toISOString().slice(0, 10);

const createWebServiceOfficialInvoicePdfBuffer = ({ request, paymentType = "deposit", invoiceNumber, issuedAt }) => {
  if (!invoiceNumber) throw new Error("Trūksta oficialios sąskaitos numerio.");
  const isFinal = paymentType === "final";
  const snapshot = request[`${isFinal ? "final" : "deposit"}InvoiceSnapshot`];
  if (!snapshot?.seller || !snapshot?.buyer) throw new Error("Trūksta nekintamos sąskaitos rekvizitų kopijos.");
  const { seller, buyer } = snapshot;
  const commands = [];
  const addText = (x, y, text, size = 10, font = "F1") => {
    commands.push(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`);
  };
  const addLine = (x1, y1, x2, y2) => commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);

  addText(48, 790, "STILLOAK STUDIO", 21, "F2");
  addText(48, 760, "PVM SASKAITA FAKTURA", 16, "F2");
  addLine(48, 742, 547, 742);
  addText(48, 716, `Nr. ${invoiceNumber}`, 11, "F2");
  addText(390, 716, `Data: ${formatDate(issuedAt)}`, 10);

  addText(48, 675, "Pardavejas", 12, "F2");
  addText(48, 655, `${seller.legalName} (${seller.tradingName})`);
  addText(48, 637, `Individualios veiklos pazymos Nr. ${seller.certificateNumber}`);
  addText(48, 619, `Veiklos kodas: ${seller.activityCode}`);
  addText(48, 601, `PVM kodas: ${seller.vatCode}`);
  addText(48, 583, seller.address);
  addText(48, 565, seller.email);

  addText(318, 675, "Pirkejas", 12, "F2");
  addText(318, 655, buyer.name);
  if (buyer.companyCode) addText(318, 637, `Kodas: ${buyer.companyCode}`);
  if (buyer.vatCode) addText(318, 619, `PVM kodas: ${buyer.vatCode}`);
  addText(318, 601, buyer.address);
  addText(318, 583, buyer.email);

  addText(48, 520, "Paslauga", 11, "F2");
  addText(355, 520, "Suma", 11, "F2");
  addLine(48, 508, 547, 508);
  addText(48, 482, snapshot.description);
  addText(355, 482, formatMoney(snapshot.amount), 11, "F2");
  addLine(310, 452, 547, 452);
  addText(355, 426, "Moketina suma", 11, "F2");
  addText(465, 426, formatMoney(snapshot.amount), 11, "F2");

  addText(48, 375, "PVM tarifas: netaikomas pagal smulkiojo verslo schema (SVS) Lietuvoje.", 9);
  addText(48, 355, "PVM suma: 0,00 EUR.", 9);
  addText(48, 320, `Uzsakymas: ${snapshot.requestNumber}`);
  addText(48, 302, `Apmokejimo budas: ${snapshot.paymentMethod === "bank_transfer" ? "banko pavedimas" : "Stripe"}`);
  addText(48, 284, "Mokejimo busena: APMOKETA", 10, "F2");

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
  for (let index = 1; index < objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
};

module.exports = { createWebServiceOfficialInvoicePdfBuffer };
