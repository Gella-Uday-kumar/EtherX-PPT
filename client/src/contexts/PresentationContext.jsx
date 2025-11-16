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
    background: '#ffffff',
    textColor: '#000000',
    layout: 'title-content',
    elements: []
  }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState(null);

  const addSlide = (layout = 'blank') => {
    const newSlide = {
      id: Date.now(),
      title: `Slide ${slides.length + 1}`,
      content: 'Click to add content',
      background: '#ffffff',
      textColor: '#000000',
      layout,
      elements: []
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = (index) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      if (currentSlide >= newSlides.length) {
        setCurrentSlide(newSlides.length - 1);
      }
    }
  };

  const duplicateSlide = (index) => {
    const slide = slides[index];
    const newSlide = { ...slide, id: Date.now(), title: `${slide.title} Copy` };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
  };

  const resetSlide = (index) => {
    const newSlides = [...slides];
    newSlides[index] = {
      ...newSlides[index],
      content: 'Click to add content',
      elements: []
    };
    setSlides(newSlides);
  };

  const updateSlide = (index, updates) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setSlides(newSlides);
  };

  const applyLayout = (index, layout) => {
    updateSlide(index, { layout });
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
      const newSlide = { ...clipboard, id: Date.now() };
      setSlides([...slides, newSlide]);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('presentation', JSON.stringify(slides));
    }, 30000);
    return () => clearInterval(interval);
  }, [slides]);

  const value = {
    slides,
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
    clipboard
  };

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
};