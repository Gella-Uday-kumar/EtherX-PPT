import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPPTX = (slides) => {
  const pptx = new pptxgen();
  
  slides.forEach((slide, index) => {
    const pptxSlide = pptx.addSlide();
    
    // Set background
    if (slide.background && slide.background !== '#ffffff') {
      pptxSlide.background = { color: slide.background.replace('#', '') };
    }
    
    // Add title
    if (slide.title && slide.title !== 'Click to add title') {
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 24,
        bold: true,
        color: slide.textColor?.replace('#', '') || '000000'
      });
    }
    
    // Add content
    if (slide.content && slide.content !== 'Click to add content') {
      pptxSlide.addText(slide.content, {
        x: 0.5,
        y: 2,
        w: 9,
        h: 4,
        fontSize: 16,
        color: slide.textColor?.replace('#', '') || '000000'
      });
    }
    
    // Add elements
    slide.elements?.forEach(element => {
      if (element.type === 'text') {
        pptxSlide.addText(element.content, {
          x: element.x / 100,
          y: element.y / 100,
          w: element.width / 100,
          h: element.height / 100,
          fontSize: element.style?.fontSize || 16,
          color: element.style?.color?.replace('#', '') || '000000'
        });
      } else if (element.type === 'shape') {
        pptxSlide.addShape(pptx.ShapeType.rect, {
          x: element.x / 100,
          y: element.y / 100,
          w: element.width / 100,
          h: element.height / 100,
          fill: element.style?.fill?.replace('#', '') || 'FFFFFF',
          line: { color: element.style?.stroke?.replace('#', '') || '000000' }
        });
      }
    });
  });
  
  pptx.writeFile({ fileName: 'presentation.pptx' });
};

export const exportToPDF = async (slides) => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  for (let i = 0; i < slides.length; i++) {
    if (i > 0) pdf.addPage();
    
    const slide = slides[i];
    
    // Add title
    if (slide.title && slide.title !== 'Click to add title') {
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text(slide.title, 20, 30);
    }
    
    // Add content
    if (slide.content && slide.content !== 'Click to add content') {
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'normal');
      const lines = pdf.splitTextToSize(slide.content, pageWidth - 40);
      pdf.text(lines, 20, 50);
    }
    
    // Add slide number
    pdf.setFontSize(10);
    pdf.text(`${i + 1}`, pageWidth - 20, pageHeight - 10);
  }
  
  pdf.save('presentation.pdf');
};

export const exportSlideAsImage = async (slideElement) => {
  if (!slideElement) return;
  
  try {
    const canvas = await html2canvas(slideElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    });
    
    const link = document.createElement('a');
    link.download = 'slide.png';
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Error exporting slide:', error);
  }
};

export const printPresentation = () => {
  window.print();
};