import React, { useState } from 'react';

const DrawingTools = () => {
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#ffffff');

  const shapes = [
    { id: 'rectangle', name: 'Rectangle', icon: '⬜' },
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'triangle', name: 'Triangle', icon: '🔺' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'arrow', name: 'Arrow', icon: '➡️' },
    { id: 'star', name: 'Star', icon: '⭐' },
    { id: 'polygon', name: 'Polygon', icon: '🔷' },
    { id: 'hexagon', name: 'Hexagon', icon: '⬡' }
  ];

  const handleShapeSelect = (shapeId) => {
    setSelectedShape(shapeId);
    // Dispatch custom event for slide editor to listen
    window.dispatchEvent(new CustomEvent('selectShape', { detail: shapeId }));
  };

  const handleStrokeWidthChange = (width) => {
    setStrokeWidth(width);
    window.dispatchEvent(new CustomEvent('updateStrokeWidth', { detail: width }));
  };

  const handleStrokeColorChange = (color) => {
    setStrokeColor(color);
    window.dispatchEvent(new CustomEvent('updateStrokeColor', { detail: color }));
  };

  const handleFillColorChange = (color) => {
    setFillColor(color);
    window.dispatchEvent(new CustomEvent('updateFillColor', { detail: color }));
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Drawing Tools
      </h3>

      {/* Shape Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Shape
        </label>
        <div className="grid grid-cols-4 gap-2">
          {shapes.map(shape => (
            <button
              key={shape.id}
              onClick={() => handleShapeSelect(shape.id)}
              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedShape === shape.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              title={shape.name}
            >
              <div className="text-2xl">{shape.icon}</div>
              <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                {shape.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Properties */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Border Style
        </label>
        
        {/* Stroke Width */}
        <div className="mb-4">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
            Border Width: {strokeWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={strokeWidth}
            onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0px</span>
            <span>10px</span>
          </div>
        </div>

        {/* Stroke Color */}
        <div className="mb-4">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
            Border Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => handleStrokeColorChange(e.target.value)}
              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => handleStrokeColorChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      {/* Fill Properties */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Fill Style
        </label>
        
        <div className="mb-4">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
            Fill Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => handleFillColorChange(e.target.value)}
              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={fillColor}
              onChange={(e) => handleFillColorChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Quick Fill Colors */}
        <div className="mb-4">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
            Quick Fill Colors
          </label>
          <div className="grid grid-cols-6 gap-2">
            {[
              '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
              '#ff00ff', '#00ffff', '#ffa500', '#800080', '#008000', '#ffc0cb',
              '#f0f0f0', '#808080', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
              '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'
            ].map(color => (
              <button
                key={color}
                onClick={() => handleFillColorChange(color)}
                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Shape Preview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Preview
        </label>
        <div className="h-20 bg-gray-50 dark:bg-gray-700 rounded-lg border flex items-center justify-center">
          <div
            className="w-16 h-12 border"
            style={{
              backgroundColor: fillColor,
              borderColor: strokeColor,
              borderWidth: `${strokeWidth}px`,
              borderRadius: selectedShape === 'circle' ? '50%' : '0',
              clipPath: selectedShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          🎨 Drawing Instructions
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Select a shape from the grid above</li>
          <li>• Click and drag on the slide to draw</li>
          <li>• Adjust border and fill properties</li>
          <li>• Use Ctrl+Z to undo changes</li>
        </ul>
      </div>
    </div>
  );
};

export default DrawingTools;