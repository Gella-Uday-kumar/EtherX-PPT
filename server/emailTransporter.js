import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify at startup
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error with email transporter:', error);
  } else {
    console.log('✅ Email transporter verified and ready');
  }
});

export default transporter;
