import React, { createContext, useContext, useState, useEffect } from 'react';
import userDataService from '../services/userDataService.js';
import { useAuth } from './AuthContext.jsx';

const PresentationContext = createContext();

export const usePresentation = () => {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation must be used within a PresentationProvider');
  }
  return context;
};

export const PresentationProvider = ({ children }) => {
  const { user } = useAuth();
  const [slides, setSlides] = useState([{
    id: 1,
    title: 'Slide 1',
    content: 'Click to add content',
    background: '#1B1A17',
    textColor: '#F0A500',
    layout: 'title-content',
    elements: []
  }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState(null);
  const [animationPreview, setAnimationPreview] = useState({ active: false, animations: [] });
  const [selectedAnimation, setSelectedAnimation] = useState(null);
  const [presentationMeta, setPresentationMeta] = useState({
    title: 'Untitled',
    author: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slideSize: '16:9',
    themePreset: 'default',
    header: { default: '', first: '', even: '', odd: '' },
    footer: { default: '', first: '', even: '', odd: '' }
  });

  // Push a new snapshot into history (trimming future states)
  const pushHistory = (nextSlides) => {
    try {
      const snapshot = JSON.parse(JSON.stringify(nextSlides));
      const base = history.slice(0, historyIndex + 1);
      const updated = [...base, snapshot];
      setHistory(updated);
      setHistoryIndex(base.length);
    } catch (e) {
      console.warn('History snapshot failed:', e);
    }
  };

  const addSlide = (layout = 'blank') => {
    const themeColors = {
      'default': { bg: '#1B1A17', text: '#F0A500' },
      'ocean': { bg: '#0b132b', text: '#e0e6f1' },
      'forest': { bg: '#0f1f14', text: '#e6f2ea' }
    }[presentationMeta.themePreset] || { bg: '#ffffff', text: '#000000' };
    const newSlide = {
      id: Date.now(),
      title: `Slide ${slides.length + 1}`,
      content: 'Click to add content',
      background: themeColors.bg,
      textColor: themeColors.text,
      layout,
      elements: []
    };
    const next = [...slides, newSlide];
    setSlides(next);
    setCurrentSlide(slides.length);
    pushHistory(next);
  };

  const deleteSlide = (index) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      if (currentSlide >= newSlides.length) {
        setCurrentSlide(newSlides.length - 1);
      }
      pushHistory(newSlides);
    }
  };

  const duplicateSlide = (index) => {
    const slide = slides[index];
    const newSlide = { ...JSON.parse(JSON.stringify(slide)), id: Date.now(), title: `${slide.title} Copy` };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    pushHistory(newSlides);
  };

  const resetSlide = (index) => {
    const newSlides = [...slides];
    newSlides[index] = {
      ...newSlides[index],
      content: 'Click to add content',
      elements: []
    };
    setSlides(newSlides);
    pushHistory(newSlides);
  };

  const updateSlide = (index, updates, skipHistory = false) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setSlides(newSlides);
    if (!skipHistory) {
      pushHistory(newSlides);
    }
  };

  const applyLayout = (index, layout) => {
    const newSlides = [...slides];
    const current = { ...newSlides[index] };

    // Initialize layout-specific metadata and fields
    let layoutMeta = {};
    switch (layout) {
      case 'blank':
        layoutMeta = { type: 'blank' };
        current.title = current.title || '';
        current.content = current.content || '';
        break;
      case 'title-content':
        layoutMeta = { type: 'title-content' };
        // Restore content from layout-specific fields if switching back
        if (current.layout === 'two-column') {
          current.content = (current.contentLeft || '') + (current.contentRight ? '\n\n' + current.contentRight : '');
        } else if (current.layout === 'comparison') {
          current.title = current.compLeftTitle || current.title || '';
          current.content = (current.compLeftContent || '') + (current.compRightContent ? '\n\n' + current.compRightContent : '');
        }
        current.title = current.title || 'Click to add title';
        current.content = current.content || 'Click to add content';
        // Clear layout-specific fields
        delete current.contentLeft;
        delete current.contentRight;
        delete current.compLeftTitle;
        delete current.compLeftContent;
        delete current.compRightTitle;
        delete current.compRightContent;
        break;
      case 'title-only':
        layoutMeta = { type: 'title-only' };
        current.title = current.title || 'Click to add title';
        break;
      case 'content-only':
        layoutMeta = { type: 'content-only' };
        current.content = current.content || 'Click to add content';
        break;
      case 'two-column':
        layoutMeta = { type: 'two-column', columns: 2 };
        if (current.layout === 'comparison') {
          current.contentLeft = current.contentLeft || current.compLeftContent || 'Left content';
          current.contentRight = current.contentRight || current.compRightContent || 'Right content';
        } else {
          current.contentLeft = current.contentLeft || current.content || 'Left content';
          current.contentRight = current.contentRight || 'Right content';
        }
        break;
      case 'image-text':
        layoutMeta = { type: 'image-text', regions: [{ type: 'image' }, { type: 'text' }] };
        current.imageSrc = current.imageSrc || '';
        current.content = current.content || 'Add text';
        break;
      case 'comparison':
        layoutMeta = { type: 'comparison', columns: 2 };
        if (current.layout === 'two-column') {
          current.compLeftTitle = current.compLeftTitle || current.title || 'Left heading';
          current.compLeftContent = current.compLeftContent || current.contentLeft || 'Left content';
          current.compRightTitle = current.compRightTitle || 'Right heading';
          current.compRightContent = current.compRightContent || current.contentRight || 'Right content';
        } else {
          current.compLeftTitle = current.compLeftTitle || current.title || 'Left heading';
          current.compLeftContent = current.compLeftContent || current.content || 'Left content';
          current.compRightTitle = current.compRightTitle || 'Right heading';
          current.compRightContent = current.compRightContent || 'Right content';
        }
        break;
      default:
        layoutMeta = { type: layout };
    }

    current.layout = layout;
    current.layoutMeta = layoutMeta;
    newSlides[index] = current;
    setSlides(newSlides);
    pushHistory(newSlides);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSlides(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSlides(history[historyIndex + 1]);
    }
  };

  const copy = () => {
    setClipboard(slides[currentSlide]);
  };

  const paste = () => {
    if (clipboard) {
      const newSlide = { ...JSON.parse(JSON.stringify(clipboard)), id: Date.now() };
      const next = [...slides, newSlide];
      setSlides(next);
      pushHistory(next);
    }
  };

  const reorderSlides = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const next = [...slides];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setSlides(next);
    setCurrentSlide(toIndex);
    pushHistory(next);
  };

  const saveToIPFS = async () => {
    try {
      const { default: ipfsService } = await import('../services/ipfsService.js');
      const result = await ipfsService.savePresentation({ slides, presentationMeta, savedAt: new Date().toISOString() });
      localStorage.setItem('lastIPFSHash', result.ipfsHash);
      return result;
    } catch (error) {
      console.error('Manual save to IPFS failed:', error);
      throw error;
    }
  };

  const loadFromIPFS = async (ipfsHash) => {
    try {
      const { default: ipfsService } = await import('../services/ipfsService.js');
      const result = await ipfsService.loadPresentation(ipfsHash);
      if (result.success && result.data) {
        setSlides(result.data.slides || []);
        setPresentationMeta(result.data.presentationMeta || presentationMeta);
        pushHistory(result.data.slides || []);
        return result;
      }
      throw new Error('Invalid data received');
    } catch (error) {
      console.error('Load from IPFS failed:', error);
      throw error;
    }
  };

  // User data functions
  const saveCurrentPresentation = () => {
    if (user?.id) {
      const presentationData = {
        title: presentationMeta.title,
        slides,
        presentationMeta,
        lastModified: new Date().toISOString()
      };
      userDataService.savePresentation(user.id, presentationData);
    }
  };

  const addToFavorites = () => {
    if (user?.id) {
      const presentationData = {
        title: presentationMeta.title,
        slides,
        lastModified: new Date().toISOString()
      };
      return userDataService.addToFavorites(user.id, presentationData);
    }
    return null;
  };

  const getUserHistory = () => {
    return user?.id ? userDataService.getHistory(user.id) : [];
  };

  const getUserFavorites = () => {
    return user?.id ? userDataService.getFavorites(user.id) : [];
  };

  const removeFromFavorites = (presentationId) => {
    if (user?.id) {
      return userDataService.removeFromFavorites(user.id, presentationId);
    }
    return [];
  };

  useEffect(() => {
    // initialize history on mount
    if (historyIndex === -1) {
      const initial = JSON.parse(JSON.stringify(slides));
      setHistory([initial]);
      setHistoryIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      // Save to localStorage
      localStorage.setItem('presentation', JSON.stringify({ slides, presentationMeta }));
      
      // Auto-save user data
      saveCurrentPresentation();
      
      // Auto-save to IPFS
      try {
        const { default: ipfsService } = await import('../services/ipfsService.js');
        const result = await ipfsService.savePresentation({ slides, presentationMeta, savedAt: new Date().toISOString() });
        console.log('Auto-saved to IPFS:', result.ipfsHash);
        localStorage.setItem('lastIPFSHash', result.ipfsHash);
      } catch (error) {
        console.warn('Auto-save to IPFS failed:', error.message);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [slides, presentationMeta, user]);

  const value = {
    slides,
    setSlides,
    currentSlide,
    setCurrentSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    resetSlide,
    updateSlide,
    applyLayout,
    undo,
    redo,
    copy,
    paste,
    clipboard,
    presentationMeta,
    setPresentationMeta,
    reorderSlides,
    animationPreview,
    setAnimationPreview,
    selectedAnimation,
    setSelectedAnimation,
    saveToIPFS,
    loadFromIPFS,
    saveCurrentPresentation,
    addToFavorites,
    removeFromFavorites,
    getUserHistory,
    getUserFavorites
  };

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
};