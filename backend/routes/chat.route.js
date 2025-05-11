import express from "express";
import { 
  getProjectMessages, 
  createMessage 
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/project/:projectId", protectRoute, getProjectMessages);
router.post("/project/:projectId", protectRoute, createMessage);

export default router; 