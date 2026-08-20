const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");

const sharp = require("sharp");

const brandConfig = require("../config/stilloakBrandConfig");
const { createHttpError } = require("../utils/httpError");

const FORMATS = {
  square: {
    label: "Square feed post",
    width: 1080,
    height: 1080,
  },
  portrait: {
    label: "Portrait feed post",
    width: 1080,
    height: 1350,
  },
  story: {
    label: "Story/Reel",
    width: 1080,
    height: 1920,
  },
};

const POST_TYPES = {
  "brand-intro": {
    label: "Brand intro",
    slug: "brand-intro",
    template: "template-brand-intro",
    captionKey: "brandIntro",
  },
  "bazinis-planas": {
    label: "Demo",
    slug: "bazinis",
    template: "template-plan",
    captionKey: "bazinis",
  },
  "asmeninis-planas": {
    label: "Asmeninis planas",
    slug: "asmeninis",
    template: "template-plan",
    captionKey: "asmeninis",
  },
  "privatus-verslas": {
    label: "Verslas",
    slug: "privatus-verslas",
    template: "template-plan",
    captionKey: "privatusVerslas",
  },
  "plan-comparison": {
    label: "Plan comparison",
    slug: "plan-comparison",
    template: "template-comparison",
    captionKey: "comparison",
  },
  faq: {
    label: "FAQ",
    slug: "faq",
    template: "template-faq",
    captionKey: "faq",
  },
  "cta-join-now": {
    label: "CTA / Join now",
    slug: "cta-join-now",
    template: "template-cta",
    captionKey: "cta",
  },
};

const FILE_TYPES = new Set(["jpg", "png"]);
const SAFE_FILENAME_PATTERN = /^stilloak-[a-z0-9-]+-\d{8}-\d{4}\.(jpg|png)$/i;

const CAPTION_TEMPLATES = {
  brandIntro: (website) => `Stilloak Studio – privati nario erdvė aiškesniam pasirinkimui.

Pasirink planą pagal savo etapą:
• Demo
• Asmeninis
• Verslas

Paprasta pradėti. Aišku naudoti. Sukurta augimui.

${website}`,
  bazinis: (website) => `Demo – nemokama Saving Studio pradžia.

Tinka, jeigu nori susipažinti su bazinėmis planavimo kortelėmis ir vėliau pereiti į Asmeninį planą.

${website}`,
  asmeninis: (website) => `Asmeninis planas – daugiau galimybių, daugiau lankstumo ir patogesnė patirtis aktyviam naudojimui.

Populiariausias pasirinkimas tiems, kurie nori daugiau vertės.

${website}`,
  privatusVerslas: (website) => `Verslas – premium sprendimas verslui su daugiau kontrolės, prioriteto ir profesionalių funkcijų.

Skirta rimtesniems poreikiams, verslo naudojimui ir aukštesniam aptarnavimo lygiui.

${website}`,
};

const textLimits = {
  headline: 120,
  subtitle: 260,
  badge: 48,
  feature: 90,
  price: 40,
  website: 80,
  ctaText: 80,
};

const ensureGeneratedDirectory = async () => {
  await fs.mkdir(brandConfig.generatedDirectory, { recursive: true });
};

const removeControlCharacters = (value) =>
  value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();

const normalizeText = (value, fallback = "") => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return removeControlCharacters(String(value));
};

const assertLength = (field, value, max) => {
  if (value.length > max) {
    throw createHttpError(`${field} negali viršyti ${max} simbolių.`, 400);
  }
};

const parseFeatures = (value) => {
  const rawFeatures = Array.isArray(value)
    ? value
    : String(value || "")
        .split(/\r?\n/)
        .map((entry) => entry.trim());

  const features = rawFeatures
    .map((entry) => normalizeText(entry))
    .filter(Boolean)
    .slice(0, 6);

  if (features.length < 3 || features.length > 5) {
    throw createHttpError("Feature list turi turėti nuo 3 iki 5 eilučių.", 400);
  }

  features.forEach((feature) => assertLength("Feature eilutė", feature, textLimits.feature));

  return features;
};

