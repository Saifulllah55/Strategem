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
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationPopup = () => {
  const { reminders, dismissReminder, hasPermission, requestPermission } = useNotification();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const navigate = useNavigate();
  
  const open = Boolean(anchorEl);
  
  useEffect(() => {
    if (!hasPermission) {
      setShowPermissionPrompt(true);
    }
  }, [hasPermission]);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDismiss = (taskId) => {
    dismissReminder(taskId);
  };
  
  const handleTaskClick = (projectId, taskId) => {
    navigate(`/tasks?project=${projectId}&task=${taskId}`);
    handleClose();
  };
  
  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setShowPermissionPrompt(!granted);
  };
  
  const formatTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m remaining`;
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error.main';
      case 'medium': return 'warning.main';
      default: return 'info.main';
    }
  };
  
  return (
    <>
      <IconButton
        size="large"
        color="inherit"
        aria-label="show notifications"
        aria-controls="notification-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Badge badgeContent={reminders.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
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
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
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
        
        {reminders.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No task reminders at this time
            </Typography>
          </Box>
        ) : (
          reminders.map((task) => (
            <MenuItem 
              key={task.id} 
              sx={{ 
                py: 1.5, 
                px: 2,
                borderLeft: 3, 
                borderColor: getPriorityColor(task.priority),
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
                    {task.title}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDismiss(task.id)}
                    sx={{ ml: 1, mt: -0.5 }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {task.projectTitle}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" color="error">
                    {formatTimeRemaining(task.dueDate)}
                  </Typography>
                </Box>
                
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => handleTaskClick(task.projectId, task.id)}
                  sx={{ mt: 0.5 }}
                >
                  View Task
                </Button>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationPopup;