class UserDataService {
  constructor() {
    this.baseKey = 'etherxppt_user_';
  }

  getUserKey(userId, dataType) {
    return `${this.baseKey}${userId}_${dataType}`;
  }

  // Save presentation to history
  saveToHistory(userId, presentationData) {
    const key = this.getUserKey(userId, 'history');
    const history = this.getHistory(userId);
    
    const newEntry = {
      id: Date.now(),
      name: presentationData.title || 'Untitled Presentation',
      slides: presentationData.slides,
      lastModified: new Date().toISOString(),
      createdAt: presentationData.createdAt || new Date().toISOString()
    };

    // Remove if already exists and add to beginning
    const filtered = history.filter(item => item.name !== newEntry.name);
    const updated = [newEntry, ...filtered].slice(0, 50); // Keep last 50

    localStorage.setItem(key, JSON.stringify(updated));
    return newEntry;
  }

  // Get user history
  getHistory(userId) {
    const key = this.getUserKey(userId, 'history');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Add to favorites
  addToFavorites(userId, presentationData) {
    const key = this.getUserKey(userId, 'favorites');
    const favorites = this.getFavorites(userId);
    
    const newFavorite = {
      id: Date.now(),
      name: presentationData.title || 'Untitled Presentation',
      slides: presentationData.slides,
      addedAt: new Date().toISOString(),
      lastModified: presentationData.lastModified || new Date().toISOString()
    };

    // Check if already exists
    if (!favorites.find(fav => fav.name === newFavorite.name)) {
      const updated = [newFavorite, ...favorites];
      localStorage.setItem(key, JSON.stringify(updated));
      return newFavorite;
    }
    return null;
  }

  // Remove from favorites
  removeFromFavorites(userId, presentationId) {
    const key = this.getUserKey(userId, 'favorites');
    const favorites = this.getFavorites(userId);
    const updated = favorites.filter(fav => fav.id !== presentationId);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }

  // Get user favorites
  getFavorites(userId) {
    const key = this.getUserKey(userId, 'favorites');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Save current presentation
  savePresentation(userId, presentationData) {
    // Save to history automatically
    this.saveToHistory(userId, presentationData);
    
    // Also save as current work
    const key = this.getUserKey(userId, 'current');
    localStorage.setItem(key, JSON.stringify(presentationData));
  }

  // Get current presentation
  getCurrentPresentation(userId) {
    const key = this.getUserKey(userId, 'current');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Clear all user data
  clearUserData(userId) {
    const keys = ['history', 'favorites', 'current'];
    keys.forEach(type => {
      const key = this.getUserKey(userId, type);
      localStorage.removeItem(key);
    });
  }
}

export default new UserDataService();