import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  NotificationsActive as NotificationsActiveIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  EventNote as EventNoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import CustomReminderForm from './CustomReminderForm';

const CustomReminders = () => {
  const { customReminders, createCustomReminder, updateCustomReminder, deleteReminder, loading } = useNotification();
  const [openForm, setOpenForm] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeReminder, setActiveReminder] = useState(null);
  
  const handleOpenMenu = (event, reminder) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveReminder(reminder);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
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
  
  const handleOpenDeleteDialog = (reminder) => {
    setReminderToDelete(reminder);
    setOpenDeleteDialog(true);
    handleCloseMenu();
  };
  
  const handleDeleteReminder = async () => {
    if (reminderToDelete) {
      await deleteReminder(reminderToDelete._id, 'custom');
    }
    setOpenDeleteDialog(false);
    setReminderToDelete(null);
  };
  
  const handleReminderSaved = (newReminder) => {
    console.log('Reminder saved:', newReminder);
    // The context will handle updating the state
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    
    if (diffMs < 0) {
      return 'Overdue';
    }
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHrs} hr${diffHrs !== 1 ? 's' : ''}`;
    } else {
      return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} remaining`;
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  const getNotificationTime = (dueDate, hoursBeforeDue) => {
    if (!dueDate || !hoursBeforeDue) return null;
    
    const dueDateObj = new Date(dueDate);
    const notificationDate = new Date(dueDateObj);
    notificationDate.setHours(notificationDate.getHours() - hoursBeforeDue);
    
    return notificationDate;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
          Custom Reminders
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleCreateReminder}
          sx={{ borderRadius: 2 }}
        >
          Add Reminder
        </Button>
      </Box>
      
      {customReminders.length === 0 ? (
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <EventNoteIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No custom reminders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a custom reminder to get notified before an important deadline.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={handleCreateReminder}
            >
              Add Your First Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {customReminders.map((reminder) => {
            const notificationDate = getNotificationTime(reminder.dueDate, reminder.hoursBeforeDue);
            const isNotified = reminder.isNotified;
            const isPastNotification = notificationDate && notificationDate < new Date();
            
            return (
              <Grid item xs={12} sm={6} md={4} key={reminder._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 3,
                  borderLeft: 5,
                  borderColor: `${getPriorityColor(reminder.priority)}.main`,
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 5
                  }
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    zIndex: 1 
                  }}>
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, reminder)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, pt: 3, pb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {reminder.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {reminder.description || 'No description provided'}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        icon={<EventIcon />} 
                        label={`Due: ${formatDate(reminder.dueDate)}`}
                        size="small"
                        sx={{ mb: 1, mr: 1 }}
                      />
                      <Chip 
                        icon={<TimeIcon />} 
                        label={getTimeRemaining(reminder.dueDate)}
                        color={new Date(reminder.dueDate) < new Date() ? 'error' : 'primary'}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <NotificationsActiveIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: isPastNotification ? 'text.disabled' : 
                                  isNotified ? 'success.main' : 'primary.main' 
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {isPastNotification ? 'Notification time passed' : 
                         isNotified ? 'Notification sent' : 
                         `Notifies ${reminder.hoursBeforeDue} hours before due date`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Menu for reminder options */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditReminder(activeReminder)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleOpenDeleteDialog(activeReminder)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Reminder Form Dialog */}
      <CustomReminderForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={handleReminderSaved}
        editReminder={selectedReminder}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Reminder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this reminder? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteReminder} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomReminders; 