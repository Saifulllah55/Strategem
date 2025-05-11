import express from "express";
import { customReminderController } from "../controllers/customReminder.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

// Get all custom reminders
router.get("/", customReminderController.getAllCustomReminders);

// Get reminders to notify
router.get("/notify", customReminderController.getRemindersToNotify);

// Cleanup expired reminders
router.delete("/cleanup", customReminderController.cleanupExpiredReminders);

// Get a custom reminder by ID
router.get("/:id", customReminderController.getCustomReminderById);

// Create a new custom reminder
router.post("/", customReminderController.createCustomReminder);

// Update a custom reminder
router.put("/:id", customReminderController.updateCustomReminder);

// Delete a custom reminder
router.delete("/:id", customReminderController.deleteCustomReminder);

// Mark a custom reminder as notified
router.patch("/:id/notified", customReminderController.markAsNotified);

export default router; 