// Local storage-based API replacement
import { 
  getData, 
  addItem, 
  updateItem, 
  deleteItem, 
  getItemById 
} from '../utils/localStorageUtils';

// Project API functions
const projectAPI = {
  getAllProjects: () => Promise.resolve({ data: getData('projects') }),
  getProjectById: (id) => Promise.resolve({ data: getItemById('projects', id) }),
  createProject: (projectData) => {
    const newProject = addItem('projects', {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return Promise.resolve({ data: newProject });
  },
  updateProject: (id, projectData) => {
    const updated = updateItem('projects', id, {
      ...projectData,
      updatedAt: new Date().toISOString()
    });
    return Promise.resolve({ data: updated });
  },
  deleteProject: (id) => {
    // Also delete associated tasks
    const tasks = getData('tasks');
    const projectTasks = tasks.filter(task => task.projectId === id);
    projectTasks.forEach(task => deleteItem('tasks', task.id));
    
    // Delete the project
    deleteItem('projects', id);
    return Promise.resolve({ data: { success: true } });
  },
  getProjectTasks: (id) => {
    const tasks = getData('tasks').filter(task => task.projectId === id);
    return Promise.resolve({ data: tasks });
  }
};

// Task API functions
const taskAPI = {
  getAllTasks: () => Promise.resolve({ data: getData('tasks') }),
  getTaskById: (id) => Promise.resolve({ data: getItemById('tasks', id) }),
  createTask: (taskData) => {
    const newTask = addItem('tasks', {
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      status: taskData.status || 'pending'
    });
    return Promise.resolve({ data: newTask });
  },
  updateTask: (id, taskData) => {
    // If task is being marked as completed, add completedAt timestamp
    let updateData = {
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    
    if (taskData.status === 'completed' && !taskData.completedAt) {
      updateData.completedAt = new Date().toISOString();
    }
    
    const updated = updateItem('tasks', id, updateData);
    return Promise.resolve({ data: updated });
  },
  deleteTask: (id) => {
    deleteItem('tasks', id);
    return Promise.resolve({ data: { success: true } });
  }
};

// Report API functions
const reportAPI = {
  getDashboardData: () => {
    const projects = getData('projects');
    const tasks = getData('tasks');
    
    // Calculate summary data
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Get recent projects
    const recentProjects = [...projects]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    // Get upcoming deadlines
    const upcomingDeadlines = [...tasks]
      .filter(task => task.status !== 'completed' && task.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
    
    return Promise.resolve({
      data: {
        summary: {
          totalProjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate
        },
        recentProjects,
        upcomingDeadlines
      }
    });
  },
  
  getProjectReport: (id) => {
    const project = getItemById('projects', id);
    if (!project) return Promise.resolve({ data: null });
    
    const tasks = getData('tasks').filter(task => task.projectId === id);
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const pendingTasks = tasks.filter(task => task.status !== 'completed');
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    // Group tasks by status
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    return Promise.resolve({
      data: {
        project,
        stats: {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length,
          completionRate
        },
        tasksByStatus,
        tasks
      }
    });
  },
  
  getTasksReport: () => {
    const tasks = getData('tasks');
    const projects = getData('projects');
    
    // Group tasks by project
    const tasksByProject = {};
    projects.forEach(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      tasksByProject[project.id] = {
        projectName: project.title,
        totalTasks: projectTasks.length,
        completedTasks: projectTasks.filter(task => task.status === 'completed').length
      };
    });
    
    // Tasks by status
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    // Tasks by due date (this month)
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const tasksByDueDate = {};
    tasks.forEach(task => {
      if (!task.dueDate) return;
      
      const dueDate = new Date(task.dueDate);
      if (dueDate.getMonth() === thisMonth && dueDate.getFullYear() === thisYear) {
        const day = dueDate.getDate();
        tasksByDueDate[day] = (tasksByDueDate[day] || 0) + 1;
      }
    });
    
    return Promise.resolve({
      data: {
        tasksByProject,
        tasksByStatus,
        tasksByDueDate
      }
    });
  }
};

// Reminder API functions (new for your email reminders module)
const reminderAPI = {
  getAllReminders: () => Promise.resolve({ data: getData('reminders') }),
  getReminderById: (id) => Promise.resolve({ data: getItemById('reminders', id) }),
  createReminder: (reminderData) => {
    const newReminder = addItem('reminders', {
      ...reminderData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    return Promise.resolve({ data: newReminder });
  },
  updateReminder: (id, reminderData) => {
    const updated = updateItem('reminders', id, reminderData);
    return Promise.resolve({ data: updated });
  },
  deleteReminder: (id) => {
    deleteItem('reminders', id);
    return Promise.resolve({ data: { success: true } });
  },
  getTaskReminders: (taskId) => {
    const reminders = getData('reminders').filter(reminder => reminder.taskId === taskId);
    return Promise.resolve({ data: reminders });
  }
};

export { projectAPI, taskAPI, reportAPI, reminderAPI };