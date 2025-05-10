import { createContext, useContext, useState, useEffect } from 'react';
import { projectAPI } from '../api';

// Create app context
const AppContext = createContext(null);

// Custom hook for using app context
export const useApp = () => useContext(AppContext);

// App provider component
export const AppProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Initialize app on component mount
  useEffect(() => {
    try {
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Check for projects due within 24 hours
  useEffect(() => {
    const checkDueProjects = async () => {
      try {
        const response = await projectAPI.getAllProjects();
        if (response && response.data) {
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setHours(now.getHours() + 24);
          
          const projectsDueSoon = response.data.filter(project => {
            if (!project.dueDate) return false;
            const dueDate = new Date(project.dueDate);
            return dueDate >= now && dueDate <= tomorrow;
          });
          
          const newNotifications = projectsDueSoon.map(project => ({
            id: project._id,
            title: 'Project Due Soon',
            message: `${project.name} is due within 24 hours`,
            timestamp: new Date().toISOString(),
            type: 'project_due',
            read: false,
            dueDate: project.dueDate,
            projectId: project._id
          }));
          
          setNotifications(newNotifications);
        }
      } catch (error) {
        console.error('Error fetching due projects:', error);
      }
    };
    
    // Check immediately and then every hour
    checkDueProjects();
    const interval = setInterval(checkDueProjects, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  // Define the context value
  const value = {
    initialized,
    isLoading,
    isDarkMode,
    toggleDarkMode,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;