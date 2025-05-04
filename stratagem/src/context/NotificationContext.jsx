import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { checkNotificationPermission, checkAndSendReminders } from '../utils/notificationUtils';
import { taskAPI } from '../api';

// Create notification context
const NotificationContext = createContext(null);

// Custom hook for using notification context
export const useNotification = () => useContext(NotificationContext);

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check notification permission on initial load
  useEffect(() => {
    const checkPermission = async () => {
      const permission = await checkNotificationPermission();
      setHasPermission(permission);
    };

    checkPermission();
  }, []);

  // Fetch tasks from real API
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await taskAPI.getAllTasks();
        
        // Transform tasks to the format needed for notifications
        const formattedTasks = response.data.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          projectId: task.project._id,
          projectTitle: task.project.title,
          assignees: task.assignees.map(assignee => assignee._id),
          dueDate: task.dueDate,
          completed: task.completed,
          priority: task.priority
        }));
        
        setTasks(formattedTasks);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  // Check for reminders when tasks change
  useEffect(() => {
    if (!user || tasks.length === 0 || loading) return;
    
    // Initial check for tasks due within 24 hours
    const initialReminders = checkAndSendReminders(tasks, user);
    setReminders(initialReminders);
    
    // Set up interval to check for reminders every hour
    const intervalId = setInterval(() => {
      const updatedReminders = checkAndSendReminders(tasks, user);
      setReminders(updatedReminders);
    }, 3600000); // Check every hour (3600000 ms)
    
    return () => clearInterval(intervalId);
  }, [tasks, user, loading]);

  // Function to manually send a reminder for a specific task
  const sendReminder = async (taskId, recipientId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error(`Task with ID ${taskId} not found`);
      return false;
    }
    
    // In a real app, you would send the reminder to the specific recipient
    // For now, we'll just send to the current user
    return await checkAndSendReminders([task], user).length > 0;
  };

  // Function to mark a reminder as read/dismissed
  const dismissReminder = (taskId) => {
    setReminders(prevReminders => 
      prevReminders.filter(reminder => reminder.id !== taskId)
    );
  };

  // Function to refresh tasks from the API
  const refreshTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await taskAPI.getAllTasks();
      
      // Transform tasks to the format needed for notifications
      const formattedTasks = response.data.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        projectId: task.project._id,
        projectTitle: task.project.title,
        assignees: task.assignees.map(assignee => assignee._id),
        dueDate: task.dueDate,
        completed: task.completed,
        priority: task.priority
      }));
      
      setTasks(formattedTasks);
      setError(null);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      setError('Failed to refresh tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    hasPermission,
    reminders,
    tasks,
    loading,
    error,
    sendReminder,
    dismissReminder,
    refreshTasks,
    requestPermission: checkNotificationPermission
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;