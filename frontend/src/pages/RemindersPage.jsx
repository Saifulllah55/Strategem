import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Tabs, 
  Tab, 
  Divider, 
  Chip, 
  IconButton,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import axios from '../lib/axios';
import CustomReminderForm from '../components/CustomReminderForm';

const RemindersPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [customReminders, setCustomReminders] = useState([]);
  const [projectReminders, setProjectReminders] = useState([]);
  const [taskReminders, setTaskReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editReminder, setEditReminder] = useState(null);

  // Fetch reminders on component mount
  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch custom reminders
      const customResponse = await axios.get('/api/custom-reminders');
      setCustomReminders(customResponse.data);

      // Fetch project reminders
      const projectResponse = await axios.get('/api/reminders/type/project');
      setProjectReminders(projectResponse.data);

      // Fetch task reminders
      const taskResponse = await axios.get('/api/reminders/type/task');
      setTaskReminders(taskResponse.data);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError('Failed to load reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateReminder = () => {
    setEditReminder(null);
    setFormOpen(true);
  };

  const handleEditReminder = (reminder) => {
    setEditReminder(reminder);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditReminder(null);
  };

  const handleFormSuccess = () => {
    fetchReminders();
  };

  const handleDeleteReminder = async (id, isCustom = true) => {
    try {
      if (isCustom) {
        await axios.delete(`/api/custom-reminders/${id}`);
      } else {
        await axios.delete(`/api/reminders/${id}`);
      }
      fetchReminders();
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError('Failed to delete reminder. Please try again.');
    }
  };

  const handleCompleteReminder = async (id, isCustom = true) => {
    try {
      const payload = { status: 'completed' };
      if (isCustom) {
        await axios.put(`/api/custom-reminders/${id}`, payload);
      } else {
        await axios.put(`/api/reminders/${id}`, payload);
      }
      fetchReminders();
    } catch (err) {
      console.error('Error completing reminder:', err);
      setError('Failed to mark reminder as complete. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const getReminderStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) return 'var(--color-error)'; // Overdue
    if (diffHours < 24) return 'var(--color-warning)'; // Due soon
    return 'var(--color-success)'; // Due later
  };

  const renderReminderCard = (reminder, isCustom = true) => {
    const statusColor = getReminderStatusColor(reminder.dueDate);

    return (      <Card 
        key={reminder._id} 
        sx={{ 
          mb: 2, 
          borderLeft: `4px solid ${statusColor === 'var(--color-error)' ? 'var(--color-error)' : statusColor === 'var(--color-warning)' ? 'var(--color-warning)' : 'var(--color-success)'}`,
          transition: 'transform 0.2s',
          bgcolor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: 3,
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" component="div">
              {reminder.title}
            </Typography>
            <Box>              <IconButton 
                size="small" 
                sx={{ color: 'var(--color-primary)' }}
                onClick={() => handleEditReminder(reminder)}
                mr={1}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: 'var(--color-success)' }}
                onClick={() => handleCompleteReminder(reminder._id, isCustom)}
                mr={1}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: 'var(--color-error)' }}
                onClick={() => handleDeleteReminder(reminder._id, isCustom)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          {reminder.description && (
            <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {reminder.description}
            </Typography>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Chip 
              icon={<TimeIcon fontSize="small" />} 
              label={`Due: ${formatDate(reminder.dueDate)}`}
              size="small"
              color={statusColor}
              variant="outlined"
            />
            
            <Chip 
              icon={<NotificationsIcon fontSize="small" />} 
              label={`Notification: ${reminder.hoursBeforeDue}h before`}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Reminders
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ 
            bgcolor: 'var(--color-primary)',
            '&:hover': {
              bgcolor: 'var(--color-primary-dark)'
            }
          }}
          onClick={handleCreateReminder}
        >
          New Reminder
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>          <Box sx={{ borderBottom: 1, borderColor: 'var(--color-border)', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              aria-label="reminder tabs"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'var(--color-primary)',
                },
                '& .Mui-selected': {
                  color: 'var(--color-primary) !important',
                },
              }}
            >
              <Tab label="Custom Reminders" />
              <Tab label="Project Reminders" />
              <Tab label="Task Reminders" />
            </Tabs>
          </Box>

          {/* Custom Reminders Tab */}
          {activeTab === 0 && (
            <Box>
              {customReminders.length === 0 ? (
                <Alert severity="info">
                  You don't have any custom reminders. Click "New Reminder" to create one.
                </Alert>
              ) : (
                customReminders.map(reminder => renderReminderCard(reminder, true))
              )}
            </Box>
          )}

          {/* Project Reminders Tab */}
          {activeTab === 1 && (
            <Box>
              {projectReminders.length === 0 ? (
                <Alert severity="info">
                  You don't have any project reminders. These are automatically created from your projects.
                </Alert>
              ) : (
                projectReminders.map(reminder => renderReminderCard(reminder, false))
              )}
            </Box>
          )}

          {/* Task Reminders Tab */}
          {activeTab === 2 && (
            <Box>
              {taskReminders.length === 0 ? (
                <Alert severity="info">
                  You don't have any task reminders. These are automatically created from your tasks.
                </Alert>
              ) : (
                taskReminders.map(reminder => renderReminderCard(reminder, false))
              )}
            </Box>
          )}
        </>
      )}

      {/* Custom Reminder Form Dialog */}
      <CustomReminderForm 
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editReminder={editReminder}
      />
    </Box>
  );
};

export default RemindersPage;
