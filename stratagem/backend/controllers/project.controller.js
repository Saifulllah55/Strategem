import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import { createActivity } from "./activity.controller.js";

export const projectController = {
  // Get all projects
  getAllProjects: async (req, res) => {
    try {
      const projects = await Project.find()
        .populate('tasks');
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get project by ID
  getProjectById: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('tasks');
      if (!project) return res.status(404).json({ message: 'Project not found' });
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new project
  createProject: async (req, res) => {
    try {
      const project = new Project(req.body);
      const savedProject = await project.save();
      res.status(201).json(savedProject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update project
  updateProject: async (req, res) => {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true }
      ).populate('tasks');
      
      if (!project) return res.status(404).json({ message: 'Project not found' });
      
      // Recalculate progress after update
      await project.calculateProgress();
      
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete project
  deleteProject: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      
      // Delete all tasks associated with the project
      await Task.deleteMany({ project: project._id });
      
      await project.remove();
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getUserProjects = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate({
      path: "projects",
      populate: [
        { path: "owner", select: "name email" },
        { path: "members.user", select: "name email" },
        { path: "announcements.announcer", select: "name email" },
        { path: "tasks" }
      ],
      options: { sort: { updatedAt: -1 } },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate progress for each project
    for (let project of user.projects) {
      await project.calculateProgress();
    }

    res.status(200).json(user.projects);
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
};

export const getTasksByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).populate("tasks");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(project.tasks);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while fetching tasks" });
  }
};

export const createTaskForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate } = req.body;
    const userId = req.user._id;

    const task = new Task({
      title,
      description,
      dueDate,
      project: projectId,
      assignedTo: userId,
    });

    await task.save();

    // Create activity for task creation
    await createActivity(
      projectId,
      userId,
      "task_created",
      `Created task: ${title}`,
      task._id
    );

    // Get updated project with tasks
    const project = await Project.findById(projectId).populate('tasks');
    
    // Recalculate project progress
    await project.calculateProgress();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskForProject = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    await task.save();

    let activityType = "";
    let activityContent = "";

    if (status === "submitted") {
      activityType = "task_submitted";
      activityContent = `Submitted task: ${task.title}`;
    } else if (status === "approved") {
      activityType = "task_approved";
      activityContent = `Approved task: ${task.title}`;
    }

    if (activityType) {
      await createActivity(
        task.project,
        userId,
        activityType,
        activityContent,
        task._id
      );
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not authorized to post announcements" });
    }

    const announcement = {
      announcer: userId,
      text,
      createdAt: new Date(),
    };

    project.announcements.push(announcement);
    await project.save();

    await createActivity(
      projectId,
      userId,
      "announcement_created",
      `Posted announcement: ${text}`
    );

    const populatedProject = await Project.findById(projectId)
      .populate("announcements.announcer", "name email");

    const newAnnouncement = populatedProject.announcements[populatedProject.announcements.length - 1];
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: error.message });
  }
};
