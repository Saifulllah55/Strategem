import express from "express";
import { taskController } from "../controllers/task.controller.js";
// import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.use(protectRoute); // Temporarily removed for testing

// Get all tasks
router.get("/", taskController.getAllTasks);

// Get task by ID
router.get("/:id", taskController.getTaskById);

// Create new task
router.post("/", taskController.createTask);

// Update task
router.put("/:id", taskController.updateTask);

// Delete task
router.delete("/:id", taskController.deleteTask);

// Get tasks by project
router.get("/project/:projectId", taskController.getTasksByProject);

export default router;
