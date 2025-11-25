import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [pinnedFiles, setPinnedFiles] = useState([]);

  const templates = [
    { id: 1, name: 'Blank Presentation', category: 'Basic', description: 'Start with a blank presentation' },
    { id: 2, name: 'Business Pitch', category: 'Business', description: 'Professional business presentation' },
    { id: 3, name: 'Project Report', category: 'Business', description: 'Project status and updates' },
    { id: 4, name: 'Educational', category: 'Education', description: 'Educational content template' },
    { id: 5, name: 'Marketing Plan', category: 'Marketing', description: 'Marketing strategy presentation' },
    { id: 6, name: 'Sales Report', category: 'Business', description: 'Sales performance report' },
    { id: 7, name: 'Training Module', category: 'Education', description: 'Employee training presentation' },
    { id: 8, name: 'Product Launch', category: 'Marketing', description: 'New product announcement' },
    { id: 9, name: 'Financial Report', category: 'Business', description: 'Financial analysis and data' },
    { id: 10, name: 'Team Meeting', category: 'Business', description: 'Team updates and agenda' }
  ];

  useEffect(() => {
    loadRecentFiles();
    loadPinnedFiles();
  }, []);

  const loadRecentFiles = () => {
    const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    setRecentFiles(recent.slice(0, 10));
  };

  const loadPinnedFiles = () => {
    const pinned = JSON.parse(localStorage.getItem('pinnedFiles') || '[]');
    setPinnedFiles(pinned);
  };

  const handleCreateNew = (templateId = null) => {
    const newFile = {
      id: Date.now(),
      name: templateId ? templates.find(t => t.id === templateId)?.name || 'New Presentation' : 'Blank Presentation',
      modified: new Date().toISOString(),
      created: new Date().toISOString(),
      templateId
    };
    
    const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    recent.unshift(newFile);
    localStorage.setItem('recentFiles', JSON.stringify(recent.slice(0, 20)));
    
    if (templateId) {
      navigate(`/dashboard?template=${templateId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pptx,.ppt,.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const newFile = {
          id: Date.now(),
          name: file.name,
          modified: new Date().toISOString(),
          file: file
        };
        const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
        recent.unshift(newFile);
        localStorage.setItem('recentFiles', JSON.stringify(recent.slice(0, 20)));
        navigate('/dashboard', { state: { file } });
      }
    };
    input.click();
  };

  const handlePinFile = (fileId) => {
    const file = recentFiles.find(f => f.id === fileId);
    if (file) {
      const pinned = JSON.parse(localStorage.getItem('pinnedFiles') || '[]');
      if (!pinned.find(p => p.id === fileId)) {
        pinned.push(file);
        localStorage.setItem('pinnedFiles', JSON.stringify(pinned));
        setPinnedFiles(pinned);
      }
    }
  };

  const handleUnpinFile = (fileId) => {
    const pinned = pinnedFiles.filter(f => f.id !== fileId);
    localStorage.setItem('pinnedFiles', JSON.stringify(pinned));
    setPinnedFiles(pinned);
  };

  const handleShareFile = (fileId) => {
    const shareUrl = `${window.location.origin}/dashboard?share=${fileId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const handleDeleteFile = (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const recent = recentFiles.filter(f => f.id !== fileId);
      localStorage.setItem('recentFiles', JSON.stringify(recent));
      setRecentFiles(recent);
    }
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1B1A17' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#000000', borderBottom: '1px solid #F0A500' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <img src="/DOCS-LOGO-final-transparent.png" alt="EtherX Logo" className="w-8 h-8" />
                <h1 className="text-xl font-semibold" style={{ color: '#F0A500' }}>PowerPoint</h1>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'home' ? 'border-b-2' : 'hover:opacity-80'}`}
                  style={{ color: activeTab === 'home' ? '#F0A500' : '#F0A500', borderColor: activeTab === 'home' ? '#F0A500' : 'transparent' }}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'new' ? 'border-b-2' : 'hover:opacity-80'}`}
                  style={{ color: '#F0A500', borderColor: activeTab === 'new' ? '#F0A500' : 'transparent' }}
                >
                  New
                </button>
                <button
                  onClick={() => setActiveTab('open')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'open' ? 'border-b-2' : 'hover:opacity-80'}`}
                  style={{ color: '#F0A500', borderColor: activeTab === 'open' ? '#F0A500' : 'transparent' }}
                >
                  Open
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates and files"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 px-4 py-2 pl-10 pr-4 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                  style={{ backgroundColor: '#000000', color: '#F0A500', borderColor: '#F0A500' }}
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Toggle theme"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name || user?.email}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => navigate('/profile')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Account Settings
                      </button>
                      <button
                        onClick={() => navigate('/change-password')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Change Password
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-600" />
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <>
            {/* Quick Actions */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold" style={{ color: '#F0A500' }}>Start a new presentation</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleOpenFile}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: '#F0A500', color: '#1B1A17' }}
                  >
                    Open File
                  </button>
                  <button
                    onClick={() => handleCreateNew()}
                    className="px-4 py-2 rounded-lg transition-colors border"
                    style={{ backgroundColor: 'transparent', color: '#F0A500', borderColor: '#F0A500' }}
                  >
                    New Blank
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Blank Presentation */}
                <div 
                  onClick={() => handleCreateNew()}
                  className="cursor-pointer group"
                >
                  <div className="aspect-[4/3] bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 group-hover:text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-sm" style={{ color: '#F0A500' }}>Blank</p>
                    </div>
                  </div>
                </div>

                {/* Template Previews */}
                {filteredTemplates.slice(1, 6).map((template) => (
                  <div 
                    key={template.id}
                    onClick={() => handleCreateNew(template.id)}
                    className="cursor-pointer group"
                    title={template.description}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto mb-2 bg-white/20 rounded"></div>
                          <div className="w-12 h-1 mx-auto bg-white/30 rounded mb-1"></div>
                          <div className="w-8 h-1 mx-auto bg-white/30 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mt-2 text-center" style={{ color: '#F0A500' }}>{template.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pinned Files */}
            {pinnedFiles.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: '#F0A500' }}>Pinned</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pinnedFiles.map((file) => (
                    <div 
                      key={file.id}
                      className="cursor-pointer rounded-lg border hover:shadow-md transition-shadow p-4 group"
                      style={{ backgroundColor: '#000000', borderColor: '#F0A500' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1" onClick={() => navigate('/dashboard')}>
                          <div className="w-12 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#F0A500' }}>{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(file.modified).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnpinFile(file.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Unpin"
                        >
                          📌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Files */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: '#F0A500' }}>Recent</h2>
                <button 
                  onClick={() => setActiveTab('open')}
                  className="text-sm hover:opacity-80"
                  style={{ color: '#F0A500' }}
                >
                  See all
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentFiles.slice(0, 8).map((file) => (
                  <div 
                    key={file.id}
                    className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-4 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1" onClick={() => navigate('/dashboard')}>
                        <div className="w-12 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(file.modified).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                        <button
                          onClick={() => handlePinFile(file.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Pin"
                        >
                          📌
                        </button>
                        <button
                          onClick={() => handleShareFile(file.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Share"
                        >
                          🔗
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'new' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: '#F0A500' }}>Choose a template</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {filteredTemplates.map((template) => (
                <div 
                  key={template.id}
                  onClick={() => handleCreateNew(template.id)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow mb-3">
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded"></div>
                        <div className="w-16 h-1 mx-auto bg-white/30 rounded mb-2"></div>
                        <div className="w-12 h-1 mx-auto bg-white/30 rounded mb-2"></div>
                        <div className="w-14 h-1 mx-auto bg-white/30 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                    {template.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'open' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold" style={{ color: '#F0A500' }}>Open a file</h2>
              <button
                onClick={handleOpenFile}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#F0A500', color: '#1B1A17' }}
              >
                Browse Files
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: '#F0A500' }}>Recent files</h3>
                <div className="space-y-2">
                  {recentFiles.map((file) => (
                    <div 
                      key={file.id}
                      onClick={() => navigate('/dashboard')}
                      className="cursor-pointer flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
                    >
                      <div className="w-10 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Modified {new Date(file.modified).toLocaleDateString()}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePinFile(file.id);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Pin"
                        >
                          📌
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareFile(file.id);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Share"
                        >
                          🔗
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close account menu */}
      {showAccountMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowAccountMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default Home;