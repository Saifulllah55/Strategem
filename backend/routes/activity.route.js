import express from "express";
import { getProjectActivities, getAllActivities } from "../controllers/activity.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getAllActivities);
router.get("/:projectId", protectRoute, getProjectActivities);

export default router; 