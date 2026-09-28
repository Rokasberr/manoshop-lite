import nodemailer from "nodemailer";
import { getConfig } from "../config.js";
import EmailDelivery from "../models/EmailDelivery.js";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sender = () => process.env.EMAIL_FROM || "RESET by Stilloak <hello@stilloak-studio.com>";

const parseSender = (value) => {
  const match = String(value).match(/^(.*?)<([^>]+)>$/);
  return match
    ? { name: match[1].trim(), email: match[2].trim() }
    : { name: "RESET by Stilloak", email: String(value).trim() };
};

export const buildResetEmail = ({ preheader, eyebrow = "RESET BY STILLOAK", title, intro, rows = [], cta, note = "" }) => {
  const rowHtml = rows
    .filter((row) => row?.label && row?.value !== undefined && row?.value !== null && row?.value !== "")
    .map(
      (row) => `<tr><td style="padding:12px 0;color:#8f9992;font-size:14px;border-bottom:1px solid #252a27;">${escapeHtml(row.label)}</td><td style="padding:12px 0;color:#f5f7f5;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #252a27;">${escapeHtml(row.value)}</td></tr>`
    )
    .join("");
  const listText = rows.filter((row) => row?.label && row?.value !== undefined).map((row) => `${row.label}: ${row.value}`);
  const html = `<!doctype html><html><body style="margin:0;background:#090b0a;padding:24px;font-family:Arial,sans-serif;color:#f5f7f5;"><span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:620px;max-width:100%;background:#111412;border:1px solid #2a302c;border-radius:24px;overflow:hidden;"><tr><td style="padding:34px;"><p style="margin:0 0 22px;color:#d8ff72;font-size:12px;font-weight:700;letter-spacing:.16em;">${escapeHtml(eyebrow)}</p><h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;color:#f5f7f5;">${escapeHtml(title)}</h1><p style="margin:0 0 24px;color:#aeb7b0;font-size:16px;line-height:1.65;">${escapeHtml(intro)}</p>${rowHtml ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;border-top:1px solid #252a27;">${rowHtml}</table>` : ""}${cta?.url ? `<a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#d8ff72;color:#101310;text-decoration:none;font-weight:800;padding:14px 20px;border-radius:999px;">${escapeHtml(cta.label)}</a>` : ""}${note ? `<p style="margin:24px 0 0;color:#778079;font-size:13px;line-height:1.6;">${escapeHtml(note)}</p>` : ""}<p style="margin:30px 0 0;color:#778079;font-size:13px;">RESET supports habit and behaviour tracking. It is not medical treatment or a substitute for professional care.</p></td></tr></table></td></tr></table></body></html>`;
  const text = [eyebrow, title, intro, ...listText, cta?.url ? `${cta.label}: ${cta.url}` : "", note].filter(Boolean).join("\n\n");
  return { html, text };
};

const sendWithBrevo = async ({ to, subject, html, text }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        sender: parseSender(sender()),
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
        tags: ["reset-by-stilloak"]
      }),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "Brevo email request failed.");
    return body.messageId || "";
  } finally {
    clearTimeout(timeout);
  }
};

const sendWithSmtp = async ({ to, subject, html, text }) => {
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
    socketTimeout: 15_000
  });
  const result = await transport.sendMail({ from: sender(), to, subject, html, text });
  return result.messageId || "";
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === "test") return { messageId: "test-email" };
  if (process.env.BREVO_API_KEY) return { messageId: await sendWithBrevo({ to, subject, html, text }) };
  if (process.env.SMTP_HOST) return { messageId: await sendWithSmtp({ to, subject, html, text }) };
  throw Object.assign(new Error("Email delivery is not configured."), { statusCode: 503 });
};

export const sendTrackedEmail = async ({ user, type, dedupeKey, subject, content }) => {
  let delivery;
  const identity = { userId: user._id, type, dedupeKey };
  const existing = await EmailDelivery.findOne(identity);
  if (existing) {
    const staleBefore = new Date(Date.now() - 5 * 60 * 1000);
    delivery = await EmailDelivery.findOneAndUpdate(
      {
        _id: existing._id,
        $or: [{ status: "failed" }, { status: "pending", updatedAt: { $lte: staleBefore } }]
      },
      {
        $set: {
          recipient: user.email,
          status: "pending",
          providerMessageId: "",
          error: "",
          sentAt: null
        }
      },
      { new: true }
    );
    if (!delivery) return { sent: false, duplicate: true };
  } else {
    try {
      delivery = await EmailDelivery.create({ ...identity, recipient: user.email, status: "pending" });
    } catch (error) {
      if (error?.code === 11000) return { sent: false, duplicate: true };
      throw error;
    }
  }

  try {
    const result = await sendEmail({ to: user.email, subject, ...content });
    delivery.status = "sent";
    delivery.providerMessageId = result.messageId || "";
    delivery.sentAt = new Date();
    await delivery.save();
    return { sent: true };
  } catch (error) {
    delivery.status = "failed";
    delivery.error = String(error.message || error).slice(0, 500);
    await delivery.save();
    throw error;
  }
};

export const emailTemplates = {
  welcome: (user) => ({
    subject: "Welcome to RESET by Stilloak",
    content: buildResetEmail({
      preheader: "Your reset starts with one honest day.",
      title: `Welcome, ${user.name}.`,
      intro: "You now have a practical place to rebuild your routine without chasing a perfect streak.",
      cta: { label: "START ONBOARDING", url: `${getConfig().appUrl}/onboarding` }
    })
  }),
  passwordReset: (user, token) => ({
    subject: "Reset your RESET password",
    content: buildResetEmail({
      preheader: "Your secure password reset link expires in 15 minutes.",
      title: "Reset your password.",
      intro: "Use the secure link below. If you did not request this, you can ignore this email.",
      cta: { label: "RESET PASSWORD", url: `${getConfig().appUrl}/reset-password?token=${encodeURIComponent(token)}` },
      note: "This link expires in 15 minutes and can only be used once."
    })
  }),
  payment: () => ({
    subject: "Founding Lifetime access confirmed",
    content: buildResetEmail({
      preheader: "Your RESET Lifetime access is active.",
      title: "Lifetime access unlocked.",
      intro: "Your one-time payment was confirmed by Stripe. Your 30, 60, and 90 day programs are now available.",
      rows: [
        { label: "Plan", value: "Founding Lifetime" },
        { label: "Payment", value: "€19 one-time" },
        { label: "Subscription", value: "None" }
      ],
      cta: { label: "OPEN TODAY'S PLAN", url: `${getConfig().appUrl}/today` }
    })
  })
};
