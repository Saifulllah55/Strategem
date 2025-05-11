import Chat from "../models/chat.model.js";
import Project from "../models/project.model.js";
import { createNotification } from "./notification.controller.js";

export const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const messages = await Chat.find({ project: projectId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not authorized to send messages" });
    }

    const message = new Chat({
      content,
      sender: userId,
      project: projectId
    });

    await message.save();

    const populatedMessage = await Chat.findById(message._id)
      .populate("sender", "name email");

    // Emit the new message to all connected clients in the project room
    req.app.get("io").to(projectId).emit("newMessage", populatedMessage);

    // Notify all project members except the sender
    const memberIds = project.members.map(m => m.user.toString()).filter(id => id !== userId.toString());
    await Promise.all(
      memberIds.map(id =>
        createNotification(
          id,
          "message",
          `New message in project '${project.name}': ${content}`,
          `/projects/${projectId}`
        )
      )
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: error.message });
  }
}; 