const normalizeInstagramPostPayload = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    throw createHttpError("Netinkamas generatoriaus užklausos formatas.", 400);
  }

  const postType = normalizeText(payload.postType).toLowerCase();
  const format = normalizeText(payload.format).toLowerCase();
  const outputType = normalizeText(payload.outputType || "jpg").toLowerCase();
  const postTypeMeta = POST_TYPES[postType];
  const formatMeta = FORMATS[format];

  if (!postTypeMeta) {
    throw createHttpError("Nepalaikomas Instagram įrašo tipas.", 400);
  }

  if (!formatMeta) {
    throw createHttpError("Nepalaikomas Instagram formatas.", 400);
  }

  if (!FILE_TYPES.has(outputType)) {
    throw createHttpError("Nepalaikomas failo tipas.", 400);
  }

  const headline = normalizeText(payload.headline);
  const subtitle = normalizeText(payload.subtitle);
  const badge = normalizeText(payload.badge || postTypeMeta.label.toUpperCase());
  const price = normalizeText(payload.price);
  const website = normalizeText(payload.website || brandConfig.website);
  const ctaText = normalizeText(payload.ctaText);
  const features = parseFeatures(payload.features);

  if (!headline) {
    throw createHttpError("Headline yra privalomas.", 400);
  }

  assertLength("Headline", headline, textLimits.headline);
  assertLength("Subtitle", subtitle, textLimits.subtitle);
  assertLength("Badge label", badge, textLimits.badge);
  assertLength("Price", price, textLimits.price);
  assertLength("Website text", website, textLimits.website);
  assertLength("CTA text", ctaText, textLimits.ctaText);

  return {
    postType,
    postTypeLabel: postTypeMeta.label,
    template: postTypeMeta.template,
    format,
    formatLabel: formatMeta.label,
    outputType,
    width: formatMeta.width,
    height: formatMeta.height,
    headline,
    subtitle,
    badge,
    features,
    price,
    website,
    ctaText,
    slug: postTypeMeta.slug,
    captionKey: postTypeMeta.captionKey,
  };
};

const pad = (value) => String(value).padStart(2, "0");

const buildTimestamp = (date = new Date()) =>
  [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("") + `-${pad(date.getHours())}${pad(date.getMinutes())}`;

const buildBaseFilename = (payload, date = new Date()) =>
  `stilloak-${payload.slug}-${buildTimestamp(date)}`;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const rgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const splitLongWord = (word, maxChars) => {
  const chunks = [];
  let remaining = word;

  while (remaining.length > maxChars) {
    chunks.push(remaining.slice(0, maxChars));
    remaining = remaining.slice(maxChars);
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
};

const wrapText = (text, maxWidth, fontSize, maxLines = 4) => {
  const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * 0.52)));
  const words = normalizeText(text)
    .split(" ")
    .flatMap((word) => (word.length > maxChars ? splitLongWord(word, maxChars) : word));
  const lines = [];

  words.forEach((word) => {
    const current = lines[lines.length - 1] || "";
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxChars || !current) {
      if (lines.length) {
        lines[lines.length - 1] = next;
      } else {
        lines.push(next);
      }
      return;
    }

    lines.push(word);
  });

  if (lines.length > maxLines) {
    const clipped = lines.slice(0, maxLines);
    const last = clipped[clipped.length - 1];
    clipped[clipped.length - 1] = last.length > 3 ? `${last.slice(0, Math.max(3, maxChars - 3))}...` : last;
    return clipped;
  }

  return lines.length ? lines : [""];
};

const renderTextBlock = ({
  text,
  x,
  y,
  width,
  fontSize,
  lineHeight,
  fill,
  weight = 600,
  anchor = "middle",
  maxLines = 4,
  opacity = 1,
}) => {
  const lines = wrapText(text, width, fontSize, maxLines);
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return {
    svg: `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Manrope, Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${fill}" opacity="${opacity}">${tspans}</text>`,
    height: lineHeight * lines.length,
    lines,
  };
};

