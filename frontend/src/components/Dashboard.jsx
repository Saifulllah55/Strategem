import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../Store/features/projectSlice";
import { fetchActivities } from "../Store/features/activitySlice";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { byId, allIds, fetchLoading, fetchError } = useSelector(
    (state) => state.projects
  );
  const activities = useSelector((state) => state.activities.activities);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchActivities());
  }, [dispatch]);

  // Calculate task completion data
  const taskCompletionData = useMemo(() => {
    if (!activities || !user) return null;

    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Filter activities for task completions by the current user
    const completedTasks = activities.filter(activity => 
      (activity.type === 'task_approved' || activity.type === 'task_submitted') && 
      activity.user._id === user._id
    );

    // Count completions per day
    const completionCounts = last7Days.map(date => {
      return completedTasks.filter(task => 
        new Date(task.createdAt).toISOString().split('T')[0] === date
      ).length;
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        label: 'Tasks Completed',
        data: completionCounts,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }]
    };
  }, [activities, user]);

  // Calculate project-wise task completion
  const projectCompletionData = useMemo(() => {
    if (!activities || !user || !byId || !allIds) return null;

    const projectStats = {};
    const projects = allIds.map(id => byId[id]);

    projects.forEach(project => {
      projectStats[project._id] = {
        name: project.name,
        submitted: 0,
        approved: 0
      };
    });

    activities.forEach(activity => {
      if (activity.user._id === user._id && activity.project) {
        if (!projectStats[activity.project._id]) {
          projectStats[activity.project._id] = {
            name: activity.project.name,
            submitted: 0,
            approved: 0
          };
        }

        if (activity.type === 'task_submitted') {
          projectStats[activity.project._id].submitted++;
        } else if (activity.type === 'task_approved') {
          projectStats[activity.project._id].approved++;
        }
      }
    });

    const projectNames = Object.values(projectStats).map(p => p.name);
    const submittedCounts = Object.values(projectStats).map(p => p.submitted);
    const approvedCounts = Object.values(projectStats).map(p => p.approved);

    return {
      labels: projectNames,
      datasets: [
        {
          label: 'Submitted Tasks',
          data: submittedCounts,
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 1
        },
        {
          label: 'Approved Tasks',
          data: approvedCounts,
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }
      ]
    };
  }, [activities, user, byId, allIds]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading user data...</div>
      </div>
    );
  }

  // Calculate statistics
  const projects = allIds.map(id => byId[id]);
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((acc, project) => acc + (project.tasks?.length || 0), 0);
  const pendingTasks = projects.reduce((acc, project) => 
    acc + (project.tasks?.filter(task => task.status === 'todo').length || 0), 0
  );
  const completedTasks = projects.reduce((acc, project) => 
    acc + (project.tasks?.filter(task => task.status === 'completed').length || 0), 0
  );

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h2>
        <p className="text-[var(--color-text-secondary)]">
          Here's an overview of your work
        </p>
      </div>

      {fetchLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      )}
      
      {fetchError && (
        <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg p-4 text-[var(--color-error)] mb-6">
          Error: {fetchError}
        </div>
      )}

      {!fetchLoading && (
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

          {/* Task Completion Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Task Completion Timeline</h3>
              {taskCompletionData && (
                <Line
                  data={taskCompletionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Tasks Completed Over Time'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Project-wise Completion</h3>
              {projectCompletionData && (
                <Bar
                  data={projectCompletionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Tasks by Project'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              )}
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

