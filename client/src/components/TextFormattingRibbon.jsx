import React, { useState } from 'react';
import { usePresentation } from '../contexts/PresentationContext';

const TextFormattingRibbon = ({ selectedElement, onFormatChange, applyFormatToSelection }) => {
  const { slides, currentSlide, updateSlide } = usePresentation();
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('12');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [selectedList, setSelectedList] = useState('bullet');
  const [alignment, setAlignment] = useState('left');

  const fontFamilies = [
    'Arial', 'Calibri', 'Times New Roman', 'Helvetica', 'Georgia', 
    'Verdana', 'Tahoma', 'Comic Sans MS', 'Impact', 'Trebuchet MS'
  ];

  const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];

  const handleFontFamilyChange = (family) => {
    setFontFamily(family);
    applyFormatToSelection?.('fontName', family);
    onFormatChange?.({ fontFamily: family });
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    applyFormatToSelection?.('fontSize', size);
    onFormatChange?.({ fontSize: `${size}px` });
  };

  const handleUpperCase = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = range.toString().toUpperCase();
      const textNode = document.createTextNode(text);
      range.deleteContents();
      range.insertNode(textNode);
      
      // Restore selection
      const newRange = document.createRange();
      newRange.selectNodeContents(textNode);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  const handleLowerCase = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = range.toString().toLowerCase();
      const textNode = document.createTextNode(text);
      range.deleteContents();
      range.insertNode(textNode);
      
      // Restore selection
      const newRange = document.createRange();
      newRange.selectNodeContents(textNode);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  const toggleBold = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    applyFormatToSelection?.('bold');
  };

  const toggleItalic = () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    applyFormatToSelection?.('italic');
  };

  const toggleUnderline = () => {
    const newUnderline = !isUnderline;
    setIsUnderline(newUnderline);
    applyFormatToSelection?.('underline');
  };

  const toggleStrikethrough = () => {
    const newStrike = !isStrikethrough;
    setIsStrikethrough(newStrike);
    applyFormatToSelection?.('strikeThrough');
  };

  const handleListChange = (listType) => {
    setSelectedList(listType);
    setShowListDropdown(false);
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
    
    // Get the contentEditable element
    let editableElement = element;
    while (editableElement && !editableElement.contentEditable) {
      editableElement = editableElement.parentElement;
    }
    
    if (!editableElement) return;
    
    // Get selected text or current line
    let selectedText = selection.toString();
    if (!selectedText) {
      // If no selection, work with the current line
      const textContent = editableElement.textContent || '';
      const lines = textContent.split('\n');
      selectedText = lines.join('\n');
    }
    
    // Apply list formatting with proper HTML structure
    const lines = selectedText.split('\n').filter(line => line.trim());
    
    const listItems = lines.map((line) => {
      const cleanLine = line.replace(/^[•\d+A-Z]\.?\s*/, '').trim();
      if (!cleanLine) return '';
      
      switch (listType) {
        case 'bullet':
          return `<li style="list-style-type: disc;">${cleanLine}</li>`;
        case 'numeric':
          return `<li>${cleanLine}</li>`;
        case 'alphabetic':
          return `<li>${cleanLine}</li>`;
        case 'stars':
          return `<li style="list-style: none; position: relative; padding-left: 0;"><span style="position: absolute; left: -20px; top: 0;">★</span>${cleanLine}</li>`;
        case 'arrows':
          return `<li style="list-style: none; position: relative; padding-left: 0;"><span style="position: absolute; left: -20px; top: 0;">→</span>${cleanLine}</li>`;
        default:
          return `<li style="list-style-type: disc;">${cleanLine}</li>`;
      }
    }).filter(Boolean);
    
    let listHTML = '';
    switch (listType) {
      case 'numeric':
        listHTML = `<ol style="padding-left: 30px; margin: 0; list-style-type: decimal;">${listItems.join('')}</ol>`;
        break;
      case 'alphabetic':
        listHTML = `<ol style="padding-left: 30px; margin: 0; list-style-type: upper-alpha;">${listItems.join('')}</ol>`;
        break;
      case 'bullet':
        listHTML = `<ul style="padding-left: 30px; margin: 0; list-style-type: disc;">${listItems.join('')}</ul>`;
        break;
      default:
        listHTML = `<ul style="padding-left: 30px; margin: 0; list-style-type: none;">${listItems.join('')}</ul>`;
    }
    
    editableElement.innerHTML = listHTML;
    
    // Trigger content update
    const event = new Event('blur', { bubbles: true });
    editableElement.dispatchEvent(event);
  };

  const handleAlignmentChange = (align) => {
    setAlignment(align);
    const alignCommand = align === 'left' ? 'justifyLeft' : align === 'center' ? 'justifyCenter' : 'justifyRight';
    applyFormatToSelection?.(alignCommand);
  };

  const handleTextColor = () => {
    const color = prompt('Enter color (hex, rgb, or name):');
    if (color) {
      applyFormatToSelection?.('foreColor', color);
    }
  };

  const handleHighlightColor = () => {
    const color = prompt('Enter highlight color (hex, rgb, or name):');
    if (color) {
      applyFormatToSelection?.('backColor', color);
    }
  };

  const handleInsertElement = (elementType) => {
    if (elementType === 'image') {
      handleImageUpload();
      return;
    }
    
    if (elementType === 'chart') {
      handleChartSelection();
      return;
    }
    
    if (elementType === 'table') {
      handleTableCreation();
      return;
    }
    
    const slide = slides[currentSlide];
    const elements = slide.elements || [];
    
    const newElement = {
      id: Date.now(),
      type: elementType,
      x: 100,
      y: 100,
      width: elementType === 'textbox' ? 200 : 250,
      height: elementType === 'textbox' ? 100 : 150,
      content: elementType === 'textbox' ? 'New text' : elementType === 'equation' ? 'E = mc²' : '',
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#000000',
      shapeType: elementType === 'shape' ? 'rectangle' : undefined,
      fill: elementType === 'shape' ? '#3B82F6' : undefined,
      stroke: elementType === 'shape' ? '#1E40AF' : undefined,
      strokeWidth: elementType === 'shape' ? 2 : undefined
    };
    
    const updatedElements = [...elements, newElement];
    updateSlide(currentSlide, { elements: updatedElements });
  };

  const handleTableCreation = () => {
    const rows = prompt('Enter number of rows (1-10):') || '3';
    const cols = prompt('Enter number of columns (1-10):') || '3';
    
    const numRows = Math.min(Math.max(parseInt(rows), 1), 10);
    const numCols = Math.min(Math.max(parseInt(cols), 1), 10);
    
    const slide = slides[currentSlide];
    const elements = slide.elements || [];
    
    const newElement = {
      id: Date.now(),
      type: 'table',
      x: 100,
      y: 100,
      width: numCols * 80,
      height: numRows * 40,
      rows: numRows,
      cols: numCols,
      data: Array(numRows).fill().map(() => Array(numCols).fill('Cell'))
    };
    
    const updatedElements = [...elements, newElement];
    updateSlide(currentSlide, { elements: updatedElements });
  };

  const handleChartSelection = () => {
    const chartType = prompt('Select chart type:\n1. Pie Chart\n2. Doughnut Chart\n3. Bar Chart\n4. Line Chart\n\nEnter 1, 2, 3, or 4:');
    
    const chartTypes = {
      '1': 'pie',
      '2': 'doughnut', 
      '3': 'bar',
      '4': 'line'
    };
    
    const selectedType = chartTypes[chartType] || 'pie';
    
    const slide = slides[currentSlide];
    const elements = slide.elements || [];
    
    const newElement = {
      id: Date.now(),
      type: 'chart',
      chartType: selectedType,
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Sample Data',
          color: '#3B82F6',
          data: [30, 45, 60, 40]
        }]
      },
      options: { legend: true, dataLabels: true },
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      title: 'Sample Chart'
    };
    
    const updatedElements = [...elements, newElement];
    updateSlide(currentSlide, { elements: updatedElements });
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const slide = slides[currentSlide];
          const elements = slide.elements || [];
          
          const newElement = {
            id: Date.now(),
            type: 'image',
            x: 100,
            y: 100,
            width: 300,
            height: 200,
            src: event.target.result,
            alt: file.name
          };
          
          const updatedElements = [...elements, newElement];
          updateSlide(currentSlide, { elements: updatedElements });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const listTypes = [
    { value: 'bullet', label: '• Bullet Points', icon: '•' },
    { value: 'numeric', label: '1. Numeric', icon: '1.' },
    { value: 'alphabetic', label: 'A. Alphabetic', icon: 'A.' },
    { value: 'stars', label: '★ Stars', icon: '★' },
    { value: 'arrows', label: '→ Arrows', icon: '→' }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-3 shadow-sm">
      <div className="flex items-start gap-4">
        
        {/* First Field - Font Controls */}
        <div className="flex flex-col gap-2 px-3 py-2 border-r border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-2">
            {/* Font Family Dropdown */}
            <div className="relative">
              <select
                value={fontFamily}
                onChange={(e) => handleFontFamilyChange(e.target.value)}
                className="w-36 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
                style={{ fontFamily: fontFamily }}
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size Dropdown */}
            <div className="relative">
              <select
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="w-14 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Controls */}
            <button
              onClick={handleUpperCase}
              className="w-8 h-8 flex items-center justify-center text-sm font-bold border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              title="Convert to uppercase"
            >
              <span className="flex items-center gap-0.5">
                A
                <span className="text-xs">↑</span>
              </span>
            </button>

            <button
              onClick={handleLowerCase}
              className="w-8 h-8 flex items-center justify-center text-sm font-bold border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              title="Convert to lowercase"
            >
              <span className="flex items-center gap-0.5">
                A
                <span className="text-xs">↓</span>
              </span>
            </button>
          </div>
          
          {/* Format Buttons Row */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleBold}
              className={`w-7 h-7 flex items-center justify-center text-sm font-bold border-0 rounded-sm transition-colors ${
                isBold 
                  ? 'bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-white' 
                  : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Bold (Ctrl+B)"
            >
              B
            </button>

            <button
              onClick={toggleItalic}
              className={`w-7 h-7 flex items-center justify-center text-sm font-bold italic border-0 rounded-sm transition-colors ${
                isItalic 
                  ? 'bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-white' 
                  : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Italic (Ctrl+I)"
            >
              I
            </button>

            <button
              onClick={toggleUnderline}
              className={`w-7 h-7 flex items-center justify-center text-sm font-bold underline border-0 rounded-sm transition-colors ${
                isUnderline 
                  ? 'bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-white' 
                  : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Underline (Ctrl+U)"
            >
              U
            </button>

            <button
              onClick={toggleStrikethrough}
              className={`w-7 h-7 flex items-center justify-center text-sm font-bold line-through border-0 rounded-sm transition-colors ${
                isStrikethrough 
                  ? 'bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-white' 
                  : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Strikethrough"
            >
              S
            </button>

            <button
              onClick={handleTextColor}
              className="w-8 h-8 flex items-center justify-center text-sm border-0 rounded-sm bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              title="Text Color"
            >
              <span className="relative">
                A
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></span>
              </span>
            </button>

            <button
              onClick={handleHighlightColor}
              className="w-8 h-8 flex items-center justify-center text-sm border-0 rounded-sm bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              title="Highlight Color"
            >
              <span className="relative">
                <span className="bg-yellow-300 px-1">A</span>
              </span>
            </button>
          </div>
        </div>

        {/* Second Field - Lists and Alignment */}
        <div className="flex flex-col gap-2 px-3 py-2 border-r border-gray-300 dark:border-gray-600">
          {/* Lists Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="w-20 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300 flex items-center justify-between"
              title="List Style"
            >
              <span>{listTypes.find(t => t.value === selectedList)?.icon}</span>
              <span className="text-xs">▼</span>
            </button>
            {showListDropdown && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm shadow-lg z-10">
                {listTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleListChange(type.value)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 flex items-center gap-2"
                  >
                    <span>{type.icon}</span>
                    <span className="text-xs">{type.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Alignment Buttons */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleAlignmentChange('left')}
              className={`w-7 h-7 flex items-center justify-center text-sm border border-gray-300 dark:border-gray-600 rounded-sm transition-colors ${
                alignment === 'left'
                  ? 'bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-white border-blue-400'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Align Left"
            >
              ≡
            </button>

            <button
              onClick={() => handleAlignmentChange('center')}
              className={`w-7 h-7 flex items-center justify-center text-sm border border-gray-300 dark:border-gray-600 rounded-sm transition-colors ${
                alignment === 'center'
                  ? 'bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-white border-blue-400'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Align Center"
            >
              ≣
            </button>

            <button
              onClick={() => handleAlignmentChange('right')}
              className={`w-7 h-7 flex items-center justify-center text-sm border border-gray-300 dark:border-gray-600 rounded-sm transition-colors ${
                alignment === 'right'
                  ? 'bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-white border-blue-400'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Align Right"
            >
              ≡
            </button>
          </div>
        </div>



      </div>
    </div>
  );
};

export default TextFormattingRibbon;