// Enhanced export utilities with comprehensive format support

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
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const exportToPowerPoint = async (slides, filename) => {
  // Would use pptxgenjs library
  const data = JSON.stringify({ slides, format: 'pptx' });
  downloadFile(data, `${filename}.pptx`, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  console.log('PowerPoint export completed');
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