import express from "express";
import { 
  getDashboardData,
  getProjectReport,
  getTasksReport
} from "../controllers/report.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

// Get dashboard data with summary stats
router.get("/dashboard", getDashboardData);

// Get detailed project report
router.get("/dashboard/project/:projectId", getProjectReport);

// Get tasks report with timeline data
router.get("/dashboard/tasks", getTasksReport);

export default router;
