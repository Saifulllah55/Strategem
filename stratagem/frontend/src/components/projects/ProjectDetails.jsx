import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { projectAPI } from '../../api';

const ProjectDetails = () => {
  const { id } = useParams(); // Get the project ID from the URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await projectAPI.getProjectById(id);
        console.log('Project details:', response.data);
        setProject(response.data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, backgroundColor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h6">Error</Typography>
          <Typography>{error}</Typography>
        </Paper>
      </Box>
    );
  }

  // No project found
  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, backgroundColor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="h6">Project Not Found</Typography>
          <Typography>The requested project could not be found.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {project.name || 'Project Details'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">
                {project.description || 'No description provided.'}
              </Typography>
            </CardContent>
          </Card>
          
          {/* Placeholder for additional content */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
            This page is under construction. More details coming soon.
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={project.status || 'In Progress'} 
                  color={project.status === 'completed' ? 'success' : 'primary'}
                  size="small"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography>
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography>
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetails; 