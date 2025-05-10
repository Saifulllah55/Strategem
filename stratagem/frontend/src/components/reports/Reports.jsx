import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { 
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
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
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { reportAPI, projectAPI, taskAPI } from '../../api';

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

const chartColors = {
  blue: { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' },
  green: { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },
  orange: { bg: 'rgba(255, 159, 64, 0.6)', border: 'rgba(255, 159, 64, 1)' },
  purple: { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' },
  red: { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' },
  teal: { bg: 'rgba(0, 128, 128, 0.6)', border: 'rgba(0, 128, 128, 1)' }
};

function calculateTaskProgress(status) {
  switch(status) {
    case "submitted": return 25;
    case "revision": return 50;
    case "approved": return 75;
    case "completed": return 100;
    default: return 0; // for "created" and "assigned"
  }
}

function calculateProjectProgress(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const total = tasks.reduce((sum, task) => sum + calculateTaskProgress(task.status), 0);
  return Math.round(total / tasks.length);
}

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [projectData, setProjectData] = useState([]);
  const [taskStats, setTaskStats] = useState({
    completed: [],
    inProgress: [],
    notStarted: [],
    dates: []
  });
  const [dueSoonProjects, setDueSoonProjects] = useState([]);
  const chartsContainerRef = useRef(null);
  const projectDetailsRef = useRef(null);

  // Fetch project and task data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get projects with populated tasks
        const projectsResponse = await projectAPI.getAllProjects();
        
        if (projectsResponse.data) {
          // Keep all projects
          setProjectData(projectsResponse.data);
          
          // Process task data for timeline chart
          processTasksForTimeline(projectsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Process tasks for timeline visualization
  const processTasksForTimeline = (projects) => {
    // Get all task dates (creation dates)
    const allDates = new Set();
    const dateTaskCounts = {};
    
    // Initialize with dates from all tasks
    projects.forEach(project => {
      if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach(task => {
          if (task.createdAt) {
            const dateStr = new Date(task.createdAt).toISOString().split('T')[0];
            allDates.add(dateStr);
            
            // Initialize count object for this date
            if (!dateTaskCounts[dateStr]) {
              dateTaskCounts[dateStr] = {
                completed: 0,
                inProgress: 0,
                notStarted: 0
              };
            }
            
            // Count by status
            if (task.status === 'completed') {
              dateTaskCounts[dateStr].completed++;
            } else if (['submitted', 'revision', 'approved'].includes(task.status)) {
              dateTaskCounts[dateStr].inProgress++;
            } else {
              dateTaskCounts[dateStr].notStarted++;
            }
          }
        });
      }
    });
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort();
    
    // Prepare cumulative counts for line chart
    const cumulativeCounts = {
      completed: [],
      inProgress: [],
      notStarted: [],
      dates: []
    };
    
    let runningTotals = {
      completed: 0,
      inProgress: 0,
      notStarted: 0
    };
    
    sortedDates.forEach(date => {
      const counts = dateTaskCounts[date];
      
      // Add to running totals
      runningTotals.completed += counts.completed;
      runningTotals.inProgress += counts.inProgress;
      runningTotals.notStarted += counts.notStarted;
      
      // Add to arrays
      cumulativeCounts.completed.push(runningTotals.completed);
      cumulativeCounts.inProgress.push(runningTotals.inProgress);
      cumulativeCounts.notStarted.push(runningTotals.notStarted);
      cumulativeCounts.dates.push(formatDate(date));
    });
    
    setTaskStats(cumulativeCounts);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if projects are due within 24 hours
  useEffect(() => {
    if (projectData.length > 0) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(now.getHours() + 24);
      
      const projectsDueSoon = projectData.filter(project => {
        if (!project.dueDate) return false;
        const dueDate = new Date(project.dueDate);
        return dueDate >= now && dueDate <= tomorrow;
      });
      
      setDueSoonProjects(projectsDueSoon);
    }
  }, [projectData]);

  // Generate PDF of charts
  const generateChartsPDF = async () => {
    if (!chartsContainerRef.current) return;
    
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const canvas = await html2canvas(chartsContainerRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#212121', // Match dark theme background
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      doc.save('project_charts.pdf');
    } catch (error) {
      console.error('Error generating charts PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Helper function to generate PDF report for a project
  const generateProjectPDF = async (project) => {
    try {
      console.log('Starting PDF generation for project:', project.name);
      
      // Basic validation
      if (!project || !project._id) {
        console.error('Invalid project data:', project);
        alert('Error: Invalid project data');
        return;
      }
      
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
      doc.text(`Start Date: ${project.createdAt ? formatDate(project.createdAt) : 'Not set'}`, 15, 45);
      doc.text(`Due Date: ${project.dueDate ? formatDate(project.dueDate) : 'Not set'}`, 15, 55);
      
      // Safely calculate progress
      let projectProgress = 0;
      try {
        projectProgress = calculateProjectProgress(project.tasks);
      } catch (calcError) {
        console.error('Error calculating progress:', calcError);
      }
      doc.text(`Progress: ${projectProgress}%`, 15, 65);
      
      // Task summary with error handling
      const totalTasks = project.tasks ? project.tasks.length : 0;
      
      let taskDistribution = {
        completed: 0, approved: 0, revision: 0, submitted: 0, assigned: 0
      };
      
      try {
        if (project.tasks && project.tasks.length > 0) {
          taskDistribution = {
            completed: project.tasks.filter(t => t && t.status === 'completed').length,
            approved: project.tasks.filter(t => t && t.status === 'approved').length,
            revision: project.tasks.filter(t => t && t.status === 'revision').length,
            submitted: project.tasks.filter(t => t && t.status === 'submitted').length,
            assigned: project.tasks.filter(t => t && ['created', 'assigned'].includes(t.status)).length
          };
        }
      } catch (filterError) {
        console.error('Error filtering tasks:', filterError);
      }
      
      doc.text('Task Summary:', 15, 80);
      
      const taskSummaryData = [
        ['Category', 'Count', 'Percentage'],
        ['Completed', taskDistribution.completed, totalTasks > 0 ? `${Math.round((taskDistribution.completed/totalTasks) * 100)}%` : '0%'],
        ['Approved', taskDistribution.approved, totalTasks > 0 ? `${Math.round((taskDistribution.approved/totalTasks) * 100)}%` : '0%'],
        ['Revision', taskDistribution.revision, totalTasks > 0 ? `${Math.round((taskDistribution.revision/totalTasks) * 100)}%` : '0%'],
        ['Submitted', taskDistribution.submitted, totalTasks > 0 ? `${Math.round((taskDistribution.submitted/totalTasks) * 100)}%` : '0%'],
        ['Assigned', taskDistribution.assigned, totalTasks > 0 ? `${Math.round((taskDistribution.assigned/totalTasks) * 100)}%` : '0%']
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
        // Fallback to text if table fails
        doc.text('Task summary could not be generated as a table', 15, 85);
      }
      
      // Add date generated
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Report generated on: ${currentDate}`, 15, 280);
      
      const filename = `${project.name ? project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'project'}_report.pdf`;
      console.log('Attempting to save PDF as:', filename);
      
      doc.save(filename);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Detailed error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      bgcolor: 'black', 
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', letterSpacing: 1.2 }}>
          PROJECT REPORTS
        </Typography>
        <Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => window.location.reload()}
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              px: 3,
              py: 1
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'rgba(255,255,255,0.2)',
          '& .MuiTab-root': { 
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1rem',
            fontWeight: 'medium',
            mx: 1
          },
          '& .Mui-selected': { color: 'white' },
          '& .MuiTabs-indicator': { backgroundColor: 'white', height: '3px' }
        }}
      >
        <Tab label="DASHBOARD" />
        <Tab label="PROJECT DETAILS" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Dashboard Tab */}
          {tabValue === 0 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box 
                ref={chartsContainerRef} 
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Grid container spacing={3} sx={{ height: '100%', minHeight: '70vh' }}>
                  {/* Project Progress Overview */}
                  <Grid item xs={12} md={6} sx={{ display: 'flex', height: '100%' }}>
                    <Card sx={{ 
                      borderRadius: 2, 
                      boxShadow: '0 4px 24px rgba(0,0,0,0.5)', 
                      bgcolor: '#121212', 
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: '500', letterSpacing: 0.5, paddingBottom: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          Project Progress Overview
                        </Typography>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '450px' }}>
                          {projectData.length > 0 ? (
                            <Bar 
                              data={{
                                labels: projectData.map(project => project.name),
                                datasets: [
                                  {
                                    label: 'Progress (%)',
                                    data: projectData.map(project => calculateProjectProgress(project.tasks)),
                                    backgroundColor: projectData.map((_, idx) => Object.values(chartColors)[idx % Object.values(chartColors).length].bg),
                                    borderColor: projectData.map((_, idx) => Object.values(chartColors)[idx % Object.values(chartColors).length].border),
                                    borderWidth: 1,
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        return `Progress: ${context.raw}%`;
                                      }
                                    }
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    max: 100,
                                    title: {
                                      display: true,
                                      text: 'Progress (%)'
                                    },
                                    ticks: {
                                      callback: function(value) {
                                        return value + '%';
                                      }
                                    }
                                  }
                                },
                                animation: {
                                  duration: 1500
                                }
                              }}
                            />
                          ) : (
                            <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <Typography variant="body1" color="rgba(255,255,255,0.7)">
                                No project data available.
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Task Distribution Pie Chart */}
                  <Grid item xs={12} md={6} sx={{ display: 'flex', height: '100%' }}>
                    <Card sx={{ 
                      borderRadius: 2, 
                      boxShadow: '0 4px 24px rgba(0,0,0,0.5)', 
                      bgcolor: '#121212', 
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: '500', letterSpacing: 0.5, paddingBottom: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          Task Distribution
                        </Typography>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '450px' }}>
                          {projectData.length > 0 && projectData.some(p => p.tasks && p.tasks.length > 0) ? (
                            <Doughnut 
                              data={{
                                labels: ['Completed', 'In Progress', 'Not Started'],
                                datasets: [
                                  {
                                    data: [
                                      projectData.reduce((acc, project) => acc + (project.tasks ? project.tasks.filter(t => t.status === 'completed').length : 0), 0),
                                      projectData.reduce((acc, project) => acc + (project.tasks ? project.tasks.filter(t => ['submitted', 'revision', 'approved'].includes(t.status)).length : 0), 0),
                                      projectData.reduce((acc, project) => acc + (project.tasks ? project.tasks.filter(t => ['created', 'assigned'].includes(t.status)).length : 0), 0)
                                    ],
                                    backgroundColor: [
                                      chartColors.green.bg,
                                      chartColors.orange.bg,
                                      chartColors.red.bg
                                    ],
                                    borderColor: [
                                      chartColors.green.border,
                                      chartColors.orange.border,
                                      chartColors.red.border
                                    ],
                                    borderWidth: 1,
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        const value = context.raw;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = Math.round((value / total) * 100);
                                        return `${context.label}: ${value} (${percentage}%)`;
                                      }
                                    }
                                  }
                                },
                                animation: {
                                  duration: 1500
                                }
                              }}
                            />
                          ) : (
                            <Typography variant="body1" color="rgba(255,255,255,0.7)">
                              No task data available.
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}

          {/* Project Details Tab */}
          {tabValue === 1 && (
            <Box 
              ref={projectDetailsRef} 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)', 
                bgcolor: '#121212',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    color: 'white', 
                    fontWeight: '500', 
                    letterSpacing: 0.5, 
                    paddingBottom: 1, 
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    Project Reports
                  </Typography>
                  {projectData.length > 0 ? (
                    <TableContainer component={Paper} sx={{ 
                      backgroundColor: 'transparent', 
                      boxShadow: 'none',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Table sx={{ 
                        '& .MuiTableCell-root': { 
                          color: 'white', 
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          padding: '16px 12px'
                        },
                        '& .MuiTableCell-head': {
                          fontWeight: 'bold',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '0.9rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }
                      }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Project Name</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Task Distribution</TableCell>
                            <TableCell align="center">Report</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {projectData.map((project, index) => {
                            const totalTasks = project.tasks ? project.tasks.length : 0;
                            const projectProgress = calculateProjectProgress(project.tasks);
                            
                            const taskDistribution = {
                              completed: project.tasks ? project.tasks.filter(t => t.status === 'completed').length : 0,
                              approved: project.tasks ? project.tasks.filter(t => t.status === 'approved').length : 0,
                              revision: project.tasks ? project.tasks.filter(t => t.status === 'revision').length : 0,
                              submitted: project.tasks ? project.tasks.filter(t => t.status === 'submitted').length : 0,
                              assigned: project.tasks ? project.tasks.filter(t => ['created', 'assigned'].includes(t.status)).length : 0
                            };
                            
                            return (
                              <TableRow 
                                key={project._id}
                                sx={{ 
                                  bgcolor: index % 2 === 0 ? '#121212' : 'rgba(255, 255, 255, 0.03)',
                                  transition: 'all 0.2s',
                                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.07)' } 
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {project.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ 
                                      width: 50, 
                                      height: 50, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      borderRadius: '50%',
                                      border: '2px solid rgba(255, 255, 255, 0.4)',
                                      background: `linear-gradient(0deg, rgba(255, 255, 255, 0.15) ${projectProgress}%, transparent ${projectProgress}%)`,
                                      mr: 1
                                    }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {projectProgress}%
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>{formatDate(project.createdAt)}</TableCell>
                                <TableCell>
                                  {project.dueDate ? formatDate(project.dueDate) : 'Not set'}
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                    <Typography variant="body2" sx={{ 
                                      color: 'white',
                                      display: 'flex',
                                      justifyContent: 'space-between'
                                    }}>
                                      <span>Completed:</span> 
                                      <span>{taskDistribution.completed} ({totalTasks > 0 ? Math.round((taskDistribution.completed/totalTasks) * 100) : 0}%)</span>
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      color: 'white',
                                      display: 'flex',
                                      justifyContent: 'space-between'
                                    }}>
                                      <span>Approved:</span>
                                      <span>{taskDistribution.approved} ({totalTasks > 0 ? Math.round((taskDistribution.approved/totalTasks) * 100) : 0}%)</span>
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      color: 'white',
                                      display: 'flex',
                                      justifyContent: 'space-between'
                                    }}>
                                      <span>Revision:</span>
                                      <span>{taskDistribution.revision} ({totalTasks > 0 ? Math.round((taskDistribution.revision/totalTasks) * 100) : 0}%)</span>
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      color: 'white',
                                      display: 'flex',
                                      justifyContent: 'space-between'
                                    }}>
                                      <span>Submitted:</span>
                                      <span>{taskDistribution.submitted} ({totalTasks > 0 ? Math.round((taskDistribution.submitted/totalTasks) * 100) : 0}%)</span>
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      color: 'white',
                                      display: 'flex',
                                      justifyContent: 'space-between'
                                    }}>
                                      <span>Assigned:</span>
                                      <span>{taskDistribution.assigned} ({totalTasks > 0 ? Math.round((taskDistribution.assigned/totalTasks) * 100) : 0}%)</span>
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Download PDF Report">
                                    <IconButton 
                                      sx={{ 
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                      }} 
                                      onClick={() => generateProjectPDF(project)}
                                    >
                                      <DownloadIcon />
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
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Typography variant="body1" color="rgba(255,255,255,0.7)">
                        No projects found. Create a project to generate reports.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Reports;