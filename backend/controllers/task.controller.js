import taskModel from "../models/task.model.js";
// Create a new task for a project

export const createTask = async (req, res) => {
  try {
    const { projectId, tasks } = req.body;

    if (!projectId || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Invalid request format! Expected an array of tasks." });
    }

    const task = await Task.findOneAndUpdate(
      { projectId },
      { $push: { tasks: { $each: tasks } } },  // ✅ Bulk push array items
      { upsert: true, new: true }
    );

    res.status(201).json(task);
  } catch (error) {
    console.error("❌ Error saving tasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks for a project
export const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.findOne({ projectId: req.params.projectId });
    if (!tasks) {
      return res.status(404).json({ message: 'No tasks found for this project' });
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTask = await Task.findOneAndUpdate(
      { projectId: req.params.projectId, 'tasks._id': req.params.taskId },
      { $set: { 'tasks.$.status': status } },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { projectId: req.params.projectId },
      { $pull: { tasks: { _id: req.params.taskId } } },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully', updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
