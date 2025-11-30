// Mock email service for development
class MockEmailService {
  async sendOTP(email, otp) {
    console.log(`🔑 OTP for ${email}: ${otp}`);
    console.log(`📧 Email would be sent to: ${email}`);
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  async sendPasswordReset(email, resetLink) {
    console.log(`🔐 Password reset for ${email}: ${resetLink}`);
    return { success: true, messageId: 'mock-' + Date.now() };
  }
}

export default new MockEmailService();