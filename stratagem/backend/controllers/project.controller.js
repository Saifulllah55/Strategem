import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import { createActivity } from "./activity.controller.js";



export const createProject = async (req, res) => {
  try {
    const { name, description, members = [], tools } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const ownerId = req.user._id;

    const uniqueMemberIds = [...new Set(members.map((id) => id.toString()))];

    const users = await User.find({ _id: { $in: uniqueMemberIds } });
    const foundUserIds = users.map((user) => user._id.toString());

    const notFound = uniqueMemberIds.filter((id) => !foundUserIds.includes(id));
    if (notFound.length > 0) {
      return res
        .status(404)
        .json({ message: `Users not found: ${notFound.join(", ")}` });
    }

    const formattedMembers = users.map((user) => ({
      user: user._id,
      role: "member",
      joinedAt: new Date(),
    }));

    formattedMembers.push({
      user: ownerId,
      role: "lead",
      joinedAt: new Date(),
    });

    const newProject = new Project({
      name,
      description,
      owner: ownerId,
      members: formattedMembers,
      tools: {
        messageBoard: tools?.messageBoard || false,
        todos: tools?.todos || false,
        docsFiles: tools?.docsFiles || false,
        chat: tools?.chat || false,
        schedule: tools?.schedule || false,
        cardTable: tools?.cardTable || false,
      },
      announcements: [
        {
          announcer: ownerId,
          text: "Welcome to the project! Let's collaborate effectively by using the right tools for each task.",
          createdAt: new Date(),
        },
      ],
    });

    const savedProject = await newProject.save();

    const allUserIds = [...new Set([...uniqueMemberIds, ownerId.toString()])];
    await User.updateMany(
      { _id: { $in: allUserIds } },
      { $addToSet: { projects: savedProject._id } }
    );

    res.status(201).json(savedProject);
  } catch (err) {
    console.error("Create Project Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
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
      ],
      options: { sort: { updatedAt: -1 } },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.projects);
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  try {
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const user = await User.findById(userId);
    if (!user || !user.projects.includes(projectId)) {
      return res
        .status(403)
        .json({ message: "Access denied: not a project member or owner" });
    }

    const project = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .populate("announcements.announcer", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project by projectId:", error);
    res.status(500).json({ message: "Server error while fetching project" });
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

    // Update project's tasks array
    await Project.findByIdAndUpdate(projectId, {
      $push: { tasks: task._id },
    });

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
