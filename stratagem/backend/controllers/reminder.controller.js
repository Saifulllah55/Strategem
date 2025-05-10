import Reminder from "../models/reminder.model.js";

export const reminderController = {
  // Get all reminders for a user
  getAllReminders: async (req, res) => {
    try {
      const reminders = await Reminder.find({ user: req.user._id })
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
      const reminder = new Reminder({
        ...req.body,
        user: req.user._id
      });
      
      const savedReminder = await reminder.save();
      res.status(201).json(savedReminder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update reminder
  updateReminder: async (req, res) => {
    try {
      const reminder = await Reminder.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { ...req.body },
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

  // Get reminders by type (task, project, or general)
  getRemindersByType: async (req, res) => {
    try {
      const reminders = await Reminder.find({
        user: req.user._id,
        type: req.params.type
      })
        .populate('relatedTo')
        .sort({ dueDate: 1 });
      
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}; 