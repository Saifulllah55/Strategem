import express from "express";
import { createProject, createTaskForProject, getProjectById, getTasksByProjectId, getUserProjects, updateTaskForProject, createAnnouncement, addMembers } from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/create", protectRoute, createProject);
router.get("/getall", protectRoute, getUserProjects);
router.get("/:projectId", protectRoute, getProjectById);
router.post("/:projectId/announcement", protectRoute, createAnnouncement);
router.post("/:projectId/members", protectRoute, addMembers);



export default router;
