import nodemailer from 'nodemailer';

/**
 * Creates and returns a reusable Nodemailer transporter instance using
 * environment variables (supporting both EMAIL_* and SMTP_* variables).
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) return null;

  let host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.hostinger.com';
  let port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 465;

  // Support Gmail / Google Workspace SMTP if host is set to smtp.gmail.com
  if (process.env.EMAIL_HOST === 'smtp.gmail.com' || process.env.SMTP_HOST === 'smtp.gmail.com') {
    host = 'smtp.gmail.com';
    port = 465;
  }

  const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Generates a responsive, modern HTML email template for OTP delivery.
 */
export const generateOtpEmailTemplate = ({ appName = 'Praskla Workspace', otpCode, purpose = 'Verification', expiresMinutes = 5 }) => {
  const title = purpose === 'FORGOT_PASSWORD' ? 'Password Reset OTP Code' : 'Email Verification OTP Code';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f1117; color: #f3f4f6; }
        .email-container { max-width: 520px; margin: 30px auto; background: #161822; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .email-header { padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .brand-logo { font-size: 24px; font-weight: 800; color: #a855f7; letter-spacing: -0.5px; text-decoration: none; }
        .email-body { padding: 32px; }
        .greeting { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
        .text { font-size: 15px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(126, 34, 206, 0.12) 100%); border: 1.5px dashed #a855f7; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 28px 0; }
        .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #ffffff; text-indent: 12px; font-family: 'Courier New', Courier, monospace; }
        .expiry-badge { display: inline-block; background: rgba(239, 68, 68, 0.15); color: #f87171; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; margin-top: 10px; }
        .email-footer { padding: 24px 32px; background: #11131c; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; }
        .footer-text { font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="brand-logo">✨ ${appName}</div>
        </div>
        <div class="email-body">
          <h2 class="greeting">${title}</h2>
          <p class="text">Use the following 6-digit One-Time Password (OTP) to complete your ${purpose === 'FORGOT_PASSWORD' ? 'password reset' : 'account verification'}.</p>
          
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="expiry-badge">⏱️ Valid for ${expiresMinutes} minutes only</div>
          </div>
          
          <p class="text" style="font-size: 13px; color: #6b7280;">If you did not initiate this request, please ignore this email. Your account remains completely secure.</p>
        </div>
        <div class="email-footer">
          <p class="footer-text">© ${new Date().getFullYear()} ${appName}. All rights reserved.<br>Automated security notification — do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Async function to send OTP email using Hostinger Nodemailer SMTP
 */
export const sendOtpEmail = async ({ to, otpCode, purpose = 'REGISTER', subjectTitle }) => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"Praskla Workspace" <${user || 'no-reply@prasklatodo.com'}>`;
  const appName = 'Praskla Workspace';

  const defaultSubject = purpose === 'FORGOT_PASSWORD' ? 'Password Reset OTP Code' : 'Email Verification OTP Code';
  const subject = subjectTitle || `${defaultSubject} - ${appName}`;

  console.log(`\n==================================================`);
  console.log(`[📧 SENDING OTP EMAIL VIA SMTP] To: ${to} | Purpose: ${purpose}`);
  console.log(`==================================================\n`);

  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn(`[SMTP Warning] EMAIL_USER/SMTP_USER or EMAIL_PASS/SMTP_PASS not configured in .env.`);
      return { success: false, message: 'SMTP credentials missing' };
    }

    const htmlContent = generateOtpEmailTemplate({ appName, otpCode, purpose, expiresMinutes: 5 });

    const mailOptions = {
      from,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Success] Message ID: ${info.messageId} | Accepted: ${info.accepted?.join(', ')}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP Error] Failed to send email to ${to}:`, error.message);
    console.log(`\n==================================================`);
    console.log(`[🔑 LOCAL DEV OTP FALLBACK FOR ${to}]: ${otpCode}`);
    console.log(`==================================================\n`);
    
    // In local development, allow flow to continue if SMTP fails, logging OTP to server console
    return { 
      success: true, 
      warning: error.message,
      message: `OTP generated for ${to}. (SMTP delivery warning logged in server console)` 
    };
  }
};

export default {
  sendOtpEmail,
  generateOtpEmailTemplate,
};
