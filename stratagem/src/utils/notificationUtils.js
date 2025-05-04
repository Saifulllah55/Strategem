// Notification utility functions for managing task reminders

// Function to check if Notification API is available and permission is granted
const checkNotificationPermission = async () => {
  // Check if the browser supports notifications
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notifications');
    return false;
  }

  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    return true;
  }

  // Request permission if it's not denied
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Function to send a notification for a task
const sendTaskNotification = async (task) => {
  const hasPermission = await checkNotificationPermission();
  
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return false;
  }

  try {
    const notification = new Notification(`Task Due Soon: ${task.title}`, {
      body: `The task "${task.title}" is due in 24 hours (${new Date(task.dueDate).toLocaleString()})`,
      icon: '/vite.svg', // Default icon
      tag: `task-reminder-${task.id}`, // Prevents duplicate notifications
      requireInteraction: true // Notification persists until user interacts with it
    });

    notification.onclick = () => {
      // Focus on window and navigate to the task
      window.focus();
      if (task.projectId) {
        window.location.href = `/tasks?project=${task.projectId}&task=${task.id}`;
      } else {
        window.location.href = `/tasks?task=${task.id}`;
      }
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Function to send email reminders (placeholder for backend integration)
const sendEmailReminder = async (task, user) => {
  // In a real application, this would call a backend API to send an email
  console.log(`[Email Reminder] To: ${user.email}, Task: ${task.title} due on ${new Date(task.dueDate).toLocaleString()}`);
  return true;
};

// Function to check tasks and send reminders for those due within 24 hours
const checkAndSendReminders = (tasks, user) => {
  if (!tasks || tasks.length === 0) return [];
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(now.getHours() + 24);
  
  const tasksToRemind = tasks.filter(task => {
    if (task.completed) return false;
    
    const dueDate = new Date(task.dueDate);
    return dueDate > now && dueDate <= tomorrow;
  });
  
  // Send notifications for each task due within 24 hours
  tasksToRemind.forEach(task => {
    sendTaskNotification(task);
    sendEmailReminder(task, user);
  });
  
  return tasksToRemind;
};

export { 
  checkNotificationPermission, 
  sendTaskNotification, 
  sendEmailReminder, 
  checkAndSendReminders 
};