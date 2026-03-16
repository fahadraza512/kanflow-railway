import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;
  private logger: LoggerService;
  private fromAddress: string;

  constructor() {
    this.logger = new LoggerService('EmailService');

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const appName = process.env.APP_NAME || 'KanFlow';
    this.fromAddress = process.env.EMAIL_FROM || `${appName} <${user}>`;

    if (!host || !user || !pass) {
      this.logger.logWarning('SMTP config incomplete. Email sending will be disabled.');
      return;
    }

    // Use Gmail service shorthand if host is Gmail — avoids Railway port-blocking issues
    const isGmail = host === 'smtp.gmail.com' || host === 'smtp.google.com';

    this.transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: { user, pass },
            // Force TLS — required on cloud platforms like Railway
            tls: { rejectUnauthorized: false },
          }
        : {
            host,
            port,
            secure: port === 465 ? true : secure,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            // Fallback to port 465 if 587 is blocked
            requireTLS: port === 587,
          },
    );

    this.isConfigured = true;
    this.logger.logSuccess('Email service initialized (SMTP/Nodemailer)');
    this.logger.log(`   From: ${this.fromAddress}`);
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    if (!this.isConfigured || !this.transporter) {
      this.logger.logWarning(`Email not sent to ${to} - SMTP not configured`);
      return { success: false, reason: 'SMTP not configured' };
    }

    try {
      this.logger.log(`📧 Sending email to ${to} with subject: "${subject}"`);
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });
      this.logger.logSuccess(`Email sent to ${to}`);
      return { success: true };
    } catch (error) {
      this.logger.logError(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async send(options: { to: string; subject: string; html?: string; text?: string }) {
    if (!options.html) throw new Error('html must be provided');
    return this.sendEmail(options.to, options.subject, options.html, options.text);
  }

  async testConnection() {
    if (!this.isConfigured || !this.transporter) {
      this.logger.logWarning('Email service not configured');
      return false;
    }
    try {
      await this.transporter.verify();
      this.logger.logSuccess('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.logError('SMTP connection failed', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const appName = process.env.APP_NAME || 'KanFlow';
    return this.sendEmail(
      email,
      `Password Reset Request - ${appName}`,
      this.buildPasswordResetHtml(resetLink, appName),
      `Password Reset\n\nClick the link to reset your password:\n\n${resetLink}\n\nExpires in 1 hour.`,
    );
  }

  async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const appName = process.env.APP_NAME || 'KanFlow';
    return this.sendEmail(
      email,
      `Verify Your Email - ${appName}`,
      this.buildVerificationHtml(verificationLink, appName),
      `Email Verification\n\nVerify your email:\n\n${verificationLink}\n\nExpires in 24 hours.`,
    );
  }

  async sendInvitationEmail(
    email: string,
    token: string,
    workspaceName: string,
    inviterName: string,
    role: string,
  ) {
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/accept?token=${token}`;
    const appName = process.env.APP_NAME || 'KanFlow';
    const roleDisplay = role === 'pm' ? 'Project Manager' : role.charAt(0).toUpperCase() + role.slice(1);
    return this.sendEmail(
      email,
      `You've been invited to join ${workspaceName} on ${appName}`,
      this.buildInvitationHtml(inviteLink, workspaceName, inviterName, roleDisplay, appName),
      `Invitation\n\n${inviterName} invited you to join ${workspaceName} as ${roleDisplay}.\n\n${inviteLink}\n\nExpires in 7 days.`,
    );
  }

  async sendNotificationEmail(
    email: string,
    notification: {
      type: string;
      title: string;
      message: string;
      workspaceName?: string;
      actionUrl?: string;
      userName?: string;
    },
  ) {
    const appName = process.env.APP_NAME || 'KanFlow';
    return this.sendEmail(
      email,
      `${notification.title} - ${notification.workspaceName || appName}`,
      this.buildNotificationHtml(notification, appName),
      `${notification.title}\n\n${notification.message}${notification.actionUrl ? `\n\n${notification.actionUrl}` : ''}`,
    );
  }

  // ─── HTML Builders ────────────────────────────────────────────────────────

  private baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; }
    .message { font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.8; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; }
    .link-section { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; word-break: break-all; font-size: 13px; color: #667eea; font-family: monospace; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #92400e; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .logo { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
  `;

  private wrap(title: string, body: string, appName: string) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${this.baseStyles}</style></head><body>
      <div class="container">
        <div class="header"><div class="logo">🚀 ${appName}</div><h1>${title}</h1></div>
        <div class="content">${body}</div>
        <div class="footer"><p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p></div>
      </div>
    </body></html>`;
  }

  private buildVerificationHtml(link: string, appName: string) {
    return this.wrap('Verify Your Email', `
      <div class="message">Hi there! 👋 Thank you for signing up with ${appName}. Please verify your email address.</div>
      <div class="button-container"><a href="${link}" class="button">Verify Email Address</a></div>
      <div class="message">Or copy this link:</div>
      <div class="link-section">${link}</div>
      <div class="warning">⏰ This link expires in 24 hours.</div>
    `, appName);
  }

  private buildPasswordResetHtml(link: string, appName: string) {
    return this.wrap('Password Reset Request', `
      <div class="message">Hi there! 👋 We received a request to reset your ${appName} password.</div>
      <div class="button-container"><a href="${link}" class="button">Reset Password</a></div>
      <div class="message">Or copy this link:</div>
      <div class="link-section">${link}</div>
      <div class="warning">⏰ This link expires in 1 hour. If you didn't request this, ignore this email.</div>
    `, appName);
  }

  private buildInvitationHtml(link: string, workspaceName: string, inviterName: string, role: string, appName: string) {
    return this.wrap("You're Invited!", `
      <div class="message">Hi there! 👋 <strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> as <strong>${role}</strong>.</div>
      <div class="button-container"><a href="${link}" class="button">Accept Invitation</a></div>
      <div class="message">Or copy this link:</div>
      <div class="link-section">${link}</div>
      <div class="warning">⏰ This invitation expires in 7 days.</div>
    `, appName);
  }

  private buildNotificationHtml(n: { title: string; message: string; workspaceName?: string; actionUrl?: string; userName?: string }, appName: string) {
    const greeting = n.userName ? `Hi ${n.userName}!` : 'Hi there!';
    const actionBtn = n.actionUrl ? `<div class="button-container"><a href="${n.actionUrl}" class="button">View Details</a></div>` : '';
    return this.wrap(n.title, `
      <div class="message">${greeting} 👋</div>
      ${n.workspaceName ? `<div class="message"><strong>${n.workspaceName}</strong></div>` : ''}
      <div class="message">${n.message}</div>
      ${actionBtn}
    `, appName);
  }
}
