import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Divider,
  InputAdornment
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { reminderAPI } from '../../api';

const CustomReminderForm = ({ open, onClose, onSuccess, editReminder = null }) => {
  const isEditMode = Boolean(editReminder);
  
  const defaultFormState = {
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to tomorrow
    hoursBeforeDue: 24
  };
  
  const [formData, setFormData] = useState(defaultFormState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load data when editing an existing reminder
  useEffect(() => {
    if (editReminder) {
      setFormData({
        title: editReminder.title || '',
        description: editReminder.description || '',
        dueDate: new Date(editReminder.dueDate).toISOString().slice(0, 16),
        hoursBeforeDue: editReminder.hoursBeforeDue || 24
      });
    } else {
      setFormData(defaultFormState);
    }
    setError('');
  }, [editReminder, open]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    // Validate form
    if (!formData.title) {
      setError('Please enter a title for the reminder');
      return;
    }
    
    if (!formData.dueDate) {
      setError('Please enter a valid due date');
      return;
    }
    
    if (formData.hoursBeforeDue < 1) {
      setError('Please enter at least 1 hour before due date for notification');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a date object from the form input
      const dueDate = new Date(formData.dueDate);
      
      // Calculate notification date
      const notificationDate = new Date(dueDate);
      notificationDate.setHours(notificationDate.getHours() - formData.hoursBeforeDue);
      
      // Check if notification date is in the past
      if (notificationDate < new Date()) {
        setError('The notification time has already passed. Please adjust the due date or hours before due.');
        setLoading(false);
        return;
      }
      
      // Prepare data for API
      const reminderData = {
        ...formData,
        dueDate: dueDate.toISOString()
      };
      
      // Send to API
      let response;
      if (isEditMode) {
        response = await reminderAPI.updateReminder(editReminder._id, {
          ...reminderData,
          type: 'custom'
        });
      } else {
        response = await reminderAPI.createCustomReminder(reminderData);
      }
      
      setLoading(false);
      
      if (response && response.data) {
        onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Error saving reminder:', err);
      setError('Failed to save reminder. Please try again.');
      setLoading(false);
    }
  };
  
  const calculateNotificationTime = () => {
    if (!formData.dueDate || !formData.hoursBeforeDue) {
      return null;
    }
    
    const dueDate = new Date(formData.dueDate);
    const notificationDate = new Date(dueDate);
    notificationDate.setHours(notificationDate.getHours() - formData.hoursBeforeDue);
    
    return notificationDate;
  };
  
  const notificationTime = calculateNotificationTime();
  const isPastNotification = notificationTime && notificationTime < new Date();
  const dueDateObj = formData.dueDate ? new Date(formData.dueDate) : null;
  
  // Get current date/time in ISO format with timezone adjustment
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(Date.now() - timezoneOffset)).toISOString().slice(0, 16);
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? 'Edit Reminder' : 'Create Reminder'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            name="title"
            label="Reminder Title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            variant="outlined"
          />
          
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            variant="outlined"
          />
          
          <TextField
            name="dueDate"
            label="Due Date & Time"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: localISOTime
            }}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          
          <TextField
            name="hoursBeforeDue"
            label="Hours Before Due Date"
            type="number"
            value={formData.hoursBeforeDue}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  hours
                </InputAdornment>
              ),
            }}
            helperText="When to send the notification"
            sx={{ mt: 2 }}
          />
          
          {notificationTime && (
            <Box sx={{ mt: 3, mb: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notification Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  Due: {dueDateObj ? dueDateObj.toLocaleString() : 'Not set'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon fontSize="small" sx={{ mr: 1, color: isPastNotification ? 'error.main' : 'primary.main' }} />
                <Typography variant="body2" color={isPastNotification ? 'error.main' : 'text.primary'}>
                  Notification: {notificationTime.toLocaleString()}
                  {isPastNotification && ' (in the past)'}
                </Typography>
              </Box>
              {isPastNotification && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  The notification time has already passed. Please adjust the due date or hours before due.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading || isPastNotification}
        >
          {loading ? 'Saving...' : (isEditMode ? 'Update Reminder' : 'Create Reminder')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomReminderForm; 