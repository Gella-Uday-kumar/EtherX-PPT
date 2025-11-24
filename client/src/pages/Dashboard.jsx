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

  const renderRightPanel = () => {
    switch (activePanel) {
      case 'layout':
        return <LayoutSelector applyLayout={applyLayout} currentSlide={currentSlide} onClose={() => setActivePanel(null)} />;
      // Removed format, draw, charts, add-ins per simplification
      case 'animations':
        return <AnimationPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <KeyboardShortcuts />
      
      {/* Modern Top Menu Bar */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-soft">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-8">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <img src="/DOCS-LOGO-final-transparent.png" alt="EtherX Logo" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
                EtherXPPT
              </span>
            </div>
            
            {/* Navigation Menu - simplified for signin flow */}
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
              
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all duration-200"
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
            </div>
            
            <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 mx-2"></div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <DropdownMenu
                label={
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#F0A500' }}>
                      {(user?.name || user?.email || 'User').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user?.name || 'User'}</div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar - hidden for signin flow */}
      {authFlow !== 'signin' && <Toolbar activePanel={activePanel} setActivePanel={setActivePanel} />}

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
          <SlideEditor />

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

      {/* Mobile View */}
      <MobileView />
    </div>
  );
};

export default Dashboard;