const renderLogoLockup = ({ width, y, logoDataUri, colors, compact = false }) => {
  const logoSize = compact ? 72 : 88;
  const logoX = width / 2 - logoSize / 2;
  const brandY = y + logoSize + (compact ? 34 : 42);

  return `
    <image href="${logoDataUri}" x="${logoX}" y="${y}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>
    <text x="${width / 2}" y="${brandY}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="${compact ? 24 : 28}" font-weight="800" fill="${colors.white}">${escapeXml(brandConfig.name)}</text>
    <text x="${width / 2}" y="${brandY + (compact ? 30 : 34)}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="${compact ? 17 : 19}" font-weight="600" fill="${colors.mutedText}" opacity="0.84">privati nario erdvė</text>
  `;
};

const renderBadge = ({ text, x, y, width, colors }) => `
  <rect x="${x - width / 2}" y="${y}" width="${width}" height="52" rx="26" fill="${rgba(colors.gold, 0.14)}" stroke="${rgba(colors.gold, 0.72)}" stroke-width="1.4"/>
  <text x="${x}" y="${y + 34}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="21" font-weight="800" fill="${colors.gold}">${escapeXml(text.toUpperCase())}</text>
`;

const renderFeatureRows = ({ features, x, y, width, rowHeight, gap, fontSize, colors, numbered = false }) =>
  features
    .map((feature, index) => {
      const rowY = y + index * (rowHeight + gap);
      const label = numbered ? `${index + 1}` : "";

      return `
        <rect x="${x}" y="${rowY}" width="${width}" height="${rowHeight}" rx="24" fill="rgba(255,255,255,0.078)" stroke="${rgba(colors.gold, 0.28)}" stroke-width="1.2"/>
        ${
          numbered
            ? `<circle cx="${x + 42}" cy="${rowY + rowHeight / 2}" r="18" fill="${rgba(colors.gold, 0.24)}"/><text x="${x + 42}" y="${rowY + rowHeight / 2 + 8}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="20" font-weight="800" fill="${colors.gold}">${label}</text>`
            : `<circle cx="${x + 42}" cy="${rowY + rowHeight / 2}" r="9" fill="${colors.gold}" opacity="0.92"/>`
        }
        <text x="${x + 76}" y="${rowY + rowHeight / 2 + fontSize * 0.34}" font-family="Manrope, Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${colors.white}">${escapeXml(feature)}</text>
      `;
    })
    .join("");

const renderPlanCards = ({ features, x, y, width, rowHeight, gap, colors }) =>
  features
    .map((feature, index) => {
      const rowY = y + index * (rowHeight + gap);
      const [title, detail] = feature.includes(" - ") ? feature.split(" - ", 2) : [feature, ""];

      return `
        <rect x="${x}" y="${rowY}" width="${width}" height="${rowHeight}" rx="26" fill="rgba(255,255,255,0.085)" stroke="${rgba(colors.gold, 0.34)}" stroke-width="1.3"/>
        <circle cx="${x + 46}" cy="${rowY + rowHeight / 2}" r="17" fill="${rgba(colors.gold, 0.18)}" stroke="${rgba(colors.gold, 0.48)}"/>
        <text x="${x + 46}" y="${rowY + rowHeight / 2 + 7}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="20" font-weight="800" fill="${colors.gold}">${index + 1}</text>
        <text x="${x + 86}" y="${rowY + rowHeight / 2 - (detail ? 4 : -8)}" font-family="Manrope, Inter, Arial, sans-serif" font-size="${detail ? 28 : 31}" font-weight="800" fill="${colors.white}">${escapeXml(title)}</text>
        ${
          detail
            ? `<text x="${x + 86}" y="${rowY + rowHeight / 2 + 31}" font-family="Manrope, Inter, Arial, sans-serif" font-size="21" font-weight="600" fill="${colors.mutedText}" opacity="0.88">${escapeXml(detail)}</text>`
            : ""
        }
      `;
    })
    .join("");

const buildSvgFrame = ({ payload, logoDataUri, content }) => {
  const colors = brandConfig.colors;
  const { width, height } = payload;
  const safe = Math.round(width * 0.078);
  const outerRadius = Math.round(width * 0.046);

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="stilloakBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colors.darkGreen}"/>
        <stop offset="58%" stop-color="${colors.deepGreen}"/>
        <stop offset="100%" stop-color="#03130f"/>
      </linearGradient>
      <radialGradient id="goldGlow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="${colors.gold}" stop-opacity="0.22"/>
        <stop offset="48%" stop-color="${colors.gold}" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="${colors.gold}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="deepGlow" cx="18%" cy="82%" r="52%">
        <stop offset="0%" stop-color="#2c7a62" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#2c7a62" stop-opacity="0"/>
      </radialGradient>
      <filter id="premiumShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="28" stdDeviation="30" flood-color="#000000" flood-opacity="0.32"/>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#stilloakBg)"/>
    <rect width="${width}" height="${height}" fill="url(#goldGlow)"/>
    <rect width="${width}" height="${height}" fill="url(#deepGlow)"/>
    <circle cx="${width - safe * 1.15}" cy="${safe * 1.15}" r="${safe * 1.25}" fill="${colors.gold}" opacity="0.08"/>
    <circle cx="${safe * 0.9}" cy="${height - safe * 0.9}" r="${safe * 1.45}" fill="#66b08c" opacity="0.08"/>
    <rect x="${safe / 2}" y="${safe / 2}" width="${width - safe}" height="${height - safe}" rx="${outerRadius}" fill="none" stroke="${rgba(colors.gold, 0.34)}" stroke-width="1.5"/>
    <rect x="${safe * 0.78}" y="${safe * 0.78}" width="${width - safe * 1.56}" height="${height - safe * 1.56}" rx="${outerRadius - 10}" fill="none" stroke="rgba(255,255,255,0.055)" stroke-width="1"/>
    ${content({ colors, safe, logoDataUri })}
  </svg>`;
};

