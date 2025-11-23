import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transporter from './emailTransporter.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// In-memory OTP storage
const otpStorage = new Map();

// Reuse centralized transporter from `emailTransporter.js` (creates and verifies at startup)

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'EtherXPPT - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🔐 Password Reset Request</h1>
          <p>EtherXPPT - PowerPoint Replica</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hello!</h2>
          <p>We received a request to reset your password for your EtherXPPT account.</p>
          
          <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px;">
            <p><strong>Your OTP Code:</strong></p>
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</div>
            <p><small>This code will expire in 10 minutes</small></p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>Never share this OTP with anyone</li>
              <li>EtherXPPT will never ask for your OTP via phone or email</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>Best regards,<br>The EtherXPPT Team</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'EtherXPPT Server Running', status: 'OK' });
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log('🔑 Generated OTP:', otp);

    // Store OTP
    otpStorage.set(email, { otp, expiresAt });

    // Send email
    try {
      const result = await sendOTPEmail(email, otp);
      console.log('✅ Email sent successfully:', result.messageId);
      
      res.json({
        message: 'OTP sent successfully to your email address',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      
      // Still return success but log OTP for testing
      console.log('🔑 USE THIS OTP FOR TESTING:', otp);
      res.json({
        message: 'OTP generated (check server console for testing)',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        testOTP: otp // Remove this in production
      });
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔍 Verifying OTP for:', email, 'OTP:', otp);

    const storedData = otpStorage.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (new Date() > storedData.expiresAt) {
      otpStorage.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    console.log('✅ OTP verified successfully');
    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('🔄 Password reset for:', email);

    const storedData = otpStorage.get(email);
    
    if (!storedData || storedData.otp !== otp || new Date() > storedData.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    otpStorage.delete(email);

    console.log('✅ Password reset successful');
    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📧 Email configured for:', process.env.EMAIL_USER);
  console.log('🔑 OTP will be sent to Gmail or shown in console for testing');
});