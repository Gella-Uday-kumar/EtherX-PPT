import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import RenameModal from '../components/RenameModal';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [pinnedFiles, setPinnedFiles] = useState([]);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const templates = {
    1: { id: 1, name: 'Blank Presentation', category: 'Basic', description: 'Start with a blank presentation', slides: [{ id: 1, title: 'Click to add title', content: 'Click to add content', background: '#ffffff', textColor: '#000000', layout: 'title-content', elements: [] }] },
    2: { id: 2, name: 'Business Pitch', category: 'Business', description: 'Professional business presentation', slides: [
      { id: 1, title: 'Company Overview', content: 'Present your company vision and mission', background: '#1E40AF', textColor: '#FFFFFF', layout: 'title-content', elements: [] },
      { id: 2, title: 'Problem Statement', content: 'Define the problem you are solving', background: '#1E40AF', textColor: '#FFFFFF', layout: 'title-content', elements: [] },
      { id: 3, title: 'Our Solution', content: 'Present your innovative solution', background: '#1E40AF', textColor: '#FFFFFF', layout: 'title-content', elements: [] }
    ]},
    3: { id: 3, name: 'Project Report', category: 'Business', description: 'Project status and updates', slides: [
      { id: 1, title: 'Project Status Report', content: 'Q4 2024 Progress Update', background: '#059669', textColor: '#FFFFFF', layout: 'title-content', elements: [] },
      { id: 2, title: 'Key Achievements', content: 'Major milestones and accomplishments', background: '#059669', textColor: '#FFFFFF', layout: 'title-content', elements: [] }
    ]},
    4: { id: 4, name: 'Educational', category: 'Education', description: 'Educational content template', slides: [
      { id: 1, title: 'Course Introduction', content: 'Welcome to the course', background: '#7C3AED', textColor: '#FFFFFF', layout: 'title-content', elements: [] },
      { id: 2, title: 'Learning Objectives', content: 'What you will learn today', background: '#7C3AED', textColor: '#FFFFFF', layout: 'title-content', elements: [] }
    ]},
    5: { id: 5, name: 'Marketing Plan', category: 'Marketing', description: 'Marketing strategy presentation', slides: [
      { id: 1, title: 'Marketing Strategy 2024', content: 'Our comprehensive marketing approach', background: '#DC2626', textColor: '#FFFFFF', layout: 'title-content', elements: [] },
      { id: 2, title: 'Target Audience', content: 'Understanding our customers', background: '#DC2626', textColor: '#FFFFFF', layout: 'title-content', elements: [] }
    ]}
  };
  
  const templateList = Object.values(templates);

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
    const template = templateId ? templates[templateId] : null;

    if (template && template.slides) {
      // Generate unique IDs for slides to avoid conflicts
      const baseId = Date.now();
      const slidesWithUniqueIds = template.slides.map((slide, index) => ({
        ...slide,
        id: baseId + index
      }));
      const templateWithUniqueIds = {
        ...template,
        slides: slidesWithUniqueIds
      };
      navigate('/dashboard', { state: { template: templateWithUniqueIds } });
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

  const handleRenameFile = (fileId) => {
    const file = recentFiles.find(f => f.id === fileId);
    if (file) {
      setSelectedFile(file);
      setShowRenameModal(true);
    }
  };

  const handleFileRenamed = (newName) => {
    if (selectedFile) {
      const updatedFiles = recentFiles.map(f => 
        f.id === selectedFile.id ? { ...f, name: newName } : f
      );
      setRecentFiles(updatedFiles);
      localStorage.setItem('recentFiles', JSON.stringify(updatedFiles));
      
      // Also update pinned files if this file is pinned
      const updatedPinned = pinnedFiles.map(f => 
        f.id === selectedFile.id ? { ...f, name: newName } : f
      );
      setPinnedFiles(updatedPinned);
      localStorage.setItem('pinnedFiles', JSON.stringify(updatedPinned));
    }
  };

  const filteredTemplates = templateList.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-black border-b" style={{ borderColor: '#F0A500' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <img src="/DOCS-LOGO-final-transparent.png" alt="EtherX Logo" className="w-12 h-12" />
                <h1 className="text-xl font-semibold" style={{ color: '#F0A500' }}>PowerPoint</h1>
              </div>
              
              {/* Navigation */}
              <nav className="flex space-x-8">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-3 py-2 text-sm font-medium hover:opacity-80"
                  style={{ color: '#F0A500' }}
                >
                  Dashboard
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
                  className="w-80 px-4 py-2 pl-10 pr-4 text-sm border rounded-lg focus:ring-2 focus:outline-none bg-white dark:bg-black"
                  style={{ color: '#F0A500', borderColor: '#F0A500' }}
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{ color: '#F0A500' }}
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
                  <span className="text-sm text-gray-700 dark:text-white">{user?.name || user?.email}</span>
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
        {/* Featured Templates */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#F0A500' }}>Create a new presentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Blank Presentation */}
            <div
              onClick={() => handleCreateNew()}
              className="cursor-pointer group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-lg font-semibold" style={{ color: '#F0A500' }}>Blank Presentation</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Start from scratch</p>
                </div>
              </div>
            </div>

            {/* Template Previews */}
            {filteredTemplates.slice(1, 4).map((template) => {
              const bgColor = template.slides?.[0]?.background || '#4F46E5';
              return (
                <div
                  key={template.id}
                  onClick={() => handleCreateNew(template.id)}
                  className="cursor-pointer group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  title={template.description}
                >
                  <div className="aspect-[4/3] overflow-hidden" style={{ background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)` }}>
                    <div className="w-full h-full flex items-center justify-center text-white p-6">
                      <div className="text-center">
                        <div className="w-12 h-8 mx-auto mb-3 bg-white/20 rounded"></div>
                        <div className="w-16 h-1 mx-auto bg-white/30 rounded mb-1"></div>
                        <div className="w-12 h-1 mx-auto bg-white/30 rounded mb-1"></div>
                        <div className="w-14 h-1 mx-auto bg-white/30 rounded"></div>
                        <div className="text-sm mt-3 opacity-90 font-medium">{template.slides?.length || 1} slides</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{template.category}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* More Templates Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 rounded-lg transition-colors text-white hover:opacity-90"
              style={{ backgroundColor: '#F0A500' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Browse All Templates
            </button>
          </div>
        </div>

        {/* Recent Presentations */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#F0A500' }}>Recent presentations</h2>
            <button
              onClick={handleOpenFile}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: '#F0A500', color: '#000000' }}
            >
              Open from file
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFiles.slice(0, 6).map((file) => (
              <div
                key={file.id}
                onClick={() => navigate('/dashboard')}
                className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 p-6 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">{file.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Modified {new Date(file.modified).toLocaleDateString()}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFile(file.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePinFile(file.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Pin"
                    >
                      📌
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareFile(file.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Share"
                    >
                      🔗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentFiles.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recent presentations</h3>
              <p className="text-gray-600 dark:text-gray-400">Create your first presentation to get started</p>
            </div>
          )}
        </div>

        {/* Pinned Files */}
        {pinnedFiles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#F0A500' }}>Pinned</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => navigate('/dashboard')}
                  className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 p-6 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">{file.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Modified {new Date(file.modified).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnpinFile(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
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
      </div>
      
      {/* Rename Modal */}
      <RenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        currentName={selectedFile?.name || ''}
        onRename={handleFileRenamed}
      />

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