import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../Store/features/projectSlice";

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { byId, allIds, fetchLoading, fetchError } = useSelector(
    (state) => state.projects
  );

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleOpenBoard = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const filteredProjects = allIds
    .map((id) => byId[id])
    .filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getMemberInitial = (member) => {
    if (!member) return "-";
    if (typeof member === "string") return member.charAt(0).toUpperCase();
    if (member.user?.name) return member.user.name.charAt(0).toUpperCase();
    if (member.user?.username) return member.user.username.charAt(0).toUpperCase();
    if (typeof member.user === "string") return member.user.charAt(0).toUpperCase();
    return "-";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Projects</h2>
          <p className="text-[var(--color-text-secondary)]">
            You have {filteredProjects.length} active projects
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field flex-1 md:w-64"
          />
          <button
            onClick={() => navigate('/create')}
            className="btn-primary whitespace-nowrap"
          >
            <span className="text-xl mr-2">+</span>
            Create Project
          </button>
        </div>
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

      {!fetchLoading && filteredProjects.length === 0 && (
        <div className="card text-center">
          <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            {searchQuery ? "No projects match your search" : "Create your first project to get started"}
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary"
          >
            Create Project
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {project.members?.length || 0} members
                </p>
              </div>
            </div>
            
            <p className="text-[var(--color-text-secondary)] mb-6 line-clamp-2">
              {project.description || "No description provided"}
            </p>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex -space-x-2">
                {project.members?.slice(0, 3).map((member, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-hover)] flex items-center justify-center text-sm font-semibold"
                  >
                    {getMemberInitial(member)}
                  </div>
                ))}
                {project.members?.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-hover)] flex items-center justify-center text-sm">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleOpenBoard(project._id)}
                className="btn-primary flex-1"
              >
                Open Board
              </button>
              <button className="btn-secondary">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage; 