import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

export const taskController = {
  // Get all tasks
  getAllTasks: async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate('assignedTo', 'name email')
        .populate('project', 'name description');
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get task by ID
  getTaskById: async (req, res) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate('assignedTo', 'name email')
        .populate('project', 'name description');
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new task
  createTask: async (req, res) => {
    try {
      const task = new Task(req.body);
      const savedTask = await task.save();
      
      // Update project's tasks array
      await Project.findByIdAndUpdate(
        task.project,
        { $push: { tasks: savedTask._id } }
      );
      
      res.status(201).json(savedTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update task
  updateTask: async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true }
      );
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete task
  deleteTask: async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      
      // Remove task from project's tasks array
      await Project.findByIdAndUpdate(
        task.project,
        { $pull: { tasks: task._id } }
      );
      
      await task.remove();
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get tasks by project
  getTasksByProject: async (req, res) => {
    try {
      const tasks = await Task.find({ project: req.params.projectId })
        .populate('assignedTo', 'name email');
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}; 