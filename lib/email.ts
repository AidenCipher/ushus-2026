import { Resend } from "resend";
import { isFeatureEnabled } from "@/lib/features.config";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@ushus2026.com";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a transactional email via Resend.
 * Fails silently if email is disabled or Resend is not configured.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!isFeatureEnabled("EMAIL_NOTIFICATIONS") || !resend) {
    console.warn("[Email] Email notifications disabled or Resend not configured");
    return false;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: "USHUS 2026 — Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f8f9fa; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #003580; font-size: 24px; margin: 0;">USHUS 2026</h1>
            <p style="color: #6C757D; font-size: 14px; margin-top: 4px;">Constellation — Illuminate your potential</p>
          </div>
          <h2 style="color: #1A1A2E; font-size: 20px;">Password Reset</h2>
          <p style="color: #4a4a4a; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
            This link expires in 1 hour.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #003580; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6C757D; font-size: 13px; line-height: 1.5;">
            If you did not request this reset, you can safely ignore this email.
            Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            © 2026 USHUS — Christ University, Bangalore. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send task assignment notification email
 */
export async function sendTaskAssignmentEmail(
  email: string,
  taskTitle: string,
  assignedBy: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendEmail({
    to: email,
    subject: `USHUS 2026 — New Task Assigned: ${taskTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f8f9fa; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #003580; font-size: 24px; margin: 0;">USHUS 2026</h1>
          </div>
          <h2 style="color: #1A1A2E; font-size: 20px;">New Task Assigned</h2>
          <p style="color: #4a4a4a; line-height: 1.6;">
            <strong>${assignedBy}</strong> has assigned you a new task:
          </p>
          <div style="background-color: #F8F9FA; border-left: 4px solid #003580; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="color: #1A1A2E; font-weight: 600; margin: 0;">${taskTitle}</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${appUrl}/dashboard/organiser/tasks" style="background-color: #003580; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Task
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            © 2026 USHUS — Christ University, Bangalore.
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send task due reminder email
 */
export async function sendTaskReminderEmail(
  email: string,
  taskTitle: string,
  dueDate: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendEmail({
    to: email,
    subject: `USHUS 2026 — Task Due Soon: ${taskTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f8f9fa; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #003580; font-size: 24px; margin: 0;">USHUS 2026</h1>
          </div>
          <h2 style="color: #EF4444; font-size: 20px;">⏰ Task Due Reminder</h2>
          <p style="color: #4a4a4a; line-height: 1.6;">
            Your task is due within the next 24 hours:
          </p>
          <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="color: #1A1A2E; font-weight: 600; margin: 0 0 8px 0;">${taskTitle}</p>
            <p style="color: #6C757D; font-size: 14px; margin: 0;">Due: ${dueDate}</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${appUrl}/dashboard/organiser/tasks" style="background-color: #EF4444; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Update Task
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            © 2026 USHUS — Christ University, Bangalore.
          </p>
        </div>
      </body>
      </html>
    `,
  });
}
