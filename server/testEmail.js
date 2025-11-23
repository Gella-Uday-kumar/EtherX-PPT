import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

async function sendTest() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Transporter OK, ready to send");

    const info = await transporter.sendMail({
      from: `"OTP Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test OTP email",
      text: "If you see this, SMTP is working ✅",
    });

    console.log("📨 Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}

sendTest();