import { Resend } from 'resend';
import { env } from '../config/env';

const resend = env.resend.apiKey ? new Resend(env.resend.apiKey) : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set - skipped email to ${to}: "${subject}"`);
    return;
  }
  try {
    await resend.emails.send({ from: env.resend.fromEmail, to, subject, html });
  } catch (err) {
    console.error('[email] Failed to send:', err);
  }
}

export function doctorWelcomeEmail(doctorName: string, email: string, temporaryPassword: string) {
  return {
    subject: 'Your DocPulse doctor account is ready',
    html: `
      <p>Hi Dr. ${doctorName},</p>
      <p>An account has been created for you on DocPulse.</p>
      <p><strong>Email:</strong> ${email}<br/>
      <strong>Temporary password:</strong> ${temporaryPassword}</p>
      <p>Please log in and change your password as soon as possible.</p>
    `,
  };
}