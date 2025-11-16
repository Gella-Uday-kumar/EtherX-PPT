import React, { useState } from 'react';
import { usePresentation } from '../contexts/PresentationContext';
import { useTheme } from '../contexts/ThemeContext';
import { exportToPPTX, exportToPDF, printPresentation } from '../utils/exportUtils';

const Toolbar = ({ activePanel, setActivePanel }) => {
  const { slides, addSlide, resetSlide, currentSlide, undo, redo } = usePresentation();
  const { isDark, toggleTheme } = useTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (type) => {
    switch (type) {
      case 'pptx':
        exportToPPTX(slides);
        break;
      case 'pdf':
        exportToPDF(slides);
        break;
      case 'print':
        printPresentation();
        break;
    }
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center space-x-2 flex-wrap">
        {/* File Operations */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            onClick={() => addSlide()}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="New Slide (Ctrl+Shift+N)"
          >
            📄 New Slide
          </button>
          <button
            onClick={() => resetSlide(currentSlide)}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            title="Reset Slide"
          >
            🔄 Reset
          </button>
        </div>

        {/* Edit Operations */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            onClick={undo}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            onClick={redo}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
        </div>

        {/* Panel Toggles */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            onClick={() => setActivePanel(activePanel === 'layout' ? null : 'layout')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activePanel === 'layout'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            📐 Layout
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'format' ? null : 'format')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activePanel === 'format'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            🎨 Format
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'draw' ? null : 'draw')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activePanel === 'draw'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            ✏️ Draw
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'addins' ? null : 'addins')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activePanel === 'addins'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            🧩 Add-ins
          </button>
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            📤 Export
          </button>
          {showExportMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => handleExport('pptx')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                📊 Export as PPTX
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                📄 Export as PDF
              </button>
              <button
                onClick={() => handleExport('print')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                🖨️ Print
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;