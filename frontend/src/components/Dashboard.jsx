import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./NavBar";
import { fetchProjects } from "../Store/features/projectSlice";

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
    return <div className="min-h-screen bg-[#121620] text-white flex items-center justify-center">
      <div className="animate-pulse">Loading user data...</div>
    </div>;
  }

  const handleOpenBoard = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const projectList = allIds.map((id) => {
    const project = byId[id];
    return project;
  });

  const getMemberInitial = (member) => {
    if (!member) return "-";
    if (typeof member === "string") return member.charAt(0).toUpperCase();
    if (member.user?.name) return member.user.name.charAt(0).toUpperCase();
    if (member.user?.username) return member.user.username.charAt(0).toUpperCase();
    if (typeof member.user === "string") return member.user.charAt(0).toUpperCase();
    return "-";
  };

  return (
    <div className="min-h-screen bg-[#121620] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Projects</h2>
            <p className="text-gray-400">You have {projectList.length} active projects</p>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            <span className="text-xl">+</span>
            <span>Create Project</span>
          </button>
        </div>

        {fetchLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
        
        {fetchError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 mb-6">
            Error: {fetchError}
          </div>
        )}

        {!fetchLoading && projectList.length === 0 && (
          <div className="bg-[#1c2331] rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to get started</p>
            <button
              onClick={() => navigate('/create')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Create Project
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.map((project) => (
            <div
              key={project._id}
              className="bg-[#1c2331] rounded-xl p-6 border border-[#2c323f] hover:border-[#3a404e] transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-400">
                    {project.members?.length || 0} members
                  </p>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6 line-clamp-2">{project.description || "No description provided"}</p>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 3).map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-[#1c2331] bg-[#2c323f] flex items-center justify-center text-sm font-semibold"
                    >
                      {getMemberInitial(member)}
                    </div>
                  ))}
                  {project.members?.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-[#1c2331] bg-[#2c323f] flex items-center justify-center text-sm">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleOpenBoard(project._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Open Board
                </button>
                <button className="px-4 py-2 border border-[#3a404e] hover:border-[#4a5060] rounded-lg font-medium transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


