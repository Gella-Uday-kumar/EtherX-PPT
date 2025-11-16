import React, { useState } from 'react';
import { usePresentation } from '../contexts/PresentationContext';

const FormatPanel = () => {
  const { slides, currentSlide, updateSlide } = usePresentation();
  const [textFormat, setTextFormat] = useState({
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 1.5,
    letterSpacing: 0
  });

  const slide = slides[currentSlide];

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New'
  ];

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

  const handleFormatChange = (property, value) => {
    setTextFormat(prev => ({ ...prev, [property]: value }));
    // Apply to current slide's text color if it's a color change
    if (property === 'color') {
      updateSlide(currentSlide, { textColor: value });
    }
  };

  const toggleBold = () => {
    const newWeight = textFormat.fontWeight === 'bold' ? 'normal' : 'bold';
    handleFormatChange('fontWeight', newWeight);
  };

  const toggleItalic = () => {
    const newStyle = textFormat.fontStyle === 'italic' ? 'normal' : 'italic';
    handleFormatChange('fontStyle', newStyle);
  };

  const toggleUnderline = () => {
    const newDecoration = textFormat.textDecoration === 'underline' ? 'none' : 'underline';
    handleFormatChange('textDecoration', newDecoration);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Text Formatting
      </h3>

      {/* Font Family */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Family
        </label>
        <select
          value={textFormat.fontFamily}
          onChange={(e) => handleFormatChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {fonts.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Size
        </label>
        <select
          value={textFormat.fontSize}
          onChange={(e) => handleFormatChange('fontSize', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}pt</option>
          ))}
        </select>
      </div>

      {/* Text Style Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Style
        </label>
        <div className="flex space-x-2">
          <button
            onClick={toggleBold}
            className={`px-3 py-2 rounded font-bold transition-colors ${
              textFormat.fontWeight === 'bold'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            B
          </button>
          <button
            onClick={toggleItalic}
            className={`px-3 py-2 rounded italic transition-colors ${
              textFormat.fontStyle === 'italic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            I
          </button>
          <button
            onClick={toggleUnderline}
            className={`px-3 py-2 rounded underline transition-colors ${
              textFormat.textDecoration === 'underline'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            U
          </button>
        </div>
      </div>

      {/* Text Color */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={textFormat.color}
            onChange={(e) => handleFormatChange('color', e.target.value)}
            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
          />
          <input
            type="text"
            value={textFormat.color}
            onChange={(e) => handleFormatChange('color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Alignment
        </label>
        <div className="flex space-x-1">
          {[
            { value: 'left', icon: '⬅️', label: 'Left' },
            { value: 'center', icon: '↔️', label: 'Center' },
            { value: 'right', icon: '➡️', label: 'Right' },
            { value: 'justify', icon: '↕️', label: 'Justify' }
          ].map(align => (
            <button
              key={align.value}
              onClick={() => handleFormatChange('textAlign', align.value)}
              className={`flex-1 px-2 py-2 rounded text-sm transition-colors ${
                textFormat.textAlign === align.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
              title={align.label}
            >
              {align.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Line Spacing
        </label>
        <select
          value={textFormat.lineHeight}
          onChange={(e) => handleFormatChange('lineHeight', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value={1}>Single</option>
          <option value={1.15}>1.15</option>
          <option value={1.5}>1.5</option>
          <option value={2}>Double</option>
          <option value={2.5}>2.5</option>
          <option value={3}>Triple</option>
        </select>
      </div>

      {/* Letter Spacing */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Letter Spacing: {textFormat.letterSpacing}px
        </label>
        <input
          type="range"
          min="-2"
          max="10"
          step="0.5"
          value={textFormat.letterSpacing}
          onChange={(e) => handleFormatChange('letterSpacing', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Quick Colors */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Colors
        </label>
        <div className="grid grid-cols-6 gap-2">
          {[
            '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
            '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB'
          ].map(color => (
            <button
              key={color}
              onClick={() => handleFormatChange('color', color)}
              className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preview
        </label>
        <div
          className="p-2 bg-white dark:bg-gray-800 border rounded"
          style={{
            fontFamily: textFormat.fontFamily,
            fontSize: `${textFormat.fontSize}px`,
            fontWeight: textFormat.fontWeight,
            fontStyle: textFormat.fontStyle,
            textDecoration: textFormat.textDecoration,
            color: textFormat.color,
            textAlign: textFormat.textAlign,
            lineHeight: textFormat.lineHeight,
            letterSpacing: `${textFormat.letterSpacing}px`
          }}
        >
          Sample text with current formatting
        </div>
      </div>
    </div>
  );
};

export default FormatPanel;