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
import { useAuth } from '../../context/AuthContext';

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

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [projectData, setProjectData] = useState([]);
  const [taskStats, setTaskStats] = useState({
    completed: [],
    pending: [],
    overdue: [],
    dates: []
  });
  const chartsRef = useRef(null);
  const projectDetailsRef = useRef(null);

  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch data from an API
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for projects
        const projects = [
          {
            id: 1,
            title: 'Website Redesign',
            description: 'Redesign the company website with modern UI components',
            progress: 75,
            dueDate: '2025-05-30',
            startDate: '2025-03-01',
            tasks: {
              total: 20,
              completed: 15,
              pending: 5,
              overdue: 0
            },
            taskHistory: [
              { date: '2025-03-07', completed: 2, pending: 18, overdue: 0 },
              { date: '2025-03-14', completed: 5, pending: 15, overdue: 0 },
              { date: '2025-03-21', completed: 8, pending: 12, overdue: 0 },
              { date: '2025-03-28', completed: 10, pending: 10, overdue: 0 },
              { date: '2025-04-04', completed: 12, pending: 8, overdue: 0 },
              { date: '2025-04-11', completed: 14, pending: 6, overdue: 0 },
              { date: '2025-04-18', completed: 15, pending: 5, overdue: 0 }
            ]
          },
          {
            id: 2,
            title: 'Mobile App Development',
            description: 'Develop a mobile application for iOS and Android platforms',
            progress: 40,
            dueDate: '2025-07-15',
            startDate: '2025-02-15',
            tasks: {
              total: 20,
              completed: 8,
              pending: 10,
              overdue: 2
            },
            taskHistory: [
              { date: '2025-02-21', completed: 1, pending: 19, overdue: 0 },
              { date: '2025-02-28', completed: 3, pending: 17, overdue: 0 },
              { date: '2025-03-07', completed: 4, pending: 16, overdue: 0 },
              { date: '2025-03-14', completed: 5, pending: 15, overdue: 0 },
              { date: '2025-03-21', completed: 6, pending: 13, overdue: 1 },
              { date: '2025-03-28', completed: 7, pending: 11, overdue: 2 },
              { date: '2025-04-04', completed: 8, pending: 10, overdue: 2 }
            ]
          },
          {
            id: 3,
            title: 'Marketing Campaign',
            description: 'Plan and execute Q2 marketing campaign',
            progress: 20,
            dueDate: '2025-06-10',
            startDate: '2025-04-01',
            tasks: {
              total: 15,
              completed: 3,
              pending: 12,
              overdue: 0
            },
            taskHistory: [
              { date: '2025-04-07', completed: 1, pending: 14, overdue: 0 },
              { date: '2025-04-14', completed: 2, pending: 13, overdue: 0 },
              { date: '2025-04-21', completed: 3, pending: 12, overdue: 0 }
            ]
          },
          {
            id: 4,
            title: 'Database Migration',
            description: 'Migrate data from legacy system to new cloud platform',
            progress: 60,
            dueDate: '2025-05-20',
            startDate: '2025-03-15',
            tasks: {
              total: 20,
              completed: 12,
              pending: 6,
              overdue: 2
            },
            taskHistory: [
              { date: '2025-03-21', completed: 3, pending: 17, overdue: 0 },
              { date: '2025-03-28', completed: 6, pending: 14, overdue: 0 },
              { date: '2025-04-04', completed: 8, pending: 12, overdue: 0 },
              { date: '2025-04-11', completed: 10, pending: 8, overdue: 2 },
              { date: '2025-04-18', completed: 12, pending: 6, overdue: 2 }
            ]
          }
        ];
        
        setProjectData(projects);
        
        // Calculate aggregate task stats for all projects
        const dates = [];
        const completed = [];
        const pending = [];
        const overdue = [];
        
        // Get all unique dates across all projects
        const allDates = new Set();
        projects.forEach(project => {
          project.taskHistory.forEach(history => {
            allDates.add(history.date);
          });
        });
        
        // Sort dates
        const sortedDates = Array.from(allDates).sort();
        
        // For each date, sum up the task stats across all projects
        sortedDates.forEach(date => {
          let completedCount = 0;
          let pendingCount = 0;
          let overdueCount = 0;
          
          projects.forEach(project => {
            const historyForDate = project.taskHistory.find(h => h.date === date);
            if (historyForDate) {
              completedCount += historyForDate.completed;
              pendingCount += historyForDate.pending;
              overdueCount += historyForDate.overdue;
            }
          });
          
          dates.push(formatDate(date));
          completed.push(completedCount);
          pending.push(pendingCount);
          overdue.push(overdueCount);
        });
        
        setTaskStats({
          dates,
          completed,
          pending,
          overdue
        });
        
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const generatePDF = async (project) => {
    try {
      console.log('Starting PDF generation for:', project.title);
      
      // Create new document with more compatibility options
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Project Report - ${project.title}`, 15, 20);
      
      // Project details
      doc.setFontSize(12);
      doc.text(`Description: ${project.description}`, 15, 35);
      doc.text(`Start Date: ${formatDate(project.startDate)}`, 15, 45);
      doc.text(`Due Date: ${formatDate(project.dueDate)}`, 15, 55);
      doc.text(`Progress: ${project.progress}%`, 15, 65);
      
      // Task summary - use simpler data representation
      doc.text('Task Summary:', 15, 80);
      
      const taskSummaryData = [
        ['Total Tasks', project.tasks.total],
        ['Completed Tasks', project.tasks.completed],
        ['Pending Tasks', project.tasks.pending],
        ['Overdue Tasks', project.tasks.overdue]
      ];
      
      // Track the Y position manually
      let yPosition = 85;
      
      try {
        // First table
        const taskSummaryTable = doc.autoTable({
          startY: yPosition,
          head: [['Category', 'Count']],
          body: taskSummaryData,
          theme: 'striped',
          styles: { fontSize: 10 },
          margin: { left: 15, right: 15 }
        });
        
        // Update Y position based on the first table
        yPosition = taskSummaryTable.lastAutoTable.finalY + 15;
      } catch (tableError) {
        console.error('Error generating task summary table:', tableError);
        // Fallback to regular text
        doc.text(JSON.stringify(taskSummaryData), 15, 85);
        yPosition = 110; // Manual position for fallback
      }
      
      // Task progress chart - using html2canvas to capture the chart
      try {
        // Create a temporary canvas for the chart
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 500;
        tempCanvas.height = 250;
        tempCanvas.style.display = 'none';
        document.body.appendChild(tempCanvas);
        
        // Create a chart on the temporary canvas
        const ctx = tempCanvas.getContext('2d');
        new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: project.taskHistory.map(h => formatDate(h.date)),
            datasets: [
              {
                label: 'Completed',
                data: project.taskHistory.map(h => h.completed),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
              },
              {
                label: 'Pending',
                data: project.taskHistory.map(h => h.pending),
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                fill: true
              },
              {
                label: 'Overdue',
                data: project.taskHistory.map(h => h.overdue),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true
              }
            ]
          },
          options: {
            responsive: false,
            animation: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              title: {
                display: true,
                text: 'Task Progress Over Time'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
        
        // Add title for chart
        doc.text('Task Progress Chart:', 15, yPosition);
        yPosition += 5;
        
        // Convert chart to image and add to PDF
        const imgData = tempCanvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 15, yPosition, 180, 90);
        
        // Update position
        yPosition += 95;
        
        // Remove temporary canvas
        document.body.removeChild(tempCanvas);
        
      } catch (chartError) {
        console.error('Error generating chart for PDF:', chartError);
        doc.text('Chart could not be generated', 15, yPosition);
        yPosition += 10;
        
        // As fallback, add table instead
        doc.text('Task Progress Timeline (Fallback):', 15, yPosition);
        yPosition += 10;
        
        const progressData = project.taskHistory.map(h => [
          formatDate(h.date),
          h.completed.toString(),
          h.pending.toString(),
          h.overdue.toString()
        ]);
        
        try {
          doc.autoTable({
            startY: yPosition,
            head: [['Date', 'Completed', 'Pending', 'Overdue']],
            body: progressData,
            theme: 'grid',
            styles: { fontSize: 9 },
            margin: { left: 15, right: 15 }
          });
        } catch (tableError) {
          console.error('Error generating fallback progress table:', tableError);
          doc.text('Progress data not rendered due to error', 15, yPosition);
        }
      }
      
      // Save with just the project name as filename
      const cleanTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${cleanTitle}.pdf`;
      
      console.log('PDF generated successfully, attempting to save as:', filename);
      doc.save(filename);
      console.log('PDF saved successfully');
      
    } catch (error) {
      console.error('Detailed error generating PDF:', error);
      const errorMessage = error?.message || 'Unknown error';
      const errorStack = error?.stack || 'No stack trace';
      console.error('Error message:', errorMessage);
      console.error('Stack trace:', errorStack);
      
      alert(`Error generating PDF: ${errorMessage}. Please check the browser console for details.`);
    }
  };

  // Project overview chart data
  const projectOverviewData = {
    labels: projectData.map(project => project.title),
    datasets: [
      {
        label: 'Progress (%)',
        data: projectData.map(project => project.progress),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Task distribution chart data
  const taskDistributionData = {
    labels: ['Completed', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [
          projectData.reduce((acc, project) => acc + project.tasks.completed, 0),
          projectData.reduce((acc, project) => acc + project.tasks.pending, 0),
          projectData.reduce((acc, project) => acc + project.tasks.overdue, 0)
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  // Task progress over time chart data
  const taskProgressData = {
    labels: taskStats.dates,
    datasets: [
      {
        label: 'Completed Tasks',
        data: taskStats.completed,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
      {
        label: 'Pending Tasks',
        data: taskStats.pending,
        fill: true,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        tension: 0.4,
      },
      {
        label: 'Overdue Tasks',
        data: taskStats.overdue,
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.4,
      }
    ]
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
          Generate Report
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
          sx={{ borderRadius: 2 }}
        >
          Refresh Data
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Dashboard" />
              <Tab label="Project Details" />
            </Tabs>
          </Box>

          {/* Dashboard Tab */}
          {tabValue === 0 && (
            <Box ref={chartsRef}>
              <Grid container spacing={3}>
                {/* Project Overview Chart */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Project Progress Overview
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar 
                          data={projectOverviewData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100
                              }
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Task Distribution Pie Chart */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Task Distribution
                      </Typography>
                      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Doughnut 
                          data={taskDistributionData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                            },
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Task Progress Line Chart */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Task Progress Over Time
                      </Typography>
                      <Box sx={{ height: 400 }}>
                        <Line 
                          data={taskProgressData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true
                              }
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Project Details Tab */}
          {tabValue === 1 && (
            <Box ref={projectDetailsRef}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Project Reports
                  </Typography>
                  <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Project Name</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Tasks (Completed/Total)</TableCell>
                          <TableCell align="center">Report</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projectData.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>{project.title}</TableCell>
                            <TableCell>
                              {project.progress}%
                            </TableCell>
                            <TableCell>{formatDate(project.startDate)}</TableCell>
                            <TableCell>{formatDate(project.dueDate)}</TableCell>
                            <TableCell>{`${project.tasks.completed}/${project.tasks.total}`}</TableCell>
                            <TableCell align="center">
                              <Tooltip title="Download PDF Report">
                                <IconButton 
                                  color="primary" 
                                  onClick={() => generatePDF(project)}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Individual Project Charts */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Individual Project Progress
              </Typography>

              <Grid container spacing={3}>
                {projectData.map((project) => (
                  <Grid item xs={12} md={6} key={project.id}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {project.title}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ height: 300 }}>
                          <Line 
                            data={{
                              labels: project.taskHistory.map(h => formatDate(h.date)),
                              datasets: [
                                {
                                  label: 'Completed',
                                  data: project.taskHistory.map(h => h.completed),
                                  fill: true,
                                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                  borderColor: 'rgba(75, 192, 192, 1)',
                                  tension: 0.4,
                                },
                                {
                                  label: 'Pending',
                                  data: project.taskHistory.map(h => h.pending),
                                  fill: true,
                                  backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                  borderColor: 'rgba(255, 159, 64, 1)',
                                  tension: 0.4,
                                },
                                {
                                  label: 'Overdue',
                                  data: project.taskHistory.map(h => h.overdue),
                                  fill: true,
                                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                  borderColor: 'rgba(255, 99, 132, 1)',
                                  tension: 0.4,
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
                                title: {
                                  display: false,
                                  text: 'Task Progress'
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true
                                }
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button 
                            variant="contained" 
                            startIcon={<DownloadIcon />}
                            onClick={() => generatePDF(project)}
                            size="small"
                          >
                            Download Report
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Reports;