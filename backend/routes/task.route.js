import express from "express";
import { createTaskForProject, getTasksByProjectId, updateTaskForProject } from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();


router.get("/:projectId", protectRoute, getTasksByProjectId);
router.post("/:projectId/createtask", protectRoute, createTaskForProject);
router.put("/:taskId/updatetask", protectRoute, updateTaskForProject);

export default router;
