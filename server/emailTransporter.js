import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;
let useMockEmail = false;

// Check if real credentials are configured
if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
    process.env.EMAIL_USER !== 'gellaudaykumar2329@gmail.com' && 
    process.env.EMAIL_PASS !== 'your-gmail-app-password') {
  
  transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email transporter failed, using console output:', error.message);
      useMockEmail = true;
    } else {
      console.log('✅ Email transporter verified and ready');
    }
  });
} else {
  console.log('⚠️ Email credentials not configured, using console output for OTPs');
  useMockEmail = true;
}

export default {
  async sendMail(options) {
    if (useMockEmail || !transporter) {
      const otpMatch = options.text?.match(/\b\d{6}\b/);
      const otp = otpMatch ? otpMatch[0] : 'N/A';
      console.log(`🔑 OTP for ${options.to}: ${otp}`);
      return { messageId: 'mock-' + Date.now() };
    }
    return transporter.sendMail(options);
  }
};