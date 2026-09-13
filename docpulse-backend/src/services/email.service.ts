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

export function passwordResetEmail(name: string, resetUrl: string) {
  return {
    subject: 'Reset your DocPulse password',
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your DocPulse account password.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#39393A;color:#ffffff;text-decoration:none;border-radius:6px;">Reset My Password</a></p>
      <p>Or copy and paste this link into your browser:<br/>${resetUrl}</p>
      <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
    `,
  };
}