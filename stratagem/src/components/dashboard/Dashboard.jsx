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
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0
  });

  useEffect(() => {
    // Simulate fetching projects from an API
    const fetchProjects = async () => {
      // This would be an API call in a real app
      // For now, we'll use mock data
      const mockProjects = [
        {
          id: 1,
          title: 'Website Redesign',
          description: 'Redesign the company website with modern UI components',
          progress: 75,
          dueDate: '2025-05-30',
          team: [
            { id: 1, name: 'John Doe', avatar: null },
            { id: 2, name: 'Jane Smith', avatar: null },
            { id: 3, name: 'Bob Johnson', avatar: null }
          ],
          tasksCompleted: 15,
          totalTasks: 20
        },
        {
          id: 2,
          title: 'Mobile App Development',
          description: 'Develop a mobile application for iOS and Android platforms',
          progress: 40,
          dueDate: '2025-07-15',
          team: [
            { id: 1, name: 'John Doe', avatar: null },
            { id: 4, name: 'Alice Brown', avatar: null }
          ],
          tasksCompleted: 8,
          totalTasks: 20
        },
        {
          id: 3,
          title: 'Marketing Campaign',
          description: 'Plan and execute Q2 marketing campaign',
          progress: 20,
          dueDate: '2025-06-10',
          team: [
            { id: 2, name: 'Jane Smith', avatar: null },
            { id: 5, name: 'Charlie Davis', avatar: null }
          ],
          tasksCompleted: 3,
          totalTasks: 15
        },
        {
          id: 4,
          title: 'Database Migration',
          description: 'Migrate data from legacy system to new cloud platform',
          progress: 60,
          dueDate: '2025-05-20',
          team: [
            { id: 1, name: 'John Doe', avatar: null },
            { id: 3, name: 'Bob Johnson', avatar: null },
            { id: 6, name: 'Eva Wilson', avatar: null }
          ],
          tasksCompleted: 12,
          totalTasks: 20
        }
      ];
      
      setProjects(mockProjects);
      
      // Calculate stats
      setStats({
        totalProjects: mockProjects.length,
        completedProjects: mockProjects.filter(p => p.progress === 100).length,
        pendingTasks: mockProjects.reduce((acc, curr) => acc + (curr.totalTasks - curr.tasksCompleted), 0),
        upcomingDeadlines: mockProjects.filter(p => {
          const dueDate = new Date(p.dueDate);
          const now = new Date();
          const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          return diffDays <= 14 && diffDays > 0;
        }).length
      });
    };
    
    fetchProjects();
  }, []);

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
          Welcome, {user?.name}
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