import React, { useState, useRef } from 'react';
import { usePresentation } from '../contexts/PresentationContext';

const SlideEditor = () => {
  const { slides, currentSlide, updateSlide } = usePresentation();
  const [selectedElement, setSelectedElement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);

  const slide = slides[currentSlide];

  const handleTitleEdit = (newTitle) => {
    updateSlide(currentSlide, { title: newTitle });
  };

  const handleContentEdit = (newContent) => {
    updateSlide(currentSlide, { content: newContent });
  };

  const handleBackgroundChange = (color) => {
    updateSlide(currentSlide, { background: color });
  };

  const renderLayout = () => {
    switch (slide.layout) {
      case 'title-only':
        return (
          <div className="h-full flex items-center justify-center">
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleTitleEdit(e.target.value)}
              className="text-4xl font-bold text-center bg-transparent border-none outline-none w-full"
              style={{ color: slide.textColor }}
              placeholder="Click to add title"
            />
          </div>
        );

      case 'title-content':
        return (
          <div className="h-full flex flex-col p-8">
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleTitleEdit(e.target.value)}
              className="text-3xl font-bold mb-6 bg-transparent border-none outline-none"
              style={{ color: slide.textColor }}
              placeholder="Click to add title"
            />
            <textarea
              value={slide.content}
              onChange={(e) => handleContentEdit(e.target.value)}
              className="flex-1 text-lg bg-transparent border-none outline-none resize-none"
              style={{ color: slide.textColor }}
              placeholder="Click to add content"
            />
          </div>
        );

      case 'two-column':
        return (
          <div className="h-full flex flex-col p-8">
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleTitleEdit(e.target.value)}
              className="text-3xl font-bold mb-6 bg-transparent border-none outline-none"
              style={{ color: slide.textColor }}
              placeholder="Click to add title"
            />
            <div className="flex-1 flex space-x-6">
              <div className="flex-1">
                <textarea
                  value={slide.content}
                  onChange={(e) => handleContentEdit(e.target.value)}
                  className="w-full h-full text-lg bg-transparent border-none outline-none resize-none"
                  style={{ color: slide.textColor }}
                  placeholder="Left column content"
                />
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full h-full text-lg bg-transparent border-none outline-none resize-none"
                  style={{ color: slide.textColor }}
                  placeholder="Right column content"
                />
              </div>
            </div>
          </div>
        );

      case 'section-header':
        return (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => handleTitleEdit(e.target.value)}
                className="text-5xl font-bold mb-4 bg-transparent border-none outline-none text-center w-full"
                style={{ color: slide.textColor }}
                placeholder="Section Title"
              />
              <textarea
                value={slide.content}
                onChange={(e) => handleContentEdit(e.target.value)}
                className="text-xl bg-transparent border-none outline-none resize-none text-center w-full"
                style={{ color: slide.textColor }}
                placeholder="Section subtitle"
                rows="2"
              />
            </div>
          </div>
        );

      default: // blank
        return (
          <div className="h-full p-8">
            <textarea
              value={slide.content}
              onChange={(e) => handleContentEdit(e.target.value)}
              className="w-full h-full text-lg bg-transparent border-none outline-none resize-none"
              style={{ color: slide.textColor }}
              placeholder="Click to add content"
            />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Slide Canvas */}
      <div className="flex-1 p-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div
            ref={editorRef}
            className="aspect-video bg-white dark:bg-gray-800 rounded-lg shadow-lg relative overflow-hidden"
            style={{ backgroundColor: slide.background }}
          >
            {renderLayout()}
            
            {/* Elements Layer */}
            {slide.elements?.map((element, index) => (
              <div
                key={element.id}
                className={`absolute cursor-pointer ${
                  selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  width: `${element.width}%`,
                  height: `${element.height}%`,
                }}
                onClick={() => setSelectedElement(element.id)}
              >
                {element.type === 'text' && (
                  <div
                    className="w-full h-full"
                    style={element.style}
                  >
                    {element.content}
                  </div>
                )}
                {element.type === 'shape' && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: element.style?.fill,
                      border: `${element.style?.strokeWidth || 1}px solid ${element.style?.stroke || '#000'}`,
                      borderRadius: element.shape === 'circle' ? '50%' : '0',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Slide Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Slide {currentSlide + 1} of {slides.length}</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <span>Background:</span>
                <input
                  type="color"
                  value={slide.background}
                  onChange={(e) => handleBackgroundChange(e.target.value)}
                  className="w-8 h-8 rounded border"
                />
              </label>
              <span>Layout: {slide.layout}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideEditor;