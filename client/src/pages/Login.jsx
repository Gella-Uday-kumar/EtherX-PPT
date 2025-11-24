import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data.token) {
        login({ 
          token: response.data.token, 
          email: response.data.user.email,
          name: response.data.user.name,
          id: response.data.user.id
        });
        navigate('/home');
      } else {
        alert('Login failed: Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        alert('Invalid email or password. Please check your credentials.');
      } else {
        alert('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="panel p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/src/assets/icons/DOCS-LOGO-final-transparent.png" alt="Logo" className="w-10 h-10" />
              <span className="text-3xl font-bold nav-title">EtherXPPT</span>
            </div>
            <h2 className="text-2xl font-bold nav-title">Welcome Back</h2>
            <p className="text-neutral-300">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <div className="text-center">
              <Link to="/forgot-password" className="font-medium text-sm" style={{ color: 'var(--accent-gold)' }}>
                Forgot your password?
              </Link>
            </div>
              <p className="text-neutral-300">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium" style={{ color: 'var(--accent-gold)' }}>
                Sign up
              </Link>
            </p>
              <Link to="/" className="text-sm muted">
                ← Back to Home
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;