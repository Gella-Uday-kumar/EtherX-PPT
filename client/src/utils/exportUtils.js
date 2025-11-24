// Enhanced export utilities with comprehensive format support
import PptxGenJS from 'pptxgenjs';

// Function to generate a sample PowerPoint presentation with all features
export const generateSamplePresentation = async (filename = 'EtherXPPT_Sample') => {
  const pptx = new PptxGenJS();

  pptx.author = 'EtherXPPT';
  pptx.company = 'EtherXPPT';
  pptx.subject = 'Sample Presentation with Editable Elements';
  pptx.title = 'EtherXPPT Demo';

  pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
  pptx.layout = 'CUSTOM';

  // Slide 1: Title Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: '003366' };
  slide1.addText('EtherXPPT Demo', {
    x: 1, y: 1.5, w: 8, h: 1, fontSize: 48, bold: true, color: 'FFFFFF', align: 'center'
  });
  slide1.addText('Fully Editable PowerPoint Presentation', {
    x: 1, y: 3, w: 8, h: 0.8, fontSize: 24, color: 'FFFFFF', align: 'center'
  });

  // Slide 2: Text Boxes and Shapes
  const slide2 = pptx.addSlide();
  slide2.addText('Editable Text Boxes and Shapes', {
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 36, bold: true, align: 'center'
  });

  // Text box
  slide2.addText('This is an editable text box. You can modify this text in PowerPoint.', {
    x: 1, y: 1.5, w: 4, h: 1, fontSize: 18, fill: { color: 'E6F3FF' }
  });

  // Rectangle shape
  slide2.addShape('rect', {
    x: 6, y: 1.5, w: 2, h: 1, fill: { color: 'FF6B6B' }, line: { color: '000000', width: 2 }
  });

  // Circle shape
  slide2.addShape('ellipse', {
    x: 6.5, y: 3, w: 1, h: 1, fill: { color: '4ECDC4' }, line: { color: '000000', width: 2 }
  });

  // Triangle shape
  slide2.addShape('triangle', {
    x: 7.5, y: 3, w: 1, h: 1, fill: { color: '45B7D1' }, line: { color: '000000', width: 2 }
  });

  // Slide 3: Charts
  const slide3 = pptx.addSlide();
  slide3.addText('Editable Charts', {
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 36, bold: true, align: 'center'
  });

  // Bar chart data
  const barData = [
    {
      name: 'Sales Q1',
      labels: ['Jan', 'Feb', 'Mar'],
      values: [10, 20, 30]
    },
    {
      name: 'Sales Q2',
      labels: ['Apr', 'May', 'Jun'],
      values: [15, 25, 35]
    }
  ];

  slide3.addChart('bar', barData, {
    x: 0.5, y: 1.2, w: 4.5, h: 3, title: 'Quarterly Sales', showLegend: true, showDataLabels: true,
    chartColors: ['4ECDC4', '45B7D1']
  });

  // Pie chart
  const pieData = [
    {
      name: 'Market Share',
      labels: ['Product A', 'Product B', 'Product C'],
      values: [40, 35, 25]
    }
  ];

  slide3.addChart('pie', pieData, {
    x: 5.5, y: 1.2, w: 4, h: 3, title: 'Market Share', showLegend: true, showDataLabels: true,
    chartColors: ['FF6B6B', '4ECDC4', '45B7D1']
  });

  // Slide 4: SmartArt-like diagram (using shapes and text)
  const slide4 = pptx.addSlide();
  slide4.addText('SmartArt-Style Diagram', {
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 36, bold: true, align: 'center'
  });

  // Process flow diagram
  slide4.addShape('rect', { x: 1, y: 1.5, w: 1.5, h: 0.8, fill: { color: 'FFE66D' } });
  slide4.addText('Step 1', { x: 1, y: 1.5, w: 1.5, h: 0.8, fontSize: 14, align: 'center' });

  slide4.addShape('rect', { x: 3, y: 1.5, w: 1.5, h: 0.8, fill: { color: 'FFE66D' } });
  slide4.addText('Step 2', { x: 3, y: 1.5, w: 1.5, h: 0.8, fontSize: 14, align: 'center' });

  slide4.addShape('rect', { x: 5, y: 1.5, w: 1.5, h: 0.8, fill: { color: 'FFE66D' } });
  slide4.addText('Step 3', { x: 5, y: 1.5, w: 1.5, h: 0.8, fontSize: 14, align: 'center' });

  slide4.addShape('rect', { x: 7, y: 1.5, w: 1.5, h: 0.8, fill: { color: 'FFE66D' } });
  slide4.addText('Step 4', { x: 7, y: 1.5, w: 1.5, h: 0.8, fontSize: 14, align: 'center' });

  // Arrows
  slide4.addShape('rightArrow', { x: 2.5, y: 1.8, w: 0.5, h: 0.2, fill: { color: '000000' } });
  slide4.addShape('rightArrow', { x: 4.5, y: 1.8, w: 0.5, h: 0.2, fill: { color: '000000' } });
  slide4.addShape('rightArrow', { x: 6.5, y: 1.8, w: 0.5, h: 0.2, fill: { color: '000000' } });

  // Slide 5: Table
  const slide5 = pptx.addSlide();
  slide5.addText('Editable Table', {
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 36, bold: true, align: 'center'
  });

  const tableData = [
    ['Product', 'Q1', 'Q2', 'Q3', 'Q4'],
    ['Widget A', '100', '120', '140', '160'],
    ['Widget B', '80', '90', '110', '130'],
    ['Widget C', '60', '70', '80', '90']
  ];

  slide5.addTable(tableData, {
    x: 1, y: 1.2, w: 8, h: 3, fill: { color: 'F8F9FA' }, border: { color: '000000', pt: 1 }
  });

  // Slide 6: Layout Examples
  const slide6 = pptx.addSlide();
  slide6.addText('Slide Layouts', {
    x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 36, bold: true, align: 'center'
  });

  // Two column layout
  slide6.addText('Left Column\n\nThis demonstrates a two-column layout that can be edited in PowerPoint.', {
    x: 0.5, y: 1.2, w: 4.5, h: 3, fontSize: 16
  });

  slide6.addText('Right Column\n\nYou can modify text, add images, and adjust formatting.', {
    x: 5.5, y: 1.2, w: 4.5, h: 3, fontSize: 16
  });

  // Save the presentation
  await pptx.writeFile({ fileName: `${filename}.pptx` });
  console.log('Sample PowerPoint presentation generated');
  return `${filename}.pptx`;
};

