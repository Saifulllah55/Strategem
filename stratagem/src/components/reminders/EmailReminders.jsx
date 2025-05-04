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
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { taskAPI, reminderAPI, projectAPI } from '../../api';
import { sendNotification, checkNotificationPermission } from '../../utils/notificationUtils';

const TaskReminders = () => {
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    taskId: '',
    type: 'before_deadline', // or 'custom'
    timeValue: 24,
    timeUnit: 'hours', // hours, days
    scheduledDate: new Date(),
    title: '',
    message: '',
    status: 'pending'
  });

  // Check for notification permission on component mount
  useEffect(() => {
    const checkPermission = async () => {
      const permission = await checkNotificationPermission();
      setHasPermission(permission);
    };
    
    checkPermission();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch reminders, projects, and tasks
        const remindersResponse = await reminderAPI.getAllReminders();
        const projectsResponse = await projectAPI.getAllProjects();
        const tasksResponse = await taskAPI.getAllTasks();
        
        // Process the data
        if (remindersResponse.data) {
          setReminders(remindersResponse.data);
        }
        
        if (projectsResponse.data) {
          setProjects(projectsResponse.data);
        }
        
        if (tasksResponse.data) {
          setTasks(tasksResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load reminders data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Open dialog to create a new reminder
  const handleOpenDialog = (reminder = null) => {
    if (reminder) {
      // Editing existing reminder
      setSelectedReminder(reminder);
      
      // Convert the reminder format to form format
      let formValues = {
        taskId: reminder.taskId,
        title: reminder.title,
        message: reminder.message,
        status: reminder.status || 'pending'
      };
      
      if (reminder.customDate) {
        formValues.type = 'custom';
        formValues.scheduledDate = new Date(reminder.customDate);
      } else {
        formValues.type = 'before_deadline';
        
        // Parse the time before deadline into value and unit
        const timeBeforeValue = reminder.timeBeforeDeadline || 24;
        if (timeBeforeValue >= 24) {
          formValues.timeValue = Math.floor(timeBeforeValue / 24);
          formValues.timeUnit = 'days';
        } else {
          formValues.timeValue = timeBeforeValue;
          formValues.timeUnit = 'hours';
        }
      }
      
      setFormData(formValues);
    } else {
      // Creating new reminder
      setSelectedReminder(null);
      setFormData({
        taskId: '',
        type: 'before_deadline',
        timeValue: 24,
        timeUnit: 'hours',
        scheduledDate: new Date(),
        title: '',
        message: '',
        status: 'pending'
      });
    }
    
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReminder(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If a task is selected, pre-fill the reminder title with the task name
    if (name === 'taskId' && value) {
      const selectedTask = tasks.find(task => task.id === value);
      if (selectedTask && !formData.title) {
        setFormData(prev => ({
          ...prev,
          title: `Reminder: ${selectedTask.title}`,
          message: `This is a reminder for your task "${selectedTask.title}" that is due soon.`
        }));
      }
    }
  };

  // Handle date change for custom date
  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      scheduledDate: new Date(e.target.value)
    });
  };

  // Save reminder
  const handleSaveReminder = async () => {
    try {
      // Prepare reminder data based on form input
      const selectedTask = tasks.find(task => task.id === formData.taskId);
      
      if (!selectedTask) {
        setMessage({
          type: 'error',
          text: 'Please select a task for this reminder.'
        });
        return;
      }
      
      // Calculate the time the reminder should be sent
      let reminderData = {
        taskId: formData.taskId,
        title: formData.title || `Reminder: ${selectedTask.title}`,
        message: formData.message || `Reminder for task: ${selectedTask.title}`,
        status: formData.status || 'pending'
      };
      
      if (formData.type === 'custom') {
        reminderData.customDate = formData.scheduledDate.toISOString();
      } else {
        // Calculate hours before deadline based on selected time unit
        let hoursBeforeDeadline = formData.timeValue;
        if (formData.timeUnit === 'days') {
          hoursBeforeDeadline = formData.timeValue * 24;
        }
        
        reminderData.timeBeforeDeadline = hoursBeforeDeadline;
      }
      
      // Calculate the actual time to send the reminder (for display purposes)
      let sendTime;
      if (formData.type === 'custom') {
        sendTime = new Date(formData.scheduledDate);
      } else {
        // Calculate based on task deadline
        const taskDueDate = new Date(selectedTask.dueDate);
        if (isNaN(taskDueDate.getTime())) {
          setMessage({
            type: 'error',
            text: 'The selected task has no due date. Please select a different task or set a due date for this task.'
          });
          return;
        }
        
        sendTime = new Date(taskDueDate);
        if (formData.timeUnit === 'hours') {
          sendTime.setHours(sendTime.getHours() - formData.timeValue);
        } else {
          sendTime.setDate(sendTime.getDate() - formData.timeValue);
        }
      }
      
      reminderData.sendAt = sendTime.toISOString();
      
      // Save or update the reminder
      let response;
      if (selectedReminder) {
        response = await reminderAPI.updateReminder(selectedReminder.id, reminderData);
        setMessage({
          type: 'success',
          text: 'Reminder updated successfully!'
        });
      } else {
        response = await reminderAPI.createReminder(reminderData);
        setMessage({
          type: 'success',
          text: 'Reminder created successfully!'
        });
      }
      
      // Update the reminders list
      if (response.data) {
        if (selectedReminder) {
          // Update in the current list
          setReminders(prev => 
            prev.map(reminder => 
              reminder.id === selectedReminder.id ? response.data : reminder
            )
          );
        } else {
          // Add to the current list
          setReminders(prev => [...prev, response.data]);
        }
      }
      
      // Close the dialog
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving reminder:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save reminder. Please try again.'
      });
    }
  };

  // Delete reminder
  const handleDeleteReminder = async (reminderId) => {
    try {
      await reminderAPI.deleteReminder(reminderId);
      
      // Update the reminders list
      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      
      setMessage({
        type: 'success',
        text: 'Reminder deleted successfully!'
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      setMessage({
        type: 'error',
        text: 'Failed to delete reminder. Please try again.'
      });
    }
  };

  // Open test notification dialog
  const handleOpenTestDialog = () => {
    setOpenTestDialog(true);
  };

  // Close test notification dialog
  const handleCloseTestDialog = () => {
    setOpenTestDialog(false);
  };

  // Send test notification
  const handleSendTestNotification = () => {
    if (!hasPermission) {
      checkNotificationPermission().then(permission => {
        setHasPermission(permission);
        if (permission) {
          sendTestNotification();
        } else {
          setMessage({
            type: 'error',
            text: 'Notification permission denied. Please enable notifications in your browser settings.'
          });
        }
      });
    } else {
      sendTestNotification();
    }
    
    handleCloseTestDialog();
  };
  
  // Helper function to send a test notification
  const sendTestNotification = () => {
    const success = sendNotification(
      'Test Reminder Notification', 
      {
        body: 'This is a test notification from Stratagem.',
        icon: '/notification-icon.png',
        onClick: () => console.log('Test notification clicked')
      }
    );
    
    if (success) {
      setMessage({
        type: 'success',
        text: 'Test notification sent successfully!'
      });
    } else {
      setMessage({
        type: 'error',
        text: 'Failed to send test notification. Please check browser permissions.'
      });
    }
  };

  // Find task and project details for a reminder
  const getTaskAndProjectDetails = (reminder) => {
    const task = tasks.find(t => t.id === reminder.taskId);
    if (!task) return { taskTitle: 'Unknown Task', projectTitle: 'Unknown Project' };
    
    const project = projects.find(p => p.id === task.projectId);
    return {
      taskTitle: task.title,
      projectTitle: project ? project.title : 'Unknown Project'
    };
  };

  // Format reminder time for display
  const formatReminderTime = (reminder) => {
    if (reminder.customDate) {
      return new Date(reminder.customDate).toLocaleString();
    }
    
    if (reminder.sendAt) {
      return new Date(reminder.sendAt).toLocaleString();
    }
    
    if (reminder.timeBeforeDeadline) {
      const hours = reminder.timeBeforeDeadline;
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''} before deadline`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} before deadline`;
    }
    
    return 'Not specified';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
          Task Reminders
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<NotificationsIcon />}
            onClick={handleOpenTestDialog}
            sx={{ borderRadius: 2, mr: 2 }}
          >
            Test Notification
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add Reminder
          </Button>
        </Box>
      </Box>

      {/* Message Alert */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Main Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Reminders Summary Card */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Reminders Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: 'primary.dark', color: 'white', p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 40, mr: 2 }} />
                        <Box>
                          <Typography variant="h4">
                            {reminders.length}
                          </Typography>
                          <Typography variant="body2">
                            Total Reminders
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: 'warning.dark', color: 'white', p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ fontSize: 40, mr: 2 }} />
                        <Box>
                          <Typography variant="h4">
                            {reminders.filter(r => r.status === 'pending').length}
                          </Typography>
                          <Typography variant="body2">
                            Pending Reminders
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: 'success.dark', color: 'white', p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 40, mr: 2 }} />
                        <Box>
                          <Typography variant="h4">
                            {reminders.filter(r => r.status === 'sent').length}
                          </Typography>
                          <Typography variant="body2">
                            Sent Reminders
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Reminders List */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Scheduled Reminders
                </Typography>
                {reminders.length > 0 ? (
                  <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Task</TableCell>
                          <TableCell>Project</TableCell>
                          <TableCell>Notification Time</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reminders.map((reminder) => {
                          const { taskTitle, projectTitle } = getTaskAndProjectDetails(reminder);
                          return (
                            <TableRow key={reminder.id}>
                              <TableCell>{reminder.title}</TableCell>
                              <TableCell>{taskTitle}</TableCell>
                              <TableCell>{projectTitle}</TableCell>
                              <TableCell>{formatReminderTime(reminder)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={reminder.status || 'pending'} 
                                  color={getStatusColor(reminder.status)} 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Edit Reminder">
                                  <IconButton 
                                    color="primary" 
                                    onClick={() => handleOpenDialog(reminder)}
                                    disabled={reminder.status === 'sent'}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Reminder">
                                  <IconButton 
                                    color="error" 
                                    onClick={() => handleDeleteReminder(reminder.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      No reminders have been set up yet.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                    >
                      Add Your First Reminder
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Create/Edit Reminder Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedReminder ? 'Edit Reminder' : 'Create New Reminder'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="task-select-label">Task</InputLabel>
                <Select
                  labelId="task-select-label"
                  id="task-select"
                  name="taskId"
                  value={formData.taskId}
                  onChange={handleInputChange}
                  label="Task"
                  required
                >
                  {tasks.map(task => (
                    <MenuItem key={task.id} value={task.id}>
                      {task.title} - {projects.find(p => p.id === task.projectId)?.title || 'Unknown Project'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reminder Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  When to send the reminder:
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="reminder-type-label">Reminder Type</InputLabel>
                  <Select
                    labelId="reminder-type-label"
                    id="reminder-type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Reminder Type"
                  >
                    <MenuItem value="before_deadline">Before Task Deadline</MenuItem>
                    <MenuItem value="custom">Custom Date & Time</MenuItem>
                  </Select>
                </FormControl>
              </FormControl>
            </Grid>

            {formData.type === 'before_deadline' ? (
              <Grid item container xs={12} spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Time Value"
                    name="timeValue"
                    type="number"
                    value={formData.timeValue}
                    onChange={handleInputChange}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="time-unit-label">Time Unit</InputLabel>
                    <Select
                      labelId="time-unit-label"
                      id="time-unit"
                      name="timeUnit"
                      value={formData.timeUnit}
                      onChange={handleInputChange}
                      label="Time Unit"
                    >
                      <MenuItem value="hours">Hours</MenuItem>
                      <MenuItem value="days">Days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reminder Date & Time"
                  type="datetime-local"
                  value={formData.scheduledDate.toISOString().slice(0, 16)}
                  onChange={handleDateChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveReminder} 
            variant="contained"
            color="primary"
          >
            {selectedReminder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Notification Dialog */}
      <Dialog
        open={openTestDialog}
        onClose={handleCloseTestDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Test Notification
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Send a test browser notification to verify that reminders are working correctly.
          </Typography>
          
          {!hasPermission && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You need to allow browser notifications for this feature to work.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestDialog}>Cancel</Button>
          <Button 
            onClick={handleSendTestNotification} 
            variant="contained"
            color="primary"
          >
            Send Test Notification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskReminders;