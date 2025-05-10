import express from "express";
import { projectController } from "../controllers/project.controller.js";
// import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.use(protectRoute); // Temporarily removed for testing

// Get all projects
router.get("/", projectController.getAllProjects);

// Get project by ID
router.get("/:id", projectController.getProjectById);

// Create new project
router.post("/", projectController.createProject);

// Update project
router.put("/:id", projectController.updateProject);

// Delete project
router.delete("/:id", projectController.deleteProject);

export default router;
