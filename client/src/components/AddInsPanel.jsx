import React, { useState } from 'react';
import { usePresentation } from '../contexts/PresentationContext';
import ImageUpload from './ImageUpload';

const AddInsPanel = () => {
  const { slides, currentSlide, updateSlide } = usePresentation();
  const [activeSection, setActiveSection] = useState('elements');
  
  const slide = slides[currentSlide] || {};

  const addShape = (shapeType) => {
    const newElement = {
      id: Date.now(),
      type: 'shape',
      shapeType,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      fill: '#F0A500',
      stroke: '#d48f00',
      strokeWidth: 2
    };
    
    const elements = slide.elements || [];
    updateSlide(currentSlide, { elements: [...elements, newElement] });
  };

  const addIcon = (iconType) => {
    const icons = {
      star: '⭐', heart: '❤️', check: '✅', arrow: '➡️', warning: '⚠️', info: 'ℹ️',
      home: '🏠', phone: '📞', email: '📧', user: '👤', settings: '⚙️', search: '🔍',
      calendar: '📅', clock: '🕐', location: '📍', camera: '📷', music: '🎵', video: '🎥'
    };

    const newElement = {
      id: Date.now(),
      type: 'icon',
      content: icons[iconType],
      x: 200,
      y: 200,
      width: 50,
      height: 50,
      fontSize: 32
    };
    
    const elements = slide.elements || [];
    updateSlide(currentSlide, { elements: [...elements, newElement] });
  };

  const templates = [
    { name: 'Title Slide', layout: 'title-only', bg: '#FFFFFF', text: '#000000' },
    { name: 'Content Slide', layout: 'title-content', bg: '#F8FAFC', text: '#1F2937' },
    { name: 'Two Column', layout: 'two-column', bg: '#EFF6FF', text: '#1E40AF' },
    { name: 'Dark Theme', layout: 'title-content', bg: '#1F2937', text: '#FFFFFF' }
  ];

  const applyTemplate = (template) => {
    updateSlide(currentSlide, {
      layout: template.layout,
      background: template.bg,
      textColor: template.text
    });
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Add-ins</h3>
      
      {/* Section Tabs */}
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-600">
        <button
          onClick={() => setActiveSection('elements')}
          className={`px-2 py-1 text-xs font-medium ${activeSection === 'elements' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Elements
        </button>
        <button
          onClick={() => setActiveSection('templates')}
          className={`px-2 py-1 text-xs font-medium ${activeSection === 'templates' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Templates
        </button>
      </div>

      {/* Elements Section */}
      {activeSection === 'elements' && (
        <div className="space-y-4">
          {/* Media */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Media</h4>
            <ImageUpload />
          </div>

          {/* Shapes */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Basic Shapes</h4>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button onClick={() => addShape('rectangle')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Rectangle">⬜</button>
              <button onClick={() => addShape('circle')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Circle">⭕</button>
              <button onClick={() => addShape('triangle')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Triangle">🔺</button>
              <button onClick={() => addShape('diamond')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Diamond">💎</button>
              <button onClick={() => addShape('pentagon')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Pentagon">⬟</button>
              <button onClick={() => addShape('hexagon')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Hexagon">⬡</button>
            </div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Flowchart</h4>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button onClick={() => addShape('process')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Process">▭</button>
              <button onClick={() => addShape('decision')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Decision">◇</button>
              <button onClick={() => addShape('start')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Start/End">⬭</button>
            </div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">3D Shapes</h4>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => addShape('cube')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Cube">🧊</button>
              <button onClick={() => addShape('sphere')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Sphere">🔮</button>
              <button onClick={() => addShape('cylinder')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Cylinder">🥫</button>
              <button onClick={() => addShape('cone')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Cone">🔺</button>
              <button onClick={() => addShape('pyramid')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Pyramid">🔻</button>
              <button onClick={() => addShape('torus')} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs" title="Torus">🍩</button>
            </div>
          </div>

          {/* Icons */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Basic Icons</h4>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {['star', 'heart', 'check', 'arrow', 'warning', 'info', 'home', 'phone'].map((icon) => (
                <button key={icon} onClick={() => addIcon(icon)} className="p-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm" title={icon}>
                  {icon === 'star' && '⭐'}{icon === 'heart' && '❤️'}{icon === 'check' && '✅'}{icon === 'arrow' && '➡️'}
                  {icon === 'warning' && '⚠️'}{icon === 'info' && 'ℹ️'}{icon === 'home' && '🏠'}{icon === 'phone' && '📞'}
                </button>
              ))}
            </div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Communication</h4>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {['email', 'user', 'settings', 'search'].map((icon) => (
                <button key={icon} onClick={() => addIcon(icon)} className="p-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm" title={icon}>
                  {icon === 'email' && '📧'}{icon === 'user' && '👤'}{icon === 'settings' && '⚙️'}{icon === 'search' && '🔍'}
                </button>
              ))}
            </div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Media & Time</h4>
            <div className="grid grid-cols-4 gap-1">
              {['calendar', 'clock', 'location', 'camera', 'music', 'video'].map((icon) => (
                <button key={icon} onClick={() => addIcon(icon)} className="p-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm" title={icon}>
                  {icon === 'calendar' && '📅'}{icon === 'clock' && '🕐'}{icon === 'location' && '📍'}
                  {icon === 'camera' && '📷'}{icon === 'music' && '🎵'}{icon === 'video' && '🎥'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Section */}
      {activeSection === 'templates' && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Slide Templates</h4>
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => applyTemplate(template)}
              className="w-full p-3 text-left text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              style={{
                backgroundColor: template.bg + '20',
                borderColor: template.bg,
                color: template.text
              }}
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-xs opacity-75">{template.layout}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddInsPanel;