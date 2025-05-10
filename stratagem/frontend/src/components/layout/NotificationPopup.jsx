import { useState, useEffect } from 'react';
import { 
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccessTime as TimeIcon, 
  Check as CheckIcon,
  Error as ErrorIcon,
  Event as EventIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const NotificationPopup = ({ anchorEl, open, onClose }) => {
  const { taskReminders, customReminders, dismissReminder, hasPermission, requestPermission } = useNotification();
  const { notifications, markNotificationRead, removeNotification, markAllNotificationsRead } = useApp();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!hasPermission) {
      setShowPermissionPrompt(true);
    }
  }, [hasPermission]);
  
  const handleDismissReminder = (reminderId, isCustom = false) => {
    dismissReminder(reminderId, isCustom);
  };
  
  const handleDismissNotification = (notificationId) => {
    removeNotification(notificationId);
  };
  
  const handleTaskClick = (projectId, taskId) => {
    navigate(`/tasks?project=${projectId}&task=${taskId}`);
    onClose();
  };
  
  const handleCustomReminderClick = () => {
    navigate('/reminders');
    onClose();
  };
  
  const handleProjectClick = (projectId) => {
    navigate(`/reports?project=${projectId}`);
    markNotificationRead(projectId);
    onClose();
  };
  
  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setShowPermissionPrompt(!granted);
  };
  
  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };
  
  const formatTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    
    if (diffMs < 0) {
      return 'Overdue';
    }
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m remaining`;
  };
  
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error.main';
      case 'medium': return 'warning.main';
      default: return 'info.main';
    }
  };
  
  // Combine task reminders, custom reminders, and project notifications
  const allNotifications = [
    ...taskReminders.map(reminder => ({ ...reminder, type: 'taskReminder' })),
    ...customReminders.map(reminder => ({ ...reminder, type: 'customReminder' })),
    ...notifications
  ];
  
  const notificationCount = allNotifications.length;
  
  return (
    <Menu
      id="notification-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: {
          width: 350,
          maxHeight: 400,
          overflow: 'auto',
          borderRadius: 2,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        bgcolor: 'background.paper', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center' 
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Notifications
        </Typography>
        {notificationCount > 0 && (
          <Button 
            size="small" 
            variant="text" 
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        )}
      </Box>
      <Divider />
      
      {showPermissionPrompt && (
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Enable notifications to receive task reminders
          </Typography>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleRequestPermission}
            sx={{ mt: 1 }}
          >
            Enable Notifications
          </Button>
        </Box>
      )}
      
      {notificationCount === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications at this time
          </Typography>
        </Box>
      ) : (
        allNotifications.map((notification) => {
          if (notification.type === 'taskReminder') {
            // Task reminder notification
            return (
              <MenuItem 
                key={`taskReminder-${notification._id}`} 
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderLeft: 3, 
                  borderColor: getPriorityColor(notification.priority),
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 0.5
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {notification.title}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissReminder(notification._id);
                      }}
                      sx={{ ml: 1, mt: -0.5 }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {notification.projectTitle}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" color="error">
                      {formatTimeRemaining(notification.dueDate)}
                    </Typography>
                  </Box>
                  
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleTaskClick(notification.project._id, notification.relatedTo)}
                    sx={{ mt: 0.5 }}
                  >
                    View Task
                  </Button>
                </Box>
              </MenuItem>
            );
          } else if (notification.type === 'customReminder') {
            // Custom reminder notification
            return (
              <MenuItem 
                key={`customReminder-${notification._id}`} 
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderLeft: 3, 
                  borderColor: getPriorityColor(notification.priority),
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 0.5
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {notification.title}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissReminder(notification._id, true);
                      }}
                      sx={{ ml: 1, mt: -0.5 }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {notification.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventNoteIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" color="error">
                      {formatTimeRemaining(notification.dueDate)}
                    </Typography>
                  </Box>
                  
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    onClick={handleCustomReminderClick}
                    sx={{ mt: 0.5 }}
                  >
                    View Reminder
                  </Button>
                </Box>
              </MenuItem>
            );
          } else {
            // Project due notification
            return (
              <MenuItem 
                key={`project-${notification.id}`} 
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderLeft: 3, 
                  borderColor: 'error.main',
                  backgroundColor: notification.read ? 'rgba(0,0,0,0.05)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 0.5
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 'bold',
                      color: notification.read ? 'text.secondary' : 'text.primary'
                    }}>
                      {notification.title}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissNotification(notification.id);
                      }}
                      sx={{ ml: 1, mt: -0.5 }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {notification.message}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" color="error">
                      Due: {formatDate(notification.dueDate)}
                    </Typography>
                  </Box>
                  
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleProjectClick(notification.projectId)}
                    sx={{ mt: 0.5 }}
                  >
                    View Project
                  </Button>
                </Box>
              </MenuItem>
            );
          }
        })
      )}
    </Menu>
  );
};

export default NotificationPopup;