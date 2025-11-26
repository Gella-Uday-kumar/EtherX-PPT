import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePresentation } from '../contexts/PresentationContext';
import { RiFileAddLine, RiStarLine, RiHistoryLine } from 'react-icons/ri';

const Landing = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { getUserHistory, getUserFavorites } = usePresentation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="navbar">
          <div className="flex items-center space-x-2">
            <img src="/src/assets/icons/DOCS-LOGO-final-transparent.png" alt="Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold nav-title">EtherXPPT</span>
          </div>
          <div className="flex items-center space-x-3">
            {/* Theme toggle near signup */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200 border"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
              }}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5 text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link to="/login" className="btn-secondary"
              onClick={() => {
                localStorage.setItem('authFlow', 'login');
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => {
                localStorage.setItem('authFlow', 'signin');
              }}
              className="btn-secondary"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in" style={{ color: '#F0A500' }}>
            Create Amazing
            <span className={isDark ? 'text-white' : 'text-black'}> Presentations</span>
          </h1>
          <p className={`text-xl mb-8 animate-slide-in-up ${isDark ? 'text-white' : 'text-black'}`}>
            Professional PowerPoint-like editor with real-time collaboration, 
            modern design tools, and seamless workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
            <Link to="/signup" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
            <button 
              onClick={() => {
                localStorage.setItem('authFlow', 'demo');
                navigate('/dashboard');
              }}
              className="btn-secondary text-lg px-8 py-3"
            >
              Try Demo
            </button>
          </div>
        </div>

        {/* Features Grid replaced per requirements */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <button
            onClick={() => navigate('/dashboard')}
            className="panel p-6 text-center animate-slide-in-left hover:shadow-glow transition"
          >
            <div className="w-12 h-12 bg-transparent rounded-lg mx-auto mb-4 flex items-center justify-center">
              <RiFileAddLine className="text-2xl" style={{ color: '#F0A500' }} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>New Presentation</h3>
            <p className={isDark ? 'text-white' : 'text-black'}>Create and open a new presentation instantly.</p>
          </button>
          
          <button
            onClick={() => {
              if (user) {
                const favorites = getUserFavorites();
                if (favorites.length > 0) {
                  navigate('/home?view=favourites');
                } else {
                  alert('No favorites yet. Star some presentations!');
                }
              } else {
                navigate('/login');
              }
            }}
            className="card-themed p-6 text-center rounded-lg hover:shadow-lg transition-all"
            title={user ? 'View your favourites' : 'Login to access favourites'}
          >
            <div className="w-12 h-12 bg-transparent rounded-lg mx-auto mb-4 flex items-center justify-center">
              <RiStarLine className="text-2xl" style={{ color: '#F0A500' }} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Favourites</h3>
            <p className={isDark ? 'text-white' : 'text-black'}>{user ? 'Your starred presentations.' : 'Sign in to access favourites.'}</p>
          </button>
          
          <button
            onClick={() => {
              if (user) {
                const history = getUserHistory();
                if (history.length > 0) {
                  navigate('/home?view=history');
                } else {
                  alert('No history yet. Start creating presentations!');
                }
              } else {
                navigate('/login');
              }
            }}
            className="card-themed p-6 text-center rounded-lg hover:shadow-lg transition-all"
            title={user ? 'View your history' : 'Login to access history'}
          >
            <div className="w-12 h-12 bg-transparent rounded-lg mx-auto mb-4 flex items-center justify-center">
              <RiHistoryLine className="text-2xl" style={{ color: '#F0A500' }} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>History</h3>
            <p className={isDark ? 'text-white' : 'text-black'}>{user ? 'Recently worked on presentations.' : 'Sign in to access history.'}</p>
          </button>
        </div>

        {/* Simplified UI: remove cluttered features */}
        <div className="mt-20 text-center"></div>
      </main>

      {/* Footer */}
      <footer className="py-12 mt-20">
        <div className={`container mx-auto px-6 text-center ${isDark ? 'text-white' : 'text-black'}`}>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/src/assets/icons/DOCS-LOGO-final-transparent.png" alt="Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold nav-title">EtherXPPT</span>
          </div>
          <p className="mb-4">Professional presentation software for modern teams</p>
          <div className="flex justify-center space-x-6">
            <Link to="/login" className={`${isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}>Login</Link>
            <Link to="/signup" className={`${isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}>Sign Up</Link>
            <a href="#" className={`${isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}>Documentation</a>
            <a href="#" className={`${isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'}`}>Support</a>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Landing;