import React from 'react';

const LayoutSelector = ({ applyLayout, currentSlide, onClose }) => {

  const layouts = [
    { id: 'blank', name: 'Blank', icon: '⬜' },
    { id: 'title-content', name: 'Title & Content', icon: '📄' },
    { id: 'title-only', name: 'Title Only', icon: '📝' },
    { id: 'content-only', name: 'Content Only', icon: '📋' },
    { id: 'two-column', name: 'Two Column', icon: '📊' },
    { id: 'image-text', name: 'Image & Text', icon: '🖼️' },
    { id: 'comparison', name: 'Comparison', icon: '⚖️' }
  ];

  return (
    <div className="fixed right-0 top-16 h-screen w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 z-10">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Layout</h3>
      <div className="grid grid-cols-2 gap-2">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => {
              applyLayout(layout.id);
              onClose();
            }}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-2xl mb-1">{layout.icon}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">{layout.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;