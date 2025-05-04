import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../Store/features/allUsersSlice.js";
import { createProject } from "../Store/features/projectSlice.js";
import ProjectToolCard from "../components/ProjectToolCard.jsx";
import ProjectUserRow from "../components/ProjectUserRow";

const CreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users || {});

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [tools, setTools] = useState({
    messageBoard: false,
    todos: false,
    docsFiles: false,
    chat: false,
    schedule: false,
    cardTable: false,
  });

  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const toggleTool = (tool) => {
    setTools((prev) => ({ ...prev, [tool]: !prev[tool] }));
    console.log(tools)
  };

  const toggleUserSelect = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
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

    console.log(projectData);


    try {
      const resultAction = await dispatch(createProject(projectData));
      if (createProject.fulfilled.match(resultAction)) {
        alert("Project created successfully!");
        navigate("/dashboard");
      } else {
        throw new Error(resultAction.payload || "Failed to create project");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#121620", color: "white", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "1.5rem" }}>
          Make a new project
        </h1>

        {/* Basics */}
        <div style={{ marginBottom: "2rem", background: "#1c2331", padding: "1.5rem", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>1. Start with the basics</h2>
          <div style={{ marginBottom: "1rem" }}>
            <label>Project Name</label>
            <input
              type="text"
              placeholder="e.g. Office Renovation"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem", background: "#2c323f", border: "1px solid #3a404e", color: "white", borderRadius: "4px" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Description</label>
            <textarea
              placeholder="e.g. Plans and scheduling for expanding the office"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem", background: "#2c323f", border: "1px solid #3a404e", color: "white", borderRadius: "4px" }}
            />
          </div>
        </div>

        {/* Tools */}
        <div style={{ marginBottom: "2rem", background: "#1c2331", padding: "1.5rem", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>2. Choose your tools</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            <ProjectToolCard title="Message Board" icon="📝" isEnabled={tools.messageBoard} onToggle={() => toggleTool("messageBoard")} description="Post announcements, pitch ideas, progress updates, etc." />
            <ProjectToolCard title="To-dos" icon="✅" isEnabled={tools.todos} onToggle={() => toggleTool("todos")} description="Make lists of work that needs to get done." />
            <ProjectToolCard title="Docs & Files" icon="📄" isEnabled={tools.docsFiles} onToggle={() => toggleTool("docsFiles")} description="Share docs, files, images, and spreadsheets." />
            <ProjectToolCard title="Chat" icon="💬" isEnabled={tools.chat} onToggle={() => toggleTool("chat")} description="Chat casually with the group." />
            <ProjectToolCard title="Schedule" icon="📅" isEnabled={tools.schedule} onToggle={() => toggleTool("schedule")} description="Set important dates on a shared schedule." />
            <ProjectToolCard title="Card Table" icon="🗂️" isEnabled={tools.cardTable} onToggle={() => toggleTool("cardTable")} description="A visual, kanban-like tool for workflows." />
          </div>
        </div>

        {/* People */}
        <div style={{ marginBottom: "2rem", background: "#1c2331", padding: "1.5rem", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>3. Choose who's on the project</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p>Error loading users: {error}</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <ProjectUserRow
                  key={user._id}
                  user={user}
                  isSelected={!!selectedUsers.find((u) => u._id === user._id)}
                  onToggle={() => toggleUserSelect(user)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={handleCreateProject}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#2d9d78",
              color: "white",
              border: "none",
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Create this project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
