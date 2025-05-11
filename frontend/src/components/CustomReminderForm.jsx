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
import axios from '../lib/axios';

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
      // Reset form when not editing
      setFormData(defaultFormState);
    }
    
    // Clear error on open/close
    setError('');
  }, [editReminder, open]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.dueDate) {
      setError('Due date is required');
      return false;
    }
    
    try {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        setError('Invalid due date');
        return false;
      }
    } catch (err) {
      setError('Invalid due date format');
      return false;
    }
    
    const hoursBeforeDue = parseInt(formData.hoursBeforeDue);
    if (isNaN(hoursBeforeDue) || hoursBeforeDue < 0) {
      setError('Hours before due must be a positive number');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        hoursBeforeDue: parseInt(formData.hoursBeforeDue)
      };
      
      let response;
      if (isEditMode) {
        response = await axios.put(`/api/custom-reminders/${editReminder._id}`, payload);
      } else {
        response = await axios.post('/api/custom-reminders', payload);
      }
      
      if (response.status >= 200 && response.status < 300) {
        // Success!
        if (onSuccess) onSuccess(response.data);
        onClose();
      } else {
        setError('Failed to save reminder. Please try again.');
      }
    } catch (err) {
      console.error('Error saving reminder:', err);
      setError(err.response?.data?.message || 'Failed to save reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isEditMode ? 'Edit Reminder' : 'Create New Reminder'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Title"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.title}
          onChange={handleInputChange}
          disabled={loading}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          name="description"
          label="Description (Optional)"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.description}
          onChange={handleInputChange}
          disabled={loading}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          name="dueDate"
          label="Due Date"
          type="datetime-local"
          fullWidth
          variant="outlined"
          value={formData.dueDate}
          onChange={handleInputChange}
          disabled={loading}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EventIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          name="hoursBeforeDue"
          label="Notify Hours Before Due"
          type="number"
          fullWidth
          variant="outlined"
          value={formData.hoursBeforeDue}
          onChange={handleInputChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <NotificationsIcon />
              </InputAdornment>
            ),
          }}
          helperText="How many hours before the due date should you be notified?"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{ 
            ml: 1,
            bgcolor: 'var(--color-primary)',
            '&:hover': {
              bgcolor: 'var(--color-primary-dark)'
            }
          }}
        >
          {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomReminderForm;
