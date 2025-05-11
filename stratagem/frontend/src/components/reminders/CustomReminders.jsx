import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Tooltip,
  Fab,
  Alert,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  NotificationsActive as NotificationsActiveIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  EventNote as EventNoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import CustomReminderForm from './CustomReminderForm';
import { customReminderAPI } from '../../api';

const CustomReminders = () => {
  const { customReminders, createCustomReminder, updateCustomReminder, deleteReminder, loading, isAuthenticated: contextAuthenticated } = useNotification();
  const [openForm, setOpenForm] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeReminder, setActiveReminder] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localReminders, setLocalReminders] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Authentication is now disabled in the backend, so we can consider all users authenticated
    setIsAuthenticated(true);
  }, []);
  
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setIsLoading(true);
        // Try direct API call first
        const response = await customReminderAPI.getAllCustomReminders();
        console.log('Fetched reminders directly from API:', response.data);
        setLocalReminders(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching reminders directly:', err);
        // Fall back to context reminders
        setLocalReminders(customReminders || []);
        setError('Failed to fetch reminders. Showing cached data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReminders();
  }, [customReminders]);
  
  const handleOpenMenu = (event, reminder) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveReminder(reminder);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveReminder(null);
  };
  
  const handleCreateReminder = () => {
    setSelectedReminder(null);
    setOpenForm(true);
  };
  
  const handleEditReminder = (reminder) => {
    setSelectedReminder(reminder);
    setOpenForm(true);
    handleCloseMenu();
  };
  
  const handleDeleteClick = (reminder) => {
    setReminderToDelete(reminder);
    setConfirmDelete(true);
    handleCloseMenu();
  };
  
  const handleSaveReminder = (reminderData) => {
    console.log('Reminder saved:', reminderData);
    // Refresh reminders from API
    setTimeout(() => {
      customReminderAPI.getAllCustomReminders().then(response => {
        setLocalReminders(response.data || []);
      });
    }, 500);
    setOpenForm(false);
  };
  
  const handleConfirmDelete = async () => {
    if (reminderToDelete) {
      try {
        await customReminderAPI.deleteCustomReminder(reminderToDelete._id);
        // Update local state
        setLocalReminders(prev => 
          prev.filter(r => r._id !== reminderToDelete._id)
        );
      } catch (err) {
        console.error('Error deleting reminder:', err);
        // Try context delete as fallback
        await deleteReminder(reminderToDelete._id, 'custom');
      }
      setConfirmDelete(false);
      setReminderToDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setReminderToDelete(null);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };
  
  const calculateTimeRemaining = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    try {
      const now = new Date();
      const due = new Date(dueDate);
      const diffMs = due - now;
      
      if (diffMs < 0) {
        return "Overdue";
      }
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      } else {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      }
    } catch (err) {
      console.error('Error calculating time remaining:', err);
      return 'Unknown';
    }
  };
  
  const calculateNotificationTime = (dueDate, hoursBeforeDue) => {
    if (!dueDate || !hoursBeforeDue) return 'No notification set';
    
    try {
      const due = new Date(dueDate);
      const notificationDate = new Date(due);
      notificationDate.setHours(notificationDate.getHours() - hoursBeforeDue);
      
      const now = new Date();
      if (notificationDate < now) {
        return "Notification time passed";
      }
      
      return `Notification at ${formatDate(notificationDate)}`;
    } catch (err) {
      console.error('Error calculating notification time:', err);
      return 'Error calculating notification time';
    }
  };
  
  if (loading || isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const remindersToDisplay = localReminders.length > 0 ? localReminders : customReminders || [];
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" component="h1">
          Custom Reminders
        </Typography>
        
        <Tooltip title="Create New Reminder">
          <Fab 
            color="primary" 
            size="medium" 
            onClick={handleCreateReminder}
            disabled={!isAuthenticated}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 4 }}>
          You need to be logged in to view and manage your reminders. Please log in to access this feature.
        </Alert>
      )}
      
      {remindersToDisplay.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 8 }}>
          {isAuthenticated ? (
            <>
              <NotificationsIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No custom reminders found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Create your first reminder to get started!
              </Typography>
              <Fab 
                variant="extended" 
                color="primary" 
                onClick={handleCreateReminder}
              >
                <AddIcon sx={{ mr: 1 }} />
                Create Reminder
              </Fab>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Log in to create and manage reminders
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {remindersToDisplay.map((reminder) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={reminder._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <IconButton
                  sx={{ position: 'absolute', top: 5, right: 5 }}
                  onClick={(e) => handleOpenMenu(e, reminder)}
                >
                  <MoreVertIcon />
                </IconButton>
                
                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ pr: 4 }}>
                    {reminder.title || 'Unnamed Reminder'}
                  </Typography>
                  
                  {reminder.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {reminder.description}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 2 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      Due: {formatDate(reminder.dueDate)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {calculateNotificationTime(reminder.dueDate, reminder.hoursBeforeDue)}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {calculateTimeRemaining(reminder.dueDate)} remaining
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Edit Reminder">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditReminder(reminder)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Reminder">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(reminder)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Options menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditReminder(activeReminder)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Reminder
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(activeReminder)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Reminder
        </MenuItem>
      </Menu>
      
      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.5)', 
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{ maxWidth: 400, p: 3, m: 2 }}>
            <Typography variant="h6" gutterBottom>
              Delete Reminder
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to delete the reminder "{reminderToDelete?.title}"?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Fab 
                  variant="extended" 
                  size="small" 
                  onClick={handleCancelDelete}
                >
                  Cancel
                </Fab>
                <Fab 
                  variant="extended" 
                  size="small" 
                  color="error"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </Fab>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
      
      {/* Form dialog */}
      <CustomReminderForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={handleSaveReminder}
        editReminder={selectedReminder}
      />
    </Box>
  );
};

export default CustomReminders; 