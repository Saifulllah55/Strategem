import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";

// Helper function to calculate project progress based on task statuses
const calculateProjectProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const statusValues = {
    'todo': 0,
    'pending': 0,
    'in-progress': 50,
    'completed': 100,
    'revision': 50,
    'submitted': 25,
    'approved': 75
  };
  
  const total = tasks.reduce((sum, task) => {
    return sum + (statusValues[task.status] || 0);
  }, 0);
  
  return Math.round(total / tasks.length);
};

// Get dashboard data with summary stats
export const getDashboardData = async (req, res) => {
  try {
    // Get basic stats about projects, tasks, and team
    const userProjects = await Project.find({ 
      "members.user": req.user._id 
    }).populate({
      path: 'tasks',
      select: 'status dueDate title assignedTo',
      populate: { path: 'assignedTo', select: 'name' }
    });
    
    const totalProjects = userProjects.length;
    const completedProjects = userProjects.filter(p => p.status === 'completed').length;
    
    // Collect all tasks from all user projects
    let allTasks = [];
    userProjects.forEach(project => {
      if (project.tasks && project.tasks.length > 0) {
        allTasks = [...allTasks, ...project.tasks];
      }
    });
    
    // User's assigned tasks
    const userTasks = allTasks.filter(task => 
      task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString()
    );
    
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = userTasks.filter(task => 
      task.status === 'pending' || task.status === 'todo'
    ).length;
    
    // Calculate completion rates
    const projectCompletionRate = totalProjects > 0 
      ? Math.round((completedProjects / totalProjects) * 100) 
      : 0;
      
    const taskCompletionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
      
    // Get upcoming deadlines (tasks due in the next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    let upcomingDeadlines = [];
    
    // Get user assigned tasks with upcoming deadlines
    for (const project of userProjects) {
      if (project.tasks && project.tasks.length > 0) {
        const upcomingTasks = project.tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate <= nextWeek && task.status !== 'completed';
        });
        
        // Add project reference to tasks
        upcomingTasks.forEach(task => {
          upcomingDeadlines.push({
            ...task.toObject(),
            project: {
              _id: project._id,
              name: project.name
            }
          });
        });
      }
    }
    
    // Sort by due date (closest first)
    upcomingDeadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // Limit to 5 most urgent
    upcomingDeadlines = upcomingDeadlines.slice(0, 5);
    
    // Return dashboard data
    res.json({
      stats: {
        totalProjects,
        completedProjects,
        projectCompletionRate,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        taskCompletionRate
      },
      upcomingDeadlines,
      projects: userProjects.map(project => ({
        _id: project._id,
        name: project.name,
        status: project.status,
        dueDate: project.dueDate,
        progress: calculateProjectProgress(project.tasks)
      }))
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get detailed project report
export const getProjectReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project details
    const project = await Project.findById(projectId)
      .populate('members.user', 'name email profilePicture')
      .populate('owner', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Get all tasks for this project
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email profilePicture');
    
    // Calculate project stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'todo').length;
    
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // Calculate member contributions
    const memberContributions = {};
    project.members.forEach(member => {
      const memberTasks = tasks.filter(task => 
        task.assignedTo && task.assignedTo._id.toString() === member.user._id.toString()
      );
      
      const tasksCompleted = memberTasks.filter(task => task.status === 'completed').length;
      
      memberContributions[member.user._id] = {
        member: member.user,
        totalTasks: memberTasks.length,
        completedTasks: tasksCompleted,
        contributionRate: memberTasks.length > 0 
          ? Math.round((tasksCompleted / memberTasks.length) * 100) 
          : 0
      };
    });
    
    res.json({
      project,
      tasks,
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate
      },
      memberContributions
    });
  } catch (error) {
    console.error(`Error fetching project report for ${req.params.projectId}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// Get tasks report with timeline data
export const getTasksReport = async (req, res) => {
  try {
    // Get user's tasks
    const tasks = await Task.find({ 
      assignedTo: req.user._id 
    })
    .populate('project', 'name')
    .sort({ dueDate: 1 });
    
    // Group tasks by status
    const tasksByStatus = {
      completed: tasks.filter(task => task.status === 'completed'),
      inProgress: tasks.filter(task => task.status === 'in-progress'),
      pending: tasks.filter(task => task.status === 'pending' || task.status === 'todo')
    };
    
    // Group tasks by priority
    const tasksByPriority = {
      high: tasks.filter(task => task.priority === 'high'),
      medium: tasks.filter(task => task.priority === 'medium'),
      low: tasks.filter(task => task.priority === 'low')
    };
    
    // Group tasks by due dates (coming up this week, next week, later)
    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    
    const nextWeekEnd = new Date(endOfWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
    
    const tasksByDueDate = {
      thisWeek: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate <= endOfWeek && task.status !== 'completed';
      }),
      nextWeek: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate > endOfWeek && dueDate <= nextWeekEnd && task.status !== 'completed';
      }),
      later: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate > nextWeekEnd && task.status !== 'completed';
      }),
      overdue: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < today && task.status !== 'completed';
      })
    };
    
    res.json({
      tasks,
      tasksByStatus,
      tasksByPriority,
      tasksByDueDate
    });
  } catch (error) {
    console.error("Error fetching tasks report:", error);
    res.status(500).json({ message: error.message });
  }
};