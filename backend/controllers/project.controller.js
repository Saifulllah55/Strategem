import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import { createActivity } from "./activity.controller.js";
import { createNotification } from "./notification.controller.js";



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
      .populate("announcements.announcer", "name email")
      .populate("tasks");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Calculate project progress
    await project.calculateProgress();

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
    const { title, description, dueDate, assignedTo } = req.body;
    const userId = req.user._id;

    const task = new Task({
      title,
      description,
      dueDate,
      project: projectId,
      assignedTo: assignedTo || userId,
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

    // Notify the assignee if not the creator
    if (task.assignedTo.toString() !== userId.toString()) {
      await createNotification(
        task.assignedTo,
        "task_assignment",
        `You have been assigned a new task: ${title}`,
        `/projects/${projectId}`
      );
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskForProject = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, assignedTo } = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Notify on assignment change
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      // Notify old assignee
      if (task.assignedTo) {
        await createNotification(
          task.assignedTo,
          "task_assignment_change",
          `You have been unassigned from task: ${task.title}`,
          `/projects/${task.project}`
        );
      }
      // Notify new assignee
      await createNotification(
        assignedTo,
        "task_assignment_change",
        `You have been assigned to task: ${task.title}`,
        `/projects/${task.project}`
      );
      task.assignedTo = assignedTo;
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

    // Notify assignee on status change
    if (status && task.assignedTo) {
      await createNotification(
        task.assignedTo,
        "task_status_change",
        `Status of your task '${task.title}' changed to ${status}`,
        `/projects/${task.project}`
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

export const addMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the current user is the project owner
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only project owner can add members" });
    }

    // Get unique member IDs
    const uniqueMemberIds = [...new Set(memberIds.map((id) => id.toString()))];

    // Find all users
    const users = await User.find({ _id: { $in: uniqueMemberIds } });
    const foundUserIds = users.map((user) => user._id.toString());

    // Check for invalid user IDs
    const notFound = uniqueMemberIds.filter((id) => !foundUserIds.includes(id));
    if (notFound.length > 0) {
      return res.status(404).json({ message: `Users not found: ${notFound.join(", ")}` });
    }

    // Add new members
    const newMembers = users.map((user) => ({
      user: user._id,
      role: "member",
      joinedAt: new Date(),
    }));

    // Filter out existing members
    const existingMemberIds = project.members.map((m) => m.user.toString());
    const uniqueNewMembers = newMembers.filter(
      (m) => !existingMemberIds.includes(m.user.toString())
    );

    // Update project members
    project.members.push(...uniqueNewMembers);
    await project.save();

    // Update users' projects array
    await User.updateMany(
      { _id: { $in: uniqueNewMembers.map(m => m.user) } },
      { $addToSet: { projects: projectId } }
    );

    // Create activity for adding members
    await createActivity(
      projectId,
      userId,
      "members_added",
      `Added ${uniqueNewMembers.length} new members to the project`
    );

    // Notify new members
    await Promise.all(
      uniqueNewMembers.map(m =>
        createNotification(
          m.user,
          "added_to_project",
          `You have been added to the project '${project.name}'`,
          `/projects/${projectId}`
        )
      )
    );

    const populatedProject = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .populate("announcements.announcer", "name email");

    res.status(200).json(populatedProject);
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ message: error.message });
  }
};
