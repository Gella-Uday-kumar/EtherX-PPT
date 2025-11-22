import React, { useState, useRef, useEffect } from 'react';
import { usePresentation } from '../contexts/PresentationContext';
import ChartComponent from './ChartComponent';
import ChartRenderer from './ChartRenderer';
import TableComponent from './TableComponent';
import HeaderFooterModal from './HeaderFooterModal';
import ImageEditor from './ImageEditor';
import TableEditor from './TableEditor';
import { RiCloseLine } from 'react-icons/ri';

const SlideEditor = () => {
   const { slides, currentSlide, updateSlide, presentationMeta, setPresentationMeta, animationPreview } = usePresentation();
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

  const getAnimationStyle = (target) => {
    if (!animationPreview.active) return {};

    const animations = animationPreview.animations || slide.animations || [];
    const animation = animations.find(a => a.target === target);
    if (!animation) return {};

    // Apply animation only during preview
    return {
      animationName: animation.type,
      animationDuration: `${animation.duration}ms`,
      animationDelay: `${animation.delay}ms`,
      animationFillMode: 'forwards',
      animationTimingFunction: 'ease-out'
    };
  };

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
    // If a table cell is selected, apply formatting to it
    if (selectedTableCell) {
      const { elementId, rowIndex, colIndex } = selectedTableCell;
      const element = (slide.elements || []).find(el => el.id === elementId);
      if (element && element.type === 'table') {
        // For now, we'll apply basic formatting by updating the cell content
        // In a more advanced implementation, we could use a rich text editor
        const cell = document.querySelector(`[data-element-id="${elementId}"] td[data-row="${rowIndex}"][data-col="${colIndex}"]`);
        if (cell) {
          cell.focus();
          document.execCommand(command, false, value);
          // Update the element data
          const newData = [...(element.data || [])];
          if (!newData[rowIndex]) newData[rowIndex] = [];
          newData[rowIndex][colIndex] = cell.innerHTML;
          updateElement(elementId, { data: newData });
        }
      }
    } else {
      document.execCommand(command, false, value);
    }
  };

  const setFontName = (name) => {
    if (selectedTableCell) {
      const { elementId, rowIndex, colIndex } = selectedTableCell;
      const element = (slide.elements || []).find(el => el.id === elementId);
      if (element && element.type === 'table') {
        const cell = document.querySelector(`[data-element-id="${elementId}"] td[data-row="${rowIndex}"][data-col="${colIndex}"]`);
        if (cell) {
          cell.focus();
          document.execCommand('fontName', false, name);
          const newData = [...(element.data || [])];
          if (!newData[rowIndex]) newData[rowIndex] = [];
          newData[rowIndex][colIndex] = cell.innerHTML;
          updateElement(elementId, { data: newData });
        }
      }
    } else {
      document.execCommand('fontName', false, name);
    }
  };
  const justify = (dir) => document.execCommand(dir, false, null);
  const insertList = (isOrdered = false) => {
    // Find the currently focused contentEditable element
    const activeElement = document.activeElement;
    let targetElement = null;

    if (activeElement && activeElement.isContentEditable) {
      targetElement = activeElement;
    } else {
      // Default to content area
      targetElement = contentRef.current;
    }

    if (!targetElement) return;

    targetElement.focus();

    // Get current selection
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const listTag = isOrdered ? 'ol' : 'ul';

    // Check if we're already in a list
    const existingList = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement.closest('ul, ol')
      : range.commonAncestorContainer.closest('ul, ol');

    if (existingList) {
      // If already in a list, toggle it off
      const listItems = existingList.querySelectorAll('li');
      const fragment = document.createDocumentFragment();

      listItems.forEach((li, index) => {
        const text = li.textContent;
        const br = index < listItems.length - 1 ? document.createElement('br') : null;
        fragment.appendChild(document.createTextNode(text));
        if (br) fragment.appendChild(br);
      });

      range.deleteContents();
      range.insertNode(fragment);

      // Update slide content
      const field = getFieldFromElement(targetElement);
      if (field) {
        const updateObj = {};
        updateObj[field] = targetElement.innerHTML;
        updateSlide(currentSlide, updateObj);
      }
      return;
    }

    // Create new list
    let listHTML = '';
    if (range.collapsed) {
      // No selection - create default list
      listHTML = `<${listTag}><li>List item 1</li><li>List item 2</li><li>List item 3</li></${listTag}>`;
    } else {
      // Selection exists - wrap in list
      const selectedContent = range.extractContents();
      const li = document.createElement('li');
      li.appendChild(selectedContent);
      const list = document.createElement(listTag);
      list.appendChild(li);

      // Add more items if the selection contains line breaks
      const text = selectedContent.textContent;
      if (text.includes('\n')) {
        const lines = text.split('\n').filter(line => line.trim());
        list.innerHTML = '';
        lines.forEach(line => {
          const listItem = document.createElement('li');
          listItem.textContent = line.trim();
          list.appendChild(listItem);
        });
      }

      range.deleteContents();
      range.insertNode(list);
      return;
    }

    // Insert the list HTML
    document.execCommand('insertHTML', false, listHTML);

    // Update slide content
    const field = getFieldFromElement(targetElement);
    if (field) {
      setTimeout(() => {
        const updateObj = {};
        updateObj[field] = targetElement.innerHTML;
        updateSlide(currentSlide, updateObj);
      }, 10);
    }
  };

  const getFieldFromElement = (element) => {
    if (element === titleRef.current) return 'title';
    if (element === contentRef.current) return 'content';

    // Check for other layout-specific elements
    const slide = slides[currentSlide] || {};
    const layoutType = (slide.layoutMeta && slide.layoutMeta.type) || slide.layout || 'title-content';

    if (layoutType === 'two-column') {
      if (element.closest('[data-layout="left"]')) return 'contentLeft';
      if (element.closest('[data-layout="right"]')) return 'contentRight';
    }

    if (layoutType === 'comparison') {
      if (element.closest('[data-layout="comp-left-content"]')) return 'compLeftContent';
      if (element.closest('[data-layout="comp-right-content"]')) return 'compRightContent';
    }

    if (layoutType === 'image-text') {
      if (element.closest('[data-layout="image-text-content"]')) return 'content';
    }

    return 'content'; // Default fallback
  };

  const toggleUL = () => insertList(false);
  const toggleOL = () => insertList(true);
  const indent = () => document.execCommand('indent', false, null);
  const outdent = () => document.execCommand('outdent', false, null);

  const handleBulletClick = (e, field) => {
    const target = e.target;
    const li = target.closest('li');
    if (li) {
      // Only prevent default and show menu if we're actually clicking on a bullet
      // For now, show menu on any LI click, but don't prevent default to allow text editing
      e.stopPropagation();

      // Select the list item content
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(li);
      selection.removeAllRanges();
      selection.addRange(range);

      // Show bullet menu positioned near the clicked LI
      setSelectedBullet({ li, field });
      const rect = li.getBoundingClientRect();
      setBulletMenuPosition({ x: rect.left + 20, y: rect.top - 50 });
      setShowBulletMenu(true);
    }
  };

  const changeBulletStyle = (style) => {
    if (!selectedBullet) return;
    const { li, field } = selectedBullet;

    // Find the parent list element (UL or OL)
    let listElement = li.closest('ul, ol');

    if (style === 'none') {
      // Remove list styling
      if (listElement) {
        listElement.style.listStyleType = 'none';
        const listItems = listElement.querySelectorAll('li');
        listItems.forEach(item => {
          item.style.listStyleType = 'none';
        });
      } else {
        li.style.listStyleType = 'none';
      }
    } else {
      // Apply the selected style
      if (listElement) {
        // Change UL to OL if numbered style is selected
        if ((style === 'decimal' || style === 'lower-alpha' || style === 'upper-alpha' || style === 'lower-roman') && listElement.tagName === 'UL') {
          // Convert UL to OL
          const ol = document.createElement('ol');
          ol.innerHTML = listElement.innerHTML;
          ol.style.listStyleType = style;
          listElement.parentNode.replaceChild(ol, listElement);
          listElement = ol;
        } else if ((style === 'disc' || style === 'circle' || style === 'square') && listElement.tagName === 'OL') {
          // Convert OL to UL
          const ul = document.createElement('ul');
          ul.innerHTML = listElement.innerHTML;
          ul.style.listStyleType = style;
          listElement.parentNode.replaceChild(ul, listElement);
          listElement = ul;
        } else {
          // Same list type, just change style
          listElement.style.listStyleType = style;
        }

        // Apply to individual items for consistency
        const listItems = listElement.querySelectorAll('li');
        listItems.forEach(item => {
          item.style.listStyleType = style;
        });
      } else {
        // Single LI - create appropriate list type
        const listType = (style === 'decimal' || style === 'lower-alpha' || style === 'upper-alpha' || style === 'lower-roman') ? 'ol' : 'ul';
        const list = document.createElement(listType);
        list.style.listStyleType = style;
        li.parentNode.insertBefore(list, li);
        list.appendChild(li);
        li.style.listStyleType = style;
        listElement = list;
      }
    }

    // Update the slide content - find the contentEditable div that contains the li
    let contentDiv = li.closest('[contenteditable]');
    if (contentDiv) {
      const newContent = contentDiv.innerHTML;
      const updateObj = {};
      updateObj[field] = newContent;
      updateSlide(currentSlide, updateObj);
    }

    setShowBulletMenu(false);
    setSelectedBullet(null);
  };

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

    // Remove all existing text boxes and keep only non-textbox elements
    const elements = slide.elements || [];
    const nonTextBoxElements = elements.filter(el => el.type !== 'textbox');

    updateSlide(currentSlide, { elements: [...nonTextBoxElements, newElement] });
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

  const addEquation = () => {
    const newElement = {
      id: Date.now(),
      type: 'equation',
      content: 'E = mc²',
      x: 150,
      y: 150,
      width: 250,
      height: 60,
      fontSize: 24,
      fontFamily: 'Times New Roman',
      color: '#000000',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      isEditing: false
    };

    const elements = slide.elements || [];
    updateSlide(currentSlide, { elements: [...elements, newElement] });
    setSelectedElement(newElement.id);

    // Focus the equation for immediate editing
    setTimeout(() => {
      const equationElement = document.querySelector(`[data-element-id="${newElement.id}"] [contenteditable]`);
      if (equationElement) {
        equationElement.focus();
      }
    }, 100);
  };

  const addShape = (shapeType) => {
    const newElement = {
      id: Date.now(),
      type: 'shape',
      shapeType: shapeType,
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2
    };

    const elements = slide.elements || [];
    updateSlide(currentSlide, { elements: [...elements, newElement] });
    setSelectedElement(newElement.id);
    setShowShapeMenu(false);
  };

  const openShapeMenu = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setShapeMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setShowShapeMenu(true);
  };

  const addIcon = (iconContent) => {
    const newElement = {
      id: Date.now(),
      type: 'icon',
      content: iconContent,
      x: 250,
      y: 250,
      width: 60,
      height: 60,
      fontSize: 48,
      color: '#000000'
    };

    const elements = slide.elements || [];
    updateSlide(currentSlide, { elements: [...elements, newElement] });
    setSelectedElement(newElement.id);
    setShowIconMenu(false);
  };

  const openIconMenu = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIconMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setShowIconMenu(true);
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
    if (element && element.type !== 'image' && element.type !== 'table') {
      // Push current state to history before starting drag
      const elements = slide.elements || [];
      const updatedElements = [...elements]; // Create a copy
      updateSlide(currentSlide, { elements: updatedElements }); // This pushes to history

      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    const element = selectedElement ? (slide.elements || []).find(el => el.id === selectedElement) : null;

    if (isDragging && selectedElement && element?.type !== 'image' && element?.type !== 'table') {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      updateElement(selectedElement, { x: Math.max(0, x), y: Math.max(0, y) }, true); // Skip history during drag
    }

    if (isResizing && selectedElement && element?.type !== 'image' && element?.type !== 'table') {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.x;
      let newY = resizeStart.y;

      // Calculate new dimensions based on resize handle
      switch (resizeHandle) {
        case 'se': // bottom-right
          newWidth = Math.max(20, mouseX - resizeStart.x);
          newHeight = Math.max(20, mouseY - resizeStart.y);
          break;
        case 'ne': // top-right
          newWidth = Math.max(20, mouseX - resizeStart.x);
          newHeight = Math.max(20, resizeStart.y + resizeStart.height - mouseY);
          newY = Math.max(0, mouseY);
          break;
        case 'nw': // top-left
          newWidth = Math.max(20, resizeStart.x + resizeStart.width - mouseX);
          newHeight = Math.max(20, resizeStart.y + resizeStart.height - mouseY);
          newX = Math.max(0, mouseX);
          newY = Math.max(0, mouseY);
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(20, resizeStart.x + resizeStart.width - mouseX);
          newHeight = Math.max(20, mouseY - resizeStart.y);
          newX = Math.max(0, mouseX);
          break;
      }

      updateElement(selectedElement, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      }, true); // Skip history during resize
    }
  };

  const handleResizeStart = (e, elementId, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsResizing(true);
    setResizeHandle(handle);

    const element = (slide.elements || []).find(el => el.id === elementId);
    if (element && element.type !== 'image' && element.type !== 'table') {
      // Push current state to history before starting resize
      const elements = slide.elements || [];
      const updatedElements = [...elements]; // Create a copy
      updateSlide(currentSlide, { elements: updatedElements }); // This pushes to history

      setResizeStart({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);

    // Push final state to history after drag/resize ends
    if (selectedElement) {
      const elements = slide.elements || [];
      const updatedElements = [...elements]; // Create a copy
      updateSlide(currentSlide, { elements: updatedElements }); // This pushes to history
    }
  };

  // Handle clicks outside to close menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close bullet menu if clicking outside
      if (showBulletMenu && !e.target.closest('.dropdown-menu')) {
        setShowBulletMenu(false);
        setSelectedBullet(null);
      }

      // Close shape menu if clicking outside
      if (showShapeMenu && !e.target.closest('.dropdown-menu') && !e.target.closest('.shape-menu-trigger')) {
        setShowShapeMenu(false);
      }

      // Close icon menu if clicking outside
      if (showIconMenu && !e.target.closest('.dropdown-menu') && !e.target.closest('.icon-menu-trigger')) {
        setShowIconMenu(false);
      }
    };

    if (showBulletMenu || showShapeMenu || showIconMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBulletMenu, showShapeMenu, showIconMenu]);

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
    <div className="editor-wrapper h-[calc(100vh-80px)] overflow-y-scroll overflow-x-hidden p-6">
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

              <button
                onClick={addEquation}
                className="btn-secondary flex items-center gap-2"
              >
                <span className="text-lg">∑</span>
                Equation
              </button>

              <div className="relative">
                <button
                  onClick={openShapeMenu}
                  className="btn-secondary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Shapes
                </button>

                {showShapeMenu && (
                  <div
                    className="dropdown-menu fixed z-[100] grid grid-cols-4 gap-2 p-3"
                    style={{ left: shapeMenuPosition.x, top: shapeMenuPosition.y }}
                    onMouseLeave={() => setShowShapeMenu(false)}
                  >
                    <button
                      onClick={() => addShape('rectangle')}
                      className="shape-btn w-12 h-12 border-2 border-gray-300 rounded hover:border-blue-500 flex items-center justify-center"
                      title="Rectangle"
                    >
                      <div className="w-8 h-6 bg-blue-500 rounded"></div>
                    </button>
                    <button
                      onClick={() => addShape('square')}
                      className="shape-btn w-12 h-12 border-2 border-gray-300 rounded hover:border-blue-500 flex items-center justify-center"
                      title="Square"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    </button>
                    <button
                      onClick={() => addShape('circle')}
                      className="shape-btn w-12 h-12 border-2 border-gray-300 rounded hover:border-blue-500 flex items-center justify-center"
                      title="Circle"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                    </button>
                    <button
                      onClick={() => addShape('triangle')}
                      className="shape-btn w-12 h-12 border-2 border-gray-300 rounded hover:border-blue-500 flex items-center justify-center"
                      title="Triangle"
                    >
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-blue-500 mx-auto mt-2"></div>
                    </button>
                    <button
                      onClick={() => addShape('star')}
                      className="shape-btn w-12 h-12 border-2 border-gray-300 rounded hover:border-blue-500 flex items-center justify-center"
                      title="Star"
                    >
                      <span className="text-yellow-500 text-lg">⭐</span>
                    </button>
                    <button
                      onClick={() => addShape('arrow')}
                      className="shape-btn w-12 h-12 border-2 border-gray-300 rounded hover:border-blue-500 flex items-center justify-center"
                      title="Arrow"
                    >
                      <span className="text-blue-500 text-lg">→</span>
                    </button>
                    <button
                      onClick={() => addShape('line')}
                      className="shape-btn w-12 h-12 border-2 border-gray-300 rounded hover:border-blue-500 flex items-center justify-center"
                      title="Line"
                    >
                      <div className="w-8 h-0.5 bg-blue-500"></div>
                    </button>
                    <button
                      onClick={() => addShape('oval')}
                      className="shape-btn w-12 h-12 border-2 border-gray-300 rounded hover:border-blue-500 flex items-center justify-center"
                      title="Oval"
                    >
                      <div className="w-8 h-6 bg-blue-500 rounded-full"></div>
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={openIconMenu}
                  className="btn-secondary flex items-center gap-2"
                >
                  <span className="text-lg">😊</span>
                  Icons
                </button>

                {showIconMenu && (
                  <div
                    className="dropdown-menu fixed z-[100] grid grid-cols-6 gap-2 p-3"
                    style={{ left: iconMenuPosition.x, top: iconMenuPosition.y }}
                    onMouseLeave={() => setShowIconMenu(false)}
                  >
                    <button onClick={() => addIcon('😊')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Happy">😊</button>
                    <button onClick={() => addIcon('👍')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Thumbs Up">👍</button>
                    <button onClick={() => addIcon('❤️')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Heart">❤️</button>
                    <button onClick={() => addIcon('⭐')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Star">⭐</button>
                    <button onClick={() => addIcon('🔥')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Fire">🔥</button>
                    <button onClick={() => addIcon('⚡')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Lightning">⚡</button>
                    <button onClick={() => addIcon('🎯')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Target">🎯</button>
                    <button onClick={() => addIcon('💡')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Lightbulb">💡</button>
                    <button onClick={() => addIcon('📈')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Chart">📈</button>
                    <button onClick={() => addIcon('🏆')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Trophy">🏆</button>
                    <button onClick={() => addIcon('⚠️')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Warning">⚠️</button>
                    <button onClick={() => addIcon('✅')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Check">✅</button>
                    <button onClick={() => addIcon('🚀')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Rocket">🚀</button>
                    <button onClick={() => addIcon('🌟')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Sparkles">🌟</button>
                    <button onClick={() => addIcon('🎉')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Party">🎉</button>
                    <button onClick={() => addIcon('💯')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Hundred">💯</button>
                    <button onClick={() => addIcon('🔍')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Search">🔍</button>
                    <button onClick={() => addIcon('📱')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Phone">📱</button>
                    <button onClick={() => addIcon('💼')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Briefcase">💼</button>
                    <button onClick={() => addIcon('🏠')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Home">🏠</button>
                    <button onClick={() => addIcon('🌍')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Globe">🌍</button>
                    <button onClick={() => addIcon('⏰')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Clock">⏰</button>
                    <button onClick={() => addIcon('📧')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Email">📧</button>
                    <button onClick={() => addIcon('🔒')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Lock">🔒</button>
                    <button onClick={() => addIcon('🔓')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Unlock">🔓</button>
                    <button onClick={() => addIcon('🎵')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Music">🎵</button>
                    <button onClick={() => addIcon('🎬')} className="icon-btn w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded" title="Film">🎬</button>
                  </div>
                )}
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
              backgroundColor: slide.background || '#ffffff'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={(e) => {
              // Clear table cell selection when clicking on canvas
              setSelectedTableCell(null);

              // Handle bullet clicks using event delegation
              const li = e.target.closest('li');
              if (li) {
                const contentEditable = li.closest('[contenteditable]');
                if (contentEditable) {
                  const field = getFieldFromElement(contentEditable);
                  if (field) {
                    handleBulletClick(e, field);
                  }
                }
              }
            }}
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
              backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}></div>
            {/* Layout-aware regions */}
            {layoutType === 'title-content' && (
              <>
                <div
                  key={`title-${animationPreview.active ? 'animating' : 'static'}`}
                  ref={titleRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleTitleEdit}
                  onFocus={() => setIsEditing(true)}
                  className="absolute top-12 left-12 right-12 text-4xl font-bold text-center outline-none min-h-[60px] p-4 rounded-xl transition-all duration-200 bg-transparent"
                  style={{ color: slide.textColor || '#1f2937', ...getAnimationStyle('title') }}
                  dangerouslySetInnerHTML={{ __html: slide.title || '<span style=\"color:rgba(255,255,255,0.45)\">Click to add title</span>' }}
                />
                <div
                  key={`content-${animationPreview.active ? 'animating' : 'static'}`}
                  ref={contentRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleContentEdit}
                  onFocus={() => setIsEditing(true)}
                  className="absolute top-32 left-12 right-12 bottom-12 text-lg outline-none p-6 rounded-xl transition-all duration-200 bg-transparent"
                  style={{ color: slide.textColor || '#374151', ...getAnimationStyle('content') }}
                  dangerouslySetInnerHTML={{ __html: slide.content || '<span style="color:rgba(255,255,255,0.45)">Click to add content</span>' }}
                />
              </>
            )}

            {layoutType === 'title-only' && (
              <div
                key={`title-only-${animationPreview.active ? 'animating' : 'static'}`}
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={handleTitleEdit}
                onFocus={() => setIsEditing(true)}
                className="absolute top-24 left-12 right-12 text-4xl font-bold text-center outline-none min-h-[60px] p-4 rounded-xl transition-all duration-200 bg-transparent"
                style={{ color: slide.textColor || '#1f2937', ...getAnimationStyle('title') }}
                dangerouslySetInnerHTML={{ __html: slide.title || '<span style="color:rgba(255,255,255,0.45)">Click to add title</span>' }}
              />
            )}

            {layoutType === 'content-only' && (
              <div
                key={`content-only-${animationPreview.active ? 'animating' : 'static'}`}
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={handleContentEdit}
                onFocus={() => setIsEditing(true)}
                className="absolute top-16 left-12 right-12 bottom-12 text-lg outline-none p-6 rounded-xl transition-all duration-200 bg-transparent"
                style={{ color: slide.textColor || '#374151', ...getAnimationStyle('content') }}
                dangerouslySetInnerHTML={{ __html: slide.content || '<span style="color:rgba(255,255,255,0.45)">Click to add content</span>' }}
              />
            )}

            {layoutType === 'two-column' && (
              <div className="absolute inset-0 pt-20 px-12 pb-12 grid grid-cols-2 gap-6">
                <div
                  data-layout="left"
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleLeftEdit}
                  className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[200px]"
                  style={{ color: slide.textColor || '#374151' }}
                  dangerouslySetInnerHTML={{ __html: slide.contentLeft || '<span style="color:rgba(255,255,255,0.45)">Left content</span>' }}
                />
                <div
                  data-layout="right"
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleRightEdit}
                  className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[200px]"
                  style={{ color: slide.textColor || '#374151' }}
                  dangerouslySetInnerHTML={{ __html: slide.contentRight || '<span style="color:rgba(255,255,255,0.45)">Right content</span>' }}
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
                  data-layout="image-text-content"
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={handleContentEdit}
                  className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[200px]"
                  style={{ color: slide.textColor || '#374151' }}
                  dangerouslySetInnerHTML={{ __html: slide.content || '<span style="color:rgba(255,255,255,0.45)">Add text</span>' }}
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
                    dangerouslySetInnerHTML={{ __html: slide.compLeftTitle || '<span style="color:rgba(255,255,255,0.45)">Left heading</span>' }}
                  />
                  <div
                    data-layout="comp-left-content"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={handleCompLeftContentEdit}
                    onMouseDown={(e) => handleBulletClick(e, 'compLeftContent')}
                    className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[160px]"
                    style={{ color: slide.textColor || '#374151' }}
                    dangerouslySetInnerHTML={{ __html: slide.compLeftContent || '<span style="color:rgba(255,255,255,0.45)">Left content</span>' }}
                  />
                </div>
                <div>
                  <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={handleCompRightTitleEdit}
                    className="text-2xl font-semibold outline-none p-2 rounded-xl bg-transparent min-h-[40px] mb-2 text-center"
                    style={{ color: slide.textColor || '#1f2937' }}
                    dangerouslySetInnerHTML={{ __html: slide.compRightTitle || '<span style="color:rgba(255,255,255,0.45)">Right heading</span>' }}
                  />
                  <div
                    data-layout="comp-right-content"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={handleCompRightContentEdit}
                    onMouseDown={(e) => handleBulletClick(e, 'compRightContent')}
                    className="text-lg outline-none p-4 rounded-xl bg-transparent min-h-[160px]"
                    style={{ color: slide.textColor || '#374151' }}
                    dangerouslySetInnerHTML={{ __html: slide.compRightContent || '<span style="color:rgba(255,255,255,0.45)">Right content</span>' }}
                  />
                </div>
              </div>
            )}

            {layoutType === 'blank' && null}

            {/* Modern Dynamic Elements */}
            {(slide.elements || []).map((element) => {
              const elementAnimations = slide.animations?.filter(a => a.target === element.id) || [];
              const animationKey = elementAnimations.length > 0 ? elementAnimations.map(a => a.id).join('-') : 'none';

              return (
                <div
                  key={`${element.id}-${animationPreview.active ? 'animating' : 'static'}-${animationKey}`}
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
                    backgroundColor: element.backgroundColor,
                    border: element.borderWidth ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor || '#000000'}` : 'none',
                    ...getAnimationStyle(element.id)
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(element.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
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
                <ImageEditor
                  element={element}
                  onUpdate={(updates) => updateElement(element.id, updates)}
                  onDelete={() => deleteElement(element.id)}
                  isSelected={selectedElement === element.id}
                  onSelect={() => setSelectedElement(element.id)}
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
                  {element.shapeType === 'square' && (
                    <div
                      className="w-full h-full rounded"
                      style={{
                        backgroundColor: element.fill,
                        border: `${element.strokeWidth}px solid ${element.stroke}`
                      }}
                    />
                  )}
                  {element.shapeType === 'oval' && (
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        backgroundColor: element.fill,
                        border: `${element.strokeWidth}px solid ${element.stroke}`
                      }}
                    />
                  )}
                  {element.shapeType === 'star' && (
                    <div
                      className="w-full h-full flex items-center justify-center text-4xl"
                      style={{ color: element.fill }}
                    >
                      ⭐
                    </div>
                  )}
                  {element.shapeType === 'arrow' && (
                    <div
                      className="w-full h-full flex items-center justify-center text-3xl"
                      style={{ color: element.fill }}
                    >
                      →
                    </div>
                  )}
                  {element.shapeType === 'line' && (
                    <div
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div
                        className="w-full"
                        style={{
                          height: `${element.strokeWidth || 2}px`,
                          backgroundColor: element.stroke || '#000000'
                        }}
                      />
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
                <div className="w-full h-full relative">
                  <ChartRenderer element={element} />
                  {selectedElement === element.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); const idx = (slide.elements || []).findIndex(el => el.id === element.id); setEditChartIndex(idx); setShowChartModal(true); }}
                      className="absolute top-2 right-2 btn-secondary text-xs px-2 py-1 z-10"
                    >
                      Edit Chart
                    </button>
                  )}
                </div>
              )}
              
              {element.type === 'table' && (
                <TableEditor
                  element={element}
                  onUpdate={(updates) => updateElement(element.id, updates)}
                  onDelete={() => deleteElement(element.id)}
                  isSelected={selectedElement === element.id}
                  onSelect={() => setSelectedElement(element.id)}
                  onCellSelect={(cellInfo) => setSelectedTableCell(cellInfo ? { elementId: element.id, ...cellInfo } : null)}
                />
              )}

              {element.type === 'equation' && (
                <div
                  className="w-full h-full flex items-center justify-center p-2 border-2 border-blue-500 bg-white rounded"
                  style={{
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    color: element.color,
                    backgroundColor: element.backgroundColor || '#ffffff',
                    borderColor: selectedElement === element.id ? '#3b82f6' : '#e5e7eb'
                  }}
                >
                  <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={(e) => updateElement(element.id, { content: e.target.textContent })}
                    onFocus={() => setSelectedElement(element.id)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-center outline-none cursor-text w-full min-h-[40px] p-2"
                    style={{
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      color: 'inherit',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {element.content || 'Enter equation...'}
                  </div>
                </div>
              )}
              
                {selectedElement === element.id && element.type !== 'image' && element.type !== 'table' && (
                  <>
                    {/* Modern Delete Button */}
                    <button
                      onClick={(e) => {
                        // Allow normal event handling
                        deleteElement(element.id);
                      }}
                      className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>

                    {/* Resize Handles */}
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 rounded-full cursor-se-resize"
                      onMouseDown={(e) => handleResizeStart(e, element.id, 'se')}
                    ></div>
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full cursor-ne-resize"
                      onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')}
                    ></div>
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-primary-500 rounded-full cursor-nw-resize"
                      onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')}
                    ></div>
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary-500 rounded-full cursor-sw-resize"
                      onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')}
                    ></div>
                  </>
                )}
              </div>
            )}

          )

          }

          </div>
          {/* Canvas Info */}
          <div className="absolute -bottom-8 left-0 text-xs text-neutral-500 dark:text-neutral-400">
            16:12 Aspect Ratio • 900×675px
          </div>
        </div>
      </div>

      
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

      {/* Bullet Style Menu */}
      {showBulletMenu && (
        <div
          className="dropdown-menu fixed z-[100]"
          style={{ left: bulletMenuPosition.x, top: bulletMenuPosition.y }}
        >
          <button className="dropdown-item" onClick={() => changeBulletStyle('disc')}>• Bullets</button>
          <button className="dropdown-item" onClick={() => changeBulletStyle('circle')}>○ Circle</button>
          <button className="dropdown-item" onClick={() => changeBulletStyle('square')}>■ Square</button>
          <button className="dropdown-item" onClick={() => changeBulletStyle('decimal')}>1. Numbers</button>
          <button className="dropdown-item" onClick={() => changeBulletStyle('lower-alpha')}>a. Lowercase</button>
          <button className="dropdown-item" onClick={() => changeBulletStyle('upper-alpha')}>A. Uppercase</button>
          <button className="dropdown-item" onClick={() => changeBulletStyle('lower-roman')}>i. Roman</button>
          <button className="dropdown-item" onClick={() => changeBulletStyle('none')}>None</button>
        </div>
      )}
    </div>
  </div>
  );
};

export default SlideEditor;
