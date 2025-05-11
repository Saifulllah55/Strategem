// filepath: d:\Project_Integration\Strategem\backend\controllers\customReminder.controller.js
import CustomReminder from "../models/customReminder.model.js";
import { createNotification } from "./notification.controller.js";

export const customReminderController = {
  // Get all custom reminders for a user
  getAllCustomReminders: async (req, res) => {
    try {
      const reminders = await CustomReminder.find({ 
        user: req.user._id,
        status: { $ne: 'cancelled' }
      }).sort({ dueDate: 1 });
      
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching custom reminders:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get custom reminders that need notification
  getRemindersToNotify: async (req, res) => {
    try {
      const now = new Date();
      
      // Find reminders that are:
      // 1. Active
      // 2. Not yet notified
      // 3. Past their notification time
      const dueReminders = await CustomReminder.find({
        status: "active",
        isNotified: false,
        notificationDate: { $lte: now }
      }).populate('user', 'name email');
      
      const notifications = [];
      
      for (const reminder of dueReminders) {
        try {
          // Create notification
          const content = `Reminder: ${reminder.title} is due ${reminder.hoursBeforeDue} hour(s) from now`;
          const link = "/reminders";
          
          const notification = await createNotification(reminder.user._id, "reminder", content, link);
          notifications.push(notification);
          
          // Mark reminder as notified
          reminder.isNotified = true;
          await reminder.save();
        } catch (err) {
          console.error(`Error processing reminder ${reminder._id}:`, err);
        }
      }
      
      res.status(200).json({
        message: `Created ${notifications.length} custom reminder notifications`,
        count: notifications.length,
        notifications
      });
    } catch (error) {
      console.error("Error checking due custom reminders:", error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get custom reminder by ID
  getCustomReminderById: async (req, res) => {
    try {
      const reminder = await CustomReminder.findOne({
        _id: req.params.id,
        user: req.user._id
      });
      
      if (!reminder) {
        return res.status(404).json({ message: "Custom reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      console.error(`Error fetching custom reminder ${req.params.id}:`, error);
      res.status(500).json({ message: error.message });
    }
  },

  // Create new custom reminder
  createCustomReminder: async (req, res) => {
    try {
      const { title, description, dueDate, hoursBeforeDue } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      if (!dueDate) {
        return res.status(400).json({ message: "Due date is required" });
      }
      
      const reminderData = {
        title,
        description: description || "",
        dueDate: new Date(dueDate),
        hoursBeforeDue: hoursBeforeDue || 24,
        user: req.user._id
      };
      
      // Calculate notification date
      const notificationDate = new Date(dueDate);
      notificationDate.setHours(notificationDate.getHours() - (hoursBeforeDue || 24));
      reminderData.notificationDate = notificationDate;
      
      const newReminder = await CustomReminder.create(reminderData);
      
      res.status(201).json(newReminder);
    } catch (error) {
      console.error("Error creating custom reminder:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Update a custom reminder
  updateCustomReminder: async (req, res) => {
    try {
      const { title, description, dueDate, hoursBeforeDue, status } = req.body;
      
      const reminder = await CustomReminder.findOne({
        _id: req.params.id,
        user: req.user._id
      });
      
      if (!reminder) {
        return res.status(404).json({ message: "Custom reminder not found" });
      }
      
      // Update fields if provided
      if (title) reminder.title = title;
      if (description !== undefined) reminder.description = description;
      if (status) reminder.status = status;
      
      // Update dates and notification settings
      if (dueDate) {
        reminder.dueDate = new Date(dueDate);
        
        // Recalculate notification date if hours or due date changed
        if (dueDate || hoursBeforeDue) {
          if (hoursBeforeDue) reminder.hoursBeforeDue = hoursBeforeDue;
          
          const notificationDate = new Date(reminder.dueDate);
          notificationDate.setHours(notificationDate.getHours() - reminder.hoursBeforeDue);
          reminder.notificationDate = notificationDate;
          
          // Reset notification status if date changed
          reminder.isNotified = false;
        }
      }
      
      await reminder.save();
      
      res.json(reminder);
    } catch (error) {
      console.error(`Error updating custom reminder ${req.params.id}:`, error);
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a custom reminder
  deleteCustomReminder: async (req, res) => {
    try {
      const result = await CustomReminder.deleteOne({
        _id: req.params.id,
        user: req.user._id
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Custom reminder not found" });
      }
      
      res.json({ message: "Custom reminder deleted successfully" });
    } catch (error) {
      console.error(`Error deleting custom reminder ${req.params.id}:`, error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // Mark reminder as notified
  markAsNotified: async (req, res) => {
    try {
      const reminder = await CustomReminder.findOne({
        _id: req.params.id,
        user: req.user._id
      });
      
      if (!reminder) {
        return res.status(404).json({ message: "Custom reminder not found" });
      }
      
      reminder.isNotified = true;
      await reminder.save();
      
      res.json({ message: "Reminder marked as notified", reminder });
    } catch (error) {
      console.error(`Error marking custom reminder ${req.params.id} as notified:`, error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // Cleanup expired reminders
  cleanupExpiredReminders: async (req, res) => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const result = await CustomReminder.deleteMany({
        status: "completed",
        updatedAt: { $lt: oneMonthAgo }
      });
      
      res.json({ 
        message: `Cleaned up ${result.deletedCount} expired custom reminders`,
        count: result.deletedCount
      });
    } catch (error) {
      console.error("Error cleaning up expired custom reminders:", error);
      res.status(500).json({ message: error.message });
    }
  }
};