import express from "express";
import { reminderController } from "../controllers/reminder.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

// Get all reminders
router.get("/", reminderController.getAllReminders);

// Get reminders to notify
router.get("/notify", reminderController.getRemindersToNotify);

// Cleanup expired reminders
router.delete("/cleanup", reminderController.cleanupExpiredReminders);

// Get reminders by type
router.get("/type/:type", reminderController.getRemindersByType);

// Get all custom reminders
router.get("/custom", reminderController.getCustomReminders);

// Create a custom reminder
router.post("/custom", reminderController.createCustomReminder);

// Get reminder by ID
router.get("/:id", reminderController.getReminderById);

// Create new reminder
router.post("/", reminderController.createReminder);

// Update reminder
router.put("/:id", reminderController.updateReminder);

// Delete reminder
router.delete("/:id", reminderController.deleteReminder);

// Mark reminder as notified
router.patch("/:id/notified", reminderController.markAsNotified);

export default router; 