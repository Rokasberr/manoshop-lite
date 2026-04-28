const getCompanyName = () => process.env.COMPANY_NAME || "Stilloak Studio";

const sanitizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");

const escapePdfText = (value) =>
  sanitizeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const formatAmount = (value) => `${Number(value || 0).toFixed(2)} EUR`;

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const truncate = (value, maxLength) => {
  const normalizedValue = sanitizeText(value);
  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, Math.max(maxLength - 3, 1))}...`;
};

const createInvoicePdfBuffer = (order) => {
  const commands = [];
  let cursorY = 800;
  const companyName = getCompanyName();
  const invoiceNumber =
    order.invoice?.number || `INV-LEGACY-${String(order._id || "").slice(-6).toUpperCase()}`;
  const invoiceDate = order.invoice?.issuedAt || order.createdAt;
  const customerEmail = order.customerEmail || order.user?.email || "-";

  const addText = (x, y, text, size = 12, font = "F1") => {
    commands.push(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`);
  };

  const addLine = (x1, y1, x2, y2) => {
    commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };

  const nextRow = (gap = 18) => {
    cursorY -= gap;
    return cursorY;
  };

  addText(50, cursorY, companyName, 22, "F2");
  addText(380, cursorY, "INVOICE", 18, "F2");
  addText(380, nextRow(20), `No: ${invoiceNumber}`, 11, "F1");
  addText(380, nextRow(16), `Date: ${formatDate(invoiceDate)}`, 11, "F1");

  cursorY -= 28;
  addLine(50, cursorY, 545, cursorY);
  cursorY -= 24;

  addText(50, cursorY, "Client details", 13, "F2");
  addText(50, nextRow(18), order.shippingAddress.fullName || "-", 11, "F1");
  addText(50, nextRow(16), customerEmail, 11, "F1");
  addText(
    50,
    nextRow(16),
    `${order.shippingAddress.address || "-"}, ${order.shippingAddress.city || "-"}`,
    11,
    "F1"
  );
  addText(
    50,
    nextRow(16),
    `${order.shippingAddress.postalCode || "-"}, ${order.shippingAddress.country || "-"}`,
    11,
    "F1"
  );

  if (order.shippingAddress.phone) {
    addText(50, nextRow(16), `Phone: ${order.shippingAddress.phone}`, 11, "F1");
  }

  cursorY -= 28;
  addText(50, cursorY, "Products", 13, "F2");
  cursorY -= 18;
  addLine(50, cursorY, 545, cursorY);
  cursorY -= 16;

  addText(50, cursorY, "Product", 11, "F2");
  addText(340, cursorY, "Qty", 11, "F2");
  addText(400, cursorY, "Unit", 11, "F2");
  addText(480, cursorY, "Total", 11, "F2");
  cursorY -= 12;
  addLine(50, cursorY, 545, cursorY);

  order.items.forEach((item) => {
    cursorY -= 20;
    addText(50, cursorY, truncate(item.name, 38), 10, "F1");
    addText(340, cursorY, String(item.quantity), 10, "F1");
    addText(400, cursorY, formatAmount(item.price), 10, "F1");
    addText(480, cursorY, formatAmount(item.price * item.quantity), 10, "F1");
  });

  cursorY -= 26;
  addLine(300, cursorY, 545, cursorY);
  cursorY -= 20;
  addText(360, cursorY, "Subtotal", 11, "F2");
  addText(470, cursorY, formatAmount(order.itemsPrice), 11, "F1");
  addText(360, nextRow(18), "Shipping", 11, "F2");
  addText(470, cursorY, formatAmount(order.shippingPrice), 11, "F1");
  addText(360, nextRow(18), "Tax (PVM)", 11, "F2");
  addText(470, cursorY, formatAmount(order.taxPrice), 11, "F1");
  addText(360, nextRow(22), "Total", 13, "F2");
  addText(470, cursorY, formatAmount(order.totalPrice), 13, "F2");

  cursorY -= 30;
  addText(50, cursorY, `Payment: ${sanitizeText(order.paymentMethod || "card")}`, 10, "F1");
  addText(50, nextRow(16), "Invoice generated automatically from checkout cart.", 10, "F1");

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
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
};

module.exports = {
  createInvoicePdfBuffer,
};
