import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('==================================================');
console.log('🔍 SMTP DIAGNOSTIC & VERIFICATION SCRIPT');
console.log('==================================================');
console.log(`Loaded User: ${process.env.EMAIL_USER || process.env.SMTP_USER || '(None)'}`);
console.log(`Loaded Pass: ${process.env.EMAIL_PASS ? '******** (' + process.env.EMAIL_PASS.length + ' chars)' : '(None)'}`);
console.log(`Loaded Host: ${process.env.EMAIL_HOST || process.env.SMTP_HOST || '(Default: smtp.hostinger.com)'}`);
console.log(`Loaded Port: ${process.env.EMAIL_PORT || process.env.SMTP_PORT || '(Default: 465)'}`);
console.log('--------------------------------------------------');

const user = process.env.EMAIL_USER || process.env.SMTP_USER;
const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

if (!user || !pass || user.includes('your-email')) {
  console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS missing or using placeholder in server/.env');
  process.exit(1);
}

const configs = [
  {
    name: '1. Hostinger SMTP (Port 465 SSL)',
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
  },
  {
    name: '2. Hostinger SMTP (Port 587 TLS)',
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
  },
  {
    name: '3. Titan Email SMTP (Port 465 SSL)',
    host: 'smtp.titan.email',
    port: 465,
    secure: true,
  },
  {
    name: '4. Google Workspace SMTP (Port 465 SSL)',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  },
];

async function runDiagnostics() {
  let successConfig = null;

  for (const cfg of configs) {
    console.log(`\nTesting ${cfg.name}...`);
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
    });

    try {
      await transporter.verify();
      console.log(`✅ SUCCESS! Connected & Authenticated cleanly via ${cfg.name}`);
      successConfig = cfg;

      // Attempt sending a real test email
      console.log(`🚀 Sending test email to ${user}...`);
      const info = await transporter.sendMail({
        from: `"Praskla Test Mailer" <${user}>`,
        to: user,
        subject: `SMTP Test Success - ${cfg.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #ffffff; border-radius: 12px;">
            <h2 style="color: #a855f7;">🎉 SMTP Connection Successful!</h2>
            <p>Your SMTP configuration is operating smoothly using <strong>${cfg.name}</strong>.</p>
            <p style="font-size: 12px; color: #94a3b8;">Sent at: ${new Date().toISOString()}</p>
          </div>
        `,
      });

      console.log(`✉️ Test Email Delivered Successfully! Message ID: ${info.messageId}`);
      break; // Stop testing remaining configs once success is found
    } catch (err) {
      console.error(`❌ Connection failed for ${cfg.name}:`);
      console.error(`   Error Code: ${err.code || 'N/A'}`);
      console.error(`   Message:    ${err.message}`);
    }
  }

  console.log('\n==================================================');
  if (successConfig) {
    console.log('🎉 RECOMMENDED .ENV CONFIGURATION:');
    console.log(`EMAIL_HOST=${successConfig.host}`);
    console.log(`EMAIL_PORT=${successConfig.port}`);
    console.log(`EMAIL_USER=${user}`);
    console.log(`EMAIL_PASS=${pass}`);
    console.log(`EMAIL_FROM="Praskla Workspace" <${user}>`);
  } else {
    console.log('⚠️ ALL SMTP CONFIGURATIONS FAILED TO AUTHENTICATE.');
    console.log('Common Solutions:');
    console.log('1. If using Google Workspace / Gmail: Generate a 16-char App Password at myaccount.google.com/apppasswords');
    console.log('2. If using Hostinger Webmail: Verify your email password in Hostinger hPanel -> Emails -> Email Accounts');
  }
  console.log('==================================================\n');
}

runDiagnostics();
