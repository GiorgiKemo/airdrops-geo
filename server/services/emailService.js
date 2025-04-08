const sgMail = require('@sendgrid/mail');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize SendGrid with API key
sgMail.setApiKey(config.email.sendgridApiKey);

/**
 * Service for sending emails
 */
class EmailService {
  /**
   * Send a password reset email
   * @param {string} to - Recipient email
   * @param {string} username - User's username
   * @param {string} resetToken - Password reset token
   * @returns {Promise<boolean>} - Success status
   */
  async sendPasswordResetEmail(to, username, resetToken) {
    try {
      const resetUrl = `${config.client.url}/reset-password/${resetToken}`;
      
      const msg = {
        to,
        from: config.email.fromEmail,
        subject: 'Password Reset - Airdrops.geo',
        text: `Hello ${username},\n\nYou requested a password reset. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nRegards,\nThe Airdrops.geo Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset</h2>
            <p>Hello ${username},</p>
            <p>You requested a password reset. Please click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Regards,<br>The Airdrops.geo Team</p>
          </div>
        `,
      };
      
      await sgMail.send(msg);
      logger.info(`Password reset email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error(`Error sending password reset email: ${error.message}`);
      return false;
    }
  }
}

module.exports = new EmailService();
