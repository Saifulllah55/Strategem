import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  LinearProgress,
  Avatar,
  Chip,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from '../lib/axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Chart imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

// Function to calculate project progress based on task statuses
const calculateProjectProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const statusValues = {
    'todo': 0,
    'pending': 0,
    'in-progress': 50,
    'completed': 100,
  };
  
  const total = tasks.reduce((sum, task) => {
    return sum + (statusValues[task.status] || 0);
  }, 0);
  
  return Math.round(total / tasks.length);
};

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [projectReport, setProjectReport] = useState(null);
  const [tasksReport, setTasksReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Refs for PDF generation
  const chartsContainerRef = useRef(null);
  const projectDetailsRef = useRef(null);
  
  // Check if we have a project ID in the URL
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('project');

  useEffect(() => {
    if (projectId) {
      // If project ID is provided, switch to the project tab
      setActiveTab(1);
      fetchProjectReport(projectId);
    } else {
      // Otherwise fetch dashboard data
      fetchDashboardData();
    }
  }, [projectId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/reports/dashboard');
      setDashboardData(response.data);
      
      // Also fetch tasks report for the third tab
      const tasksResponse = await axios.get('/api/reports/dashboard/tasks');
      setTasksReport(tasksResponse.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectReport = async (projectId) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/reports/dashboard/project/${projectId}`);
      setProjectReport(response.data);
    } catch (err) {
      console.error('Error fetching project report:', err);
      setError('Failed to load project report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Update URL based on selected tab
    if (newValue === 1 && projectId) {
      // Keep project ID in URL for project tab
      navigate(`/reports?project=${projectId}`);
    } else {
      // Remove project ID from URL for other tabs
      navigate('/reports');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--color-success)';
      case 'in-progress': return 'var(--color-primary)';
      case 'pending': return 'var(--color-warning)';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  // Generate PDF for dashboard stats
  const generateDashboardPDF = async () => {
    if (!chartsContainerRef.current || !dashboardData) return;
    
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text('Dashboard Report', 15, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 22);
      
      // Add stats summary
      doc.setFontSize(12);
      const stats = dashboardData.stats;
      doc.text(`Projects: ${stats.totalProjects} (${stats.projectCompletionRate}% complete)`, 15, 30);
      doc.text(`Tasks: ${stats.totalTasks} (${stats.taskCompletionRate}% complete)`, 15, 37);
      doc.text(`Pending Tasks: ${stats.pendingTasks}`, 15, 44);
      doc.text(`Completed Tasks: ${stats.completedTasks}`, 15, 51);
      
      try {
        // Capture dashboard charts
        const canvas = await html2canvas(chartsContainerRef.current, {
          scale: 2, // Higher scale for better quality
          backgroundColor: '#ffffff' 
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = doc.internal.pageSize.getWidth() - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 15, 60, imgWidth, imgHeight);
      } catch (chartError) {
        console.error('Error generating chart image:', chartError);
        doc.text('Charts could not be included in this report.', 15, 60);
      }
      
      // Add upcoming deadlines table
      if (dashboardData.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0) {
        const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;
        doc.text('Upcoming Deadlines', 15, startY);
        
        const tableData = dashboardData.upcomingDeadlines.map(task => [
          task.title,
          task.project ? task.project.name : 'No Project',
          formatDate(task.dueDate)
        ]);
        
        doc.autoTable({
          startY: startY + 5,
          head: [['Task', 'Project', 'Due Date']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [60, 60, 60] }
        });
      }
      
      doc.save('dashboard_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Generate PDF for project report
  const generateProjectPDF = async () => {
    if (!projectReport) return;
    
    try {
      const project = projectReport.project;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Project Report - ${project.name || 'Unnamed Project'}`, 15, 20);
      
      // Project details with error handling
      doc.setFontSize(12);
      doc.text(`Description: ${project.description || 'No description'}`, 15, 35);
      doc.text(`Start Date: ${formatDate(project.createdAt)}`, 15, 45);
      doc.text(`Due Date: ${formatDate(project.dueDate)}`, 15, 55);
      
      // Calculate progress
      const completionRate = projectReport.stats.completionRate || 0;
      doc.text(`Progress: ${completionRate}%`, 15, 65);
      
      // Task summary
      const { completedTasks, inProgressTasks, pendingTasks, totalTasks } = projectReport.stats;
      
      doc.text('Task Summary:', 15, 80);
      
      const taskSummaryData = [
        ['Category', 'Count', 'Percentage'],
        ['Completed', completedTasks, totalTasks > 0 ? `${Math.round((completedTasks/totalTasks) * 100)}%` : '0%'],
        ['In Progress', inProgressTasks, totalTasks > 0 ? `${Math.round((inProgressTasks/totalTasks) * 100)}%` : '0%'],
        ['Pending', pendingTasks, totalTasks > 0 ? `${Math.round((pendingTasks/totalTasks) * 100)}%` : '0%']
      ];
      
      try {
        doc.autoTable({
          startY: 85,
          head: [taskSummaryData[0]],
          body: taskSummaryData.slice(1),
          theme: 'striped',
        });
      } catch (tableError) {
        console.error('Error generating table:', tableError);
        doc.text('Task summary could not be generated as a table', 15, 85);
      }
      
      // Team Members section
      if (project.members && project.members.length > 0) {
        const memberStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 150;
        doc.text('Team Members:', 15, memberStartY);
        
        const memberTableData = project.members.map(member => {
          const contribution = projectReport.memberContributions[member._id];
          return [
            member.name || member.username || 'Unknown',
            member.email || 'No email',
            contribution ? `${contribution.completedTasks}/${contribution.totalTasks} tasks` : '0/0 tasks',
            contribution ? `${contribution.contributionRate}%` : '0%'
          ];
        });
        
        doc.autoTable({
          startY: memberStartY + 5,
          head: [['Name', 'Email', 'Tasks', 'Contribution']],
          body: memberTableData,
          theme: 'striped',
        });
      }
      
      // Tasks list
      if (projectReport.tasks && projectReport.tasks.length > 0) {
        const tasksStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 180;
        doc.text('Project Tasks:', 15, tasksStartY);
        
        const taskTableData = projectReport.tasks.map(task => [
          task.title,
          task.status,
          formatDate(task.dueDate),
          task.assignedTo ? (task.assignedTo.name || task.assignedTo.username) : 'Unassigned'
        ]);
        
        doc.autoTable({
          startY: tasksStartY + 5,
          head: [['Task', 'Status', 'Due Date', 'Assigned To']],
          body: taskTableData,
          theme: 'striped',
        });
      }
      
      // Add date generated
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Report generated on: ${currentDate}`, 15, 280);
      
      const filename = `${project.name ? project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'project'}_report.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating project PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    }
  };

  // Generate PDF for tasks report
  const generateTasksPDF = async () => {
    if (!tasksReport) return;
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text('Tasks Report', 15, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 27);
      
      // Tasks summary
      doc.setFontSize(12);
      doc.text('Tasks Summary', 15, 40);
      
      const statusSummary = [
        ['Status', 'Count'],
        ['Completed', tasksReport.tasksByStatus.completed.length],
        ['In Progress', tasksReport.tasksByStatus.inProgress.length],
        ['Pending', tasksReport.tasksByStatus.pending.length]
      ];
      
      doc.autoTable({
        startY: 45,
        head: [statusSummary[0]],
        body: statusSummary.slice(1),
        theme: 'striped',
        margin: { left: 15 },
        tableWidth: 80
      });
      
      const prioritySummary = [
        ['Priority', 'Count'],
        ['High', tasksReport.tasksByPriority.high.length],
        ['Medium', tasksReport.tasksByPriority.medium.length],
        ['Low', tasksReport.tasksByPriority.low.length]
      ];
      
      doc.autoTable({
        startY: 45,
        head: [prioritySummary[0]],
        body: prioritySummary.slice(1),
        theme: 'striped',
        margin: { left: 110 },
        tableWidth: 80
      });
      
      // Upcoming tasks
      const dueDateStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 100;
      doc.text('Tasks by Due Date', 15, dueDateStartY);
      
      // Group tasks by due date
      const dueDateSummary = [
        ['Period', 'Count'],
        ['This Week', tasksReport.tasksByDueDate.thisWeek.length],
        ['Next Week', tasksReport.tasksByDueDate.nextWeek.length],
        ['Later', tasksReport.tasksByDueDate.later.length],
        ['Overdue', tasksReport.tasksByDueDate.overdue.length]
      ];
      
      doc.autoTable({
        startY: dueDateStartY + 5,
        head: [dueDateSummary[0]],
        body: dueDateSummary.slice(1),
        theme: 'striped',
      });
      
      // Tasks list
      const taskListStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 150;
      doc.text('Task List', 15, taskListStartY);
      
      const taskTableData = tasksReport.tasks.map(task => [
        task.title,
        task.status,
        task.priority,
        formatDate(task.dueDate),
        task.project ? task.project.name : 'No Project'
      ]);
      
      doc.autoTable({
        startY: taskListStartY + 5,
        head: [['Task', 'Status', 'Priority', 'Due Date', 'Project']],
        body: taskTableData,
        theme: 'striped',
      });
      
      doc.save('tasks_report.pdf');
    } catch (error) {
      console.error('Error generating tasks PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Reports & Analytics
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={generateDashboardPDF}
            sx={{ 
              mr: 2,
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              '&:hover': {
                borderColor: 'var(--color-primary-dark)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              }
            }}
          >
            Export Dashboard
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ 
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              '&:hover': {
                borderColor: 'var(--color-primary-dark)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              }
            }}
          >
            Print
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ borderBottom: 1, borderColor: 'var(--color-border)', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="report tabs"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--color-primary)',
            },
            '& .Mui-selected': {
              color: 'var(--color-primary) !important',
            },
          }}
        >
          <Tab label="Dashboard Overview" />
          <Tab label="Project Report" disabled={!projectId} />
          <Tab label="Tasks Timeline" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          {/* Dashboard Overview Tab */}
          {activeTab === 0 && dashboardData && (
            <Box ref={chartsContainerRef}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
                    <CardContent>
                      <Typography color="var(--color-text-secondary)" gutterBottom>
                        Total Projects
                      </Typography>
                      <Typography variant="h3" component="div">
                        {dashboardData.stats.totalProjects}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
                    <CardContent>
                      <Typography color="var(--color-text-secondary)" gutterBottom>
                        Completed Projects
                      </Typography>
                      <Typography variant="h3" component="div">
                        {dashboardData.stats.completedProjects}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
                    <CardContent>
                      <Typography color="var(--color-text-secondary)" gutterBottom>
                        Total Tasks
                      </Typography>
                      <Typography variant="h3" component="div">
                        {dashboardData.stats.totalTasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
                    <CardContent>
                      <Typography color="var(--color-text-secondary)" gutterBottom>
                        Completion Rate
                      </Typography>
                      <Typography variant="h3" component="div">
                        {dashboardData.stats.taskCompletionRate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
                Upcoming Deadlines
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.upcomingDeadlines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No upcoming deadlines
                        </TableCell>
                      </TableRow>
                    ) : (
                      dashboardData.upcomingDeadlines.map((task) => (
                        <TableRow key={task._id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{task.project?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusText(task.status)} 
                              color={getStatusColor(task.status)} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{formatDate(task.dueDate)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Project Report Tab */}
          {activeTab === 1 && projectReport && (
            <Box ref={projectDetailsRef}>
              <Box sx={{ mb: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    setActiveTab(0);
                    navigate('/reports');
                  }}
                  sx={{ 
                    mb: 2,
                    color: 'var(--color-primary)',
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.1)'
                    }
                  }}
                >
                  Back to Overview
                </Button>
                <Typography variant="h5" gutterBottom>
                  Project: {projectReport.project.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {projectReport.project.description || 'No description provided'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`Created: ${formatDate(projectReport.project.createdAt)}`} 
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {projectReport.project.dueDate && (
                    <Chip 
                      label={`Due: ${formatDate(projectReport.project.dueDate)}`} 
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Tasks
                      </Typography>
                      <Typography variant="h3" component="div">
                        {projectReport.stats.totalTasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Completed
                      </Typography>
                      <Typography variant="h3" component="div">
                        {projectReport.stats.completedTasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        In Progress
                      </Typography>
                      <Typography variant="h3" component="div">
                        {projectReport.stats.inProgressTasks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Completion Rate
                      </Typography>
                      <Typography variant="h3" component="div">
                        {projectReport.stats.completionRate}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={projectReport.stats.completionRate} 
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
                Team Members & Contributions
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {Object.values(projectReport.memberContributions).map((contribution) => (
                  <Grid item xs={12} sm={6} md={4} key={contribution.member._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={contribution.member.profilePicture}
                            sx={{ mr: 2 }}
                          >
                            {contribution.member.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">
                              {contribution.member.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {contribution.member.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Tasks Assigned:</Typography>
                            <Typography variant="body2">{contribution.totalTasks}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Completed:</Typography>
                            <Typography variant="body2">{contribution.completedTasks}</Typography>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Completion Rate:</Typography>
                              <Typography variant="body2">{contribution.contributionRate}%</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={contribution.contributionRate} 
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
                Tasks Breakdown
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectReport.tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No tasks found for this project
                        </TableCell>
                      </TableRow>
                    ) : (
                      projectReport.tasks.map((task) => (
                        <TableRow key={task._id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>
                            {task.assignedTo ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  src={task.assignedTo.profilePicture}
                                  sx={{ width: 24, height: 24, mr: 1 }}
                                >
                                  {task.assignedTo.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">
                                  {task.assignedTo.name}
                                </Typography>
                              </Box>
                            ) : (
                              'Unassigned'
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusText(task.status)} 
                              color={getStatusColor(task.status)} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{task.dueDate ? formatDate(task.dueDate) : 'Not set'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={generateProjectPDF}
                sx={{ 
                  mt: 3,
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  '&:hover': {
                    borderColor: 'var(--color-primary-dark)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                  }
                }}
              >
                Export Project Report
              </Button>
            </Box>
          )}

          {/* Tasks Timeline Tab */}
          {activeTab === 2 && tasksReport && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Tasks Timeline
              </Typography>

              {/* Tasks by Status */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Tasks by Status
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                        Completed ({tasksReport.tasksByStatus.completed.length})
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {tasksReport.tasksByStatus.completed.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No completed tasks
                          </Typography>
                        ) : (
                          tasksReport.tasksByStatus.completed.map(task => (
                            <Box key={task._id} sx={{ 
                              p: 1.5, 
                              mb: 1, 
                              backgroundColor: 'success.light', 
                              borderRadius: 1,
                              '&:last-child': { mb: 0 }
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {task.title}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                {task.project?.name}
                              </Typography>
                            </Box>
                          ))
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        In Progress ({tasksReport.tasksByStatus.inProgress.length})
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {tasksReport.tasksByStatus.inProgress.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No in-progress tasks
                          </Typography>
                        ) : (
                          tasksReport.tasksByStatus.inProgress.map(task => (
                            <Box key={task._id} sx={{ 
                              p: 1.5, 
                              mb: 1, 
                              backgroundColor: 'primary.light', 
                              borderRadius: 1,
                              '&:last-child': { mb: 0 }
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {task.title}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                {task.project?.name}
                              </Typography>
                            </Box>
                          ))
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
                        Pending ({tasksReport.tasksByStatus.pending.length})
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {tasksReport.tasksByStatus.pending.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No pending tasks
                          </Typography>
                        ) : (
                          tasksReport.tasksByStatus.pending.map(task => (
                            <Box key={task._id} sx={{ 
                              p: 1.5, 
                              mb: 1, 
                              backgroundColor: 'warning.light', 
                              borderRadius: 1,
                              '&:last-child': { mb: 0 }
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {task.title}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                {task.project?.name}
                              </Typography>
                            </Box>
                          ))
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tasks by Due Date */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Tasks by Due Date
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="error" gutterBottom>
                        Overdue ({tasksReport.tasksByDueDate.overdue.length})
                      </Typography>
                      {tasksReport.tasksByDueDate.overdue.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No overdue tasks
                        </Typography>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Task</TableCell>
                                <TableCell>Project</TableCell>
                                <TableCell>Due Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {tasksReport.tasksByDueDate.overdue.map(task => (
                                <TableRow key={task._id}>
                                  <TableCell>{task.title}</TableCell>
                                  <TableCell>{task.project?.name || 'N/A'}</TableCell>
                                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="warning.dark" gutterBottom>
                        Due This Week ({tasksReport.tasksByDueDate.thisWeek.length})
                      </Typography>
                      {tasksReport.tasksByDueDate.thisWeek.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No tasks due this week
                        </Typography>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Task</TableCell>
                                <TableCell>Project</TableCell>
                                <TableCell>Due Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {tasksReport.tasksByDueDate.thisWeek.map(task => (
                                <TableRow key={task._id}>
                                  <TableCell>{task.title}</TableCell>
                                  <TableCell>{task.project?.name || 'N/A'}</TableCell>
                                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={generateTasksPDF}
                sx={{ 
                  mt: 3,
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  '&:hover': {
                    borderColor: 'var(--color-primary-dark)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                  }
                }}
              >
                Export Tasks Report
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ReportsPage;
