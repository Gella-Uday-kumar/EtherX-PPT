import React from 'react';
import { RiFilePptLine, RiFileTextLine, RiImageLine, RiVideoLine } from 'react-icons/ri';

const ExportMenu = ({ isOpen, onClose, onExport }) => {
  if (!isOpen) return null;

  const handleExport = (format) => {
    onExport(format);
    onClose();
  };

  const exportOptions = [
    { format: 'pptx', label: 'PowerPoint (.pptx)', icon: RiFilePptLine },
    { format: 'pdf', label: 'PDF Document (.pdf)', icon: RiFileTextLine },
    { format: 'odp', label: 'OpenDocument (.odp)', icon: RiFilePptLine },
    { format: 'docx', label: 'Word Document (.docx)', icon: RiFileTextLine },
    { format: 'rtf', label: 'Rich Text (.rtf)', icon: RiFileTextLine },
    { format: 'mp4', label: 'MP4 Video (.mp4)', icon: RiVideoLine },
    { format: 'png', label: 'PNG Images (.png)', icon: RiImageLine },
    { format: 'jpeg', label: 'JPEG Images (.jpeg)', icon: RiImageLine }
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto">
        <div className="py-1">
          {exportOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <IconComponent className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ExportMenu;