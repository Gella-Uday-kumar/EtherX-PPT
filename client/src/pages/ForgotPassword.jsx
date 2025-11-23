import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'success'

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending OTP
    setTimeout(() => {
      setStep('otp');
      setLoading(false);
    }, 1000);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setMessage('Password reset instructions sent to your email!');
      setStep('success');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--primary-dark)' }}>
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/src/assets/icons/DOCS-LOGO-final-transparent.png" alt="Logo" className="w-10 h-10" />
              <span className="text-3xl font-bold" style={{ color: 'var(--accent-gold)' }}>EtherXPPT</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>Reset Password</h2>
            <p className="muted">Enter your email to receive reset instructions</p>
          </div>

          {step === 'success' ? (
            <div className="text-center">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {message}
              </div>
              {/* Success message shown; keep navigation link at the bottom to avoid duplication */}
            </div>
          ) : step === 'otp' ? (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          )}

          {step !== 'success' && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;