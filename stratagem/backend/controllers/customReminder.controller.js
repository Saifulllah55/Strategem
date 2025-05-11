import CustomReminder from "../models/customReminder.model.js";

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
      
      // Create reminder data
      const reminderData = {
        title,
        description: description || "",
        dueDate,
        hoursBeforeDue: hoursBeforeDue || 24,
        user: req.user._id
      };
      
      // Calculate notification date
      const notificationDate = new Date(dueDate);
      notificationDate.setHours(notificationDate.getHours() - (reminderData.hoursBeforeDue));
      reminderData.notificationDate = notificationDate;
      
      // Create and save the reminder
      const reminder = new CustomReminder(reminderData);
      const savedReminder = await reminder.save();
      
      res.status(201).json(savedReminder);
    } catch (error) {
      console.error("Error creating custom reminder:", error);
      res.status(400).json({ message: error.message });
    }
  },

  // Update custom reminder
  updateCustomReminder: async (req, res) => {
    try {
      const updates = { ...req.body };
      
      // If updating due date or hours before due, recalculate notification date
      if ((updates.dueDate || updates.hoursBeforeDue) && (updates.dueDate || req.body.dueDate)) {
        const dueDate = new Date(updates.dueDate || req.body.dueDate);
        const hoursBeforeDue = updates.hoursBeforeDue || req.body.hoursBeforeDue || 24;
        
        const notificationDate = new Date(dueDate);
        notificationDate.setHours(notificationDate.getHours() - hoursBeforeDue);
        updates.notificationDate = notificationDate;
      }
      
      const reminder = await CustomReminder.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        updates,
        { new: true }
      );
      
      if (!reminder) {
        return res.status(404).json({ message: "Custom reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      console.error(`Error updating custom reminder ${req.params.id}:`, error);
      res.status(400).json({ message: error.message });
    }
  },

  // Delete custom reminder
  deleteCustomReminder: async (req, res) => {
    try {
      const reminder = await CustomReminder.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
      });
      
      if (!reminder) {
        return res.status(404).json({ message: "Custom reminder not found" });
      }
      
      res.json({ message: "Custom reminder deleted successfully" });
    } catch (error) {
      console.error(`Error deleting custom reminder ${req.params.id}:`, error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get reminders due to be notified soon
  getRemindersToNotify: async (req, res) => {
    try {
      const now = new Date();
      const future = new Date(now);
      future.setHours(future.getHours() + 1); // Get reminders due in the next hour
      
      const reminders = await CustomReminder.find({
        user: req.user._id,
        status: 'active',
        notificationDate: { $lte: future, $gte: now },
        isNotified: false,
        dueDate: { $gte: now } // Only get reminders that haven't expired
      });
      
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders to notify:", error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // Mark reminder as notified
  markAsNotified: async (req, res) => {
    try {
      const reminder = await CustomReminder.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isNotified: true },
        { new: true }
      );
      
      if (!reminder) {
        return res.status(404).json({ message: "Custom reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      console.error(`Error marking custom reminder ${req.params.id} as notified:`, error);
      res.status(400).json({ message: error.message });
    }
  },
  
  // Clean up expired reminders (due date in the past)
  cleanupExpiredReminders: async (req, res) => {
    try {
      const now = new Date();
      
      const result = await CustomReminder.deleteMany({
        user: req.user._id,
        dueDate: { $lt: now }
      });
      
      res.json({ 
        message: "Expired custom reminders cleaned up successfully", 
        count: result.deletedCount 
      });
    } catch (error) {
      console.error("Error cleaning up expired custom reminders:", error);
      res.status(500).json({ message: error.message });
    }
  }
}; 