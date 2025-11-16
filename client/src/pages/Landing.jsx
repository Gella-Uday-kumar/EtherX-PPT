import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Landing = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">EtherXPPT</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn-secondary">Login</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
            Create Amazing
            <span className="text-blue-600"> Presentations</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up">
            Professional PowerPoint-like editor with real-time collaboration, 
            advanced charts, and modern design tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
            <Link to="/signup" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
            <Link to="/dashboard" className="btn-secondary text-lg px-8 py-3">
              Try Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="panel p-6 text-center animate-slide-in-left">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Advanced Charts</h3>
            <p className="text-gray-600 dark:text-gray-300">Create stunning charts with 6 different types and real-time data editing.</p>
          </div>
          
          <div className="panel p-6 text-center animate-zoom-in">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Drawing Tools</h3>
            <p className="text-gray-600 dark:text-gray-300">Professional drawing tools with shapes, colors, and formatting options.</p>
          </div>
          
          <div className="panel p-6 text-center animate-slide-in-right">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Export Options</h3>
            <p className="text-gray-600 dark:text-gray-300">Export to PDF, PPTX, or print directly from the browser.</p>
          </div>
        </div>

        {/* More Features */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📝', title: 'Text Formatting', desc: 'Rich text editing with fonts, colors, and styles' },
              { icon: '🎭', title: 'Templates', desc: '7 professional layouts to choose from' },
              { icon: '🔧', title: 'Add-ins', desc: 'Marketplace with 6 powerful extensions' },
              { icon: '⚡', title: 'Auto-save', desc: 'Never lose your work with automatic saving' },
              { icon: '🎯', title: 'Slideshow', desc: 'Full-screen presentation mode' },
              { icon: '🎤', title: 'Voice Recording', desc: 'Add audio narration to slides' },
              { icon: '✏️', title: 'Spell Check', desc: 'Built-in spell checking for text' },
              { icon: '🌙', title: 'Dark Mode', desc: 'Work comfortably in any lighting' }
            ].map((feature, index) => (
              <div key={index} className="panel p-4">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold dark:text-white">{feature.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold">EtherXPPT</span>
          </div>
          <p className="text-gray-400 mb-4">Professional presentation software for modern teams</p>
          <div className="flex justify-center space-x-6">
            <Link to="/login" className="text-gray-400 hover:text-white">Login</Link>
            <Link to="/signup" className="text-gray-400 hover:text-white">Sign Up</Link>
            <a href="#" className="text-gray-400 hover:text-white">Documentation</a>
            <a href="#" className="text-gray-400 hover:text-white">Support</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-500">© 2024 EtherXPPT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;