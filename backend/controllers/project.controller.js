import Project from '../models/project.model.js'; 
import User from '../models/user.model.js';

export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const ownerId = req.user.id; 

    let formattedMembers = [];
    if (members && Array.isArray(members)) {
      formattedMembers = await Promise.all(
        members.map(async (member) => {
          const user = await User.findById(member.user);
          if (!user) throw new Error(`User not found: ${member.user}`);
          return {
            user: user._id,
            role: member.role || 'member',
            joinedAt: new Date()
          };
        })
      );
    }

    formattedMembers.push({
      user: ownerId,
      role: 'admin',
      joinedAt: new Date()
    });

    const newProject = new Project({
      name,
      description,
      owner: ownerId,
      members: formattedMembers
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);

  } catch (err) {
    console.error('Create Project Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
