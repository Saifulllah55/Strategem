import express from "express"
import { createTask,getTasksByProject,updateTaskStatus,deleteTask } from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post('/',createTask);
router.get('/tasks/:projectId',getTasksByProject);
router.patch('/tasks/:projectId/:taskId', updateTaskStatus);
router.delete('/tasks/:projectId/:taskId', deleteTask);
export default router;