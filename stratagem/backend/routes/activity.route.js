import express from "express";
import { getProjectActivities } from "../controllers/activity.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:projectId", protectRoute, getProjectActivities);

export default router; 