import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function SplashScreen({ onLoadingComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (typeof onLoadingComplete === 'function') onLoadingComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${isDark ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className="flex flex-col items-center text-center">
        <img
          src="/DOCS-LOGO-final-transparent.png"
          alt="Company logo"
          className="w-24 h-24 mb-6 object-contain"
        />

        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          EtherX PPT
        </h1>

        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Professional Presentations Made Simple
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;