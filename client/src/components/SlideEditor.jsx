import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePresentation } from '../contexts/PresentationContext';
import { useTheme } from '../contexts/ThemeContext';
import ChartComponent from './ChartComponent';
import ChartRenderer from './ChartRenderer';
import TableComponent from './TableComponent';
import HeaderFooterModal from './HeaderFooterModal';
import ImageEditor from './ImageEditor';
import AdvancedTableEditor from './AdvancedTableEditor';

const SlideEditor = ({ onTableSelect, onTableCellSelect, showGridlines = true, snapToGrid = false, zoomLevel = 100 }) => {
  const { slides, currentSlide, updateSlide, presentationMeta, setPresentationMeta, animationPreview, selectedAnimation } = usePresentation();
  const { isDark } = useTheme();
  const [selectedElement, setSelectedElement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [editChartIndex, setEditChartIndex] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, elementId: null });
  const [elementClipboard, setElementClipboard] = useState(null);
  const [selectedBullet, setSelectedBullet] = useState(null);
  const [showBulletMenu, setShowBulletMenu] = useState(false);
  const [bulletMenuPosition, setBulletMenuPosition] = useState({ x: 0, y: 0 });
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [shapeMenuPosition, setShapeMenuPosition] = useState({ x: 0, y: 0 });
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [iconMenuPosition, setIconMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedTableCell, setSelectedTableCell] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  const slide = slides[currentSlide] || {};
  const layoutType = (slide.layoutMeta && slide.layoutMeta.type) || slide.layout || 'title-content';

  // Force re-render when layout changes
  useEffect(() => {
    setIsEditing(false);
    setSelectedElement(null);
  }, [layoutType, currentSlide]);

  const getAnimationStyle = (target) => {
    if (!animationPreview.active) return { className: '', style: {} };
    const animations = animationPreview.animations || slide.animations || [];
    const animation = animations.find(a => a.target === target);
    if (!animation) return { className: '', style: {} };
    return {
      className: `animate-${animation.type}`,
      style: {
        animationDuration: `${animation.duration}ms`,
        animationDelay: `${animation.delay}ms`,
        animationFillMode: 'forwards'
      }
    };
  };

  const updateElement = (elementId, updates, skipHistory = false) => {
    const elements = slide.elements || [];
    const updatedElements = elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateSlide(currentSlide, { elements: updatedElements }, skipHistory);
  };

  const deleteElement = (elementId) => {
    const elements = slide.elements || [];
    const filteredElements = elements.filter(el => el.id !== elementId);
    updateSlide(currentSlide, { elements: filteredElements });
    setSelectedElement(null);
  };

  return (
    <div
      className="editor-wrapper h-[calc(100vh-80px)] overflow-y-scroll overflow-x-hidden p-6 bg-white dark:bg-black"
    >
      {/* Toolbar */}
      <div className="mb-6 panel">
        <div className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg">
              <button className="toolbar-btn" title="Bold">B</button>
              <button className="toolbar-btn" title="Italic">I</button>
              <button className="toolbar-btn" title="Underline">U</button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Canvas */}
      <div className="flex justify-center">
        <div className="relative" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
          <div
            className="slide-canvas relative overflow-hidden"
            style={{
              width: '960px',
              height: '540px',
              backgroundColor: slide.background || (isDark ? '#000000' : '#ffffff')
            }}
          >
            {/* Layout regions */}
            {layoutType === 'title-content' && (
              <div>
                <div
                  className={`absolute top-12 left-12 right-12 text-4xl font-bold text-center outline-none min-h-[60px] p-4 rounded-xl transition-all duration-200 bg-transparent ${getAnimationStyle('title').className}`}
                  style={{ color: slide.textColor || '#1f2937', ...getAnimationStyle('title').style }}
                >
                  {slide.title || 'Click to add title'}
                </div>
                <div
                  className={`absolute top-32 left-12 right-12 bottom-12 text-lg outline-none p-6 rounded-xl transition-all duration-200 bg-transparent ${getAnimationStyle('content').className}`}
                  style={{ color: slide.textColor || '#374151', ...getAnimationStyle('content').style }}
                >
                  {slide.content || 'Click to add content'}
                </div>
              </div>
            )}

            {/* Dynamic Elements */}
            {(slide.elements || []).map((element) => {
              if (element.type === 'image') {
                return (
                  <ImageEditor
                    key={element.id}
                    element={element}
                    onUpdate={(updates) => updateElement(element.id, updates)}
                    onDelete={() => deleteElement(element.id)}
                    isSelected={selectedElement === element.id}
                    onSelect={() => setSelectedElement(element.id)}
                  />
                );
              }

              const animStyle = getAnimationStyle(element.id);
              return (
                <div
                  key={element.id}
                  data-element-id={element.id}
                  className={`slide-element relative group ${selectedElement === element.id ? 'selected' : ''} ${animStyle.className}`}
                  style={{
                    position: 'absolute',
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    color: element.color,
                    backgroundColor: element.backgroundColor,
                    ...animStyle.style
                  }}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {element.type === 'textbox' && (
                    <div
                      contentEditable
                      spellCheck={true}
                      suppressContentEditableWarning={true}
                      className="w-full h-full outline-none p-1 cursor-text"
                      dangerouslySetInnerHTML={{ __html: element.content }}
                      onBlur={(e) => updateElement(element.id, { content: e.target.innerHTML })}
                      onKeyDown={(e) => {
                        // Prevent canvas shortcuts but allow typing and common editing shortcuts
                        if (e.ctrlKey || e.metaKey) {
                          if (!['a', 'c', 'v', 'x', 'z', 'y', 'b', 'i', 'u'].includes(e.key.toLowerCase())) {
                            e.stopPropagation();
                          }
                        }
                      }}
                    />
                  )}

                  {element.type === 'shape' && (
                    <div className="w-full h-full">
                      {element.shapeType === 'rectangle' && (
                        <div
                          className="w-full h-full rounded"
                          style={{
                            backgroundColor: element.fill,
                            border: `${element.strokeWidth}px solid ${element.stroke}`
                          }}
                        />
                      )}
                    </div>
                  )}

                  {element.type === 'equation' && (
                    <div
                      className="w-full h-full flex items-center justify-center p-2 border-2 border-gray-300 bg-white rounded"
                      style={{
                        fontSize: element.fontSize,
                        fontFamily: element.fontFamily,
                        color: element.color,
                        backgroundColor: element.backgroundColor || '#ffffff'
                      }}
                    >
                      <div className="text-center p-2">
                        {element.content || 'E = mc²'}
                      </div>
                    </div>
                  )}

                  {selectedElement === element.id && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white text-lg font-medium transition-all duration-200 flex items-center justify-center z-10"
                        title="Delete element"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ChartComponent onClose={() => setShowChartModal(false)} />
        </div>
      )}
    </div>
  );
};

export default SlideEditor;