const renderBrandIntroTemplate = (payload, logoDataUri) =>
  buildSvgFrame({
    payload,
    logoDataUri,
    content: ({ colors, safe }) => {
      const { width, height } = payload;
      const contentWidth = width - safe * 2.35;
      const compact = height <= 1100;
      const logoTop = compact ? safe + 5 : safe + 22;
      const badgeTop = logoTop + (compact ? 160 : 178);
      const headlineSize = compact ? 66 : height > 1500 ? 80 : 74;
      const headline = renderTextBlock({
        text: payload.headline,
        x: width / 2,
        y: badgeTop + 126,
        width: contentWidth,
        fontSize: headlineSize,
        lineHeight: headlineSize * 1.08,
        fill: colors.white,
        weight: 800,
        maxLines: compact ? 3 : 4,
      });
      const subtitleTop = badgeTop + 150 + headline.height;
      const subtitle = renderTextBlock({
        text: payload.subtitle,
        x: width / 2,
        y: subtitleTop,
        width: contentWidth * 0.92,
        fontSize: compact ? 30 : 34,
        lineHeight: compact ? 42 : 46,
        fill: colors.mutedText,
        weight: 600,
        maxLines: compact ? 3 : 4,
        opacity: 0.9,
      });
      const featureTop = subtitleTop + subtitle.height + (compact ? 44 : 62);
      const featureCount = payload.features.length;
      const bottomSpace = payload.ctaText ? 140 : 92;
      const availableRows = height - featureTop - safe - bottomSpace;
      const rowHeight = Math.max(58, Math.min(compact ? 70 : 78, Math.floor((availableRows - (featureCount - 1) * 16) / featureCount)));
      const rowWidth = contentWidth * 0.78;
      const rows = renderFeatureRows({
        features: payload.features,
        x: width / 2 - rowWidth / 2,
        y: featureTop,
        width: rowWidth,
        rowHeight,
        gap: 16,
        fontSize: compact ? 26 : 30,
        colors,
      });
      const bottomText = payload.ctaText || payload.website;
      const bottomY = height - safe - (payload.ctaText ? 62 : 36);

      return `
        ${renderLogoLockup({ width, y: logoTop, logoDataUri, colors, compact })}
        ${renderBadge({ text: payload.badge, x: width / 2, y: badgeTop, width: Math.min(520, contentWidth * 0.72), colors })}
        ${headline.svg}
        ${subtitle.svg}
        ${rows}
        <text x="${width / 2}" y="${bottomY}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="${compact ? 26 : 30}" font-weight="800" fill="${colors.gold}">${escapeXml(bottomText)}</text>
        <text x="${width / 2}" y="${height - safe - 16}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${colors.mutedText}" opacity="0.82">${escapeXml(payload.website)}</text>
      `;
    },
  });

const renderPlanTemplate = (payload, logoDataUri) =>
  buildSvgFrame({
    payload,
    logoDataUri,
    content: ({ colors, safe }) => {
      const { width, height } = payload;
      const compact = height <= 1100;
      const cardX = safe;
      const cardY = compact ? safe + 168 : safe + 190;
      const cardW = width - safe * 2;
      const cardH = height - cardY - safe * 1.2;
      const headlineSize = compact ? 57 : height > 1500 ? 72 : 64;
      const badgeTop = cardY + 52;
      const headline = renderTextBlock({
        text: payload.headline,
        x: width / 2,
        y: badgeTop + 120,
        width: cardW - 100,
        fontSize: headlineSize,
        lineHeight: headlineSize * 1.08,
        fill: colors.white,
        weight: 800,
        maxLines: compact ? 3 : 4,
      });
      const subtitleY = badgeTop + 145 + headline.height;
      const subtitle = renderTextBlock({
        text: payload.subtitle,
        x: width / 2,
        y: subtitleY,
        width: cardW - 150,
        fontSize: compact ? 28 : 32,
        lineHeight: compact ? 40 : 45,
        fill: colors.mutedText,
        weight: 600,
        maxLines: 3,
        opacity: 0.9,
      });
      const featureTop = subtitleY + subtitle.height + (compact ? 40 : 56);
      const reservedBottom = payload.price || payload.ctaText ? 156 : 82;
      const availableRows = cardY + cardH - featureTop - reservedBottom;
      const rowHeight = Math.max(54, Math.min(compact ? 68 : 76, Math.floor((availableRows - (payload.features.length - 1) * 14) / payload.features.length)));
      const rows = renderFeatureRows({
        features: payload.features,
        x: cardX + 56,
        y: featureTop,
        width: cardW - 112,
        rowHeight,
        gap: 14,
        fontSize: compact ? 25 : 29,
        colors,
      });
      const priceText = payload.price || "";
      const ctaText = payload.ctaText || "Prisijungti dabar";
      const bottomY = cardY + cardH - 74;
      const ctaWidth = 274;
      const ctaX = priceText ? width - safe - 330 : width / 2 - ctaWidth / 2;
      const ctaLabelX = ctaX + ctaWidth / 2;

      return `
        ${renderLogoLockup({ width, y: safe + 24, logoDataUri, colors, compact: true })}
        <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="42" fill="rgba(255,255,255,0.075)" stroke="${rgba(colors.gold, 0.42)}" stroke-width="1.5" filter="url(#premiumShadow)"/>
        <rect x="${cardX + 18}" y="${cardY + 18}" width="${cardW - 36}" height="${cardH - 36}" rx="34" fill="none" stroke="rgba(255,255,255,0.065)" stroke-width="1"/>
        ${renderBadge({ text: payload.badge, x: width / 2, y: badgeTop, width: Math.min(500, cardW - 140), colors })}
        ${headline.svg}
        ${subtitle.svg}
        ${rows}
        ${
          priceText
            ? `<text x="${cardX + 62}" y="${bottomY}" font-family="Manrope, Inter, Arial, sans-serif" font-size="${compact ? 36 : 42}" font-weight="800" fill="${colors.gold}">${escapeXml(priceText)}</text>`
            : ""
        }
        <rect x="${ctaX}" y="${bottomY - 44}" width="${ctaWidth}" height="64" rx="32" fill="${rgba(colors.gold, 0.18)}" stroke="${rgba(colors.gold, 0.58)}"/>
        <text x="${ctaLabelX}" y="${bottomY - 4}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${colors.white}">${escapeXml(ctaText)}</text>
        <text x="${width / 2}" y="${height - safe * 0.44}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${colors.mutedText}" opacity="0.82">${escapeXml(payload.website)}</text>
      `;
    },
  });

