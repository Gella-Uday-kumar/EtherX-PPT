import React, { useState } from 'react';

const AddInsPanel = () => {
  const [installedAddins, setInstalledAddins] = useState(['word-cloud', 'icons-pack']);
  const [searchTerm, setSearchTerm] = useState('');

  const availableAddins = [
    {
      id: 'word-cloud',
      name: 'Word Cloud Generator',
      description: 'Create beautiful word clouds from text',
      icon: '☁️',
      version: '1.2.0',
      category: 'Visualization',
      installed: true
    },
    {
      id: 'icons-pack',
      name: 'Professional Icons Pack',
      description: '1000+ professional icons for presentations',
      icon: '🎨',
      version: '2.1.0',
      category: 'Design',
      installed: true
    },
    {
      id: 'qr-generator',
      name: 'QR Code Generator',
      description: 'Generate QR codes for links and text',
      icon: '📱',
      version: '1.0.5',
      category: 'Utility',
      installed: false
    },
    {
      id: 'math-equations',
      name: 'Math Equations',
      description: 'Insert complex mathematical equations',
      icon: '🧮',
      version: '1.3.2',
      category: 'Education',
      installed: false
    },
    {
      id: 'maps-embed',
      name: 'Interactive Maps',
      description: 'Embed interactive maps and locations',
      icon: '🗺️',
      version: '1.1.0',
      category: 'Geography',
      installed: false
    },
    {
      id: 'social-media',
      name: 'Social Media Pack',
      description: 'Embed social media feeds and posts',
      icon: '📲',
      version: '1.4.1',
      category: 'Social',
      installed: false
    }
  ];

  const categories = ['All', 'Visualization', 'Design', 'Utility', 'Education', 'Geography', 'Social'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredAddins = availableAddins.filter(addin => {
    const matchesSearch = addin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || addin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (addinId) => {
    if (!installedAddins.includes(addinId)) {
      setInstalledAddins([...installedAddins, addinId]);
      // Simulate installation
      setTimeout(() => {
        alert(`${availableAddins.find(a => a.id === addinId)?.name} installed successfully!`);
      }, 1000);
    }
  };

  const handleUninstall = (addinId) => {
    setInstalledAddins(installedAddins.filter(id => id !== addinId));
    alert(`Add-in removed successfully!`);
  };

  const handleUseAddin = (addinId) => {
    const addin = availableAddins.find(a => a.id === addinId);
    
    switch (addinId) {
      case 'word-cloud':
        const text = prompt('Enter text for word cloud:');
        if (text) {
          window.dispatchEvent(new CustomEvent('insertWordCloud', { detail: text }));
        }
        break;
      case 'icons-pack':
        window.dispatchEvent(new CustomEvent('openIconPicker'));
        break;
      case 'qr-generator':
        const qrText = prompt('Enter text or URL for QR code:');
        if (qrText) {
          window.dispatchEvent(new CustomEvent('insertQRCode', { detail: qrText }));
        }
        break;
      case 'math-equations':
        const equation = prompt('Enter LaTeX equation:');
        if (equation) {
          window.dispatchEvent(new CustomEvent('insertEquation', { detail: equation }));
        }
        break;
      case 'maps-embed':
        const location = prompt('Enter location or coordinates:');
        if (location) {
          window.dispatchEvent(new CustomEvent('insertMap', { detail: location }));
        }
        break;
      case 'social-media':
        const socialUrl = prompt('Enter social media post URL:');
        if (socialUrl) {
          window.dispatchEvent(new CustomEvent('insertSocialPost', { detail: socialUrl }));
        }
        break;
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Add-ins Marketplace
      </h3>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search add-ins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Categories */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Installed Add-ins */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Installed ({installedAddins.length})
        </h4>
        <div className="space-y-2">
          {availableAddins
            .filter(addin => installedAddins.includes(addin.id))
            .map(addin => (
              <div key={addin.id} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{addin.icon}</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-green-800 dark:text-green-300">
                        {addin.name}
                      </h5>
                      <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                        {addin.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUseAddin(addin.id)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => handleUninstall(addin.id)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Available Add-ins */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Available Add-ins
        </h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAddins
            .filter(addin => !installedAddins.includes(addin.id))
            .map(addin => (
              <div key={addin.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{addin.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-800 dark:text-white">
                        {addin.name}
                      </h5>
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                        {addin.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {addin.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        v{addin.version}
                      </span>
                      <button
                        onClick={() => handleInstall(addin.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Install
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          📊 Marketplace Stats
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-medium text-gray-800 dark:text-white">
              {availableAddins.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Add-ins</div>
          </div>
          <div>
            <div className="font-medium text-gray-800 dark:text-white">
              {installedAddins.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Installed</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
          🧩 Add-ins Guide
        </h4>
        <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
          <li>• Browse and install add-ins from marketplace</li>
          <li>• Use installed add-ins to enhance slides</li>
          <li>• Filter by category or search by name</li>
          <li>• Remove add-ins you no longer need</li>
        </ul>
      </div>
    </div>
  );
};

export default AddInsPanel;