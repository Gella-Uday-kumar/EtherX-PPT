import React from 'react';
import { usePresentation } from '../contexts/PresentationContext';

const LayoutSelector = () => {
  const { currentSlide, applyLayout } = usePresentation();

  const layouts = [
    {
      id: 'blank',
      name: 'Blank',
      description: 'Empty slide for custom content',
      preview: (
        <div className="w-full h-full bg-white border rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">Blank</span>
        </div>
      )
    },
    {
      id: 'title-only',
      name: 'Title Only',
      description: 'Large title area',
      preview: (
        <div className="w-full h-full bg-white border rounded p-2">
          <div className="h-full flex items-center justify-center">
            <div className="w-3/4 h-2 bg-gray-300 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: 'title-content',
      name: 'Title & Content',
      description: 'Most common layout',
      preview: (
        <div className="w-full h-full bg-white border rounded p-2">
          <div className="w-3/4 h-1 bg-gray-300 rounded mb-2"></div>
          <div className="space-y-1">
            <div className="w-full h-1 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-1 bg-gray-200 rounded"></div>
            <div className="w-4/5 h-1 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: 'two-column',
      name: 'Two Column',
      description: 'Side-by-side content areas',
      preview: (
        <div className="w-full h-full bg-white border rounded p-2">
          <div className="w-3/4 h-1 bg-gray-300 rounded mb-2"></div>
          <div className="flex space-x-1">
            <div className="flex-1 space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'title-two-content',
      name: 'Title + Two Content',
      description: 'Title with dual content',
      preview: (
        <div className="w-full h-full bg-white border rounded p-2">
          <div className="w-3/4 h-1 bg-gray-300 rounded mb-2"></div>
          <div className="flex space-x-1">
            <div className="flex-1">
              <div className="w-full h-3 bg-gray-100 border rounded mb-1"></div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'section-header',
      name: 'Section Header',
      description: 'Large section divider',
      preview: (
        <div className="w-full h-full bg-white border rounded p-2 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-2 bg-gray-300 rounded mx-auto mb-1"></div>
            <div className="w-8 h-1 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      )
    },
    {
      id: 'comparison',
      name: 'Comparison',
      description: 'A vs B comparison layout',
      preview: (
        <div className="w-full h-full bg-white border rounded p-2">
          <div className="w-3/4 h-1 bg-gray-300 rounded mb-2 mx-auto"></div>
          <div className="flex space-x-1">
            <div className="flex-1 text-center">
              <div className="w-full h-3 bg-blue-100 border rounded mb-1"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded mx-auto"></div>
            </div>
            <div className="w-px bg-gray-300"></div>
            <div className="flex-1 text-center">
              <div className="w-full h-3 bg-green-100 border rounded mb-1"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleLayoutSelect = (layoutId) => {
    applyLayout(currentSlide, layoutId);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Slide Layouts
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            className="cursor-pointer group"
            onClick={() => handleLayoutSelect(layout.id)}
          >
            <div className="aspect-video mb-2 group-hover:scale-105 transition-transform">
              {layout.preview}
            </div>
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                {layout.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {layout.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          💡 Layout Tips
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Choose layouts based on your content type</li>
          <li>• Use consistent layouts for similar slides</li>
          <li>• Section headers help organize presentations</li>
          <li>• Two-column layouts work great for comparisons</li>
        </ul>
      </div>
    </div>
  );
};

export default LayoutSelector;