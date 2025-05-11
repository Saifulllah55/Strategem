import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../Store/features/projectSlice";

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

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

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
              <button
                onClick={() => navigate('/analytics')}
                className="card hover:border-[var(--color-warning)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-warning)]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Project Analytics</span>
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

