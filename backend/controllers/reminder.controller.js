import Reminder from "../models/reminder.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import mongoose from "mongoose";
import { createNotification } from "./notification.controller.js";
import CustomReminder from "../models/customReminder.model.js";

// Get all reminders for authenticated user
export const getUserReminders = async (req, res) => {
  try {
    // Populate related data based on reminder type
    const reminders = await Reminder.find({ user: req.user._id })
      .populate({
        path: 'relatedTo',
        select: 'name title description status dueDate',
      })
      .sort({ notificationDate: 1 });

    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get a specific reminder by ID
export const getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate({
        path: 'relatedTo',
        select: 'name title description status dueDate',
      });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Check ownership
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to access this reminder" });
    }

    res.status(200).json(reminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new reminder
export const createReminder = async (req, res) => {
  try {
    const { title, description, type, relatedTo, dueDate, priority, hoursBeforeDue } = req.body;

    // Validate required fields
    if (!title || !type || !dueDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // If type is task or project, verify the related item exists
    if ((type === "task" || type === "project") && relatedTo) {
      const Model = type === "task" ? Task : Project;
      const item = await Model.findById(relatedTo);
      
      if (!item) {
        return res.status(404).json({ message: `${type} not found` });
      }
    }

    const reminder = new Reminder({
      title,
      description,
      type,
      relatedTo,
      dueDate,
      priority,
      hoursBeforeDue,
      user: req.user._id
    });

    await reminder.save();

    res.status(201).json(reminder);
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update a reminder
export const updateReminder = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, hoursBeforeDue } = req.body;
    
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    
    // Check ownership
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this reminder" });
    }

    // Update fields
    reminder.title = title || reminder.title;
    reminder.description = description || reminder.description;
    reminder.dueDate = dueDate || reminder.dueDate;
    reminder.priority = priority || reminder.priority;
    reminder.status = status || reminder.status;
    
    // Only update hoursBeforeDue if provided (could be 0, which is falsy)
    if (hoursBeforeDue !== undefined) {
      reminder.hoursBeforeDue = hoursBeforeDue;
      
      // Recalculate notification date
      const date = new Date(reminder.dueDate);
      date.setHours(date.getHours() - hoursBeforeDue);
      reminder.notificationDate = date;
    }
    
    // Reset notification if status changed to active
    if (status === "active" && reminder.isNotified) {
      reminder.isNotified = false;
    }

    await reminder.save();
    
    res.status(200).json(reminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    
    // Check ownership
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this reminder" });
    }
    
    await Reminder.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mark reminder as completed
export const completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    
    // Check ownership
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this reminder" });
    }
    
    reminder.status = "completed";
    await reminder.save();
    
    res.status(200).json(reminder);
  } catch (error) {
    console.error("Error completing reminder:", error);
    res.status(500).json({ message: error.message });
  }
};

// Check for due reminders and create notifications
export const checkDueReminders = async (req, res) => {
  try {
    const now = new Date();
    
    // Find reminders that are:
    // 1. Active
    // 2. Not yet notified
    // 3. Past their notification time
    const dueReminders = await Reminder.find({
      status: "active",
      isNotified: false,
      notificationDate: { $lte: now }
    }).populate('user', 'name email');
    
    // Also check custom reminders 
    const dueCustomReminders = await CustomReminder.find({
      status: "active",
      isNotified: false,
      notificationDate: { $lte: now }
    }).populate('user', 'name email');
    
    const notifications = [];
    
    // Process regular reminders
    for (const reminder of dueReminders) {
      try {
        // Create notification
        const content = `Reminder: ${reminder.title} is due ${reminder.hoursBeforeDue} hour(s) from now`;
        let link = "";
        
        if (reminder.type === "task") {
          link = `/task/${reminder.relatedTo}`;
        } else if (reminder.type === "project") {
          link = `/project/${reminder.relatedTo}`;
        } else {
          link = "/reminders";
        }
        
        const notification = await createNotification(reminder.user._id, "reminder", content, link);
        notifications.push(notification);
        
        // Mark reminder as notified
        reminder.isNotified = true;
        await reminder.save();
      } catch (err) {
        console.error(`Error processing reminder ${reminder._id}:`, err);
      }
    }
    
    // Process custom reminders
    for (const reminder of dueCustomReminders) {
      try {
        // Create notification
        const content = `Custom Reminder: ${reminder.title} is due ${reminder.hoursBeforeDue} hour(s) from now`;
        const link = "/reminders";
        
        const notification = await createNotification(reminder.user._id, "reminder", content, link);
        notifications.push(notification);
        
        // Mark reminder as notified
        reminder.isNotified = true;
        await reminder.save();
      } catch (err) {
        console.error(`Error processing custom reminder ${reminder._id}:`, err);
      }
    }
    
    if (req.query.api === "true") {
      return res.status(200).json({
        message: `Created ${notifications.length} reminder notifications`,
        count: notifications.length,
        notifications
      });
    }
    
    // If this was called by a cron job, don't need to send response
    if (!res.headersSent) {
      res.status(200).json({
        message: `Created ${notifications.length} reminder notifications`,
        count: notifications.length
      });
    }
  } catch (error) {
    console.error("Error checking due reminders:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};