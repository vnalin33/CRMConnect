const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, SERVER_HOST, PORT, RESET_BASE_URL } = require('../config/env');

// ── Transporter Configuration ──────────────────────────────────────────────────
const transporterConfig = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: Number(SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certs for broader SMTP compatibility
  },
  // Connection pool for scalability
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  // Timeouts
  connectionTimeout: 10000,  // 10s
  greetingTimeout: 10000,    // 10s
  socketTimeout: 30000,      // 30s
};

const transporter = nodemailer.createTransport(transporterConfig);

// ── Verify SMTP connection on startup ──────────────────────────────────────────
(async () => {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified — email service ready');
  } catch (err) {
    console.error('❌ SMTP connection failed:', err.message);
    console.error('   Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env');
  }
})();

// ── Retry helper ───────────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000; // 1 second

const sendMailWithRetry = async (mailOptions) => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent successfully to ${mailOptions.to} (attempt ${attempt}), messageId: ${info.messageId}`);
      return info;
    } catch (err) {
      lastError = err;
      console.warn(`⚠ Email send attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);

      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  console.error(`❌ Email to ${mailOptions.to} failed after ${MAX_RETRIES} attempts:`, lastError.message);
  const error = new Error('Failed to send email. Please try again later.');
  error.statusCode = 503;
  throw error;
};

// ── HTML Template ──────────────────────────────────────────────────────────────
const buildResetEmailHTML = (resetLink) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%); padding:32px 40px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
                  CRM Connect
                </h1>
                <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:13px;">
                  Financial Suite
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 12px; color:#1F2937; font-size:20px; font-weight:600;">
                  Reset Your Password
                </h2>
                <p style="margin:0 0 24px; color:#6B7280; font-size:14px; line-height:1.6;">
                  We received a request to reset your password. Click the button below to create a new password. This link will expire in <strong>15 minutes</strong>.
                </p>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:8px 0 32px;">
                      <a href="${resetLink}" 
                         style="display:inline-block; background:linear-gradient(135deg, #6366F1, #A855F7); color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:10px; font-size:15px; font-weight:600; letter-spacing:0.3px;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 16px; color:#9CA3AF; font-size:13px; line-height:1.5;">
                  If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>

                <hr style="border:none; border-top:1px solid #F3F4F6; margin:24px 0;" />

                <p style="margin:0; color:#D1D5DB; font-size:11px; text-align:center;">
                  © 2026 CRM Connect · All rights reserved
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Sends a password reset email with a deep link to the mobile app.
 * Uses RESET_BASE_URL if configured; otherwise falls back to SERVER_HOST:PORT.
 *
 * @param {string} toEmail - recipient email address
 * @param {string} resetToken - the raw (unhashed) reset token
 */
const sendPasswordResetEmail = async (toEmail, resetToken) => {
  let resetLink;

  if (RESET_BASE_URL) {
    resetLink = `${RESET_BASE_URL}?token=${resetToken}`;
  } else {
    const host = SERVER_HOST || 'localhost';
    const port = PORT || 5000;
    resetLink = `http://${host}:${port}/api/auth/reset-redirect?token=${resetToken}`;
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to: toEmail,
    subject: 'Reset Your Password — CRM Connect',
    html: buildResetEmailHTML(resetLink),
    text: `Reset your password by opening this link on your device: ${resetLink}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
  };

  await sendMailWithRetry(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
};
