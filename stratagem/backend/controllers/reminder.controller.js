import Reminder from "../models/reminder.model.js";

export const reminderController = {
  // Get all reminders for a user
  getAllReminders: async (req, res) => {
    try {
      const reminders = await Reminder.find({ 
        user: req.user._id,
        status: { $ne: 'cancelled' },
        dueDate: { $gte: new Date() }
      })
        .populate('relatedTo')
        .sort({ dueDate: 1 });
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get reminder by ID
  getReminderById: async (req, res) => {
    try {
      const reminder = await Reminder.findOne({
        _id: req.params.id,
        user: req.user._id
      }).populate('relatedTo');
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new reminder
  createReminder: async (req, res) => {
    try {
      // Default values if not provided
      const reminderData = {
        ...req.body,
        user: req.user._id,
        type: req.body.type || "task",
        description: req.body.description || "",
        dueDate: req.body.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to 24 hours from now
      };
      
      // Make sure relatedTo exists for non-custom types
      if (reminderData.type !== 'custom' && reminderData.type !== 'general' && !reminderData.relatedTo) {
        // If taskId is provided instead (for backwards compatibility)
        if (req.body.taskId) {
          reminderData.relatedTo = req.body.taskId;
          reminderData.type = "task";
        } else {
          return res.status(400).json({ message: "Missing relatedTo field" });
        }
      }
      
      // Calculate notification date based on hoursBeforeDue
      if (reminderData.dueDate && reminderData.hoursBeforeDue) {
        const notificationDate = new Date(reminderData.dueDate);
        notificationDate.setHours(notificationDate.getHours() - (reminderData.hoursBeforeDue || 24));
        reminderData.notificationDate = notificationDate;
      }
      
      const reminder = new Reminder(reminderData);
      const savedReminder = await reminder.save();
      res.status(201).json(savedReminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(400).json({ message: error.message });
    }
  },

  // Create a custom reminder (not related to a task)
  createCustomReminder: async (req, res) => {
    try {
      // Custom reminders need title, description, due date, and hoursBeforeDue
      const { title, description, dueDate, hoursBeforeDue, priority } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      // Prepare reminder data
      const reminderData = {
        title,
        description: description || "",
        type: "custom",
        dueDate: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        hoursBeforeDue: hoursBeforeDue || 24,
        priority: priority || "medium",
        status: "active",
        user: req.user._id
      };
      
      // Calculate notification date
      const notificationDate = new Date(reminderData.dueDate);
      notificationDate.setHours(notificationDate.getHours() - reminderData.hoursBeforeDue);
      reminderData.notificationDate = notificationDate;
      
      const reminder = new Reminder(reminderData);
      const savedReminder = await reminder.save();
      res.status(201).json(savedReminder);
    } catch (error) {
      console.error("Error creating custom reminder:", error);
      res.status(400).json({ message: error.message });
    }
  },

  // Update reminder
  updateReminder: async (req, res) => {
    try {
      // If updating due date or hours before due, recalculate notification date
      const updates = { ...req.body };
      
      if ((updates.dueDate || updates.hoursBeforeDue) && req.body.dueDate) {
        const dueDate = new Date(updates.dueDate || req.body.dueDate);
        const hoursBeforeDue = updates.hoursBeforeDue || req.body.hoursBeforeDue || 24;
        
        const notificationDate = new Date(dueDate);
        notificationDate.setHours(notificationDate.getHours() - hoursBeforeDue);
        updates.notificationDate = notificationDate;
      }
      
      const reminder = await Reminder.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        updates,
        { new: true }
      );
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete reminder
  deleteReminder: async (req, res) => {
    try {
      const reminder = await Reminder.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
      });
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get reminders by type (task, project, general, or custom)
  getRemindersByType: async (req, res) => {
    try {
      const reminders = await Reminder.find({
        user: req.user._id,
        type: req.params.type,
        status: { $ne: 'cancelled' },
        dueDate: { $gte: new Date() }
      })
        .populate('relatedTo')
        .sort({ dueDate: 1 });
      
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get custom reminders
  getCustomReminders: async (req, res) => {
    try {
      const reminders = await Reminder.find({
        user: req.user._id,
        type: 'custom',
        status: { $ne: 'cancelled' },
        dueDate: { $gte: new Date() }
      })
        .sort({ dueDate: 1 });
      
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get reminders due to be notified now
  getRemindersToNotify: async (req, res) => {
    try {
      const now = new Date();
      const future = new Date(now);
      future.setHours(future.getHours() + 1); // Get reminders due in the next hour
      
      const reminders = await Reminder.find({
        user: req.user._id,
        status: 'active',
        notificationDate: { $lte: future, $gte: now },
        isNotified: false,
        dueDate: { $gte: now } // Only get reminders that haven't expired
      }).populate('relatedTo');
      
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Mark reminder as notified
  markAsNotified: async (req, res) => {
    try {
      const reminder = await Reminder.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isNotified: true },
        { new: true }
      );
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  // Clean up expired reminders (due date in the past)
  cleanupExpiredReminders: async (req, res) => {
    try {
      const now = new Date();
      
      const result = await Reminder.deleteMany({
        user: req.user._id,
        dueDate: { $lt: now }
      });
      
      res.json({ 
        message: "Expired reminders cleaned up successfully", 
        count: result.deletedCount 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}; 