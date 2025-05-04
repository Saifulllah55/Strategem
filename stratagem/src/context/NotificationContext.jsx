import { createContext, useContext, useState, useEffect } from 'react';
import { 
  checkNotificationPermission, 
  checkAndTriggerReminders, 
  sendNotification 
} from '../utils/notificationUtils';
import { taskAPI, reminderAPI, projectAPI } from '../api';

// Create notification context
const NotificationContext = createContext(null);

// Custom hook for using notification context
export const useNotification = () => useContext(NotificationContext);

// Notification provider component
export const NotificationProvider = ({ children }) => {
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

  // Fetch tasks and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksResponse = await taskAPI.getAllTasks();
        const projectsResponse = await projectAPI.getAllProjects();
        
        const projects = projectsResponse.data || [];
        
        // Transform tasks to the format needed for notifications
        const formattedTasks = tasksResponse.data.map(task => {
          const project = projects.find(p => p.id === task.projectId) || { title: 'Unknown Project' };
          return {
            id: task.id,
            title: task.title,
            description: task.description || '',
            projectId: task.projectId,
            projectTitle: project.title,
            dueDate: task.dueDate,
            completed: task.status === 'completed',
            priority: task.priority || 'medium'
          };
        });
        
        setTasks(formattedTasks);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Check for reminders and trigger notifications
  useEffect(() => {
    if (!hasPermission || tasks.length === 0 || loading) return;
    
    const checkReminders = async () => {
      try {
        // Get reminders from API
        const remindersResponse = await reminderAPI.getAllReminders();
        const allReminders = remindersResponse.data || [];
        
        // Process reminders: add task info to reminder objects
        const processedReminders = allReminders.map(reminder => {
          const task = tasks.find(t => t.id === reminder.taskId);
          if (!task) return null;
          
          return {
            ...reminder,
            taskTitle: task.title,
            projectId: task.projectId,
            projectTitle: task.projectTitle || 'Unknown Project',
            taskDueDate: task.dueDate
          };
        }).filter(Boolean); // Remove null entries
        
        // Update state with all reminders
        setReminders(processedReminders);
        
        // Check for reminders that need to be triggered
        const triggeredReminderIds = checkAndTriggerReminders(processedReminders);
        
        // Update status of triggered reminders
        if (triggeredReminderIds.length > 0) {
          triggeredReminderIds.forEach(id => {
            reminderAPI.updateReminder(id, { status: 'sent' })
              .catch(err => console.error(`Error updating reminder status: ${err}`));
          });
          
          // Update local state
          setReminders(prevReminders => 
            prevReminders.map(reminder => 
              triggeredReminderIds.includes(reminder.id) 
                ? { ...reminder, status: 'sent' } 
                : reminder
            )
          );
        }
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };
    
    // Initial check
    checkReminders();
    
    // Set up interval to check for reminders every minute
    const intervalId = setInterval(checkReminders, 60000);
    
    return () => clearInterval(intervalId);
  }, [tasks, loading, hasPermission]);

  // Function to manually send a reminder for a specific task
  const sendReminder = async (taskId) => {
    if (!hasPermission) {
      const permission = await checkNotificationPermission();
      setHasPermission(permission);
      if (!permission) return false;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error(`Task with ID ${taskId} not found`);
      return false;
    }
    
    try {
      // Send immediate notification
      const success = sendNotification(
        `Reminder: ${task.title}`,
        {
          body: `This is a reminder for your task "${task.title}" that is due soon.`,
          icon: '/notification-icon.png',
          data: { taskId: task.id }
        }
      );
      
      if (success) {
        // Create a record of this reminder
        const reminderData = {
          taskId: task.id,
          title: `Reminder: ${task.title}`,
          message: `This is a reminder for your task "${task.title}" that is due soon.`,
          status: 'sent',
          sendAt: new Date().toISOString()
        };
        
        const response = await reminderAPI.createReminder(reminderData);
        
        // Add the new reminder to the list
        if (response.data) {
          const newReminder = {
            ...response.data,
            taskTitle: task.title,
            projectId: task.projectId,
            projectTitle: task.projectTitle || 'Unknown Project',
            taskDueDate: task.dueDate
          };
          
          setReminders(prev => [...prev, newReminder]);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending reminder:', error);
      return false;
    }
  };

  // Function to mark a reminder as read/dismissed
  const dismissReminder = (reminderId) => {
    // Update reminder status in storage
    reminderAPI.updateReminder(reminderId, { status: 'sent' })
      .catch(error => console.error('Error updating reminder status:', error));
    
    // Update local state
    setReminders(prevReminders => 
      prevReminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, status: 'sent' } 
          : reminder
      )
    );
  };

  // Function to refresh tasks from the API
  const refreshTasks = async () => {
    try {
      setLoading(true);
      const tasksResponse = await taskAPI.getAllTasks();
      const projectsResponse = await projectAPI.getAllProjects();
      
      const projects = projectsResponse.data || [];
      
      // Transform tasks to the format needed for notifications
      const formattedTasks = tasksResponse.data.map(task => {
        const project = projects.find(p => p.id === task.projectId) || { title: 'Unknown Project' };
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          projectId: task.projectId,
          projectTitle: project.title,
          dueDate: task.dueDate,
          completed: task.status === 'completed',
          priority: task.priority || 'medium'
        };
      });
      
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