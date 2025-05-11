import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../Store/features/projectSlice";
import axios from '../lib/axios';

const StatCard = ({ title, value, icon, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[var(--color-text-secondary)] text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/10`}>
        {icon}
      </div>
    </div>
  </div>
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

// Function to determine status color based on progress
const getStatusColor = (progress) => {
  if (progress < 30) return 'var(--color-error)';
  if (progress < 70) return 'var(--color-warning)';
  return 'var(--color-success)';
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { byId, allIds, fetchLoading, fetchError } = useSelector(
    (state) => state.projects
  );
  const [dashboardStats, setDashboardStats] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [projectsWithProgress, setProjectsWithProgress] = useState([]);

  useEffect(() => {
    dispatch(fetchProjects());
      // Fetch dashboard data from reports API
    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const response = await axios.get('/api/reports/dashboard');
        setDashboardStats(response.data.stats);
        setUpcomingDeadlines(response.data.upcomingDeadlines);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  // Process projects to calculate progress and sort by due date
  useEffect(() => {
    if (allIds.length > 0) {
      const projects = allIds.map(id => byId[id]);
      
      const enhancedProjects = projects.map(project => ({
        ...project,
        progress: calculateProjectProgress(project.tasks || []),
        dueDate: project.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      // Sort by due date (closest first)
      enhancedProjects.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      setProjectsWithProgress(enhancedProjects);
    }
  }, [allIds, byId]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading user data...</div>
      </div>
    );
  }

  // Calculate statistics
  const projects = allIds.map(id => byId[id]);
  const totalProjects = dashboardStats?.totalProjects || projects.length;
  const totalTasks = dashboardStats?.totalTasks || projects.reduce((acc, project) => acc + (project.tasks?.length || 0), 0);
  const pendingTasks = dashboardStats?.pendingTasks || projects.reduce((acc, project) => 
    acc + (project.tasks?.filter(task => task.status === 'todo').length || 0), 0
  );
  const completedTasks = dashboardStats?.completedTasks || projects.reduce((acc, project) => 
    acc + (project.tasks?.filter(task => task.status === 'completed').length || 0), 0
  );
  
  // Project completion rate from reports
  const projectCompletionRate = dashboardStats?.projectCompletionRate || 0;
  const taskCompletionRate = dashboardStats?.taskCompletionRate || 0;

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  // Format due date
  const formatDueDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if a project is due soon (within 3 days)
  const isProjectDueSoon = (project) => {
    if (!project.dueDate) return false;
    
    const now = new Date();
    const dueDate = new Date(project.dueDate);
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    return dueDate <= threeDaysFromNow && dueDate >= now;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h2>
        <p className="text-[var(--color-text-secondary)]">
          Here's an overview of your work
        </p>
      </div>

      {(fetchLoading || dashboardLoading) && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      )}
      
      {fetchError && (
        <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg p-4 text-[var(--color-error)] mb-6">
          Error: {fetchError}
        </div>
      )}

      {!fetchLoading && !dashboardLoading && (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Projects"
              value={totalProjects}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              color="primary"
            />
            <StatCard
              title="Total Tasks"
              value={totalTasks}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              color="secondary"
            />
            <StatCard
              title="Pending Tasks"
              value={pendingTasks}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="warning"
            />
            <StatCard
              title="Completed Tasks"
              value={completedTasks}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="success"
            />
          </div>

          {/* Completion Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Project Completion</h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-700 rounded-full h-2.5 mr-4">
                  <div className="bg-[var(--color-primary)] h-2.5 rounded-full" style={{ width: `${projectCompletionRate}%` }}></div>
                </div>
                <span className="text-sm font-semibold">{projectCompletionRate}%</span>
              </div>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Task Completion</h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-700 rounded-full h-2.5 mr-4">
                  <div className="bg-[var(--color-success)] h-2.5 rounded-full" style={{ width: `${taskCompletionRate}%` }}></div>
                </div>
                <span className="text-sm font-semibold">{taskCompletionRate}%</span>
              </div>
            </div>
          </div>

          {/* Project Progress Grid - NEW SECTION FROM PROJECT A */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Project Progress</h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                View all projects →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projectsWithProgress.slice(0, 6).map((project) => (
                <div 
                  key={project._id} 
                  className={`card transition-transform hover:-translate-y-1 hover:shadow-lg ${
                    isProjectDueSoon(project) ? 'border-t-2 border-t-[var(--color-error)]' : ''
                  }`}
                >
                  <div className="relative">
                    {isProjectDueSoon(project) && (
                      <div className="absolute -top-3 right-2 bg-[var(--color-error)] text-white text-xs font-bold px-2 py-1 rounded-full">
                        DUE SOON
                      </div>
                    )}
                    <h4 className="text-lg font-semibold mb-2">{project.name}</h4>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">
                      {project.description || "No description provided"}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          Progress
                        </span>
                        <span className="text-sm" style={{ color: getStatusColor(project.progress) }}>
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${project.progress}%`,
                            backgroundColor: getStatusColor(project.progress)
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div 
                        className={`text-xs px-2 py-1 rounded ${
                          isProjectDueSoon(project) 
                            ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]' 
                            : 'bg-[var(--color-text-secondary)]/10 text-[var(--color-text-secondary)]'
                        }`}
                      >
                        Due {formatDueDate(project.dueDate)}
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {project.tasks?.filter(task => task.status === 'completed').length || 0}/{project.tasks?.length || 0} Tasks
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {(project.members || []).slice(0, 3).map((member, idx) => (
                        <div 
                          key={member._id || idx} 
                          className="w-6 h-6 rounded-full bg-[var(--color-background-light)] flex items-center justify-center text-xs ring-2 ring-[var(--color-background)]"
                        >
                          {member.username?.charAt(0) || 'U'}
                        </div>
                      ))}
                      {(project.members || []).length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-[var(--color-background-light)] flex items-center justify-center text-xs ring-2 ring-[var(--color-background)]">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => navigate(`/project/${project._id}`)}
                      className={`text-xs font-medium px-3 py-1 rounded ${
                        isProjectDueSoon(project)
                          ? 'bg-[var(--color-error)] text-white'
                          : 'text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]'
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Recent Projects</h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                View all projects →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <div key={project._id} className="card">
                  <h4 className="text-lg font-semibold mb-2">{project.name}</h4>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">
                    {project.description || "No description provided"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {project.tasks?.length || 0} tasks
                    </span>
                    <button
                      onClick={() => navigate(`/project/${project._id}`)}
                      className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
                    >
                      View project →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          {upcomingDeadlines && upcomingDeadlines.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Upcoming Deadlines</h3>
                <button
                  onClick={() => navigate('/reports')}
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
                >
                  View detailed reports →
                </button>
              </div>
              <div className="card">
                <div className="divide-y divide-[var(--color-border)]">
                  {upcomingDeadlines.slice(0, 5).map((task) => (
                    <div key={task._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {task.project ? `${task.project.name}` : 'No project'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span 
                          className={`text-sm px-2 py-1 rounded ${
                            new Date(task.dueDate) < new Date() 
                              ? 'text-[var(--color-error)] bg-[var(--color-error)]/10' 
                              : 'text-[var(--color-warning)] bg-[var(--color-warning)]/10'
                          }`}
                        >
                          Due {formatDueDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/create')}
                className="card hover:border-[var(--color-primary)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-semibold">Create New Project</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="card hover:border-[var(--color-secondary)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-secondary)]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="font-semibold">View All Projects</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/reminders')}
                className="card hover:border-[var(--color-warning)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-warning)]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span className="font-semibold">Manage Reminders</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="card hover:border-[var(--color-success)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-success)]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="font-semibold">View Reports</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

