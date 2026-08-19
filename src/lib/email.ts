import { log } from "./logger";

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    log("INFO", "smtp_email_queued", { to: payload.to, subject: payload.subject });
    return { provider: "smtp", queued: true };
  }
  log("INFO", "demo_email", { to: payload.to, subject: payload.subject, text: payload.text });
  return { provider: "demo", queued: true };
}
