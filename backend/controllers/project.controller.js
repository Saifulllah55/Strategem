import Project from "../models/project.model.js";
import User from "../models/user.model.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, members, tools } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const ownerId = req.user._id;

    // Validate and format members
    let formattedMembers = await Promise.all(
      members.map(async (memberId) => {
        const user = await User.findById(memberId);
        if (!user) throw new Error(`User not found: ${memberId}`);
        return {
          user: user._id,
          role: "member",
          joinedAt: new Date(),
        };
      })
    );

    // Add owner as lead
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
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    console.error("Create Project Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
