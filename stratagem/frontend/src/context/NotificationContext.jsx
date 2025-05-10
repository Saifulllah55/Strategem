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
  const [customReminders, setCustomReminders] = useState([]);
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
        const remindersResponse = await reminderAPI.getAllReminders();
        const customRemindersResponse = await reminderAPI.getCustomReminders();
        
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
        
        // Process reminders for tasks
        const taskReminders = [];
        
        (remindersResponse.data || []).forEach(reminder => {
          if (reminder.type === 'task' && reminder.relatedTo) {
            // Task reminder
            const task = formattedTasks.find(t => t.id === reminder.relatedTo) || null;
            if (task) {
              taskReminders.push({
                ...reminder,
                taskTitle: task.title,
                projectId: task.projectId,
                projectTitle: task.projectTitle || 'Unknown Project',
                taskDueDate: task.dueDate
              });
            }
          }
        });
        
        setTasks(formattedTasks);
        setReminders(taskReminders);
        setCustomReminders(customRemindersResponse.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks and reminders:', err);
        setError('Failed to load tasks and reminders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Check for reminders that need to be sent
  useEffect(() => {
    const checkReminders = async () => {
      if (!hasPermission) return;
      
      try {
        // Check for reminders due to be notified
        const dueSoonResponse = await reminderAPI.getRemindersToNotify();
        const dueSoonReminders = dueSoonResponse.data || [];
        
        // Send notifications for each reminder
        for (const reminder of dueSoonReminders) {
          let title = reminder.title;
          let body = reminder.description;
          
          if (reminder.type === 'task' && reminder.relatedTo) {
            const task = tasks.find(t => t.id === reminder.relatedTo);
            if (task) {
              title = `Task Reminder: ${task.title}`;
              body = `Your task "${task.title}" needs attention.`;
            }
          }
          
          // Send the notification
          const success = sendNotification(title, {
            body,
            icon: '/notification-icon.png',
            data: { reminderId: reminder._id, type: reminder.type }
          });
          
          if (success) {
            // Mark as notified
            await reminderAPI.markAsNotified(reminder._id);
            
            // Update local state
            if (reminder.type === 'custom') {
              setCustomReminders(prev => 
                prev.map(r => r._id === reminder._id ? { ...r, isNotified: true } : r)
              );
            } else {
              setReminders(prev => 
                prev.map(r => r._id === reminder._id ? { ...r, isNotified: true } : r)
              );
            }
          }
        }
        
        // Cleanup expired reminders (runs once a day)
        const now = new Date();
        const lastCleanup = localStorage.getItem('lastReminderCleanup');
        
        if (!lastCleanup || (now - new Date(lastCleanup)) > (24 * 60 * 60 * 1000)) {
          await reminderAPI.cleanupExpiredReminders();
          localStorage.setItem('lastReminderCleanup', now.toISOString());
        }
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };
    
    // Check immediately and then every minute
    checkReminders();
    const checkInterval = setInterval(checkReminders, 60 * 1000);
    
    return () => clearInterval(checkInterval);
  }, [hasPermission, tasks]);
  
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
          relatedTo: task.id,
          type: "task",
          title: `Reminder: ${task.title}`,
          description: `This is a reminder for your task "${task.title}" that is due soon.`,
          status: 'active',
          priority: task.priority || "medium",
          dueDate: new Date().toISOString()
        };
        
        try {
          const response = await reminderAPI.createReminder(reminderData);
          
          // Add the new reminder to the list
          if (response && response.data) {
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
        } catch (apiError) {
          console.error('Error creating reminder in API:', apiError);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error sending reminder:', error);
      return false;
    }
  };
  
  // Create a custom reminder
  const createCustomReminder = async (reminderData) => {
    try {
      const response = await reminderAPI.createCustomReminder(reminderData);
      
      if (response && response.data) {
        setCustomReminders(prev => [...prev, response.data]);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating custom reminder:', error);
      throw error;
    }
  };
  
  // Update a custom reminder
  const updateCustomReminder = async (reminderId, updates) => {
    try {
      const response = await reminderAPI.updateReminder(reminderId, {
        ...updates,
        type: 'custom'
      });
      
      if (response && response.data) {
        setCustomReminders(prev => 
          prev.map(reminder => reminder._id === reminderId ? response.data : reminder)
        );
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating custom reminder:', error);
      throw error;
    }
  };
  
  // Delete reminder
  const deleteReminder = async (reminderId, type = 'task') => {
    try {
      await reminderAPI.deleteReminder(reminderId);
      
      // Update state based on reminder type
      if (type === 'custom') {
        setCustomReminders(prev => prev.filter(reminder => reminder._id !== reminderId));
      } else {
        setReminders(prev => prev.filter(reminder => reminder._id !== reminderId));
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  };
  
  // Dismiss reminder
  const dismissReminder = async (reminderId, isCustomReminder = false) => {
    try {
      await reminderAPI.markAsNotified(reminderId);
      
      // Update state based on reminder type
      if (isCustomReminder) {
        setCustomReminders(prev => 
          prev.map(reminder => 
            reminder._id === reminderId 
              ? { ...reminder, isNotified: true } 
              : reminder
          )
        );
      } else {
        setReminders(prev => 
          prev.map(reminder => 
            reminder._id === reminderId 
              ? { ...reminder, isNotified: true } 
              : reminder
          )
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      return false;
    }
  };
  
  // Refresh tasks data
  const refreshTasks = async () => {
    try {
      setLoading(true);
      const tasksResponse = await taskAPI.getAllTasks();
      const projectsResponse = await projectAPI.getAllProjects();
      
      const projects = projectsResponse.data || [];
      
      // Transform tasks
      const formattedTasks = tasksResponse.data.map(task => {
        const project = projects.find(p => p._id === task.project._id) || { name: 'Unknown Project' };
        return {
          id: task._id,
          title: task.title,
          description: task.description || '',
          projectId: task.project._id,
          projectTitle: project.name,
          dueDate: task.dueDate,
          completed: task.status === 'completed',
          priority: task.priority || 'medium'
        };
      });
      
      setTasks(formattedTasks);
      setLoading(false);
      return formattedTasks;
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      setLoading(false);
      return [];
    }
  };
  
  // Get all active reminders (task + custom)
  const getAllActiveReminders = () => {
    return [...reminders, ...customReminders]
      .filter(r => r.status === 'active' && new Date(r.dueDate) >= new Date());
  };

  const value = {
    hasPermission,
    reminders: getAllActiveReminders(),
    taskReminders: reminders,
    customReminders,
    tasks,
    loading,
    error,
    sendReminder,
    createCustomReminder,
    updateCustomReminder,
    dismissReminder,
    deleteReminder,
    refreshTasks,
    requestPermission: checkNotificationPermission
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;