const renderComparisonTemplate = (payload, logoDataUri) =>
  buildSvgFrame({
    payload,
    logoDataUri,
    content: ({ colors, safe }) => {
      const { width, height } = payload;
      const compact = height <= 1100;
      const logoTop = compact ? safe + 5 : safe + 18;
      const badgeTop = logoTop + (compact ? 148 : 170);
      const headline = renderTextBlock({
        text: payload.headline,
        x: width / 2,
        y: badgeTop + 118,
        width: width - safe * 2.1,
        fontSize: compact ? 58 : 72,
        lineHeight: compact ? 65 : 80,
        fill: colors.white,
        weight: 800,
        maxLines: compact ? 3 : 4,
      });
      const subtitleY = badgeTop + 140 + headline.height;
      const subtitle = renderTextBlock({
        text: payload.subtitle,
        x: width / 2,
        y: subtitleY,
        width: width - safe * 2.6,
        fontSize: compact ? 28 : 32,
        lineHeight: compact ? 40 : 45,
        fill: colors.mutedText,
        weight: 600,
        maxLines: 3,
        opacity: 0.9,
      });
      const cardsTop = subtitleY + subtitle.height + (compact ? 40 : 62);
      const cardWidth = width - safe * 2;
      const availableRows = height - cardsTop - safe - 106;
      const rowHeight = Math.max(76, Math.min(compact ? 104 : 118, Math.floor((availableRows - (payload.features.length - 1) * 18) / payload.features.length)));

      return `
        ${renderLogoLockup({ width, y: logoTop, logoDataUri, colors, compact })}
        ${renderBadge({ text: payload.badge, x: width / 2, y: badgeTop, width: Math.min(520, width - safe * 3), colors })}
        ${headline.svg}
        ${subtitle.svg}
        ${renderPlanCards({ features: payload.features, x: safe, y: cardsTop, width: cardWidth, rowHeight, gap: 18, colors })}
        <text x="${width / 2}" y="${height - safe - 18}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${colors.gold}">${escapeXml(payload.ctaText || "Pasirink planą pagal savo etapą")}</text>
        <text x="${width / 2}" y="${height - safe * 0.42}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="21" font-weight="700" fill="${colors.mutedText}" opacity="0.82">${escapeXml(payload.website)}</text>
      `;
    },
  });

const renderFaqTemplate = (payload, logoDataUri) =>
  buildSvgFrame({
    payload,
    logoDataUri,
    content: ({ colors, safe }) => {
      const { width, height } = payload;
      const compact = height <= 1100;
      const logoTop = compact ? safe + 5 : safe + 20;
      const badgeTop = logoTop + (compact ? 150 : 170);
      const headline = renderTextBlock({
        text: payload.headline,
        x: width / 2,
        y: badgeTop + 118,
        width: width - safe * 2.2,
        fontSize: compact ? 58 : 72,
        lineHeight: compact ? 66 : 80,
        fill: colors.white,
        weight: 800,
        maxLines: 3,
      });
      const subtitleY = badgeTop + 140 + headline.height;
      const subtitle = renderTextBlock({
        text: payload.subtitle,
        x: width / 2,
        y: subtitleY,
        width: width - safe * 2.5,
        fontSize: compact ? 27 : 32,
        lineHeight: compact ? 39 : 45,
        fill: colors.mutedText,
        weight: 600,
        maxLines: 3,
        opacity: 0.9,
      });
      const featureTop = subtitleY + subtitle.height + (compact ? 36 : 54);
      const availableRows = height - featureTop - safe - 94;
      const rowHeight = Math.max(62, Math.min(compact ? 78 : 92, Math.floor((availableRows - (payload.features.length - 1) * 16) / payload.features.length)));

      return `
        ${renderLogoLockup({ width, y: logoTop, logoDataUri, colors, compact })}
        ${renderBadge({ text: payload.badge, x: width / 2, y: badgeTop, width: Math.min(420, width - safe * 3), colors })}
        ${headline.svg}
        ${subtitle.svg}
        ${renderFeatureRows({ features: payload.features, x: safe, y: featureTop, width: width - safe * 2, rowHeight, gap: 16, fontSize: compact ? 24 : 28, colors, numbered: true })}
        <text x="${width / 2}" y="${height - safe - 20}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${colors.gold}">${escapeXml(payload.ctaText || payload.website)}</text>
      `;
    },
  });

