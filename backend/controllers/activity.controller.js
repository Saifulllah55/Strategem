import Activity from "../models/activity.model.js";

export const getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    const activities = await Activity.find({ project: projectId })
      .populate("user", "username")
      .populate("relatedTask", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all activities where the user is involved
    const activities = await Activity.find({
      $or: [
        { user: userId }, // Activities created by the user
        { "relatedTask.assignedTo": userId } // Activities related to tasks assigned to the user
      ]
    })
    .populate("user", "username")
    .populate("relatedTask", "title assignedTo")
    .populate("project", "name")
    .sort({ createdAt: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createActivity = async (projectId, userId, type, content, taskId = null) => {
  try {
    const activity = new Activity({
      project: projectId,
      user: userId,
      type,
      content,
      relatedTask: taskId,
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}; 