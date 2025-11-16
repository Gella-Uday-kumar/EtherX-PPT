import React from 'react';
import { usePresentation } from '../contexts/PresentationContext';

const Sidebar = () => {
  const { 
    slides, 
    currentSlide, 
    setCurrentSlide, 
    deleteSlide, 
    duplicateSlide 
  } = usePresentation();

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Slides ({slides.length})
        </h3>
        
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                currentSlide === index
                  ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              {/* Slide Preview */}
              <div className="aspect-video bg-white dark:bg-gray-700 rounded border mb-2 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="font-medium">{slide.title}</div>
                  {slide.content && slide.content !== 'Click to add content' && (
                    <div className="mt-1 text-xs truncate">{slide.content.substring(0, 30)}...</div>
                  )}
                </div>
              </div>
              
              {/* Slide Info */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {index + 1}. {slide.title}
                </span>
                
                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Duplicate Slide"
                  >
                    📋
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this slide?')) {
                          deleteSlide(index);
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete Slide"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              
              {/* Layout Badge */}
              <div className="mt-1">
                <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  {slide.layout}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;