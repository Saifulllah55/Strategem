import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Alert,
  Divider,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  EventNoteOutlined as EventNoteOutlinedIcon
} from '@mui/icons-material';
import { taskAPI, reminderAPI, projectAPI } from '../../api';
import { sendNotification, checkNotificationPermission } from '../../utils/notificationUtils';
import { useNotification } from '../../context/NotificationContext';
import CustomReminders from './CustomReminders';

const TaskReminders = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Reminders
        </Typography>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'divider', 
          '& .MuiTab-root': { fontSize: '1rem' } 
        }}
      >
        <Tab 
          icon={<NotificationsOutlinedIcon />} 
          label="Task Reminders" 
          iconPosition="start"
        />
        <Tab 
          icon={<EventNoteOutlinedIcon />} 
          label="Custom Reminders" 
          iconPosition="start"
        />
      </Tabs>
      
      {tabValue === 0 && <TaskReminderTab />}
      {tabValue === 1 && <CustomReminders />}
    </Box>
  );
};

// Separated task reminders into a component
const TaskReminderTab = () => {
  const { taskReminders, tasks, loading } = useNotification();
  
  // Helper function to find a task by ID
  const getTaskById = (id) => {
    return tasks.find(t => t.id === id) || null;
  };
  
  // Format a date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status text for the reminder
  const getReminderStatus = (reminder) => {
    if (reminder.status === 'sent') {
      return 'Notification sent';
    }
    
    const task = getTaskById(reminder.relatedTo);
    if (!task) return 'Unknown task';
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (now > dueDate) {
      return 'Task overdue';
    }
    
    const diffHours = Math.round((dueDate - now) / (1000 * 60 * 60));
    return `Due in ${diffHours} hours`;
  };
  
  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading reminders...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
          Task Reminders
        </Typography>
      </Box>

      {taskReminders.length === 0 ? (
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No task reminders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Task reminders will appear here when tasks are due soon.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {taskReminders.map((reminder) => (
            <Grid item xs={12} sm={6} lg={4} key={reminder._id}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {reminder.title}
                </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {reminder.description}
                          </Typography>
                  <Divider sx={{ my: 2 }} />
                          <Typography variant="body2">
                    Project: {reminder.projectTitle}
                          </Typography>
                          <Typography variant="body2">
                    Due Date: {formatDate(reminder.dueDate)}
                          </Typography>
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {getReminderStatus(reminder)}
                          </Typography>
              </CardContent>
            </Card>
          </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TaskReminders;