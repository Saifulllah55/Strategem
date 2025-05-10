import { createContext, useContext, useState, useEffect } from 'react';
import { initializeLocalStorage } from '../utils/localStorageUtils';

// Create app context
const AppContext = createContext(null);

// Custom hook for using app context
export const useApp = () => useContext(AppContext);

// App provider component
export const AppProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize local storage with sample data on component mount
  useEffect(() => {
    try {
      initializeLocalStorage();
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing local storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Define the context value
  const value = {
    initialized,
    isLoading,
    isDarkMode,
    toggleDarkMode
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;