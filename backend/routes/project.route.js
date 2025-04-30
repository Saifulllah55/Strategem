import express from "express";
import { createProject } from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", createProject);

export default router;
