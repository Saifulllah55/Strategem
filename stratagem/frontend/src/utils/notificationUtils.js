/**
 * Utility functions for handling browser notifications
 */

/**
 * Check if browser notifications are supported and request permission if needed
 * @returns {Promise<boolean>} Whether notification permission is granted
 */
export const checkNotificationPermission = async () => {
  // Check if the browser supports notifications
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }

  // Check notification permission status
  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    // Request permission
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Send a browser notification
 * @param {string} title - The notification title
 * @param {Object} options - Notification options like body, icon, etc.
 * @returns {boolean} Whether the notification was sent successfully
 */
export const sendNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  try {
    // Default options merged with provided options
    const defaultOptions = {
      body: 'You have a new notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    };

    const notification = new Notification(title, { ...defaultOptions, ...options });

    // Add click event if provided
    if (options.onClick && typeof options.onClick === 'function') {
      notification.onclick = options.onClick;
    } else {
      // Default click behavior: focus on window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

/**
 * Schedule a notification to be shown at a later time
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @param {Date|number} triggerTime - When to show the notification (Date object or timestamp)
 * @returns {number} Timer ID that can be used to cancel the notification
 */
export const scheduleNotification = (title, options = {}, triggerTime) => {
  if (!triggerTime) {
    console.error('No trigger time provided for scheduled notification');
    return null;
  }

  let delay;
  if (triggerTime instanceof Date) {
    delay = triggerTime.getTime() - Date.now();
  } else if (typeof triggerTime === 'number') {
    delay = triggerTime;
  } else {
    console.error('Invalid trigger time format');
    return null;
  }

  // Ensure delay is at least 0 (don't schedule in the past)
  delay = Math.max(0, delay);

  // Schedule the notification
  const timerId = setTimeout(() => {
    sendNotification(title, options);
  }, delay);

  return timerId;
};

/**
 * Cancel a scheduled notification
 * @param {number} timerId - The timer ID returned by scheduleNotification
 */
export const cancelScheduledNotification = (timerId) => {
  if (timerId) {
    clearTimeout(timerId);
  }
};

/**
 * Check for and trigger any pending notifications
 * This should be called regularly (e.g., when app starts or using setInterval)
 * @param {Array} reminders - Array of reminder objects
 * @returns {Array} IDs of reminders that were triggered
 */
export const checkAndTriggerReminders = (reminders) => {
  if (!Array.isArray(reminders) || reminders.length === 0) {
    return [];
  }

  const now = new Date();
  const triggeredReminderIds = [];

  reminders.forEach(reminder => {
    // Skip if already sent or failed
    if (reminder.status !== 'pending') {
      return;
    }

    // Get the time the reminder should be sent
    let sendTime;
    if (reminder.sendAt) {
      sendTime = new Date(reminder.sendAt);
    } else if (reminder.customDate) {
      sendTime = new Date(reminder.customDate);
    } else {
      // Can't determine when to send, skip
      return;
    }

    // Check if it's time to send the notification
    if (sendTime <= now) {
      // Send the notification
      const success = sendNotification(
        reminder.title, 
        {
          body: reminder.message,
          icon: '/notification-icon.png',
          data: { reminderId: reminder.id, taskId: reminder.taskId }
        }
      );

      if (success) {
        triggeredReminderIds.push(reminder.id);
      }
    }
  });

  return triggeredReminderIds;
};