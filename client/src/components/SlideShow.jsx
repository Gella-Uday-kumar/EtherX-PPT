import React, { useState, useEffect } from 'react';
import { usePresentation } from '../contexts/PresentationContext';

const SlideShow = ({ isActive, onExit }) => {
  const { slides, currentSlide, setCurrentSlide } = usePresentation();
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onExit();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
          }
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
          }
          break;
        case 'Home':
          setCurrentSlide(0);
          break;
        case 'End':
          setCurrentSlide(slides.length - 1);
          break;
      }
    };

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(window.controlsTimeout);
      window.controlsTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    // Hide controls after 3 seconds
    window.controlsTimeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(window.controlsTimeout);
    };
  }, [isActive, currentSlide, slides.length, setCurrentSlide, onExit]);

  if (!isActive) return null;

  const slide = slides[currentSlide];

  const renderSlideContent = () => {
    switch (slide.layout) {
      case 'title-only':
        return (
          <div className="h-full flex items-center justify-center">
            <h1 className="text-6xl font-bold text-center" style={{ color: slide.textColor }}>
              {slide.title}
            </h1>
          </div>
        );

      case 'title-content':
        return (
          <div className="h-full flex flex-col justify-center p-16">
            <h1 className="text-5xl font-bold mb-12" style={{ color: slide.textColor }}>
              {slide.title}
            </h1>
            <div className="text-2xl leading-relaxed" style={{ color: slide.textColor }}>
              {slide.content}
            </div>
          </div>
        );

      case 'two-column':
        return (
          <div className="h-full flex flex-col p-16">
            <h1 className="text-5xl font-bold mb-12" style={{ color: slide.textColor }}>
              {slide.title}
            </h1>
            <div className="flex-1 flex space-x-12">
              <div className="flex-1 text-2xl" style={{ color: slide.textColor }}>
                {slide.content}
              </div>
              <div className="flex-1 text-2xl" style={{ color: slide.textColor }}>
                Right column content
              </div>
            </div>
          </div>
        );

      case 'section-header':
        return (
          <div className="h-full flex items-center justify-center text-center p-16">
            <div>
              <h1 className="text-7xl font-bold mb-8" style={{ color: slide.textColor }}>
                {slide.title}
              </h1>
              <div className="text-3xl" style={{ color: slide.textColor }}>
                {slide.content}
              </div>
            </div>
          </div>
        );

      default: // blank
        return (
          <div className="h-full flex items-center justify-center p-16">
            <div className="text-3xl text-center" style={{ color: slide.textColor }}>
              {slide.content}
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 cursor-none"
      style={{ backgroundColor: slide.background }}
    >
      {/* Slide Content */}
      <div className="w-full h-full">
        {renderSlideContent()}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
                disabled={currentSlide === 0}
                className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm">
                {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={() => currentSlide < slides.length - 1 && setCurrentSlide(currentSlide + 1)}
                disabled={currentSlide === slides.length - 1}
                className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 mx-8">
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Exit */}
            <button
              onClick={onExit}
              className="px-4 py-2 bg-red-600 bg-opacity-80 rounded hover:bg-opacity-100"
            >
              Exit (ESC)
            </button>
          </div>
        </div>
      )}

      {/* Slide Thumbnails */}
      {showControls && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 space-y-2 max-h-96 overflow-y-auto">
          {slides.map((slideItem, index) => (
            <button
              key={slideItem.id}
              onClick={() => setCurrentSlide(index)}
              className={`block w-20 h-12 rounded border-2 transition-all ${
                currentSlide === index
                  ? 'border-white bg-white bg-opacity-20'
                  : 'border-white border-opacity-50 bg-white bg-opacity-10 hover:bg-opacity-20'
              }`}
              style={{ backgroundColor: slideItem.background }}
            >
              <div className="text-xs text-white p-1 truncate">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      {showControls && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded text-sm">
          <div className="font-medium mb-1">Slideshow Controls:</div>
          <div>← → Arrow keys to navigate</div>
          <div>Space bar for next slide</div>
          <div>ESC to exit slideshow</div>
        </div>
      )}
    </div>
  );
};

export default SlideShow;