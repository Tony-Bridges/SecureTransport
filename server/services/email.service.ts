/**
 * Email Service
 * Handles sending emails for user invitations and notifications
 */

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  replyTo?: string;
}

interface InvitationOptions {
  email: string;
  name: string;
  role: string;
  inviteToken: string;
  expiresIn: string;
  invitedBy: string;
}

class EmailService {
  private fromEmail: string = 'no-reply@securetransport.com';
  private replyToEmail: string = 'support@securetransport.com';
  private appUrl: string = process.env.APP_URL || 'https://app.securetransport.com';
  
  /**
   * Send a user invitation email
   */
  async sendInvitation(options: InvitationOptions): Promise<EmailResult> {
    const { email, name, role, inviteToken, expiresIn, invitedBy } = options;
    
    const inviteUrl = `${this.appUrl}/register?token=${inviteToken}`;
    
    const subject = `You've been invited to join SecureTransport as a ${role}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">You've Been Invited</h2>
        <p>Hello ${name},</p>
        <p>${invitedBy} has invited you to join SecureTransport as a <strong>${role}</strong>.</p>
        <p>This invitation will expire in ${expiresIn}.</p>
        <div style="margin: 25px 0;">
          <a href="${inviteUrl}" style="background-color: #0f172a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you,<br>The SecureTransport Team</p>
      </div>
    `;
    
    const textContent = `
      You've Been Invited
      
      Hello ${name},
      
      ${invitedBy} has invited you to join SecureTransport as a ${role}.
      
      This invitation will expire in ${expiresIn}.
      
      To accept the invitation, please visit the following URL:
      ${inviteUrl}
      
      If you have any questions, please contact our support team.
      
      Thank you,
      The SecureTransport Team
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
      from: this.fromEmail,
      replyTo: this.replyToEmail
    });
  }
  
  /**
   * Send a general email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html, text, from = this.fromEmail, replyTo = this.replyToEmail } = options;
    
    // In a real implementation, this would use a library like nodemailer or an email API service
    // For demonstration purposes, we'll just log the email and simulate a successful send
    
    console.log(`
      --------------------------------------
      EMAIL SENT
      --------------------------------------
      From: ${from}
      Reply-To: ${replyTo}
      To: ${to}
      Subject: ${subject}
      
      Text content: 
      ${text || 'No plain text content provided'}
      
      HTML content:
      ${html}
      --------------------------------------
    `);
    
    // Simulate occasional failures for demo purposes
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        messageId: `mock_message_id_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      };
    } else {
      return {
        success: false,
        error: 'Failed to send email due to SMTP error (simulated failure)'
      };
    }
  }
}

export const emailService = new EmailService();