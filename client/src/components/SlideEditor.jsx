import React, { useState, useRef, useEffect } from 'react';
import { usePresentation } from '../contexts/PresentationContext';
import ChartComponent from './ChartComponent';
import TableComponent from './TableComponent';
import HeaderFooterModal from './HeaderFooterModal';
import { RiCloseLine } from 'react-icons/ri';

const SlideEditor = () => {
  const { slides, currentSlide, updateSlide, presentationMeta, setPresentationMeta } = usePresentation();
  const [selectedElement, setSelectedElement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showChartModal, setShowChartModal] = useState(false);
  const [editChartIndex, setEditChartIndex] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, elementId: null });
  const [elementClipboard, setElementClipboard] = useState(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  
  const slide = slides[currentSlide] || {};
  const layoutType = (slide.layoutMeta && slide.layoutMeta.type) || slide.layout || 'title-content';

  const handleTitleEdit = (e) => {
    updateSlide(currentSlide, { title: e.target.innerHTML });
  };

  const handleContentEdit = (e) => {
    updateSlide(currentSlide, { content: e.target.innerHTML });
  };

  // Layout-specific editors
  const handleLeftEdit = (e) => updateSlide(currentSlide, { contentLeft: e.target.innerHTML });
  const handleRightEdit = (e) => updateSlide(currentSlide, { contentRight: e.target.innerHTML });
  const handleCompLeftTitleEdit = (e) => updateSlide(currentSlide, { compLeftTitle: e.target.innerHTML });
  const handleCompLeftContentEdit = (e) => updateSlide(currentSlide, { compLeftContent: e.target.innerHTML });
  const handleCompRightTitleEdit = (e) => updateSlide(currentSlide, { compRightTitle: e.target.innerHTML });
  const handleCompRightContentEdit = (e) => updateSlide(currentSlide, { compRightContent: e.target.innerHTML });

  const handleImageTextInputChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e2) => {
        updateSlide(currentSlide, { imageSrc: e2.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };
  const setFontName = (name) => document.execCommand('fontName', false, name);
  const justify = (dir) => document.execCommand(dir, false, null);
  const toggleUL = () => document.execCommand('insertUnorderedList', false, null);
  const toggleOL = () => document.execCommand('insertOrderedList', false, null);
  const indent = () => document.execCommand('indent', false, null);
  const outdent = () => document.execCommand('outdent', false, null);

  const addTextBox = () => {
    const newElement = {
      id: Date.now(),
      type: 'textbox',
      content: 'Click to edit text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: 'transparent',
      isEditing: true
    };
    
    const elements = slide.elements || [];
    updateSlide(currentSlide, { elements: [...elements, newElement] });
    setSelectedElement(newElement.id);
    
    // Focus the text box after a short delay
    setTimeout(() => {
      const textElement = document.querySelector(`[data-element-id="${newElement.id}"] [contenteditable]`);
      if (textElement) {
        textElement.focus();
        textElement.select();
      }
    }, 100);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newElement = {
          id: Date.now(),
          type: 'image',
          src: e.target.result,
          x: 100,
          y: 200,
          width: 200,
          height: 150,
          alt: file.name
        };
        
        const elements = slide.elements || [];
        updateSlide(currentSlide, { elements: [...elements, newElement] });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateElement = (elementId, updates) => {
    const elements = slide.elements || [];
    const updatedElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateSlide(currentSlide, { elements: updatedElements });
  };

  const deleteElement = (elementId) => {
    const elements = slide.elements || [];
    const filteredElements = elements.filter(el => el.id !== elementId);
    updateSlide(currentSlide, { elements: filteredElements });
    setSelectedElement(null);
  };

  // Context menu actions for elements
  const cloneElement = (el) => ({ ...JSON.parse(JSON.stringify(el)), id: Date.now(), x: (el.x || 0) + 12, y: (el.y || 0) + 12 });
  const copyElement = (elementId) => {
    const el = (slide.elements || []).find(e => e.id === elementId);
    if (el) setElementClipboard(JSON.parse(JSON.stringify(el)));
  };
  const cutElement = (elementId) => {
    copyElement(elementId);
    deleteElement(elementId);
  };
  const pasteElement = () => {
    if (!elementClipboard) return;
    const newEl = cloneElement(elementClipboard);
    const elems = slide.elements || [];
    updateSlide(currentSlide, { elements: [...elems, newEl] });
    setSelectedElement(newEl.id);
  };
  const duplicateElement = (elementId) => {
    const el = (slide.elements || []).find(e => e.id === elementId);
    if (el) {
      const newEl = cloneElement(el);
      const elems = slide.elements || [];
      updateSlide(currentSlide, { elements: [...elems, newEl] });
      setSelectedElement(newEl.id);
    }
  };

  const handleMouseDown = (e, elementId) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
    setIsDragging(true);
    
    const element = (slide.elements || []).find(el => el.id === elementId);
    if (element) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedElement) {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
      
      updateElement(selectedElement, { x: Math.max(0, x), y: Math.max(0, y) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard shortcuts for element operations
  useEffect(() => {
    const onKey = (e) => {
      if (!selectedElement && !elementClipboard) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'c' && selectedElement) {
          e.preventDefault();
          copyElement(selectedElement);
        }
        if (e.key.toLowerCase() === 'x' && selectedElement) {
          e.preventDefault();
          cutElement(selectedElement);
        }
        if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          pasteElement();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedElement, elementClipboard, slide]);

  return (
    <div className="flex-1 p-6">
      {/* Modern Formatting Toolbar - now uses themed panel styles */}
      <div className="mb-6 panel">
        <div className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Text Formatting Group */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg">
              <button onClick={() => formatText('bold')} className="toolbar-btn" title="Bold (Ctrl+B)">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
              </button>
              <button onClick={() => formatText('italic')} className="toolbar-btn" title="Italic (Ctrl+I)">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/></svg>
              </button>
              <button onClick={() => formatText('underline')} className="toolbar-btn" title="Underline (Ctrl+U)">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
              </button>
            </div>

            <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>

            {/* Font Family, Size and Color */}
            <div className="flex items-center gap-2">
              <select onChange={(e) => setFontName(e.target.value)} className="form-select text-sm">
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Calibri">Calibri</option>
                <option value="Comic Sans MS">Comic Sans</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
              <select onChange={(e) => formatText('fontSize', e.target.value)} className="form-select text-sm">
                {[8,10,12,14,16,18,24,32,48,64,72,96].map(sz => (
                  <option key={sz} value={sz}>{sz}px</option>
                ))}
              </select>
              <div className="relative">
                <input type="color" onChange={(e) => formatText('foreColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer form-input" title="Text Color" />
              </div>
            </div>

            <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>

            {/* Alignment and Lists */}
            <div className="flex items-center gap-1">
              <button onClick={() => justify('justifyLeft')} className="toolbar-btn" title="Align Left">⯇</button>
              <button onClick={() => justify('justifyCenter')} className="toolbar-btn" title="Align Center">≡</button>
              <button onClick={() => justify('justifyRight')} className="toolbar-btn" title="Align Right">⯈</button>
              <button onClick={() => justify('justifyFull')} className="toolbar-btn" title="Justify">▤</button>
              <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
              <button onClick={toggleUL} className="toolbar-btn" title="Bulleted List">• • •</button>
              <button onClick={toggleOL} className="toolbar-btn" title="Numbered List">1. 2. 3.</button>
              <button onClick={outdent} className="toolbar-btn" title="Outdent">«</button>
              <button onClick={indent} className="toolbar-btn" title="Indent">»</button>
            </div>

            <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>
            
            {/* Insert Elements */}
            <div className="flex items-center gap-2">
              <button
                onClick={addTextBox}
                className="btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Text Box
              </button>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="btn-secondary flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image
              </label>
              
              <button
                onClick={() => { setEditChartIndex(null); setShowChartModal(true); }}
                className="btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Chart
              </button>
              
              <button
                onClick={() => setShowTableModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
                </svg>
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Slide Canvas */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Canvas Container with Modern Shadow */}
          <div 
            className="slide-canvas relative overflow-hidden"
            style={{ 
              width: '900px', 
              height: '675px', 
              backgroundColor: slide.background || '#ffffff',
              aspectRatio: '16/12'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Header/Footer overlays */}
            <div className="absolute top-2 left-4 right-4 text-xs text-neutral-700">
              {(() => {
                const idx = currentSlide;
                const hf = presentationMeta?.header || {};
                const txt = idx === 0 && hf.first ? hf.first : (idx % 2 === 0 && hf.even ? hf.even : (idx % 2 === 1 && hf.odd ? hf.odd : hf.default));
                const total = slides.length;
                return (txt || '').replaceAll('{page}', String(idx + 1)).replaceAll('{total}', String(total));
              })()}
            </div>
            <div className="absolute bottom-2 left-4 right-4 text-xs text-neutral-700 text-right">
              {(() => {
                const idx = currentSlide;
                const ff = presentationMeta?.footer || {};
                const txt = idx === 0 && ff.first ? ff.first : (idx % 2 === 0 && ff.even ? ff.even : (idx % 2 === 1 && ff.odd ? ff.odd : ff.default));
                const total = slides.length;
                return (txt || '').replaceAll('{page}', String(idx + 1)).replaceAll('{total}', String(total));
              })()}
            </div>
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
            {/* Layout-aware regions */}
            {layoutType === 'title-content' && (
              <>
                <div
                  ref={titleRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleTitleEdit}
                  onFocus={() => setIsEditing(true)}
                  className="absolute top-12 left-12 right-12 text-4xl font-bold text-center outline-none min-h-[60px] p-4 rounded-xl transition-all duration-200 bg-transparent"
                  style={{ color: slide.textColor || '#1f2937' }}
                  dangerouslySetInnerHTML={{ __html: slide.title || '<span style=\"color:rgba(255,255,255,0.45)\">Click to add title</span>' }}
                />
                <div
                  ref={contentRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleContentEdit}
                  onFocus={() => setIsEditing(true)}
                  className="absolute top-32 left-12 right-12 bottom-12 text-lg outline-none p-6 rounded-xl transition-all duration-200 bg-transparent"
                  style={{ color: slide.textColor || '#374151' }}
                  dangerouslySetInnerHTML={{ __html: slide.content || '<span style=\"color:rgba(255,255,255,0.45)\">Click to add content</span>' }}
                />
              </>
            )}

            {layoutType === 'title-only' && (
              <div
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={handleTitleEdit}
                onFocus={() => setIsEditing(true)}
                className="absolute top-24 left-12 right-12 text-4xl font-bold text-center outline-none min-h-[60px] p-4 rounded-xl transition-all duration-200 bg-transparent"
                style={{ color: slide.textColor || '#1f2937' }}
                dangerouslySetInnerHTML={{ __html: slide.title || '<span style=\"color:rgba(255,255,255,0.45)\">Click to add title</span>' }}
              />
            )}

            {layoutType === 'content-only' && (
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={handleContentEdit}
                onFocus={() => setIsEditing(true)}
                className="absolute top-16 left-12 right-12 bottom-12 text-lg outline-none p-6 rounded-xl transition-all duration-200 bg-transparent"
                style={{ color: slide.textColor || '#374151' }}
                dangerouslySetInnerHTML={{ __html: slide.content || '<span style=\"color:rgba(255,255,255,0.45)\">Click to add content</span>' }}
              />
            )}

            {layoutType === 'two-column' && (
              <div className="absolute inset-0 pt-20 px-12 pb-12 grid grid-cols-2 gap-6">
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleLeftEdit}
                  className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[200px]"
                  style={{ color: slide.textColor || '#374151' }}
                  dangerouslySetInnerHTML={{ __html: slide.contentLeft || '<span style=\"color:rgba(255,255,255,0.45)\">Left content</span>' }}
                />
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleRightEdit}
                  className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[200px]"
                  style={{ color: slide.textColor || '#374151' }}
                  dangerouslySetInnerHTML={{ __html: slide.contentRight || '<span style=\"color:rgba(255,255,255,0.45)\">Right content</span>' }}
                />
              </div>
            )}

            {layoutType === 'image-text' && (
              <div className="absolute inset-0 pt-16 px-12 pb-12 grid grid-cols-2 gap-6">
                <div className="relative flex items-center justify-center rounded-xl border border-[rgba(0,0,0,0.06)] bg-white/30 overflow-hidden">
                  {slide.imageSrc ? (
                    <img src={slide.imageSrc} alt="Slide" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <label htmlFor="image-text-upload" className="text-sm text-neutral-600 dark:text-neutral-300 cursor-pointer">
                      Click to upload image
                    </label>
                  )}
                  <input id="image-text-upload" type="file" accept="image/*" className="hidden" onChange={handleImageTextInputChange} />
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleContentEdit}
                  className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[200px]"
                  style={{ color: slide.textColor || '#374151' }}
                  dangerouslySetInnerHTML={{ __html: slide.content || '<span style=\"color:rgba(255,255,255,0.45)\">Add text</span>' }}
                />
              </div>
            )}

            {layoutType === 'comparison' && (
              <div className="absolute inset-0 pt-12 px-12 pb-12 grid grid-cols-2 gap-6">
                <div>
                  <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={handleCompLeftTitleEdit}
                    className="text-2xl font-semibold outline-none p-2 rounded-xl bg-transparent min-h-[40px] mb-2 text-center"
                    style={{ color: slide.textColor || '#1f2937' }}
                    dangerouslySetInnerHTML={{ __html: slide.compLeftTitle || '<span style=\"color:rgba(255,255,255,0.45)\">Left heading</span>' }}
                  />
                  <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={handleCompLeftContentEdit}
                    className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[160px]"
                    style={{ color: slide.textColor || '#374151' }}
                    dangerouslySetInnerHTML={{ __html: slide.compLeftContent || '<span style=\"color:rgba(255,255,255,0.45)\">Left content</span>' }}
                  />
                </div>
                <div>
                  <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={handleCompRightTitleEdit}
                    className="text-2xl font-semibold outline-none p-2 rounded-xl bg-transparent min-h-[40px] mb-2 text-center"
                    style={{ color: slide.textColor || '#1f2937' }}
                    dangerouslySetInnerHTML={{ __html: slide.compRightTitle || '<span style=\"color:rgba(255,255,255,0.45)\">Right heading</span>' }}
                  />
                  <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={handleCompRightContentEdit}
                    className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[160px]"
                    style={{ color: slide.textColor || '#374151' }}
                    dangerouslySetInnerHTML={{ __html: slide.compRightContent || '<span style=\"color:rgba(255,255,255,0.45)\">Right content</span>' }}
                  />
                </div>
              </div>
            )}

            {layoutType === 'blank' && null}

            {/* Modern Dynamic Elements */}
            {(slide.elements || []).map((element) => (
              <div
                key={element.id}
                data-element-id={element.id}
                className={`slide-element ${
                  selectedElement === element.id ? 'selected' : ''
                }`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                color: element.color,
                backgroundColor: element.backgroundColor
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onClick={() => setSelectedElement(element.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedElement(element.id);
                setContextMenu({ visible: true, x: e.clientX, y: e.clientY, elementId: element.id });
              }}
            >
              {element.type === 'textbox' && (
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={(e) => updateElement(element.id, { content: e.target.innerHTML, isEditing: false })}
                  onFocus={() => updateElement(element.id, { isEditing: true })}
                  onPaste={(e) => {
                    // Handle image paste
                    const items = e.clipboardData.items;
                    for (let item of items) {
                      if (item.type.indexOf('image') !== -1) {
                        e.preventDefault();
                        const file = item.getAsFile();
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updateElement(element.id, { 
                            type: 'image',
                            src: event.target.result,
                            content: undefined
                          });
                        };
                        reader.readAsDataURL(file);
                        break;
                      }
                    }
                  }}
                  className="w-full h-full outline-none p-1 cursor-text"
                  dangerouslySetInnerHTML={{ __html: element.content }}
                />
              )}
              
              {element.type === 'image' && (
                <img
                  src={element.src}
                  alt={element.alt}
                  className="w-full h-full object-cover rounded"
                  draggable={false}
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
                  {element.shapeType === 'circle' && (
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        backgroundColor: element.fill,
                        border: `${element.strokeWidth}px solid ${element.stroke}`
                      }}
                    />
                  )}
                  {element.shapeType === 'triangle' && (
                    <div
                      className="w-full h-full flex items-center justify-center text-4xl"
                      style={{ color: element.fill }}
                    >
                      🔺
                    </div>
                  )}
                </div>
              )}
              
              {element.type === 'icon' && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ fontSize: element.fontSize }}
                >
                  {element.content}
                </div>
              )}

              {element.type === 'video' && (
                <video src={element.src} className="w-full h-full rounded" controls />
              )}

              {element.type === 'audio' && (
                <div className="w-full h-full flex items-center justify-center">
                  <audio src={element.src} controls className="w-[90%]" />
                </div>
              )}
              
              {element.type === 'chart' && (
                <div className="w-full h-full p-2 relative">
                  <div className="text-xs font-medium mb-1">{element.title}</div>
                  <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                    📊 {element.chartType.toUpperCase()} Chart
                  </div>
                  {selectedElement === element.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); const idx = (slide.elements || []).findIndex(el => el.id === element.id); setEditChartIndex(idx); setShowChartModal(true); }}
                      className="absolute top-2 right-2 btn-secondary text-xs px-2 py-1"
                    >
                      Edit Chart
                    </button>
                  )}
                </div>
              )}
              
              {element.type === 'table' && (
                <div className="w-full h-full overflow-hidden relative">
                  <table className="w-full h-full text-xs border-collapse" style={{ borderColor: element.borderColor || '#d1d5db' }}>
                    <tbody>
                      {element.data.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td 
                              key={j} 
                              className="border p-1"
                              style={{ 
                                borderColor: element.borderColor || '#d1d5db',
                                backgroundColor: element.cellColors?.[i]?.[j] || element.backgroundColor || 'transparent'
                              }}
                              contentEditable
                              suppressContentEditableWarning={true}
                              onBlur={(e) => {
                                const newData = [...element.data];
                                newData[i][j] = e.target.textContent;
                                updateElement(element.id, { data: newData });
                              }}
                            >
                              {cell || `${i + 1},${j + 1}`}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedElement === element.id && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <input
                        type="color"
                        value={element.borderColor || '#d1d5db'}
                        onChange={(e) => updateElement(element.id, { borderColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer"
                        title="Border Color"
                      />
                      <input
                        type="color"
                        value={element.backgroundColor || '#ffffff'}
                        onChange={(e) => updateElement(element.id, { backgroundColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer"
                        title="Background Color"
                      />
                    </div>
                  )}
                </div>
              )}
              
                {selectedElement === element.id && (
                  <>
                    {/* Modern Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                    
                    {/* Resize Handles */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 rounded-full cursor-se-resize"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full cursor-ne-resize"></div>
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary-500 rounded-full cursor-nw-resize"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary-500 rounded-full cursor-sw-resize"></div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Canvas Info */}
          <div className="absolute -bottom-8 left-0 text-xs text-neutral-500 dark:text-neutral-400">
            16:12 Aspect Ratio • 900×675px
          </div>
        </div>
      </div>

      {/* Modern Element Properties Panel */}
      {selectedElement && (
        <div className="mt-6 panel animate-fade-in">
          <div className="panel-header">
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Element Properties</h4>
            <button
              onClick={() => setSelectedElement(null)}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Font Size</label>
              <input
                type="number"
                placeholder="Font Size"
                onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                className="form-input"
                min="8"
                max="72"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Font Family</label>
              <select
                onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                className="form-select"
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Text Color</label>
              <div className="relative">
                <input
                  type="color"
                  onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                  className="w-full h-10 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer"
                  title="Text Color"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Background</label>
              <div className="relative">
                <input
                  type="color"
                  onChange={(e) => updateElement(selectedElement, { backgroundColor: e.target.value })}
                  className="w-full h-10 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer"
                  title="Background Color"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modern Modals */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="animate-zoom-in">
            <ChartComponent onClose={() => { setShowChartModal(false); setEditChartIndex(null); }} elementIndex={editChartIndex} />
          </div>
        </div>
      )}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="animate-zoom-in">
            <TableComponent onClose={() => setShowTableModal(false)} />
          </div>
        </div>
      )}
    {showHeaderFooter && (
        <HeaderFooterModal
          onClose={() => setShowHeaderFooter(false)}
          meta={presentationMeta}
          onSave={(next) => setPresentationMeta({ ...presentationMeta, ...next })}
        />
      )}
    {/* Element Context Menu */}
      {contextMenu.visible && (
        <div
          className="dropdown-menu fixed z-[100]"
          style={{ left: contextMenu.x + 4, top: contextMenu.y + 4 }}
          onMouseLeave={() => setContextMenu({ visible: false, x: 0, y: 0, elementId: null })}
        >
          <button className="dropdown-item" onClick={() => { copyElement(contextMenu.elementId); setContextMenu({ visible: false, x: 0, y: 0, elementId: null }); }}>Copy	Ctrl+C</button>
          <button className="dropdown-item" onClick={() => { cutElement(contextMenu.elementId); setContextMenu({ visible: false, x: 0, y: 0, elementId: null }); }}>Cut	Ctrl+X</button>
          <button className="dropdown-item" onClick={() => { pasteElement(); setContextMenu({ visible: false, x: 0, y: 0, elementId: null }); }}>Paste	Ctrl+V</button>
          <button className="dropdown-item" onClick={() => { duplicateElement(contextMenu.elementId); setContextMenu({ visible: false, x: 0, y: 0, elementId: null }); }}>Duplicate</button>
          <button className="dropdown-item text-red-500" onClick={() => { if (confirm('Delete element?')) deleteElement(contextMenu.elementId); setContextMenu({ visible: false, x: 0, y: 0, elementId: null }); }}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default SlideEditor;