import React, { useEffect } from 'react';
import { usePresentation } from '../contexts/PresentationContext';

const KeyboardShortcuts = () => {
  const { 
    addSlide, 
    undo, 
    redo, 
    copy, 
    paste, 
    currentSlide, 
    setCurrentSlide, 
    slides 
  } = usePresentation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default for our shortcuts
      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (isCtrl && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        addSlide();
      } else if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (isCtrl && e.key === 'c') {
        e.preventDefault();
        copy();
      } else if (isCtrl && e.key === 'v') {
        e.preventDefault();
        paste();
      } else if (isCtrl && e.key === 's') {
        e.preventDefault();
        // Auto-save is handled in context
        console.log('Presentation saved');
      } else if (e.key === 'F5') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('startSlideshow'));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('exitSlideshow'));
      } else if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        }
      } else if (e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addSlide, undo, redo, copy, paste, currentSlide, setCurrentSlide, slides.length]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;