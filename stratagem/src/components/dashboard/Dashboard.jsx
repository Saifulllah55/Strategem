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
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { reportAPI } from '../../api';

const Dashboard = () => {
  const { initialized } = useApp();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data from the local storage API
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await reportAPI.getDashboardData();
        
        if (response.data) {
          const { recentProjects, stats } = response.data;
          
          // Format projects for display
          const formattedProjects = recentProjects.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description || 'No description provided',
            progress: project.progress || 0,
            dueDate: project.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            team: [
              { id: 1, name: 'John Doe', avatar: null },
              { id: 2, name: 'Jane Smith', avatar: null }
            ],
            tasksCompleted: project.completedTasksCount || 0,
            totalTasks: project.tasksCount || 0
          }));
          
          setProjects(formattedProjects);
          
          // Set dashboard stats
          setStats({
            totalProjects: stats.totalProjects || 0,
            completedProjects: Math.round((stats.completedTasks / stats.totalTasks) * 100) / 100 || 0,
            pendingTasks: stats.pendingTasks || 0,
            upcomingDeadlines: response.data.upcomingDeadlines?.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (initialized) {
      fetchDashboardData();
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
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'visible',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}>
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
                <Button size="small" color="primary">
                  View Details
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;