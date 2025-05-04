const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Data directory for local storage
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Initialize data files if they don't exist
const initializeDataFile = (filename, initialData = []) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
  }
};

// Initialize data files
initializeDataFile('projects');
initializeDataFile('tasks');
initializeDataFile('reports');
initializeDataFile('reminders');

// Helper functions for data manipulation
const getData = (filename) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  return JSON.parse(fs.readFileSync(filePath));
};

const saveData = (filename, data) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// API Routes

// Projects API
app.get('/api/projects', (req, res) => {
  res.json(getData('projects'));
});

app.get('/api/projects/:id', (req, res) => {
  const projects = getData('projects');
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ msg: 'Project not found' });
  res.json(project);
});

app.post('/api/projects', (req, res) => {
  const projects = getData('projects');
  const newProject = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  projects.push(newProject);
  saveData('projects', projects);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const projects = getData('projects');
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ msg: 'Project not found' });
  
  projects[index] = {
    ...projects[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveData('projects', projects);
  res.json(projects[index]);
});

app.delete('/api/projects/:id', (req, res) => {
  const projects = getData('projects');
  const filteredProjects = projects.filter(p => p.id !== req.params.id);
  saveData('projects', filteredProjects);
  
  // Also delete associated tasks
  const tasks = getData('tasks');
  const filteredTasks = tasks.filter(t => t.projectId !== req.params.id);
  saveData('tasks', filteredTasks);
  
  res.json({ msg: 'Project removed' });
});

// Tasks API
app.get('/api/tasks', (req, res) => {
  res.json(getData('tasks'));
});

app.get('/api/tasks/:id', (req, res) => {
  const tasks = getData('tasks');
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ msg: 'Task not found' });
  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const tasks = getData('tasks');
  const newTask = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };
  tasks.push(newTask);
  saveData('tasks', tasks);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const tasks = getData('tasks');
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ msg: 'Task not found' });
  
  // If task is being marked as completed and wasn't before
  let updateData = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  if (req.body.status === 'completed' && tasks[index].status !== 'completed') {
    updateData.completedAt = new Date().toISOString();
  }
  
  tasks[index] = updateData;
  saveData('tasks', tasks);
  res.json(tasks[index]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = getData('tasks');
  const filteredTasks = tasks.filter(t => t.id !== req.params.id);
  saveData('tasks', filteredTasks);
  res.json({ msg: 'Task removed' });
});

// Reports API
app.get('/api/reports/dashboard', (req, res) => {
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
  
  res.json({
    summary: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate
    },
    recentProjects,
    upcomingDeadlines
  });
});

app.get('/api/reports/project/:id', (req, res) => {
  const projects = getData('projects');
  const tasks = getData('tasks');
  
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ msg: 'Project not found' });
  
  const projectTasks = tasks.filter(task => task.projectId === req.params.id);
  const completedTasks = projectTasks.filter(task => task.status === 'completed');
  const pendingTasks = projectTasks.filter(task => task.status !== 'completed');
  const completionRate = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
  
  // Group tasks by status
  const tasksByStatus = projectTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  
  res.json({
    project,
    stats: {
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      completionRate
    },
    tasksByStatus,
    tasks: projectTasks
  });
});

app.get('/api/reports/tasks', (req, res) => {
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
  
  res.json({
    tasksByProject,
    tasksByStatus,
    tasksByDueDate
  });
});

// Reminders API (new for your email reminders module)
app.get('/api/reminders', (req, res) => {
  res.json(getData('reminders'));
});

app.get('/api/reminders/:id', (req, res) => {
  const reminders = getData('reminders');
  const reminder = reminders.find(r => r.id === req.params.id);
  if (!reminder) return res.status(404).json({ msg: 'Reminder not found' });
  res.json(reminder);
});

app.post('/api/reminders', (req, res) => {
  const reminders = getData('reminders');
  const newReminder = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  reminders.push(newReminder);
  saveData('reminders', reminders);
  res.status(201).json(newReminder);
});

app.put('/api/reminders/:id', (req, res) => {
  const reminders = getData('reminders');
  const index = reminders.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ msg: 'Reminder not found' });
  
  reminders[index] = {
    ...reminders[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveData('reminders', reminders);
  res.json(reminders[index]);
});

app.delete('/api/reminders/:id', (req, res) => {
  const reminders = getData('reminders');
  const filteredReminders = reminders.filter(r => r.id !== req.params.id);
  saveData('reminders', filteredReminders);
  res.json({ msg: 'Reminder removed' });
});

// Get reminders for a specific task
app.get('/api/tasks/:taskId/reminders', (req, res) => {
  const reminders = getData('reminders');
  const taskReminders = reminders.filter(r => r.taskId === req.params.taskId);
  res.json(taskReminders);
});

// Simulate sending email (for development)
app.post('/api/reminders/send-test-email', (req, res) => {
  const { recipient, subject, body } = req.body;
  
  // In a real implementation, you would connect to an email service
  // For now, just log the email details
  console.log('Sending test email:');
  console.log(`To: ${recipient}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  res.json({ success: true, message: 'Test email logged (check server console)' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;