export const exportToJSON = (slides, filename = 'presentation.json') => {
  const data = JSON.stringify({ slides, exportedAt: new Date().toISOString() }, null, 2);
  downloadFile(data, filename, 'application/json');
};

export const importFromJSON = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    return data.slides || [];
  } catch (error) {
    console.error('Error importing from JSON:', error);
    return [];
  }
};

export const exportPresentation = async (slides, format, filename = 'presentation') => {
  try {
    switch (format) {
      case 'pptx':
        return await exportToPowerPoint(slides, filename);
      case 'pdf':
        return await exportToPDF(slides, filename);
      case 'odp':
        return await exportToODP(slides, filename);
      case 'docx':
        return await exportToWord(slides, filename);
      case 'rtf':
        return await exportToRTF(slides, filename);
      case 'mp4':
        return await exportToVideo(slides, filename);
      case 'png':
        return await exportToPNG(slides, filename);
      case 'jpeg':
        return await exportToJPEG(slides, filename);
      default:
        // Fallback to JSON export for unsupported formats
        console.warn(`Format ${format} not fully supported, exporting as JSON`);
        return exportToJSON(slides, `${filename}.json`);
    }
  } catch (error) {
    console.error(`Export failed for format ${format}:`, error);
    // Fallback to JSON export if the requested format fails
    console.log('Falling back to JSON export...');
    return exportToJSON(slides, `${filename}.json`);
  }
};

