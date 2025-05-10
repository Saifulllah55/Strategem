import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../Store/features/allUsersSlice.js";
import { createProject } from "../Store/features/projectSlice.js";
import ProjectToolCard from "../components/ProjectToolCard.jsx";

const CreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users = [], loading, error } = useSelector((state) => state.users || {});

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [tools, setTools] = useState({
    messageBoard: false,
    tasks: false,
    docsFiles: false,
    chat: false,
    schedule: false,
    cardTable: false,
  });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const toggleTool = (tool) => {
    setTools((prev) => ({ ...prev, [tool]: !prev[tool] }));
  };

  const toggleUserSelect = (user) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert("Please provide a project name");
      return;
    }

    const projectData = {
      name: projectName,
      description: projectDescription,
      members: selectedUsers.map((u) => u._id),
      tools,
    };

    try {
      const resultAction = await dispatch(createProject(projectData));
      if (createProject.fulfilled.match(resultAction)) {
        alert("Project created successfully!");
        navigate("/projects");
      } else {
        throw new Error(resultAction.payload || "Failed to create project");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const filteredUsers = users
    .filter((u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedUsers.some((sel) => sel._id === u._id)
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#121620] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-center">Make a new project</h1>

        {/* Basics */}
        <section className="bg-[#1c2331] p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">1. Start with the basics</h2>
          <div>
            <label className="block text-sm mb-1">Project Name</label>
            <input
              type="text"
              placeholder="e.g. Office Renovation"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 bg-[#2c323f] border border-[#3a404e] text-white rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              placeholder="e.g. Plans and scheduling for expanding the office"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full p-2 bg-[#2c323f] border border-[#3a404e] text-white rounded-md"
            />
          </div>
        </section>

        {/* Tools */}
        <section className="bg-[#1c2331] p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">2. Choose your tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ProjectToolCard title="Message Board" icon="📝" isEnabled={tools.messageBoard} onToggle={() => toggleTool("messageBoard")} description="Post announcements, pitch ideas, progress updates, etc." />
            <ProjectToolCard title="To-dos" icon="✅" isEnabled={tools.tasks} onToggle={() => toggleTool("tasks")} description="Make lists of work that needs to get done." />
            <ProjectToolCard title="Docs & Files" icon="📄" isEnabled={tools.docsFiles} onToggle={() => toggleTool("docsFiles")} description="Share docs, files, images, and spreadsheets." />
            <ProjectToolCard title="Chat" icon="💬" isEnabled={tools.chat} onToggle={() => toggleTool("chat")} description="Chat casually with the group." />
            <ProjectToolCard title="Schedule" icon="📅" isEnabled={tools.schedule} onToggle={() => toggleTool("schedule")} description="Set important dates on a shared schedule." />
            <ProjectToolCard title="Card Table" icon="🗂️" isEnabled={tools.cardTable} onToggle={() => toggleTool("cardTable")} description="A visual, kanban-like tool for workflows." />
          </div>
        </section>

        {/* People */}
        <section className="bg-[#1c2331] p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">3. Choose who's on the project</h2>

          <input
            type="text"
            placeholder="Search users by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 bg-[#2c323f] border border-[#3a404e] text-white rounded-md"
          />

          {/* Matching Users */}
          {searchTerm && (
            <div className="flex gap-4 mb-4 flex-wrap">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleUserSelect(user)}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full border-2 border-green-500"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-700 text-white text-lg font-semibold border-2 border-green-500">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm mt-1">{user.username}</span>
                </div>
              ))}
            </div>
          )}

          {/* Selected Users */}
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center px-3 py-1 bg-[#2c323f] text-sm rounded-full"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-5 h-5 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-700 text-white text-xs font-bold mr-2">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                {user.username}
                <button
                  onClick={() => toggleUserSelect(user)}
                  className="ml-2 text-red-400 hover:text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {loading && <p className="mt-4">Loading users...</p>}
          {error && <p className="mt-4 text-red-500">Error loading users: {error}</p>}
        </section>

        <div className="text-center mt-8">
          <button
            onClick={handleCreateProject}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full text-lg"
          >
            Create this project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
