const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetEmail = async (email, token) => {
  // In a real app, this would be a link to your web reset page
  // For mobile-only, we might send a 6-digit code or a deep link
  // NOTE: Email clients (like Gmail) often block custom schemes like `crmconnect://`.
  // To make it clickable, we must send a standard HTTP/HTTPS link.
  // In production, you would point this to your actual website domain.
  const resetUrl = `https://crmconnect.app/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request - CRM Connect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6366f1;">CRM Connect</h2>
        <p>You requested a password reset for your account.</p>
        <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${resetUrl}</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('-----------------------------------------');
      console.log('DEVELOPMENT EMAILING FALLBACK');
      console.log(`To: ${email}`);
      console.log(`Reset Token: ${token}`);
      console.log('-----------------------------------------');
      return { message: 'Logged to console' };
    }
    throw error;
  }
};

module.exports = {
  sendResetEmail,
};
