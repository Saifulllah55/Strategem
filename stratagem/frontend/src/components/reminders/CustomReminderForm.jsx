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
  InputAdornment
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { customReminderAPI } from '../../api';

const CustomReminderForm = ({ open, onClose, onSuccess, editReminder = null }) => {
  const isEditMode = Boolean(editReminder);
  
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0); // Set to noon
  
  const defaultFormState = {
    title: '',
    description: '',
    dueDate: tomorrow.toISOString().slice(0, 16), // Format for datetime-local input
    hoursBeforeDue: 24
  };
  
  const [formData, setFormData] = useState(defaultFormState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load data when editing an existing reminder
  useEffect(() => {
    if (editReminder) {
      // Format date for the datetime-local input
      let formattedDate = '';
      try {
        formattedDate = new Date(editReminder.dueDate).toISOString().slice(0, 16);
      } catch (err) {
        console.error('Error formatting date:', err);
        formattedDate = new Date().toISOString().slice(0, 16);
      }
      
      setFormData({
        title: editReminder.title || '',
        description: editReminder.description || '',
        dueDate: formattedDate,
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
  
  // Check if the notification time has already passed
  const isPastNotification = () => {
    if (!formData.dueDate) return false;
    
    try {
      const dueDate = new Date(formData.dueDate);
      const notificationDate = new Date(dueDate);
      notificationDate.setHours(notificationDate.getHours() - formData.hoursBeforeDue);
      
      return notificationDate < new Date();
    } catch (err) {
      console.error('Error calculating notification time:', err);
      return false;
    }
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
    
    if (isNaN(Number(formData.hoursBeforeDue)) || Number(formData.hoursBeforeDue) < 1) {
      setError('Please enter at least 1 hour before due date for notification');
      return;
    }
    
    // Check if notification date is in the past
    if (isPastNotification()) {
      setError('The notification time has already passed. Please adjust the due date or hours before due.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Convert date string to ISO format for API
      const dueDate = new Date(formData.dueDate);
      
      // Prepare data for API submission
      const reminderData = {
        title: formData.title,
        description: formData.description,
        dueDate: dueDate.toISOString(), // Send ISO format string
        hoursBeforeDue: Number(formData.hoursBeforeDue)
      };
      
      console.log('Submitting custom reminder data:', reminderData);
      
      let response;
      if (isEditMode) {
        response = await customReminderAPI.updateCustomReminder(editReminder._id, reminderData);
      } else {
        response = await customReminderAPI.createCustomReminder(reminderData);
      }
      
      console.log('API response:', response);
      
      setLoading(false);
      if (response && response.data) {
        onSuccess(response.data);
        onClose();
      } else {
        throw new Error('No data returned from API');
      }
    } catch (err) {
      console.error('Error saving reminder:', err);
      setError(err.response?.data?.message || 'Failed to save reminder. Please try again.');
      setLoading(false);
    }
  };
  
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
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!formData.title}
            helperText={!formData.title ? 'Title is required' : ''}
          />
          
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
          
          <TextField
            label="Due Date"
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EventIcon />
                </InputAdornment>
              ),
            }}
            error={!formData.dueDate}
            helperText={!formData.dueDate ? 'Due date is required' : ''}
          />
          
          <TextField
            label="Hours Before Due Date for Notification"
            name="hoursBeforeDue"
            type="number"
            value={formData.hoursBeforeDue}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NotificationsIcon />
                </InputAdornment>
              ),
            }}
            error={isNaN(Number(formData.hoursBeforeDue)) || Number(formData.hoursBeforeDue) < 1}
            helperText={isNaN(Number(formData.hoursBeforeDue)) || Number(formData.hoursBeforeDue) < 1 ? 
              'Please enter a valid number greater than 0' : ''}
          />
          
          {isPastNotification() && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Warning: The notification time has already passed. Please adjust the due date or hours before due.
            </Alert>
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
          disabled={loading || isPastNotification()}
        >
          {loading ? 'Saving...' : (isEditMode ? 'Update Reminder' : 'Create Reminder')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomReminderForm; 