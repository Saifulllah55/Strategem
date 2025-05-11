import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  LinearProgress,
  Divider,
  Button,
  Avatar,
  AvatarGroup,
  Chip,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  Add as AddIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { projectAPI, taskAPI } from '../../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { initialized, notifications } = useApp();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const projectsResponse = await projectAPI.getAllProjects();
        const tasksResponse = await taskAPI.getAllTasks();
        const projects = projectsResponse.data || [];
        const tasks = tasksResponse.data || [];

        function calculateTaskProgress(status) {
          switch(status) {
            case "submitted": return 25;
            case "revision": return 50;
            case "approved": return 75;
            case "completed": return 100;
            default: return 0; // for "created" and "assigned"
          }
        }

        const formattedProjects = projects.map(project => {
          // Get tasks for this project
          const projectTasks = tasks.filter(task => String(task.project._id) === String(project._id));
          
          // Calculate progress
          const progress = projectTasks.length === 0 ? 0 : 
            Math.round(projectTasks.reduce((sum, task) => sum + calculateTaskProgress(task.status), 0) / projectTasks.length);

          console.log(`Project ${project.name} progress calculation:`, {
            totalTasks: projectTasks.length,
            taskStatuses: projectTasks.map(t => t.status),
            calculatedProgress: progress
          });

          return {
            id: project._id,
            title: project.name,
            description: project.description || 'No description provided',
            progress,
            dueDate: project.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: project.createdAt,
            timeline: { createdAt: project.createdAt, dueDate: project.dueDate },
            team: project.members || [],
            tasksCompleted: projectTasks.filter(t => t.status === 'completed').length,
            totalTasks: projectTasks.length,
            tasks: projectTasks
          };
        });

        setProjects(formattedProjects);
        setStats({
          totalProjects: formattedProjects.length,
          completedProjects: formattedProjects.filter(p => p.progress === 100).length,
          pendingTasks: tasks.filter(t => t.status !== 'completed').length,
          upcomingDeadlines: formattedProjects.filter(p => new Date(p.dueDate) > new Date()).length
        });
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    if (initialized) {
      fetchProjects();
    }
  }, [initialized]);

  const getStatusColor = (progress) => {
    if (progress < 30) return 'error';
    if (progress < 70) return 'warning';
    return 'success';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if a project is in the notifications list (due soon)
  const isProjectDueSoon = (projectId) => {
    return notifications.some(notification => 
      notification.type === 'project_due' && notification.projectId === projectId
    );
  };

  // Navigate to reports view for a specific project
  const handleViewProject = (projectId) => {
    navigate(`/reports?project=${projectId}`);
  };

  // Add a new handler function to open project details in a new window
  const handleViewProjectDetails = (projectId) => {
    window.open(`/project/${projectId}`, '_blank');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
          Welcome to Stratagem
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          New Project
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                {stats.totalProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed Projects
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                {stats.completedProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Tasks
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                {stats.pendingTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Upcoming Deadlines
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                {stats.upcomingDeadlines}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
        Your Projects
      </Typography>

      {/* Projects List */}
      <Grid container spacing={3}>
        {projects.length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
            No projects found.
          </Typography>
        )}
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'visible',
              transition: 'transform 0.2s ease-in-out',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              },
              ...(isProjectDueSoon(project.id) && {
                borderTop: '3px solid #f44336'
              })
            }}>
              {isProjectDueSoon(project.id) && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: -12, 
                  right: 10, 
                  bgcolor: 'error.main',
                  color: 'white',
                  borderRadius: '12px',
                  px: 1,
                  py: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  DUE SOON
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {project.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40 }}>
                  {project.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" color={getStatusColor(project.progress)}>
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    color={getStatusColor(project.progress)}
                    sx={{ 
                      height: 6, 
                      borderRadius: 5,
                      mb: 2
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    icon={<TimeIcon fontSize="small" />} 
                    label={`Due: ${formatDate(project.dueDate)}`} 
                    size="small"
                    variant="outlined"
                    color={isProjectDueSoon(project.id) ? "error" : "default"}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {project.tasksCompleted}/{project.totalTasks} Tasks
                  </Typography>
                </Box>
              </CardContent>
              <Divider />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AvatarGroup max={3}>
                  {project.team.map((member) => (
                    <Avatar 
                      key={member.id} 
                      alt={member.name}
                      src={member.avatar}
                      sx={{ width: 30, height: 30 }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
                <Button 
                  size="small" 
                  color={isProjectDueSoon(project.id) ? "error" : "primary"}
                  variant={isProjectDueSoon(project.id) ? "contained" : "text"}
                  onClick={() => handleViewProject(project.id)}
                >
                  View Details
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Minimal Render for Debugging */}
      <ul>
        {projects.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </Box>
  );
};

export default Dashboard;