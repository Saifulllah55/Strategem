import Announcement from "../models/announcement.model.js";
import Project from "../models/project.model.js";
import { createActivity } from "./activity.controller.js";

export const getProjectAnnouncements = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const announcements = await Announcement.find({ project: projectId })
      .populate("announcer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
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

    const announcement = new Announcement({
      text,
      announcer: userId,
      project: projectId
    });

    await announcement.save();

    // Add announcement to project
    project.announcements.push(announcement._id);
    await project.save();

    // Create activity for the announcement
    await createActivity(
      projectId,
      userId,
      "announcement_created",
      `Posted announcement: ${text}`
    );

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate("announcer", "name email");

    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: error.message });
  }
}; 