const renderCtaTemplate = (payload, logoDataUri) =>
  buildSvgFrame({
    payload,
    logoDataUri,
    content: ({ colors, safe }) => {
      const { width, height } = payload;
      const compact = height <= 1100;
      const contentWidth = width - safe * 2.15;
      const logoTop = compact ? safe + 10 : safe + 26;
      const badgeTop = logoTop + (compact ? 160 : 184);
      const headline = renderTextBlock({
        text: payload.headline,
        x: width / 2,
        y: badgeTop + 130,
        width: contentWidth,
        fontSize: compact ? 68 : height > 1500 ? 88 : 78,
        lineHeight: compact ? 76 : height > 1500 ? 96 : 86,
        fill: colors.white,
        weight: 800,
        maxLines: compact ? 3 : 4,
      });
      const subtitleY = badgeTop + 158 + headline.height;
      const subtitle = renderTextBlock({
        text: payload.subtitle,
        x: width / 2,
        y: subtitleY,
        width: contentWidth * 0.92,
        fontSize: compact ? 29 : 35,
        lineHeight: compact ? 42 : 48,
        fill: colors.mutedText,
        weight: 600,
        maxLines: 4,
        opacity: 0.9,
      });
      const featureTop = subtitleY + subtitle.height + (compact ? 38 : 56);
      const rowHeight = compact ? 62 : 72;
      const rows = renderFeatureRows({
        features: payload.features,
        x: safe + 42,
        y: featureTop,
        width: width - safe * 2 - 84,
        rowHeight,
        gap: 14,
        fontSize: compact ? 24 : 28,
        colors,
      });
      const ctaY = Math.min(height - safe - 160, featureTop + payload.features.length * (rowHeight + 14) + 48);
      const ctaWidth = Math.min(640, contentWidth * 0.82);

      return `
        ${renderLogoLockup({ width, y: logoTop, logoDataUri, colors, compact })}
        ${renderBadge({ text: payload.badge, x: width / 2, y: badgeTop, width: Math.min(520, contentWidth * 0.72), colors })}
        ${headline.svg}
        ${subtitle.svg}
        ${rows}
        <rect x="${width / 2 - ctaWidth / 2}" y="${ctaY}" width="${ctaWidth}" height="86" rx="43" fill="${rgba(colors.gold, 0.22)}" stroke="${rgba(colors.gold, 0.68)}" stroke-width="1.6"/>
        <text x="${width / 2}" y="${ctaY + 55}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="32" font-weight="900" fill="${colors.white}">${escapeXml(payload.ctaText || "Prisijungti dabar")}</text>
        <text x="${width / 2}" y="${height - safe - 20}" text-anchor="middle" font-family="Manrope, Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${colors.gold}">${escapeXml(payload.website)}</text>
      `;
    },
  });

const renderSvg = (payload, logoDataUri) => {
  switch (payload.template) {
    case "template-brand-intro":
      return renderBrandIntroTemplate(payload, logoDataUri);
    case "template-comparison":
      return renderComparisonTemplate(payload, logoDataUri);
    case "template-faq":
      return renderFaqTemplate(payload, logoDataUri);
    case "template-cta":
      return renderCtaTemplate(payload, logoDataUri);
    case "template-plan":
    default:
      return renderPlanTemplate(payload, logoDataUri);
  }
};

