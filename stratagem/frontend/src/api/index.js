import { 
  getData, 
  getItemById, 
  addItem, 
  updateItem, 
  deleteItem, 
  getItemsByField,
  initializeLocalStorage
} from '../utils/localStorageUtils';

// Initialize local storage with sample data
initializeLocalStorage();

// Helper function to simulate API response delay
const simulateDelay = async (data, delay = 300) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, delay);
  });
};

// Project API
export const projectAPI = {
  // Get all projects
  getAllProjects: async () => {
    const projects = getData('projects');
    return simulateDelay(projects);
  },
  
  // Get project by ID
  getProjectById: async (id) => {
    const project = getItemById('projects', id);
    return simulateDelay(project);
  },
  
  // Create new project
  createProject: async (projectData) => {
    const now = new Date().toISOString();
    const newProject = addItem('projects', {
      ...projectData,
      createdAt: now,
      updatedAt: now
    });
    return simulateDelay(newProject);
  },
  
  // Update project
  updateProject: async (id, updates) => {
    const updatedProject = updateItem('projects', id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return simulateDelay(updatedProject);
  },
  
  // Delete project
  deleteProject: async (id) => {
    const result = deleteItem('projects', id);
    
    // If project is deleted, also delete associated tasks
    if (result) {
      const tasks = getData('tasks');
      const projectTasks = tasks.filter(task => task.projectId === id);
      
      // Delete each task
      projectTasks.forEach(task => {
        deleteItem('tasks', task.id);
      });
    }
    
    return simulateDelay({ deleted: result });
  }
};

// Task API
export const taskAPI = {
  // Get all tasks
  getAllTasks: async () => {
    const tasks = getData('tasks');
    return simulateDelay(tasks);
  },
  
  // Get tasks for a specific project
  getProjectTasks: async (projectId) => {
    const tasks = getItemsByField('tasks', 'projectId', projectId);
    return simulateDelay(tasks);
  },
  
  // Get task by ID
  getTaskById: async (id) => {
    const task = getItemById('tasks', id);
    return simulateDelay(task);
  },
  
  // Create new task
  createTask: async (taskData) => {
    const now = new Date().toISOString();
    const newTask = addItem('tasks', {
      ...taskData,
      createdAt: now,
      updatedAt: now,
      status: taskData.status || 'pending'
    });
    return simulateDelay(newTask);
  },
  
  // Update task
  updateTask: async (id, updates) => {
    const task = getItemById('tasks', id);
    const now = new Date().toISOString();
    const updatedTask = updateItem('tasks', id, {
      ...updates,
      updatedAt: now,
      completedAt: updates.status === 'completed' && task.status !== 'completed' ? now : task.completedAt
    });
    return simulateDelay(updatedTask);
  },
  
  // Delete task
  deleteTask: async (id) => {
    const result = deleteItem('tasks', id);
    
    // If task is deleted, also delete associated reminders
    if (result) {
      const reminders = getData('reminders');
      const taskReminders = reminders.filter(reminder => reminder.taskId === id);
      
      // Delete each reminder
      taskReminders.forEach(reminder => {
        deleteItem('reminders', reminder.id);
      });
    }
    
    return simulateDelay({ deleted: result });
  }
};

// Reminder API
export const reminderAPI = {
  // Get all reminders
  getAllReminders: async () => {
    const reminders = getData('reminders');
    return simulateDelay(reminders);
  },
  
  // Get reminders for a specific task
  getTaskReminders: async (taskId) => {
    const reminders = getItemsByField('reminders', 'taskId', taskId);
    return simulateDelay(reminders);
  },
  
  // Get reminder by ID
  getReminderById: async (id) => {
    const reminder = getItemById('reminders', id);
    return simulateDelay(reminder);
  },
  
  // Create new reminder
  createReminder: async (reminderData) => {
    const now = new Date().toISOString();
    
    // Calculate actual send time if using timeBeforeDeadline
    let sendAt = null;
    if (reminderData.timeBeforeDeadline) {
      const task = getItemById('tasks', reminderData.taskId);
      if (task && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        sendAt = new Date(dueDate);
        sendAt.setHours(sendAt.getHours() - reminderData.timeBeforeDeadline);
        sendAt = sendAt.toISOString();
      }
    }
    
    const newReminder = addItem('reminders', {
      ...reminderData,
      sendAt: sendAt || reminderData.sendAt,
      createdAt: now,
      status: reminderData.status || 'pending'
    });
    
    return simulateDelay(newReminder);
  },
  
  // Update reminder
  updateReminder: async (id, updates) => {
    // Re-calculate send time if needed
    let updatedData = { ...updates };
    
    if (updates.timeBeforeDeadline) {
      const reminder = getItemById('reminders', id);
      const task = getItemById('tasks', reminder.taskId);
      
      if (task && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const sendAt = new Date(dueDate);
        sendAt.setHours(sendAt.getHours() - updates.timeBeforeDeadline);
        updatedData.sendAt = sendAt.toISOString();
      }
    }
    
    const updatedReminder = updateItem('reminders', id, updatedData);
    return simulateDelay(updatedReminder);
  },
  
  // Delete reminder
  deleteReminder: async (id) => {
    const result = deleteItem('reminders', id);
    return simulateDelay({ deleted: result });
  }
};

// Report API (for the Reports and Graphs module)
export const reportAPI = {
  // Get dashboard data with summary stats
  getDashboardData: async () => {
    const projects = getData('projects');
    const tasks = getData('tasks');
    
    // Calculate project stats
    const projectStats = projects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
      const totalTasks = projectTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        progress,
        createdAt: project.createdAt,
        dueDate: project.dueDate,
        tasksCount: totalTasks,
        completedTasksCount: completedTasks
      };
    });
    
    // Calculate overall task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    
    // Recent activity (last 5 updated tasks)
    const recentActivity = [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(task => {
        const project = projects.find(p => p.id === task.projectId);
        return {
          id: task.id,
          title: task.title,
          projectId: task.projectId,
          projectTitle: project ? project.title : 'Unknown Project',
          status: task.status,
          updatedAt: task.updatedAt
        };
      });
    
    // Calculate upcoming deadlines (next 5 tasks due)
    const now = new Date();
    const upcomingDeadlines = [...tasks]
      .filter(task => task.status !== 'completed' && new Date(task.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map(task => {
        const project = projects.find(p => p.id === task.projectId);
        return {
          id: task.id,
          title: task.title,
          projectId: task.projectId,
          projectTitle: project ? project.title : 'Unknown Project',
          dueDate: task.dueDate,
          priority: task.priority
        };
      });
    
    return simulateDelay({
      stats: {
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overallProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      recentProjects: projectStats,
      recentActivity,
      upcomingDeadlines
    });
  },
  
  // Get detailed project report
  getProjectReport: async (projectId) => {
    const project = getItemById('projects', projectId);
    const tasks = getItemsByField('tasks', 'projectId', projectId);
    
    if (!project) {
      return simulateDelay(null);
    }
    
    // Calculate task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    
    // Calculate project progress
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Get task history (for charts)
    const taskTimeline = generateTaskTimeline(project, tasks);
    
    return simulateDelay({
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        createdAt: project.createdAt,
        dueDate: project.dueDate,
        progress
      },
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks
      },
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        dueDate: task.dueDate
      })),
      taskTimeline
    });
  },
  
  // Get tasks report with timeline data
  getTasksReport: async () => {
    const tasks = getData('tasks');
    const projects = getData('projects');
    
    // Calculate tasks by status
    const tasksByStatus = {
      completed: tasks.filter(task => task.status === 'completed').length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length
    };
    
    // Calculate tasks by priority
    const tasksByPriority = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length
    };
    
    // Generate timeline data for all projects
    const timelineData = [];
    
    // Start from 30 days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Generate dates (daily intervals)
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= new Date()) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // For each date, count tasks completed on that day
    dates.forEach(date => {
      const dateString = date.toISOString().split('T')[0];
      const completedCount = tasks.filter(task => 
        task.completedAt && 
        task.completedAt.split('T')[0] === dateString
      ).length;
      
      timelineData.push({
        date: dateString,
        completed: completedCount
      });
    });
    
    return simulateDelay({
      tasksByStatus,
      tasksByPriority,
      timelineData
    });
  }
};

// Helper function to generate task timeline for a project
const generateTaskTimeline = (project, tasks) => {
  if (!project || !tasks || tasks.length === 0) return [];
  
  // Start from project creation date
  const startDate = new Date(project.createdAt);
  const today = new Date();
  
  // Generate dates (weekly intervals)
  const dates = [];
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  // For each date, calculate completed and pending tasks
  return dates.map(date => {
    const dateString = date.toISOString().split('T')[0];
    
    // Count tasks completed by this date
    const completedCount = tasks.filter(task => 
      task.status === 'completed' && 
      task.completedAt && 
      new Date(task.completedAt) <= date
    ).length;
    
    // Total tasks created by this date
    const totalTasksByDate = tasks.filter(task => 
      new Date(task.createdAt) <= date
    ).length;
    
    // Pending = Total - Completed
    const pendingCount = totalTasksByDate - completedCount;
    
    return {
      date: dateString,
      completed: completedCount,
      pending: pendingCount
    };
  });
};