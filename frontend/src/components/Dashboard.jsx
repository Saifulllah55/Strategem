import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./NavBar";
import { fetchProjects } from "../Store/features/projectSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const { byId, allIds, fetchLoading, fetchError } = useSelector(
    (state) => state.projects
  );

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  const handleOpenBoard = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const projectList = allIds.map((id) => {
    const project = byId[id];
    return project;
  });
  

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Projects ({projectList.length})</h2>
          <button
            onClick={() => {
              navigate('/create')
            }}
            className="bg-cyan-600 hover:bg-cyan-500 text-black font-semibold px-6 py-2 rounded-lg"
          >
            + Create Project
          </button>
        </div>

        {fetchLoading && <p>Loading projects...</p>}
        {fetchError && <p className="text-red-500">Error: {fetchError}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.map((project) => (
            <div
              key={project._id}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{project.name}</h3>
                <button className="text-red-400 hover:text-red-500 text-lg">✕</button>
              </div>
              <p className="text-gray-400 mb-4">{project.description}</p>
              <p className="text-sm text-gray-400 mb-6">
                People:{" "}
                {project.members
                  ?.map((m) =>
                    typeof m === "string" ? m : m.user?.name || m.user || "-"
                  )
                  .join(", ") || "-"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenBoard(project._id)}
                  className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm rounded-md font-semibold text-black"
                >
                  Open Board
                </button>
                <button className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 text-sm rounded-md font-medium text-white">
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