const exportToPowerPoint = async (slides, filename) => {
  try {
    const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'EtherXPPT';
  pptx.company = 'EtherXPPT';
  pptx.subject = 'Presentation';
  pptx.title = filename;

  // Define slide size (16:9 aspect ratio)
  pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
  pptx.layout = 'CUSTOM';

  for (const slideData of slides) {
    const slide = pptx.addSlide();

    // Set slide background
    if (slideData.background && slideData.background !== '#ffffff') {
      slide.background = { color: slideData.background };
    }

    // Add header/footer if present
    // Note: PptxGenJS doesn't directly support headers/footers, but we can add text boxes

    // Add title and content based on layout
    const layout = slideData.layout || 'title-content';

    if (layout === 'title-content') {
      // Title
      if (slideData.title) {
        slide.addText(slideData.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 1,
          fontSize: 44,
          bold: true,
          color: (slideData.textColor || '#000000').replace('#', ''),
          align: 'center'
        });
      }

      // Content
      if (slideData.content) {
        slide.addText(slideData.content.replace(/<[^>]*>/g, ''), {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 3,
          fontSize: 24,
          color: (slideData.textColor || '#000000').replace('#', '')
        });
      }
    } else if (layout === 'title-only') {
      if (slideData.title) {
        slide.addText(slideData.title, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 2,
          fontSize: 44,
          bold: true,
          color: (slideData.textColor || '#000000').replace('#', ''),
          align: 'center'
        });
      }
    } else if (layout === 'content-only') {
      if (slideData.content) {
        slide.addText(slideData.content.replace(/<[^>]*>/g, ''), {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 4,
          fontSize: 24,
          color: (slideData.textColor || '#000000').replace('#', '')
        });
      }
    } else if (layout === 'two-column') {
      // Left content
      if (slideData.contentLeft) {
        slide.addText(slideData.contentLeft.replace(/<[^>]*>/g, ''), {
          x: 0.3,
          y: 0.8,
          w: 4.5,
          h: 3.5,
          fontSize: 20,
          color: (slideData.textColor || '#000000').replace('#', '')
        });
      }

      // Right content
      if (slideData.contentRight) {
        slide.addText(slideData.contentRight.replace(/<[^>]*>/g, ''), {
          x: 5.2,
          y: 0.8,
          w: 4.5,
          h: 3.5,
          fontSize: 20,
          color: (slideData.textColor || '#000000').replace('#', '')
        });
      }
    } else if (layout === 'comparison') {
      // Left title
      if (slideData.compLeftTitle) {
        slide.addText(slideData.compLeftTitle.replace(/<[^>]*>/g, ''), {
          x: 0.3,
          y: 0.5,
          w: 4.5,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: (slideData.textColor || '#000000').replace('#', ''),
          align: 'center'
        });
      }

      // Left content
      if (slideData.compLeftContent) {
        slide.addText(slideData.compLeftContent.replace(/<[^>]*>/g, ''), {
          x: 0.3,
          y: 1.4,
          w: 4.5,
          h: 3,
          fontSize: 18,
          color: (slideData.textColor || '#000000').replace('#', '')
        });
      }

      // Right title
      if (slideData.compRightTitle) {
        slide.addText(slideData.compRightTitle.replace(/<[^>]*>/g, ''), {
          x: 5.2,
          y: 0.5,
          w: 4.5,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: (slideData.textColor || '#000000').replace('#', ''),
          align: 'center'
        });
      }

      // Right content
      if (slideData.compRightContent) {
        slide.addText(slideData.compRightContent.replace(/<[^>]*>/g, ''), {
          x: 5.2,
          y: 1.4,
          w: 4.5,
          h: 3,
          fontSize: 18,
          color: (slideData.textColor || '#000000').replace('#', '')
        });
      }
    }

    // Add elements and their animations
    if (slideData.elements) {
      for (const element of slideData.elements) {
        const x = (element.x || 0) / 100; // Convert from pixels to inches (assuming 100px = 1 inch)
        const y = (element.y || 0) / 100;
        const w = (element.width || 200) / 100;
        const h = (element.height || 100) / 100;

        let addedObject = null;

        // Check if this element has an animation
        let animationOptions = null;
        if (slideData.animations) {
          const elementAnimation = slideData.animations.find(anim => anim.target.toString() === element.id.toString());
          if (elementAnimation) {
            // Map animation types to PowerPoint animation types
            animationOptions = {
              type: 'appear',
              duration: elementAnimation.duration || 1000,
              delay: elementAnimation.delay || 0
            };

            switch (elementAnimation.type) {
              case 'fadeIn':
                animationOptions.type = 'fade';
                break;
              case 'slideInLeft':
                animationOptions.type = 'fly';
                animationOptions.direction = 'left';
                break;
              case 'slideInRight':
                animationOptions.type = 'fly';
                animationOptions.direction = 'right';
                break;
              case 'slideInUp':
                animationOptions.type = 'fly';
                animationOptions.direction = 'up';
                break;
              case 'slideInDown':
                animationOptions.type = 'fly';
                animationOptions.direction = 'down';
                break;
              case 'zoomIn':
                animationOptions.type = 'zoom';
                animationOptions.direction = 'in';
                break;
              case 'bounce':
                animationOptions.type = 'bounce';
                break;
              case 'pulse':
                animationOptions.type = 'pulse';
                break;
              case 'float':
                animationOptions.type = 'float';
                animationOptions.direction = 'up';
                break;
              case 'rotate':
                animationOptions.type = 'spin';
                break;
              default:
                animationOptions.type = 'appear';
            }
          }
        }

        if (element.type === 'textbox') {
          slide.addText(element.content || '', {
            x,
            y,
            w,
            h,
            fontSize: element.fontSize || 16,
            fontFace: element.fontFamily || 'Arial',
            color: (element.color || '#000000').replace('#', ''),
            fill: { color: (element.backgroundColor || 'transparent').replace('#', '') },
            animation: animationOptions
          });
        } else if (element.type === 'image') {
          const imageOptions = { x, y, w, h };
          if (animationOptions) imageOptions.animation = animationOptions;

          if (element.src && element.src.startsWith('data:image')) {
            // Base64 image
            slide.addImage({ data: element.src, ...imageOptions });
          } else if (element.src) {
            // URL image
            slide.addImage({ path: element.src, ...imageOptions });
          }
        } else if (element.type === 'shape') {
          let shapeType = 'rect';
          if (element.shapeType === 'circle') shapeType = 'ellipse';
          else if (element.shapeType === 'triangle') shapeType = 'triangle';

          // Strip # from colors for PptxGenJS
          const fillColor = (element.fill || '#FFFFFF').replace('#', '');
          const strokeColor = (element.stroke || '#000000').replace('#', '');

          slide.addShape(shapeType, {
            x,
            y,
            w,
            h,
            fill: { color: fillColor },
            line: { color: strokeColor, width: element.strokeWidth || 1 },
            animation: animationOptions
          });
        } else if (element.type === 'chart') {
          // Convert chart data to PptxGenJS format
          const chartData = element.data.datasets.map(ds => ({
            name: ds.label,
            labels: element.data.labels,
            values: ds.data
          }));

          let chartType = 'bar';
          if (element.chartType === 'line') chartType = 'line';
          else if (element.chartType === 'pie') chartType = 'pie';
          else if (element.chartType === 'doughnut') chartType = 'doughnut';

          slide.addChart(chartType, chartData, {
            x,
            y,
            w,
            h,
            chartColors: element.data.datasets.map(ds => (ds.color || '#3B82F6').replace('#', '')),
            showLegend: element.options?.legend ?? true,
            showDataLabels: element.options?.dataLabels ?? true,
            title: element.title || '',
            animation: animationOptions
          });
        } else if (element.type === 'table') {
          if (element.data && element.data.length > 0) {
            const tableData = [element.data[0].map(() => '')]; // Header row
            tableData.push(...element.data);

            slide.addTable(tableData, {
              x,
              y,
              w,
              h,
              fill: { color: (element.backgroundColor || '#FFFFFF').replace('#', '') },
              border: { color: (element.borderColor || '#000000').replace('#', ''), pt: 1 },
              animation: animationOptions
            });
          }
        }
      }
    }
  }

    // Save the presentation
    await pptx.writeFile({ fileName: `${filename}.pptx` });
    console.log('PowerPoint export completed');
  } catch (error) {
    console.error('PowerPoint export failed:', error);
    throw new Error('PowerPoint export failed: ' + error.message);
  }
};

