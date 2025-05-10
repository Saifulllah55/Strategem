import express from "express";
import { reminderController } from "../controllers/reminder.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all reminders
router.get("/", reminderController.getAllReminders);

// Get reminder by ID
router.get("/:id", reminderController.getReminderById);

// Create new reminder
router.post("/", reminderController.createReminder);

// Update reminder
router.put("/:id", reminderController.updateReminder);

// Delete reminder
router.delete("/:id", reminderController.deleteReminder);

// Get reminders by type
router.get("/type/:type", reminderController.getRemindersByType);

export default router; 