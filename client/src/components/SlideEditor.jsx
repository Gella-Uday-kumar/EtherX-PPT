import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePresentation } from '../contexts/PresentationContext';
import { useTheme } from '../contexts/ThemeContext';
import ChartComponent from './ChartComponent';
import ChartRenderer from './ChartRenderer';
import TableComponent from './TableComponent';
import HeaderFooterModal from './HeaderFooterModal';
import ImageEditor from './ImageEditor';
import AdvancedTableEditor from './AdvancedTableEditor';
import TextFormattingRibbon from './TextFormattingRibbon';

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

  const handleFormatChange = (formatOptions) => {
    if (selectedElement) {
      updateElement(selectedElement, formatOptions);
    }
  };

  const applyFormatToSelection = (command, value = null) => {
    if (document.getSelection().rangeCount > 0) {
      document.execCommand(command, false, value);
    }
  };

  const deleteElement = (elementId) => {
    const elements = slide.elements || [];
    const filteredElements = elements.filter(el => el.id !== elementId);
    updateSlide(currentSlide, { elements: filteredElements });
    setSelectedElement(null);
  };

  return (
    <div
      className="editor-wrapper h-[calc(100vh-80px)] overflow-y-scroll overflow-x-hidden bg-white dark:bg-black"
    >
      {/* Text Formatting Ribbon */}
      <TextFormattingRibbon 
        selectedElement={selectedElement}
        onFormatChange={handleFormatChange}
        applyFormatToSelection={applyFormatToSelection}
      />

      {/* Slide Canvas */}
      <div className="flex justify-center p-6">
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
            {/* Layout regions - all editable */}
            {layoutType === 'title-content' && (
              <div>
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  className={`absolute top-12 left-12 right-12 text-4xl font-bold text-center outline-none min-h-[60px] p-4 rounded-xl transition-all duration-200 bg-transparent cursor-text ${getAnimationStyle('title').className}`}
                  style={{ color: slide.textColor || '#1f2937', ...getAnimationStyle('title').style }}
                  onBlur={(e) => updateSlide(currentSlide, { title: e.target.textContent })}
                  onFocus={(e) => {
                    if (e.target.textContent === 'Click to add title') {
                      e.target.textContent = '';
                    }
                  }}
                >
                  {slide.title || 'Click to add title'}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  className={`absolute top-32 left-12 right-12 bottom-12 text-lg outline-none p-6 rounded-xl transition-all duration-200 bg-transparent cursor-text ${getAnimationStyle('content').className}`}
                  style={{ color: slide.textColor || '#374151', ...getAnimationStyle('content').style }}
                  onBlur={(e) => updateSlide(currentSlide, { content: e.target.textContent })}
                  onFocus={(e) => {
                    if (e.target.textContent === 'Click to add content') {
                      e.target.textContent = '';
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const selection = window.getSelection();
                      if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const container = range.startContainer;
                        let currentElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
                        
                        // Check if we're in a list item
                        while (currentElement && currentElement !== e.target && currentElement.tagName !== 'LI') {
                          currentElement = currentElement.parentElement;
                        }
                        
                        if (currentElement && currentElement.tagName === 'LI') {
                          const parentList = currentElement.parentElement;
                          if (parentList && (parentList.tagName === 'UL' || parentList.tagName === 'OL')) {
                            const newLi = document.createElement('li');
                            newLi.style.cssText = currentElement.style.cssText;
                            newLi.innerHTML = '';
                            
                            parentList.insertBefore(newLi, currentElement.nextSibling);
                            
                            const newRange = document.createRange();
                            newRange.setStart(newLi, 0);
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                            return;
                          }
                        }
                        
                        // Default enter behavior
                        const br = document.createElement('br');
                        range.insertNode(br);
                        range.setStartAfter(br);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                      }
                    }
                  }}
                >
                  {slide.content || 'Click to add content'}
                </div>
              </div>
            )}

            {layoutType === 'two-column' && (
              <div>
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  className="absolute top-12 left-12 right-12 text-3xl font-bold text-center outline-none min-h-[50px] p-3 cursor-text"
                  style={{ color: slide.textColor || '#1f2937' }}
                  onBlur={(e) => updateSlide(currentSlide, { title: e.target.textContent })}
                  onFocus={(e) => {
                    if (e.target.textContent === 'Click to add title') {
                      e.target.textContent = '';
                    }
                  }}
                >
                  {slide.title || 'Click to add title'}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  className="absolute top-24 left-12 right-1/2 bottom-12 text-base outline-none p-4 cursor-text"
                  style={{ color: slide.textColor || '#374151' }}
                  onBlur={(e) => updateSlide(currentSlide, { leftContent: e.target.textContent })}
                  onFocus={(e) => {
                    if (e.target.textContent === 'Left column content') {
                      e.target.textContent = '';
                    }
                  }}
                >
                  {slide.leftContent || 'Left column content'}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  className="absolute top-24 left-1/2 right-12 bottom-12 text-base outline-none p-4 cursor-text"
                  style={{ color: slide.textColor || '#374151' }}
                  onBlur={(e) => updateSlide(currentSlide, { rightContent: e.target.textContent })}
                  onFocus={(e) => {
                    if (e.target.textContent === 'Right column content') {
                      e.target.textContent = '';
                    }
                  }}
                >
                  {slide.rightContent || 'Right column content'}
                </div>
              </div>
            )}

            {layoutType === 'title-only' && (
              <div
                contentEditable
                suppressContentEditableWarning={true}
                className="absolute top-1/2 left-12 right-12 text-5xl font-bold text-center outline-none min-h-[80px] p-6 cursor-text transform -translate-y-1/2"
                style={{ color: slide.textColor || '#1f2937' }}
                onBlur={(e) => updateSlide(currentSlide, { title: e.target.textContent })}
                onFocus={(e) => {
                  if (e.target.textContent === 'Click to add title') {
                    e.target.textContent = '';
                  }
                }}
              >
                {slide.title || 'Click to add title'}
              </div>
            )}

            {layoutType === 'blank' && (
              <div
                contentEditable
                suppressContentEditableWarning={true}
                className="absolute top-12 left-12 right-12 bottom-12 text-lg outline-none p-6 cursor-text"
                style={{ color: slide.textColor || '#374151' }}
                onBlur={(e) => updateSlide(currentSlide, { content: e.target.textContent })}
                onFocus={(e) => {
                  if (e.target.textContent === 'Click to add content') {
                    e.target.textContent = '';
                  }
                }}
              >
                {slide.content || 'Click to add content'}
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
                        // Handle Enter key for list continuation
                        if (e.key === 'Enter') {
                          const selection = window.getSelection();
                          if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const text = e.target.textContent;
                            const cursorPos = range.startOffset;
                            const beforeCursor = text.substring(0, cursorPos);
                            const lastLine = beforeCursor.split('\n').pop();
                            
                            // Check if current line has list formatting
                            const bulletMatch = lastLine.match(/^(\u2022|\d+\.|[A-Z]\.|\u2605|\u2192)\s/);
                            if (bulletMatch) {
                              e.preventDefault();
                              const prefix = bulletMatch[1];
                              let nextPrefix = prefix;
                              
                              // Generate next list item
                              if (/\d+\./.test(prefix)) {
                                const num = parseInt(prefix) + 1;
                                nextPrefix = `${num}.`;
                              } else if (/[A-Z]\./.test(prefix)) {
                                const char = String.fromCharCode(prefix.charCodeAt(0) + 1);
                                nextPrefix = `${char}.`;
                              }
                              
                              const newText = `\n${nextPrefix} `;
                              range.deleteContents();
                              range.insertNode(document.createTextNode(newText));
                              range.collapse(false);
                              selection.removeAllRanges();
                              selection.addRange(range);
                            }
                          }
                        }
                        
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

                  {element.type === 'chart' && (
                    <ChartRenderer
                      key={element.id}
                      element={element}
                    />
                  )}

                  {element.type === 'table' && (
                    <div className="w-full h-full border border-gray-300">
                      <table className="w-full h-full border-collapse">
                        <tbody>
                          {element.data?.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="border border-gray-300 p-1 text-sm"
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => {
                                    const newData = [...element.data];
                                    newData[rowIndex][colIndex] = e.target.textContent;
                                    updateElement(element.id, { data: newData });
                                  }}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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