import express from "express";
import { 
  getUserReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  checkDueReminders
} from "../controllers/reminder.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

// Get all reminders for authenticated user
router.get("/", getUserReminders);

// Check for reminders that are due and create notifications
router.get("/check-due", checkDueReminders);

// Get reminder by ID
router.get("/:id", getReminderById);

// Create new reminder
router.post("/", createReminder);

// Update reminder
router.put("/:id", updateReminder);

// Delete reminder
router.delete("/:id", deleteReminder);

// Mark reminder as completed
router.patch("/:id/complete", completeReminder);

export default router;

