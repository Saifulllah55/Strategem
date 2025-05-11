import express from "express";
import { getUserNotifications, markNotificationRead } from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", protectRoute, getUserNotifications);
router.put("/:notificationId/read", protectRoute, markNotificationRead);

export default router; 