const getLogoDataUri = async () => {
  const logoSvg = await fs.readFile(brandConfig.logoPath);
  return `data:image/svg+xml;base64,${logoSvg.toString("base64")}`;
};

const buildCaption = (payload) => {
  const template = CAPTION_TEMPLATES[payload.captionKey];

  if (template) {
    return template(payload.website);
  }

  return [
    `${payload.headline}`,
    payload.subtitle,
    payload.features.map((feature) => `• ${feature}`).join("\n"),
    payload.ctaText,
    payload.website,
  ]
    .filter(Boolean)
    .join("\n\n");
};

const writeImageFiles = async ({ svg, baseFilename, outputType }) => {
  const files = {};
  const jpgFilename = `${baseFilename}.jpg`;
  const jpgPath = path.join(brandConfig.generatedDirectory, jpgFilename);

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(jpgPath);

  files.jpg = jpgFilename;

  if (outputType === "png") {
    const pngFilename = `${baseFilename}.png`;
    const pngPath = path.join(brandConfig.generatedDirectory, pngFilename);

    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(pngPath);

    files.png = pngFilename;
  }

  return files;
};

const generateInstagramPost = async (payload) => {
  const normalizedPayload = normalizeInstagramPostPayload(payload);

  await ensureGeneratedDirectory();

  const logoDataUri = await getLogoDataUri();
  const svg = renderSvg(normalizedPayload, logoDataUri);
  const baseFilename = buildBaseFilename(normalizedPayload);
  const caption = buildCaption(normalizedPayload);
  const files = await writeImageFiles({
    svg,
    baseFilename,
    outputType: normalizedPayload.outputType,
  });
  const previewFilename = normalizedPayload.outputType === "png" && files.png ? files.png : files.jpg;

  return {
    postType: normalizedPayload.postType,
    postTypeLabel: normalizedPayload.postTypeLabel,
    template: normalizedPayload.template,
    format: normalizedPayload.format,
    formatLabel: normalizedPayload.formatLabel,
    width: normalizedPayload.width,
    height: normalizedPayload.height,
    outputType: normalizedPayload.outputType,
    caption,
    files,
    previewFilename,
    downloadUrls: Object.fromEntries(
      Object.entries(files).map(([type, filename]) => [
        type,
        `/api/admin/instagram-posts/download/${filename}`,
      ])
    ),
    createdAt: new Date().toISOString(),
  };
};

const fileTypeFromFilename = (filename) => path.extname(filename).slice(1).toLowerCase();

const listRecentInstagramPosts = async (limit = 12) => {
  await ensureGeneratedDirectory();

  const entries = await fs.readdir(brandConfig.generatedDirectory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && SAFE_FILENAME_PATTERN.test(entry.name))
      .map(async (entry) => {
        const filePath = path.join(brandConfig.generatedDirectory, entry.name);
        const stats = await fs.stat(filePath);

        return {
          filename: entry.name,
          fileType: fileTypeFromFilename(entry.name),
          createdAt: stats.mtime.toISOString(),
          size: stats.size,
          downloadUrl: `/api/admin/instagram-posts/download/${entry.name}`,
        };
      })
  );

  return files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
};

const resolveGeneratedInstagramPath = async (filename) => {
  const safeFilename = path.basename(String(filename || ""));

  if (!safeFilename || safeFilename !== filename || !SAFE_FILENAME_PATTERN.test(safeFilename)) {
    throw createHttpError("Netinkamas failo pavadinimas.", 400);
  }

  const rootDirectory = path.resolve(brandConfig.generatedDirectory);
  const filePath = path.resolve(rootDirectory, safeFilename);
  const relativePath = path.relative(rootDirectory, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw createHttpError("Netinkamas failo kelias.", 400);
  }

  if (!fsSync.existsSync(filePath)) {
    throw createHttpError("Failas nerastas.", 404);
  }

  return filePath;
};

module.exports = {
  FORMATS,
  POST_TYPES,
  buildCaption,
  buildBaseFilename,
  generateInstagramPost,
  listRecentInstagramPosts,
  normalizeInstagramPostPayload,
  resolveGeneratedInstagramPath,
};
