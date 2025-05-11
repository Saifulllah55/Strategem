import Task from "../models/task.model.js";
import { createNotification } from "../controllers/notification.controller.js";

export const checkOverdueTasks = async () => {
  try {
    const now = new Date();
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $nin: ["approved", "submitted"] }
    }).populate("assignedTo project");

    for (const task of overdueTasks) {
      // Notify the assignee
      if (task.assignedTo) {
        await createNotification(
          task.assignedTo._id,
          "overdue",
          `Task "${task.title}" is overdue!`,
          `/projects/${task.project._id}`
        );
      }

      // Notify project members (excluding the assignee)
      const projectMembers = task.project.members
        .filter(member => member.user.toString() !== task.assignedTo?._id.toString())
        .map(member => member.user);

      for (const memberId of projectMembers) {
        await createNotification(
          memberId,
          "overdue",
          `Task "${task.title}" assigned to ${task.assignedTo?.username || "Unassigned"} is overdue!`,
          `/projects/${task.project._id}`
        );
      }
    }
  } catch (error) {
    console.error("Error checking overdue tasks:", error);
  }
}; 