import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { ContactSalesDto } from './dto/contact-sales.dto';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async submitContactRequest(dto: ContactSalesDto): Promise<{ success: boolean; message: string }> {
    try {
      const salesEmail = this.configService.get('SALES_EMAIL') || 'sales@kanflow.com';
      
      // Send email to sales team
      await this.emailService.sendEmail(
        salesEmail,
        `Enterprise Request: ${dto.companyName}`,
        this.generateSalesEmailHtml(dto),
      );

      // Log the request for tracking
      this.logger.log(`Enterprise contact request received from ${dto.companyName} (${dto.workEmail})`);

      return {
        success: true,
        message: 'Contact request submitted successfully. Our sales team will reach out soon.',
      };
    } catch (error) {
      this.logger.error('Failed to send sales contact email', error);
      throw error;
    }
  }

  private generateSalesEmailHtml(dto: ContactSalesDto): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚀 New Enterprise Request</h1>
          <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 14px;">A potential customer is interested in Enterprise plan</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Contact Information</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Full Name</strong>
                <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;">${dto.fullName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Work Email</strong>
                <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;">
                  <a href="mailto:${dto.workEmail}" style="color: #2563eb; text-decoration: none;">${dto.workEmail}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Company Name</strong>
                <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;">${dto.companyName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Team Size</strong>
                <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;">${dto.teamSize}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Workspace Name</strong>
                <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px;">${dto.workspaceName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Workspace ID</strong>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px; font-family: monospace;">${dto.workspaceId}</p>
              </td>
            </tr>
            ${dto.message ? `
            <tr>
              <td style="padding: 12px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Message</strong>
                <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 14px; line-height: 1.6;">${dto.message}</p>
              </td>
            </tr>
            ` : ''}
          </table>

          <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; font-size: 16px; margin-top: 0;">Next Steps</h3>
            <ol style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
              <li>Contact ${dto.fullName} at ${dto.workEmail}</li>
              <li>Discuss Enterprise features and pricing</li>
              <li>Negotiate contract terms</li>
              <li>After contract signed, upgrade workspace using Admin Panel</li>
            </ol>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border: 1px solid #fbbf24;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">
              <strong>⚠️ Important:</strong> The workspace is currently on the <strong>Free plan</strong>. 
              After contract signing, use the Admin Panel to upgrade to Enterprise.
            </p>
          </div>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This is an automated notification from KanFlow Sales System</p>
          <p style="margin-top: 10px;">Submitted at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }
}
