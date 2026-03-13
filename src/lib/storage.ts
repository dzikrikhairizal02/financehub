// Safe storage utilities for production environment
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      
      // Try localStorage first
      let value = localStorage.getItem(key);
      if (value) return value;
      
      // Fallback to sessionStorage
      value = sessionStorage.getItem(key);
      if (value) return value;
      
      return null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      // Save to both localStorage and sessionStorage for reliability
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
      
      return true;
    } catch (error) {
      console.error('Error writing to storage:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.clear();
      sessionStorage.clear();
      
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
};

export const PIN_KEY = 'app_pin';
export const SESSION_KEY = 'auth_session';
