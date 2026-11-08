import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const recipients = (process.env.MAIL_TO || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

export async function sendEmail(
  subject: string,
  html: string
) {
  if (!recipients.length) {
    throw new Error("No email recipients configured");
  }

  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: recipients,
    subject,
    html,
  });
}