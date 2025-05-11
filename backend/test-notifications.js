// This script tests the notification system by creating test reminders and checking due notifications
// You can run this script with: node test-notifications.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createNotification } from './controllers/notification.controller.js';
import { checkDueReminders } from './controllers/reminder.controller.js';
import Reminder from './models/reminder.model.js';
import User from './models/user.model.js';

dotenv.config();

// Connect to the database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createTestReminders = async () => {
  try {
    // Find a user to assign reminders to
    const user = await User.findOne({});
    
    if (!user) {
      console.error('No users found in the database');
      return;
    }
    
    console.log(`Creating test reminders for user: ${user.name}`);
    
    // Create a reminder due in the past (to immediately trigger)
    const pastDue = new Date();
    pastDue.setHours(pastDue.getHours() - 1);
    
    // Create a due-soon reminder
    const soonDue = new Date();
    soonDue.setMinutes(soonDue.getMinutes() + 5);
    
    // Create test reminders
    const testReminders = [
      {
        title: 'Test Immediate Notification',
        description: 'This should trigger immediately',
        type: 'general',
        dueDate: pastDue,
        priority: 'high',
        status: 'active',
        user: user._id,
        hoursBeforeDue: 0,
        notificationDate: new Date() // Now
      },
      {
        title: 'Test Soon Notification',
        description: 'This should be due soon',
        type: 'general',
        dueDate: soonDue,
        priority: 'medium',
        status: 'active',
        user: user._id,
        hoursBeforeDue: 1,
        notificationDate: new Date() // Now
      }
    ];
    
    // Delete any existing test reminders
    await Reminder.deleteMany({ 
      title: { $in: testReminders.map(r => r.title) },
      user: user._id
    });
    
    // Create the new test reminders
    await Reminder.insertMany(testReminders);
    console.log('Test reminders created successfully');
    
    // Test notification creation
    await createNotification(
      user._id,
      'test',
      'This is a test notification from the test script',
      '/reminders'
    );
    console.log('Test notification created');
    
    // Run the reminder check
    const mockReq = { query: { api: 'true' } };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`Reminder check results:`, data);
        }
      }),
      headersSent: false
    };
    
    await checkDueReminders(mockReq, mockRes);
    
    console.log('Notification test completed successfully');
  } catch (error) {
    console.error('Error creating test reminders:', error);
  } finally {
    mongoose.disconnect();
  }
};

createTestReminders();
