import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Project API
export const projectAPI = {
  // Get all projects
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response;
  },
  
  // Get project by ID
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response;
  },
  
  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response;
  },
  
  // Update project
  updateProject: async (id, updates) => {
    const response = await api.put(`/projects/${id}`, updates);
    return response;
  },
  
  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response;
  }
};

// Task API
export const taskAPI = {
  // Get all tasks
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response;
  },
  
  // Get task by ID
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response;
  },
  
  // Create new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response;
  },
  
  // Update task
  updateTask: async (id, updates) => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response;
  },
  
  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response;
  },
  
  // Get tasks by project
  getTasksByProject: async (projectId) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response;
  }
};

// Report API
export const reportAPI = {
  // Get dashboard data with summary stats
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response;
  },
  
  // Get detailed project report
  getProjectReport: async (projectId) => {
    const response = await api.get(`/dashboard/project/${projectId}`);
    return response;
  },
  
  // Get tasks report with timeline data
  getTasksReport: async () => {
    const response = await api.get('/dashboard/tasks');
    return response;
  }
};

// Reminder API
export const reminderAPI = {
  // Get all reminders
  getAllReminders: async () => {
    try {
      // Check if token exists before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for reminders API');
        return { data: [] };
      }

      const response = await api.get('/reminders');
      return response;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Authentication failed when fetching reminders. Please log in again.");
        // Optionally redirect to login or refresh token
      } else {
        console.error("Error fetching reminders:", error);
      }
      // Return empty data to avoid crashing
      return { data: [] };
    }
  },
  
  // Get all custom reminders
  getCustomReminders: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for reminders API');
        return { data: [] };
      }

      const response = await api.get('/reminders/custom');
      return response;
    } catch (error) {
      console.error("Error fetching custom reminders:", error);
      return { data: [] };
    }
  },
  
  // Get reminder by ID
  getReminderById: async (id) => {
    try {
      const response = await api.get(`/reminders/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching reminder ${id}:`, error);
      throw error;
    }
  },
  
  // Create new reminder
  createReminder: async (reminderData) => {
    try {
      // Make sure reminderData has necessary fields
      const payload = {
        ...reminderData,
        // If sending taskId but not relatedTo/type for backward compatibility
        relatedTo: reminderData.type !== 'custom' ? (reminderData.relatedTo || reminderData.taskId) : undefined,
        type: reminderData.type || "task",
        // Make sure there's a title
        title: reminderData.title || `Reminder`,
        // Set a due date if not provided
        dueDate: reminderData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        // Hours before due date to send notification
        hoursBeforeDue: reminderData.hoursBeforeDue || 24
      };
      
      const response = await api.post('/reminders', payload);
      return response;
    } catch (error) {
      console.error("Error creating reminder:", error);
      throw error;
    }
  },
  
  // Create a custom reminder (not tied to a task/project)
  createCustomReminder: async (reminderData) => {
    try {
      const payload = {
        title: reminderData.title || "Custom Reminder",
        description: reminderData.description || "",
        dueDate: reminderData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        hoursBeforeDue: reminderData.hoursBeforeDue || 24,
        priority: reminderData.priority || "medium"
      };
      
      const response = await api.post('/reminders/custom', payload);
      return response;
    } catch (error) {
      console.error("Error creating custom reminder:", error);
      throw error;
    }
  },
  
  // Update reminder
  updateReminder: async (id, updates) => {
    try {
      const response = await api.put(`/reminders/${id}`, updates);
      return response;
    } catch (error) {
      console.error(`Error updating reminder ${id}:`, error);
      throw error;
    }
  },
  
  // Delete reminder
  deleteReminder: async (id) => {
    try {
      const response = await api.delete(`/reminders/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting reminder ${id}:`, error);
      throw error;
    }
  },
  
  // Get reminders by type
  getRemindersByType: async (type) => {
    try {
      const response = await api.get(`/reminders/type/${type}`);
      return response;
    } catch (error) {
      console.error(`Error fetching reminders of type ${type}:`, error);
      throw error;
    }
  },
  
  // Get reminders that need notification
  getRemindersToNotify: async () => {
    try {
      const response = await api.get('/reminders/notify');
      return response;
    } catch (error) {
      console.error("Error fetching reminders to notify:", error);
      return { data: [] };
    }
  },
  
  // Mark reminder as notified
  markAsNotified: async (id) => {
    try {
      const response = await api.patch(`/reminders/${id}/notified`);
      return response;
    } catch (error) {
      console.error(`Error marking reminder ${id} as notified:`, error);
      throw error;
    }
  },
  
  // Cleanup expired reminders
  cleanupExpiredReminders: async () => {
    try {
      const response = await api.delete('/reminders/cleanup');
      return response;
    } catch (error) {
      console.error("Error cleaning up expired reminders:", error);
      return { data: { count: 0 } };
    }
  }
};