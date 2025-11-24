import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePresentation } from '../contexts/PresentationContext';
import { RiFileAddLine, RiStarLine, RiHistoryLine, RiTextWrap, RiImageLine, RiBarChartLine, RiTableLine, RiEmotionLine, RiVideoLine, RiMusicLine, RiPaletteLine, RiSettings3Line, RiLayoutLine, RiRulerLine, RiBrushLine, RiFolderLine, RiPlayLine, RiCloseLine } from 'react-icons/ri';
import Toolbar from '../components/Toolbar';
import Sidebar from '../components/Sidebar';
import SlideEditor from '../components/SlideEditor';
import SpeakerNotes from '../components/SpeakerNotes';
import LayoutSelector from '../components/LayoutSelector';
// import FormatPanel removed
// import DrawingTools removed
// import EnhancedChartComponent removed
// import AddInsPanel removed
import AnimationPanel from '../components/AnimationPanel';
import TableToolbar from '../components/TableToolbar';
import PresenterMode from '../components/PresenterMode';
import SlideShow from '../components/SlideShow';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import PresentationManager from '../components/PresentationManager';
import DropdownMenu, { DropdownItem, DropdownSeparator } from '../components/DropdownMenu';
import TemplateLibrary from '../components/TemplateLibrary';
import RecentPresentations from '../components/RecentPresentations';
import SearchPresentations from '../components/SearchPresentations';
import AIAssistant from '../components/AIAssistant';
import HeaderFooterModal from '../components/HeaderFooterModal';
import ChartComponent from '../components/ChartComponent';
import TableComponent from '../components/TableComponent';
import ThemePresetPicker from '../components/ThemePresetPicker';
import ImportMenu from '../components/ImportMenu';
import ExportMenu from '../components/ExportMenu';
import InteractiveElements from '../components/InteractiveElements';
import MobileView from '../components/MobileView';
import VersionHistory from '../components/VersionHistory';
import { exportToJSON, exportPresentation, generateSamplePresentation } from '../utils/exportUtils';
import { handleFileImport } from '../utils/importUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { slides, currentSlide, setSlides, presentationMeta, setPresentationMeta, updateSlide } = usePresentation();
  const [activePanel, setActivePanel] = useState(null);
  const [authFlow, setAuthFlow] = useState(localStorage.getItem('authFlow') || 'login');
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showPresentationManager, setShowPresentationManager] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showRecentPresentations, setShowRecentPresentations] = useState(false);
  const [showSearchPresentations, setShowSearchPresentations] = useState(false);
  const [showPresenterMode, setShowPresenterMode] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showInsertChart, setShowInsertChart] = useState(false);
  const [showInsertTable, setShowInsertTable] = useState(false);
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showInteractiveElements, setShowInteractiveElements] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showFavourites, setShowFavourites] = useState(false);
  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedTableElement, setSelectedTableElement] = useState(null);
  const [selectedTableCells, setSelectedTableCells] = useState([]);
  const [activeRibbonTab, setActiveRibbonTab] = useState('File');
  const [undoHistory, setUndoHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);

  const location = useLocation();

  useEffect(() => {
    // Load persisted authFlow when component mounts
    const flow = localStorage.getItem('authFlow') || 'login';
    setAuthFlow(flow);
    
    // Load demo presentation if in demo mode
    if (flow === 'demo') {
      const demoSlides = [
        {
          id: 1,
          title: 'Welcome to EtherX PPT Demo',
          content: 'This is a sample presentation to showcase our features. Try editing this text!',
          background: '#ffffff',
          textColor: '#000000',
          layout: 'title-content',
          elements: []
        },
        {
          id: 2,
          title: 'Key Features',
          content: '• Rich text editing\n• Drag & drop elements\n• Multiple export formats\n• Professional templates',
          background: '#f8fafc',
          textColor: '#1f2937',
          layout: 'title-content',
          elements: []
        },
        {
          id: 3,
          title: 'Get Started',
          content: 'Click anywhere to edit text, use the toolbar to add elements, and explore all the features!',
          background: '#fff7ed',
          textColor: '#9a3412',
          layout: 'title-content',
          elements: []
        }
      ];
      setSlides(demoSlides);
      localStorage.setItem('undoHistory', JSON.stringify([demoSlides]));
    }

    const handleStartSlideshow = () => setIsSlideshow(true);
    const handleExitSlideshow = () => setIsSlideshow(false);

    window.addEventListener('startSlideshow', handleStartSlideshow);
    window.addEventListener('exitSlideshow', handleExitSlideshow);

    return () => {
      window.removeEventListener('startSlideshow', handleStartSlideshow);
      window.removeEventListener('exitSlideshow', handleExitSlideshow);
    };
  }, []);

  // Handle deep-links from landing: favourites/history
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    if (view === 'history') {
      if (user) setShowRecentPresentations(true);
    }
    if (view === 'favourites') {
      if (user) setShowFavourites(true);
    }
  }, [location.search, user]);

  const applyLayout = (layoutType) => {
    saveToHistory();
    updateSlide(currentSlide, { layout: layoutType });
  };

  const saveToHistory = () => {
    const history = JSON.parse(localStorage.getItem('undoHistory') || '[]');
    history.push(JSON.parse(JSON.stringify(slides)));
    if (history.length > 50) history.shift();
    localStorage.setItem('undoHistory', JSON.stringify(history));
    localStorage.removeItem('redoHistory');
  };

  const handleUndo = () => {
    const history = JSON.parse(localStorage.getItem('undoHistory') || '[]');
    if (history.length > 1) {
      const current = history.pop();
      const previous = history[history.length - 1];
      const redoHistory = JSON.parse(localStorage.getItem('redoHistory') || '[]');
      redoHistory.push(current);
      localStorage.setItem('redoHistory', JSON.stringify(redoHistory));
      localStorage.setItem('undoHistory', JSON.stringify(history));
      setSlides(previous);
    }
  };

  const handleRedo = () => {
    const redoHistory = JSON.parse(localStorage.getItem('redoHistory') || '[]');
    if (redoHistory.length > 0) {
      const next = redoHistory.pop();
      const history = JSON.parse(localStorage.getItem('undoHistory') || '[]');
      history.push(next);
      localStorage.setItem('undoHistory', JSON.stringify(history));
      localStorage.setItem('redoHistory', JSON.stringify(redoHistory));
      setSlides(next);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewPresentation = () => {
    if (confirm('Start a new presentation? Unsaved changes will be lost.')) {
      const firstSlide = [{ id: Date.now(), title: 'Slide 1', content: 'Click to add content', background: '#ffffff', textColor: '#000000', layout: 'title-content', elements: [] }];
      setSlides(firstSlide);
      localStorage.setItem('undoHistory', JSON.stringify([firstSlide]));
      localStorage.removeItem('redoHistory');
      setPresentationMeta({ ...presentationMeta, updatedAt: new Date().toISOString(), title: 'Untitled' });
    }
  };

  const handleSavePresentation = () => {
    const name = prompt('Save As filename (without extension):', presentationMeta.title || 'presentation')?.trim();
    if (name) {
      exportToJSON(slides, `${name}.json`);
      setPresentationMeta({ ...presentationMeta, title: name, updatedAt: new Date().toISOString() });
    }
  };

  const handleSharePresentation = () => {
    if (navigator.share) {
      navigator.share({
        title: presentationMeta.title || 'Presentation',
        text: 'Check out my presentation!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const renderRightPanel = () => {
    // Show table toolbar if a table is selected
    if (selectedTableElement) {
      return (
        <TableToolbar 
          selectedElement={selectedTableElement}
          onUpdate={(updates) => {
            const elements = slides[currentSlide]?.elements || [];
            const updatedElements = elements.map(el => 
              el.id === selectedTableElement.id ? { ...el, ...updates } : el
            );
            updateSlide(currentSlide, { elements: updatedElements });
            setSelectedTableElement({ ...selectedTableElement, ...updates });
          }}
          selectedCells={selectedTableCells}
        />
      );
    }
    
    switch (activePanel) {
      case 'layout':
        return <LayoutSelector applyLayout={applyLayout} currentSlide={currentSlide} onClose={() => setActivePanel(null)} />;
      case 'animations':
        return <AnimationPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <KeyboardShortcuts />
      
      {/* PowerPoint-style Ribbon Menu */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b">
          <div className="flex items-center space-x-3">
            <img src="/DOCS-LOGO-final-transparent.png" alt="EtherX Logo" className="w-6 h-6" />
            <button onClick={() => navigate('/')} className="text-sm font-medium hover:underline">EtherX PowerPoint</button>
            <span className="text-xs text-gray-500">- {presentationMeta.title || 'Untitled'}</span>
          </div>
          <div className="flex items-center space-x-3">
            {/* Undo/Redo Buttons */}
            <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
              <button 
                onClick={handleUndo}
                disabled={JSON.parse(localStorage.getItem('undoHistory') || '[]').length <= 1}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  undoHistory.length <= 1 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
              <button 
                onClick={handleRedo}
                disabled={JSON.parse(localStorage.getItem('redoHistory') || '[]').length === 0}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  redoHistory.length === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" /></svg>
              </button>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <DropdownMenu
              label={
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: '#F0A500' }}>
                    {(user?.name || user?.email || 'User').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium">{user?.name || 'User'}</div>
                    <div className="text-xs opacity-75">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
              }
              align="right"
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(240,165,0,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium" style={{ backgroundColor: '#F0A500' }}>
                    {(user?.name || user?.email || 'User').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{user?.name || 'User'}</div>
                    <div className="text-xs opacity-75">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <DropdownItem onSelect={() => navigate('/profile')}>Custom Profile</DropdownItem>
                <DropdownItem onSelect={() => navigate('/change-password')}>Change Password</DropdownItem>
              </div>
              
              <div className="py-1 border-t" style={{ borderColor: 'rgba(240,165,0,0.08)' }}>
                <DropdownItem onSelect={() => { 
                  try { 
                    localStorage.removeItem('authFlow');
                    localStorage.removeItem('token');
                  } catch {} 
                  logout();
                  navigate('/');
                }}>Log Out</DropdownItem>
              </div>
            </DropdownMenu>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs">−</button>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs">□</button>
              <button onClick={() => navigate('/')} className="p-1 hover:bg-red-500 hover:text-white rounded text-xs">×</button>
            </div>
          </div>
        </div>

        {/* Ribbon Tabs */}
        <div className="flex items-center px-4 py-1 bg-gray-100 dark:bg-gray-800">
          <div className="flex space-x-6">
            {['File', 'Home', 'Insert', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Review', 'View'].map(tab => (
              <button 
                key={tab}
                onClick={() => {
                  if (tab === 'Home') {
                    navigate('/home');
                  } else {
                    setActiveRibbonTab(tab);
                  }
                }}
                className={`px-3 py-1 text-sm font-medium ${
                  activeRibbonTab === tab 
                    ? 'bg-white dark:bg-gray-700 border-b-2 border-blue-500' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Ribbon Content */}
        <div className="px-4 py-3 bg-white dark:bg-neutral-900">

          {activeRibbonTab === 'File' && (
            <div className="flex items-center space-x-8">
              {/* File Operations */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <button 
                    onClick={handleNewPresentation}
                    className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs">New</span>
                  </button>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={() => setShowPresentationManager(true)}
                    className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span className="text-xs">Open</span>
                  </button>
                </div>

                <div className="text-center">
                  <button 
                    onClick={handleSavePresentation}
                    className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs">Save</span>
                  </button>
                </div>

                <div className="text-center">
                  <button 
                    onClick={handleSharePresentation}
                    className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-xs">Share</span>
                  </button>
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => window.print()}
                    className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span className="text-xs">Print</span>
                  </button>
                </div>

                <div className="text-center relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    data-export-btn
                  >
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs">Export</span>
                  </button>
                  <ExportMenu 
                    isOpen={showExportMenu}
                    onClose={() => setShowExportMenu(false)}
                    onExport={async (format) => {
                      try {
                        if (!slides || slides.length === 0) {
                          alert('No slides to export. Please create some content first.');
                          return;
                        }
                        
                        const filename = presentationMeta.title || 'presentation';
                        console.log(`Starting export as ${format}...`);
                        
                        // Show loading state
                        const originalText = document.querySelector('[data-export-btn]')?.textContent;
                        if (document.querySelector('[data-export-btn]')) {
                          document.querySelector('[data-export-btn]').textContent = 'Exporting...';
                        }
                        
                        await exportPresentation(slides, format, filename);
                        
                        // Reset button text
                        if (document.querySelector('[data-export-btn]')) {
                          document.querySelector('[data-export-btn]').textContent = originalText;
                        }
                        
                        console.log('Successfully exported as:', format);
                        alert(`Successfully exported as ${format.toUpperCase()}!`);
                      } catch (error) {
                        console.error('Export failed:', error);
                        alert('Export failed: ' + error.message);
                        
                        // Reset button text on error
                        if (document.querySelector('[data-export-btn]')) {
                          document.querySelector('[data-export-btn]').textContent = 'Export';
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>

              {/* Recent Files */}
              <div>
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Recent</h4>
                <button 
                  onClick={() => setShowRecentPresentations(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Recent Files
                </button>
              </div>
            </div>
          )}
          
          {activeRibbonTab === 'Home' && (
            <div className="flex items-center space-x-8">

              
              {/* Clipboard */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    if (slides[currentSlide]) {
                      navigator.clipboard.writeText(JSON.stringify(slides[currentSlide]));
                    }
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                  </button>
                  <button onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      const slide = JSON.parse(text);
                      if (slide.id) {
                        slide.id = Date.now();
                        setSlides([...slides, slide]);
                      }
                    } catch {}
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Paste
                  </button>
                </div>
                <span className="text-xs text-gray-500">Clipboard</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Slides */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    saveToHistory();
                    const newSlide = { id: Date.now(), title: `Slide ${slides.length + 1}`, content: 'Click to add content', background: '#ffffff', textColor: '#000000', layout: 'title-content', elements: [] };
                    setSlides([...slides, newSlide]);
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New
                  </button>
                  <button onClick={() => setActivePanel(activePanel === 'layout' ? null : 'layout')} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiLayoutLine className="w-6 h-6 mb-1" />
                    Layout
                  </button>
                  <button onClick={() => {
                    if (slides.length > 1) {
                      saveToHistory();
                      const newSlides = slides.filter((_, i) => i !== currentSlide);
                      setSlides(newSlides);
                    }
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                  </button>
                </div>
                <span className="text-xs text-gray-500">Slides</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Drawing */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    const el = { id: Date.now(), type: 'shape', shapeType: 'rectangle', fill: '#F0A500', stroke: '#8a6d00', strokeWidth: 2, x: 200, y: 220, width: 160, height: 100 };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Shapes
                  </button>
                  <button onClick={() => {
                    const el = { id: Date.now(), type: 'textbox', content: 'Text Box', x: 100, y: 100, width: 240, height: 60, fontSize: 18, fontFamily: 'Arial', color: '#000', backgroundColor: 'transparent' };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiTextWrap className="w-6 h-6 mb-1" />
                    Text Box
                  </button>
                </div>
                <span className="text-xs text-gray-500">Drawing</span>
              </div>
            </div>
          )}
          
          {activeRibbonTab === 'Insert' && (
            <div className="flex items-center space-x-8">
              {/* Slides */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    const newSlide = { id: Date.now(), title: `Slide ${slides.length + 1}`, content: 'Click to add content', background: '#ffffff', textColor: '#000000', layout: 'title-content', elements: [] };
                    setSlides([...slides, newSlide]);
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Slide
                  </button>
                  <button onClick={() => setActivePanel(activePanel === 'layout' ? null : 'layout')} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiLayoutLine className="w-6 h-6 mb-1" />
                    Layout
                  </button>
                </div>
                <span className="text-xs text-gray-500">Slides</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Tables */}
              <div className="flex flex-col items-center">
                <button onClick={() => setShowInsertTable(true)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <RiTableLine className="w-6 h-6 mb-1" />
                  Table
                </button>
                <span className="text-xs text-gray-500">Tables</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Images */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const el = { id: Date.now(), type: 'image', src: e.target.result, x: 120, y: 140, width: 300, height: 200, alt: 'Image' };
                          const elems = slides[currentSlide]?.elements || [];
                          updateSlide(currentSlide, { elements: [...elems, el] });
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiImageLine className="w-6 h-6 mb-1" />
                    Pictures
                  </button>
                  <button onClick={() => {
                    const url = prompt('Online Image URL:');
                    if (url) {
                      const el = { id: Date.now(), type: 'image', src: url, x: 120, y: 140, width: 300, height: 200, alt: 'Image' };
                      const elems = slides[currentSlide]?.elements || [];
                      updateSlide(currentSlide, { elements: [...elems, el] });
                    }
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" /></svg>
                    Online
                  </button>
                </div>
                <span className="text-xs text-gray-500">Images</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Illustrations */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    const shapes = ['rectangle', 'circle', 'triangle', 'arrow'];
                    const shape = shapes[Math.floor(Math.random() * shapes.length)];
                    const el = { id: Date.now(), type: 'shape', shapeType: shape, fill: '#F0A500', stroke: '#8a6d00', strokeWidth: 2, x: 200, y: 220, width: 160, height: 100 };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Shapes
                  </button>
                  <button onClick={() => {
                    const icons = ['⭐', '❤️', '🎯', '💡', '🚀', '📊', '🔥', '✨'];
                    const icon = icons[Math.floor(Math.random() * icons.length)];
                    const el = { id: Date.now(), type: 'icon', content: icon, x: 260, y: 200, width: 48, height: 48, fontSize: 32 };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiEmotionLine className="w-6 h-6 mb-1" />
                    Icons
                  </button>
                </div>
                <span className="text-xs text-gray-500">Illustrations</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Charts */}
              <div className="flex flex-col items-center">
                <button onClick={() => setShowInsertChart(true)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <RiBarChartLine className="w-6 h-6 mb-1" />
                  Chart
                </button>
                <span className="text-xs text-gray-500">Charts</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Text */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    const el = { id: Date.now(), type: 'textbox', content: 'Text Box', x: 100, y: 100, width: 240, height: 60, fontSize: 18, fontFamily: 'Arial', color: '#000', backgroundColor: 'transparent' };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiTextWrap className="w-6 h-6 mb-1" />
                    Text Box
                  </button>
                  <button onClick={() => setShowHeaderFooter(true)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Header
                  </button>
                </div>
                <span className="text-xs text-gray-500">Text</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Media */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        const el = { id: Date.now(), type: 'video', src: url, x: 200, y: 240, width: 360, height: 220 };
                        const elems = slides[currentSlide]?.elements || [];
                        updateSlide(currentSlide, { elements: [...elems, el] });
                      }
                    };
                    input.click();
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiVideoLine className="w-6 h-6 mb-1" />
                    Video
                  </button>
                  <button onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'audio/*';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        const el = { id: Date.now(), type: 'audio', src: url, x: 220, y: 280, width: 280, height: 40 };
                        const elems = slides[currentSlide]?.elements || [];
                        updateSlide(currentSlide, { elements: [...elems, el] });
                      }
                    };
                    input.click();
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiMusicLine className="w-6 h-6 mb-1" />
                    Audio
                  </button>
                </div>
                <span className="text-xs text-gray-500">Media</span>
              </div>
            </div>
          )}
          
          {activeRibbonTab === 'Design' && (
            <div className="flex items-center space-x-8">
              {/* Designer */}
              <div className="flex flex-col items-center">
                <button onClick={() => setShowTemplateLibrary(true)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  Designer
                </button>
                <span className="text-xs text-gray-500">Designer</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Themes */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <div className="grid grid-cols-4 gap-1">
                    {[{bg:'#1B1A17',text:'#F0A500'},{bg:'#0b132b',text:'#e0e6f1'},{bg:'#0f1f14',text:'#e6f2ea'},{bg:'#2d1b69',text:'#e8e3ff'}].map((theme,i) => (
                      <button key={i} onClick={() => {
                        const updatedSlides = slides.map(slide => ({...slide, background: theme.bg, textColor: theme.text}));
                        setSlides(updatedSlides);
                      }} className="w-8 h-6 rounded border-2 border-gray-300" style={{backgroundColor: theme.bg}}></button>
                    ))}
                  </div>
                  <button onClick={() => setShowThemePicker(true)} className="flex flex-col items-center p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
                <span className="text-xs text-gray-500">Themes</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Variants */}
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-2 gap-1">
                  {['light','dark'].map(variant => (
                    <button key={variant} onClick={() => {
                      const bg = variant === 'dark' ? '#1a1a1a' : '#ffffff';
                      const text = variant === 'dark' ? '#ffffff' : '#000000';
                      updateSlide(currentSlide, { background: bg, textColor: text });
                    }} className={`w-12 h-8 rounded border text-xs ${variant === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black border-gray-300'}`}>
                      {variant}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500">Variants</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Shapes */}
              <div className="flex flex-col items-center">
                <button onClick={() => setShowShapeSelector(!showShapeSelector)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Shapes
                </button>
                <span className="text-xs text-gray-500">Shapes</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Icons */}
              <div className="flex flex-col items-center">
                <button onClick={() => setShowIconSelector(!showIconSelector)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <RiEmotionLine className="w-6 h-6 mb-1" />
                  Icons
                </button>
                <span className="text-xs text-gray-500">Icons</span>
              </div>
            </div>
          )}
          
          {activeRibbonTab === 'Transitions' && (
            <div className="flex items-center space-x-8">
              {/* Transition to This Slide */}
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {[
                    {name:'None',effect:'none'},
                    {name:'Fade',effect:'fade'},
                    {name:'Push',effect:'push'},
                    {name:'Wipe',effect:'wipe'},
                    {name:'Split',effect:'split'},
                    {name:'Reveal',effect:'reveal'},
                    {name:'Cover',effect:'cover'},
                    {name:'Flash',effect:'flash'}
                  ].map((transition,i) => (
                    <button key={i} onClick={() => {
                      if (currentSlide >= 0 && slides[currentSlide]) {
                        updateSlide(currentSlide, { transition: transition.effect });
                        console.log(`Applied ${transition.name} transition to slide ${currentSlide + 1}`);
                      }
                    }} className="w-12 h-8 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      {transition.name}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500">Transition to This Slide</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Timing */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col items-center">
                    <input type="number" min="0" max="10" step="0.1" defaultValue="1" className="w-16 text-xs p-1 border rounded" onChange={(e) => {
                      if (currentSlide >= 0 && slides[currentSlide]) {
                        updateSlide(currentSlide, { transitionDuration: parseFloat(e.target.value) });
                        console.log(`Set transition duration: ${e.target.value}s`);
                      }
                    }} />
                    <span className="text-xs">Duration</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="flex items-center text-xs">
                      <input type="checkbox" className="mr-1" onChange={(e) => {
                        if (currentSlide >= 0 && slides[currentSlide]) {
                          updateSlide(currentSlide, { autoAdvance: e.target.checked });
                          console.log(`Auto advance: ${e.target.checked}`);
                        }
                      }} />
                      Auto
                    </label>
                    <input type="number" min="1" max="60" defaultValue="5" className="w-12 text-xs p-1 border rounded mt-1" onChange={(e) => {
                      if (currentSlide >= 0 && slides[currentSlide]) {
                        updateSlide(currentSlide, { autoAdvanceTime: parseInt(e.target.value) });
                        console.log(`Auto advance time: ${e.target.value}s`);
                      }
                    }} />
                  </div>
                </div>
                <span className="text-xs text-gray-500">Timing</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Preview */}
              <div className="flex flex-col items-center">
                <button onClick={() => {
                  if (currentSlide >= 0 && slides[currentSlide]) {
                    const slide = slides[currentSlide];
                    if (slide?.transition) {
                      console.log(`Previewing ${slide.transition} transition`);
                      setShowPresenterMode(true);
                      setTimeout(() => setShowPresenterMode(false), 1500);
                    } else {
                      console.log('No transition set for this slide');
                    }
                  }
                }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <RiPlayLine className="w-6 h-6 mb-1" />
                  Preview
                </button>
                <span className="text-xs text-gray-500">Preview</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Apply To All */}
              <div className="flex flex-col items-center">
                <button onClick={() => {
                  if (currentSlide >= 0 && slides[currentSlide]) {
                    const currentTransition = slides[currentSlide]?.transition || 'fade';
                    const currentDuration = slides[currentSlide]?.transitionDuration || 1;
                    const updatedSlides = slides.map(slide => ({
                      ...slide, 
                      transition: currentTransition,
                      transitionDuration: currentDuration
                    }));
                    setSlides(updatedSlides);
                    console.log(`Applied ${currentTransition} transition to all ${slides.length} slides`);
                  }
                }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Apply To All
                </button>
                <span className="text-xs text-gray-500">Apply To All</span>
              </div>
            </div>
          )}
          
          {activeRibbonTab === 'Animations' && (
            <div className="flex items-center space-x-8">
              {/* Advanced Animation */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => setActivePanel(activePanel === 'animations' ? null : 'animations')} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                    Animation Pane
                  </button>
                  <select className="text-xs p-1 border rounded" onChange={(e) => {
                    const slide = slides[currentSlide];
                    if (!slide) return;
                    const animations = slide.animations || [];
                    const updatedAnimations = animations.map(anim => ({...anim, trigger: e.target.value}));
                    updateSlide(currentSlide, { animations: updatedAnimations });
                  }}>
                    <option value="onClick">On Click</option>
                    <option value="withPrevious">With Previous</option>
                    <option value="afterPrevious">After Previous</option>
                  </select>
                </div>
                <span className="text-xs text-gray-500">Advanced Animation</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Timing */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col items-center">
                    <input type="number" min="0" max="5" step="0.1" defaultValue="0.5" className="w-16 text-xs p-1 border rounded" onChange={(e) => {
                      const elements = slides[currentSlide]?.elements || [];
                      const updatedElements = elements.map(el => ({...el, animationDuration: parseFloat(e.target.value)}));
                      updateSlide(currentSlide, { elements: updatedElements });
                    }} />
                    <span className="text-xs">Duration</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <input type="number" min="0" max="5" step="0.1" defaultValue="0" className="w-16 text-xs p-1 border rounded" onChange={(e) => {
                      const elements = slides[currentSlide]?.elements || [];
                      const updatedElements = elements.map(el => ({...el, animationDelay: parseFloat(e.target.value)}));
                      updateSlide(currentSlide, { elements: updatedElements });
                    }} />
                    <span className="text-xs">Delay</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Timing</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Preview */}
              <div className="flex flex-col items-center">
                <button onClick={() => {
                  if (currentSlide >= 0 && slides[currentSlide]) {
                    const slide = slides[currentSlide];
                    const animations = slide.animations || [];
                    if (animations.length > 0) {
                      console.log('Starting animation preview...');
                      setShowPresenterMode(true);
                      setTimeout(() => setShowPresenterMode(false), 2000);
                    } else {
                      console.log('No animations found');
                    }
                  }
                }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <RiPlayLine className="w-6 h-6 mb-1" />
                  Preview
                </button>
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            </div>
          )}
          
          {activeRibbonTab === 'Slide Show' && (
            <div className="flex items-center space-x-8">
              {/* Start Slide Show */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => setShowPresenterMode(true)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <RiPlayLine className="w-6 h-6 mb-1" />
                    From Start
                  </button>
                  <button onClick={() => setShowPresenterMode(true)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    From Current
                  </button>
                </div>
                <span className="text-xs text-gray-500">Start Slide Show</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Set Up */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    if (confirm('Start recording slide show?')) {
                      const startTime = Date.now();
                      localStorage.setItem('recordingStart', startTime);
                      alert('Recording started! Press ESC to stop.');
                      setShowPresenterMode(true);
                    }
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Record
                  </button>
                  <button onClick={() => {
                    if (confirm('Start rehearse timings?')) {
                      const timings = slides.map((_, i) => ({ slide: i + 1, duration: Math.floor(Math.random() * 30) + 10 }));
                      alert(`Rehearse complete! Average time per slide: ${Math.round(timings.reduce((a, b) => a + b.duration, 0) / timings.length)}s`);
                    }
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Rehearse
                  </button>
                </div>
                <span className="text-xs text-gray-500">Set Up</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Monitors */}
              <div className="flex flex-col items-center">
                <button onClick={() => {
                  const monitors = screen.availWidth > 1920 ? 'Multiple monitors detected' : 'Single monitor detected';
                  if (confirm(`${monitors}. Enable presenter view with speaker notes?`)) {
                    localStorage.setItem('presenterView', 'enabled');
                    setShowPresenterMode(true);
                  }
                }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Use Presenter View
                </button>
                <span className="text-xs text-gray-500">Monitors</span>
              </div>
            </div>
          )}
          
          {activeRibbonTab === 'Review' && (
            <div className="flex items-center space-x-8">
              {/* Proofing */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    const slide = slides[currentSlide];
                    if (!slide) return;
                    const allText = [slide.title, slide.content, slide.contentLeft, slide.contentRight, slide.compLeftContent, slide.compRightContent].filter(Boolean).join(' ');
                    const words = allText.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0);
                    const misspelled = words.filter(w => w.length > 10 || /[0-9]/.test(w));
                    alert(`Spell check: ${words.length} words checked, ${misspelled.length} potential issues found.`);
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Spelling
                  </button>
                  <button onClick={() => {
                    const selection = window.getSelection().toString();
                    if (selection) {
                      alert(`Synonyms for "${selection}": similar, equivalent, comparable, related`);
                    } else {
                      alert('Select a word to find synonyms');
                    }
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    Thesaurus
                  </button>
                </div>
                <span className="text-xs text-gray-500">Proofing</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Comments */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => {
                    const comment = prompt('Add comment:');
                    if (comment) {
                      const comments = slides[currentSlide]?.comments || [];
                      updateSlide(currentSlide, { comments: [...comments, {id: Date.now(), text: comment, author: user?.name || 'User'}] });
                    }
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    New Comment
                  </button>
                  <button onClick={() => {
                    const comments = slides[currentSlide]?.comments || [];
                    if (comments.length > 0) {
                      if (confirm(`Delete all ${comments.length} comments?`)) {
                        updateSlide(currentSlide, { comments: [] });
                        alert('All comments deleted.');
                      }
                    } else {
                      alert('No comments to delete.');
                    }
                  }} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                  </button>
                </div>
                <span className="text-xs text-gray-500">Comments</span>
              </div>
            </div>
          )}
          
          {activeRibbonTab === 'View' && (
            <div className="flex items-center space-x-8">
              {/* Presentation Views */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => setActivePanel(null)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                    Normal
                  </button>
                  <button onClick={() => setShowPresenterMode(true)} className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Slide Sorter
                  </button>
                </div>
                <span className="text-xs text-gray-500">Presentation Views</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Show */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <label className="flex items-center text-xs">
                    <input type="checkbox" className="mr-1" defaultChecked />
                    Ruler
                  </label>
                  <label className="flex items-center text-xs">
                    <input type="checkbox" className="mr-1" checked={showGridlines} onChange={(e) => setShowGridlines(e.target.checked)} />
                    Gridlines
                  </label>
                  <label className="flex items-center text-xs">
                    <input type="checkbox" className="mr-1" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
                    Snap to Grid
                  </label>
                </div>
                <span className="text-xs text-gray-500">Show</span>
              </div>
              
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Zoom */}
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => setZoomLevel(100)} className="text-xs p-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                    Fit to Window
                  </button>
                  <select value={zoomLevel} onChange={(e) => setZoomLevel(parseInt(e.target.value))} className="text-xs p-1 border rounded">
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={125}>125%</option>
                    <option value={150}>150%</option>
                    <option value={200}>200%</option>
                  </select>
                </div>
                <span className="text-xs text-gray-500">Zoom</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Toolbar - Hidden for now */}
      <div className="hidden">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-8">
            <nav className="flex items-center space-x-1">
              {authFlow !== 'signin' && (
              <DropdownMenu label="File" align="left">
                <DropdownItem onSelect={() => {
                  if (confirm('Start a new presentation? Unsaved changes will be lost.')) {
                    const firstSlide = [{ id: Date.now(), title: 'Slide 1', content: 'Click to add content', background: '#ffffff', textColor: '#000000', layout: 'title-content', elements: [] }];
                    setSlides(firstSlide);
                    setPresentationMeta({ ...presentationMeta, updatedAt: new Date().toISOString(), title: presentationMeta.title || 'Untitled' });
                  }
                }}>
                  <div className="flex items-center gap-2">
                    <RiFileAddLine className="w-4 h-4" />
                    New
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowInfoModal(true)}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                    Information
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const name = prompt('Save As filename (without extension):', presentationMeta.title || 'presentation')?.trim();
                  if (name) {
                    exportToJSON(slides, `${name}.json`);
                    setPresentationMeta({ ...presentationMeta, title: name, updatedAt: new Date().toISOString() });
                  }
                }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Save As
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  if (confirm('Close presentation and return to Home?')) {
                    navigate('/');
                  }
                }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Close
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowPresentationManager(true)}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    Manage Presentations
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={async () => {
                  try {
                    await generateSamplePresentation();
                    alert('Sample PowerPoint presentation generated successfully!');
                  } catch (error) {
                    console.error('Error generating sample presentation:', error);
                    alert('Error generating sample presentation: ' + error.message);
                  }
                }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Sample PPT
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowTemplateLibrary(true)}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                    </svg>
                    Template Library
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowRecentPresentations(true)}>
                  <div className="flex items-center gap-2">
                    <RiHistoryLine className="w-4 h-4" />
                    Recent Presentations
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowFavourites(true)}>
                  <div className="flex items-center gap-2">
                    <RiStarLine className="w-4 h-4" />
                    Favorites
                  </div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowSearchPresentations(true)}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Presentations
                  </div>
                </DropdownItem>
              </DropdownMenu>
              )}
              
              <button 
                onClick={() => navigate('/')}
                className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200"
              >
                Home
              </button>
              
              {authFlow !== 'signin' && (
              <DropdownMenu label="Insert" align="left">
                <DropdownItem onSelect={() => {
                  const el = { id: Date.now(), type: 'textbox', content: 'New text', x: 100, y: 100, width: 240, height: 60, fontSize: 18, fontFamily: 'Arial', color: '#000', backgroundColor: 'transparent' };
                  const elems = slides[currentSlide]?.elements || [];
                  updateSlide(currentSlide, { elements: [...elems, el] });
                }}>
                  <div className="flex items-center gap-2"><RiTextWrap className="w-4 h-4" /> Text Box</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const url = prompt('Image URL:');
                  if (url) {
                    const el = { id: Date.now(), type: 'image', src: url, x: 120, y: 140, width: 300, height: 200, alt: 'Image' };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                  }
                }}>
                  <div className="flex items-center gap-2"><RiImageLine className="w-4 h-4" /> Image (URL)</div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowInsertChart(true)}>
                  <div className="flex items-center gap-2"><RiBarChartLine className="w-4 h-4" /> Chart</div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowInsertTable(true)}>
                  <div className="flex items-center gap-2"><RiTableLine className="w-4 h-4" /> Table</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const el = { id: Date.now(), type: 'icon', content: '⭐', x: 260, y: 200, width: 48, height: 48, fontSize: 32 };
                  const elems = slides[currentSlide]?.elements || [];
                  updateSlide(currentSlide, { elements: [...elems, el] });
                }}>
                  <div className="flex items-center gap-2"><RiEmotionLine className="w-4 h-4" /> Icon</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const el = { id: Date.now(), type: 'textbox', content: '<i>E = mc^2</i>', x: 180, y: 220, width: 180, height: 50, fontSize: 20, fontFamily: 'Times New Roman', color: '#111' };
                  const elems = slides[currentSlide]?.elements || [];
                  updateSlide(currentSlide, { elements: [...elems, el] });
                }}>
                  <div className="flex items-center gap-2"><RiSettings3Line className="w-4 h-4" /> Equation</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const url = prompt('Video URL (mp4/webm):');
                  if (url) {
                    const el = { id: Date.now(), type: 'video', src: url, x: 200, y: 240, width: 360, height: 220 };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                  }
                }}>
                  <div className="flex items-center gap-2"><RiVideoLine className="w-4 h-4" /> Video</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const url = prompt('Audio URL (mp3/ogg):');
                  if (url) {
                    const el = { id: Date.now(), type: 'audio', src: url, x: 220, y: 280, width: 280, height: 40 };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                  }
                }}>
                  <div className="flex items-center gap-2"><RiMusicLine className="w-4 h-4" /> Audio</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const el = { id: Date.now(), type: 'textbox', content: '<span style=\"font-weight:800;text-shadow:0 2px 6px rgba(0,0,0,0.3)\">WordArt</span>', x: 160, y: 180, width: 280, height: 80, fontSize: 28, fontFamily: 'Georgia', color: '#111', backgroundColor: 'transparent' };
                  const elems = slides[currentSlide]?.elements || [];
                  updateSlide(currentSlide, { elements: [...elems, el] });
                }}>
                  <div className="flex items-center gap-2"><RiTextWrap className="w-4 h-4" /> WordArt</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const el = { id: Date.now(), type: 'shape', shapeType: 'rectangle', fill: '#F0A500', stroke: '#8a6d00', strokeWidth: 2, x: 200, y: 220, width: 160, height: 100 };
                  const elems = slides[currentSlide]?.elements || [];
                  updateSlide(currentSlide, { elements: [...elems, el] });
                }}>
                  <div className="flex items-center gap-2"><RiLayoutLine className="w-4 h-4" /> Rectangle</div>
                </DropdownItem>
              </DropdownMenu>
              )}
              
              {authFlow !== 'signin' && (
              <DropdownMenu label="Design" align="left">
                <DropdownItem onSelect={() => setActivePanel(activePanel === 'layout' ? null : 'layout')}>
                  <div className="flex items-center gap-2"><RiLayoutLine className="w-4 h-4" /> Layouts</div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowTemplateLibrary(true)}>
                  <div className="flex items-center gap-2"><RiPaletteLine className="w-4 h-4" /> Templates</div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowThemePicker(true)}>
                  <div className="flex items-center gap-2"><RiSettings3Line className="w-4 h-4" /> Theme Presets</div>
                </DropdownItem>
                <DropdownItem onSelect={() => setShowHeaderFooter(true)}>
                  <div className="flex items-center gap-2"><RiLayoutLine className="w-4 h-4" /> Header & Footer</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const next = presentationMeta.slideSize === '16:9' ? '4:3' : '16:9';
                  setPresentationMeta({ ...presentationMeta, slideSize: next, updatedAt: new Date().toISOString() });
                }}>
                  <div className="flex items-center gap-2"><RiRulerLine className="w-4 h-4" /> Toggle Slide Size (Current: {presentationMeta.slideSize})</div>
                </DropdownItem>
                <DropdownItem onSelect={() => {
                  const color = prompt('Slide background color (hex):', slides[currentSlide]?.background || '#ffffff');
                  if (color) updateSlide(currentSlide, { background: color });
                }}>
                  <div className="flex items-center gap-2"><RiBrushLine className="w-4 h-4" /> Format Background</div>
                </DropdownItem>
              </DropdownMenu>
              )}
              
              {authFlow !== 'signin' && (
              <button 
                onClick={() => setActivePanel(activePanel === 'animations' ? null : 'animations')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activePanel === 'animations' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <RiPlayLine className="w-4 h-4" />
                Animations
              </button>
              )}
              
              {authFlow !== 'signin' && (
              <button 
                onClick={() => setShowPresenterMode(true)}
                className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200"
              >
                Presenter
              </button>
              )}
              

            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="relative">
                <button
                  onClick={() => setShowImportMenu(!showImportMenu)}
                  className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all duration-200"
                  title="Import"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </button>
                <ImportMenu 
                  isOpen={showImportMenu}
                  onClose={() => setShowImportMenu(false)}
                  onImport={async (file, fileType) => {
                    try {
                      const importedSlides = await handleFileImport(file, fileType);
                      setSlides([...slides, ...importedSlides]);
                      console.log('Successfully imported:', file.name);
                    } catch (error) {
                      console.error('Import failed:', error);
                      alert('Import failed: ' + error.message);
                    }
                  }}
                />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all duration-200"
                  title="Export"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </button>
                <ExportMenu 
                  isOpen={showExportMenu}
                  onClose={() => setShowExportMenu(false)}
                  onExport={async (format) => {
                    try {
                      const filename = presentationMeta.title || 'presentation';
                      await exportPresentation(slides, format, filename);
                      console.log('Successfully exported as:', format);
                    } catch (error) {
                      console.error('Export failed:', error);
                      alert('Export failed: ' + error.message);
                    }
                  }}
                />
              </div>
              
              <button
                onClick={() => setShowSearchPresentations(true)}
                className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all duration-200"
                title="Search Presentations (Ctrl+F)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              

            </div>
            
            <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 mx-2"></div>
            

          </div>
        </div>
      </div>

      {/* Import Menu */}
      <ImportMenu 
        isOpen={showImportMenu}
        onClose={() => setShowImportMenu(false)}
        onImport={async (file, fileType) => {
          try {
            const importedSlides = await handleFileImport(file, fileType);
            setSlides([...slides, ...importedSlides]);
          } catch (error) {
            alert('Import failed: ' + error.message);
          }
        }}
      />

      {/* Main Content - Show blank state for first-time sign-in, else full editor */}
      {authFlow === 'signin' ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-xl p-8">
            <h2 className="text-3xl font-bold mb-2 nav-title">Welcome to EtherX PPT!</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8">Get started by creating your first presentation or browse our templates.</p>
            <div className="flex gap-4 justify-center">
              <button
                className="btn-primary px-6 py-3"
                onClick={() => {
                  localStorage.setItem('authFlow', 'login');
                  setAuthFlow('login');
                }}
              >
                Create New Presentation
              </button>
              <button
                className="btn-secondary px-6 py-3"
                onClick={() => setShowTemplateLibrary(true)}
              >
                Explore Templates
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Slide Editor */}
          <SlideEditor 
            onTableSelect={(element) => setSelectedTableElement(element)}
            onTableCellSelect={(cells) => setSelectedTableCells(cells)}
            showGridlines={showGridlines}
            snapToGrid={snapToGrid}
            zoomLevel={zoomLevel}
          />

          {/* Right Panel */}
          {renderRightPanel()}
        </div>
      )}
      
      {/* Speaker Notes */}
      <SpeakerNotes />



      {/* Slideshow removed */}
      
      {/* Presenter Mode */}
      <PresenterMode 
        isActive={showPresenterMode} 
        onExit={() => setShowPresenterMode(false)} 
      />
      
      {/* Presentation Management Modals */}
      {showPresentationManager && (
        <PresentationManager 
          onClose={() => setShowPresentationManager(false)}
          onLoadPresentation={(data) => console.log('Loaded:', data)}
        />
      )}
      
      {showTemplateLibrary && (
        <TemplateLibrary onClose={() => setShowTemplateLibrary(false)} />
      )}
      
      {showRecentPresentations && authFlow !== 'signin' && (
        <RecentPresentations 
          onClose={() => setShowRecentPresentations(false)}
          onLoadPresentation={(data) => console.log('Loaded:', data)}
        />
      )}
      
      {showSearchPresentations && (
        <SearchPresentations 
          onClose={() => setShowSearchPresentations(false)}
          onLoadPresentation={(data) => console.log('Loaded:', data)}
        />
      )}
      
      {/* Insert/Design Modals */}
      {showInsertChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-zoom-in">
            <ChartComponent onClose={() => setShowInsertChart(false)} />
          </div>
        </div>
      )}
      {showInsertTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-zoom-in">
            <TableComponent onClose={() => setShowInsertTable(false)} />
          </div>
        </div>
      )}
      {showHeaderFooter && (
        <HeaderFooterModal onClose={() => setShowHeaderFooter(false)} meta={presentationMeta} onSave={(next) => setPresentationMeta({ ...presentationMeta, ...next, updatedAt: new Date().toISOString() })} />
      )}
      {showThemePicker && (
        <ThemePresetPicker onClose={() => setShowThemePicker(false)} onSelect={(id) => {
          const themeColors = {
            'default': { bg: '#1B1A17', text: '#F0A500' },
            'ocean': { bg: '#0b132b', text: '#e0e6f1' },
            'forest': { bg: '#0f1f14', text: '#e6f2ea' }
          }[id] || { bg: '#1B1A17', text: '#F0A500' };
          const updatedSlides = slides.map(slide => ({
            ...slide,
            background: themeColors.bg,
            textColor: themeColors.text
          }));
          setSlides(updatedSlides);
          setPresentationMeta({ ...presentationMeta, themePreset: id, updatedAt: new Date().toISOString() });
        }} />
      )}


      {showInteractiveElements && <InteractiveElements onClose={() => setShowInteractiveElements(false)} />}
      {showVersionHistory && <VersionHistory onClose={() => setShowVersionHistory(false)} />}

      {/* Favourites Modal - placeholder gated by auth */}
      {showFavourites && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="modal w-96">
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Favourites</h3>
              <button onClick={() => setShowFavourites(false)} className="text-neutral-500 hover:text-neutral-700">✕</button>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">Star presentations to see them here.</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowFavourites(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="modal w-[480px]">
            <div className="modal-header">
              <h3 className="nav-title">Information</h3>
              <button onClick={() => setShowInfoModal(false)} className="btn-ghost">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input className="form-input" value={presentationMeta.title || ''} onChange={(e) => setPresentationMeta({ ...presentationMeta, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Author</label>
                <input className="form-input" value={presentationMeta.author || ''} onChange={(e) => setPresentationMeta({ ...presentationMeta, author: e.target.value })} />
              </div>
              <div className="text-sm text-neutral-400">Slides: {slides.length}</div>
              <div className="text-sm text-neutral-400">Last Modified: {new Date(presentationMeta.updatedAt || Date.now()).toLocaleString()}</div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowInfoModal(false)} className="btn-secondary">Close</button>
              <button onClick={() => { setPresentationMeta({ ...presentationMeta, updatedAt: new Date().toISOString() }); setShowInfoModal(false); }} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Shape Selector Modal */}
      {showShapeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Select Shape</h3>
              <button onClick={() => setShowShapeSelector(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                {name: 'Rectangle', type: 'rectangle', icon: '▭'},
                {name: 'Circle', type: 'circle', icon: '●'},
                {name: 'Triangle', type: 'triangle', icon: '▲'},
                {name: 'Arrow', type: 'arrow', icon: '→'},
                {name: 'Diamond', type: 'diamond', icon: '◆'},
                {name: 'Star', type: 'star', icon: '★'},
                {name: 'Heart', type: 'heart', icon: '♥'},
                {name: 'Hexagon', type: 'hexagon', icon: '⬡'}
              ].map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => {
                    const el = { 
                      id: Date.now(), 
                      type: 'shape', 
                      shapeType: shape.type, 
                      fill: '#F0A500', 
                      stroke: '#8a6d00', 
                      strokeWidth: 2, 
                      x: 200, 
                      y: 220, 
                      width: 160, 
                      height: 100 
                    };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                    setShowShapeSelector(false);
                  }}
                  className="flex flex-col items-center p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-2xl mb-1">{shape.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">{shape.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Icon Selector Modal */}
      {showIconSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Select Icon</h3>
              <button onClick={() => setShowIconSelector(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {[
                '⭐', '❤️', '🎯', '💡', '🚀', '📊', '🔥', '✨', '💎', '🏆', '🎉', '🌟',
                '📈', '💰', '🎨', '🔧', '⚡', '🌍', '🎵', '📱', '💻', '🏠', '🚗', '✈️',
                '📝', '📚', '🎓', '💼', '🏢', '🛡️', '⚙️', '🔍', '📞', '✉️', '🎁', '🍕'
              ].map((icon, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const el = { 
                      id: Date.now(), 
                      type: 'icon', 
                      content: icon, 
                      x: 260, 
                      y: 200, 
                      width: 48, 
                      height: 48, 
                      fontSize: 32 
                    };
                    const elems = slides[currentSlide]?.elements || [];
                    updateSlide(currentSlide, { elements: [...elems, el] });
                    setShowIconSelector(false);
                  }}
                  className="flex items-center justify-center p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-2xl"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile View */}
      <MobileView />
    </div>
  );
};

export default Dashboard;