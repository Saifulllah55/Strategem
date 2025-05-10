import express from "express";
import { 
  getProjectAnnouncements, 
  createAnnouncement 
} from "../controllers/announcement.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/project/:projectId", protectRoute, getProjectAnnouncements);
router.post("/project/:projectId", protectRoute, createAnnouncement);

export default router; 