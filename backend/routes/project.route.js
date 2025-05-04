import express from "express";
import { createProject, getUserProjects } from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createProject);
router.get("/getall", protectRoute,getUserProjects );

export default router;