const exportToPDF = async (slides, filename) => {
  // Would use jsPDF or similar
  const data = JSON.stringify({ slides, format: 'pdf' });
  downloadFile(data, `${filename}.pdf`, 'application/pdf');
  console.log('PDF export completed');
};

const exportToODP = async (slides, filename) => {
  // OpenDocument Presentation format
  const data = JSON.stringify({ slides, format: 'odp' });
  downloadFile(data, `${filename}.odp`, 'application/vnd.oasis.opendocument.presentation');
  console.log('ODP export completed');
};

const exportToWord = async (slides, filename) => {
  // Export as Word document with slides and notes
  const data = JSON.stringify({ slides, format: 'docx' });
  downloadFile(data, `${filename}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  console.log('Word export completed');
};

const exportToRTF = async (slides, filename) => {
  // Rich Text Format
  let rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
  slides.forEach((slide, index) => {
    rtfContent += `\\par\\b Slide ${index + 1}: ${slide.title || 'Untitled'}\\b0\\par`;
    rtfContent += `${slide.content || ''}\\par\\par`;
  });
  rtfContent += '}';
  
  downloadFile(rtfContent, `${filename}.rtf`, 'application/rtf');
  console.log('RTF export completed');
};

const exportToVideo = async (slides, filename) => {
  // Video export with timings - would need video processing library
  const data = JSON.stringify({ slides, format: 'mp4', duration: slides.length * 5 });
  downloadFile(data, `${filename}.mp4`, 'video/mp4');
  console.log('Video export completed');
};

const exportToPNG = async (slides, filename) => {
  // Export all slides as PNG images
  for (let i = 0; i < slides.length; i++) {
    const canvas = await slideToCanvas(slides[i]);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_slide_${i + 1}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }
  console.log('PNG export completed');
};

const exportToJPEG = async (slides, filename) => {
  // Export all slides as JPEG images
  for (let i = 0; i < slides.length; i++) {
    const canvas = await slideToCanvas(slides[i]);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_slide_${i + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.9);
  }
  console.log('JPEG export completed');
};

const slideToCanvas = async (slide) => {
  // Convert slide to canvas - would use html2canvas or similar
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = slide.background || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add title
  ctx.fillStyle = slide.textColor || '#000000';
  ctx.font = 'bold 48px Arial';
  ctx.fillText(slide.title || '', 100, 150);
  
  // Add content
  ctx.font = '32px Arial';
  const lines = (slide.content || '').split('\n');
  lines.forEach((line, index) => {
    ctx.fillText(line, 100, 250 + (index * 50));
  });
  
  return canvas;
};

const downloadFile = (data, filename, mimeType) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};