import React, { createContext, useContext, useState, useEffect } from 'react';

const PresentationContext = createContext();

export const usePresentation = () => {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation must be used within a PresentationProvider');
  }
  return context;
};

export const PresentationProvider = ({ children }) => {
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
        // Clear standard fields for blank if desired
        current.title = '';
        current.content = '';
        break;
      case 'title-content':
        layoutMeta = { type: 'title-content' };
        // Restore content from layout-specific fields if switching back
        if (current.layout === 'two-column') {
          current.content = (current.contentLeft || '') + (current.contentRight ? '\n\n' + current.contentRight : '');
        } else if (current.layout === 'comparison') {
          current.title = current.compLeftTitle || current.title || '';
          current.content = (current.compLeftContent || '') + (current.compRightContent ? '\n\n' + current.compRightContent : '');
        } else if (current.layout === 'image-text') {
          current.content = current.content || '';
        } else if (current.layout === 'title-only') {
          current.title = current.title || '';
        } else if (current.layout === 'content-only') {
          current.content = current.content || '';
        }
        // Clear layout-specific fields
        delete current.contentLeft;
        delete current.contentRight;
        delete current.compLeftTitle;
        delete current.compLeftContent;
        delete current.compRightTitle;
        delete current.compRightContent;
        delete current.imageSrc;
        break;
      case 'title-only':
        layoutMeta = { type: 'title-only' };
        current.title = current.title || '';
        current.content = '';
        break;
      case 'content-only':
        layoutMeta = { type: 'content-only' };
        current.title = '';
        current.content = current.content || '';
        break;
      case 'two-column':
        layoutMeta = { type: 'two-column', columns: 2 };
        if (current.layout === 'comparison') {
          current.contentLeft = current.contentLeft || current.compLeftContent || '';
          current.contentRight = current.contentRight || current.compRightContent || '';
        } else {
          current.contentLeft = current.contentLeft || current.content || '';
          current.contentRight = current.contentRight || '';
        }
        current.content = '';
        break;
      case 'image-text':
        layoutMeta = { type: 'image-text', regions: [{ type: 'image' }, { type: 'text' }] };
        current.imageSrc = current.imageSrc || '';
        current.content = current.content || '';
        break;
      case 'comparison':
        layoutMeta = { type: 'comparison', columns: 2 };
        if (current.layout === 'two-column') {
          current.compLeftTitle = current.compLeftTitle || current.title || '';
          current.compLeftContent = current.compLeftContent || current.contentLeft || '';
          current.compRightTitle = current.compRightTitle || '';
          current.compRightContent = current.compRightContent || current.contentRight || '';
        } else {
          current.compLeftTitle = current.compLeftTitle || current.title || '';
          current.compLeftContent = current.compLeftContent || current.content || '';
          current.compRightTitle = current.compRightTitle || '';
          current.compRightContent = current.compRightContent || '';
        }
        current.title = '';
        current.content = '';
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
    const interval = setInterval(() => {
      localStorage.setItem('presentation', JSON.stringify({ slides, presentationMeta }));
    }, 30000);
    return () => clearInterval(interval);
  }, [slides, presentationMeta]);

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
    setAnimationPreview
  };

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
};