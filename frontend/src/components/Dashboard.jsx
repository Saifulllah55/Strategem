import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../Store/features/projectSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const { projects, fetchLoading, fetchError } = useSelector(
    (state) => state.projects
  );

  const [showModal, setShowModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectPeople, setNewProjectPeople] = useState("");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  const handleOpenBoard = (projectId) => {
    // navigate(`/dashboard/${user.username}/project/${encodeURIComponent(projectTitle)}`);(
    navigate(`/project/${projectId}`);
  };

  const handleAddProject = () => {
    if (
      newProjectTitle.trim() === "" ||
      newProjectDescription.trim() === "" ||
      newProjectPeople.trim() === ""
    ) {
      alert("Please fill in all fields!");
      return;
    }

    // This is just for temporary frontend state unless handled via Redux create thunk
    const newProject = {
      title: newProjectTitle,
      description: newProjectDescription,
      people: newProjectPeople.split(",").map((person) => person.trim()),
    };

    // Show success in UI but ideally you'd dispatch a thunk here
    alert("Project will be created (add Redux dispatch logic to persist it)");

    setNewProjectTitle("");
    setNewProjectDescription("");
    setNewProjectPeople("");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Projects ({projects.length})</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-black font-semibold px-6 py-2 rounded-lg"
          >
            + Create Project
          </button>
        </div>

        {fetchLoading && <p>Loading projects...</p>}
        {fetchError && <p className="text-red-500">Error: {fetchError}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project._id || index}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">
                  {project.name || project.title}
                </h3>
                <button className="text-red-400 hover:text-red-500 text-lg">
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mb-4">{project.description}</p>
              <p className="text-sm text-gray-400 mb-6">
                People:{" "}
                {project.members
                  ?.map((m) => m.user?.name || m.user)
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-zinc-900 p-8 rounded-2xl w-96">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Create New Project
            </h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Project Title"
                className="px-4 py-2 rounded-md bg-zinc-700 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Project Description"
                rows="3"
                className="px-4 py-2 rounded-md bg-zinc-700 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                value={newProjectPeople}
                onChange={(e) => setNewProjectPeople(e.target.value)}
                placeholder="Collaborators (comma-separated)"
                className="px-4 py-2 rounded-md bg-zinc-700 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleAddProject}
                  className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-md font-semibold text-black"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-md font-semibold text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

// import Navbar from "./NavBar";
// import { useSelector } from "react-redux";

// const projects = [
//   {
//     title: "Package",
//     description:
//       "Sets targets and objectives and actively works towards them, whilst raising the quality of the outcomes.",
//   },
//   {
//     title: "Deals app",
//     description:
//       "Goes out of their way to help the physical, mental, or emotional pains of another and themselves.",
//   },
//   {
//     title: "Brochure products",
//     description:
//       "Conscious and aware of their own character, feelings and behaviour.",
//   },
//   {
//     title: "Static printing",
//     description:
//       "Do what they say and say what they do. They bring their whole self to work.",
//   },
//   {
//     title: "Article",
//     description: "Short pieces focusing on latest updates or deep dives.",
//   },
//   {
//     title: "Social advertising",
//     description: "Engaging campaigns on TikTok, IG, and YouTube Shorts.",
//   },
//   {
//     title: "OLO",
//     description: "One-liner objectives for fast-moving teams.",
//   },
// ];

// const Dashboard = () => {
//   const user = useSelector((state) => state.user.user); // 🔥 correctly

//   if (!user) {
//     return <div>Loading user data...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-black text-white">
//       <Navbar />

//       <div className="px-8 py-10">
//         <div className="flex justify-between items-center mb-8">
//           <h2 className="text-3xl font-bold">Projects ({projects.length})</h2>
//           <div className="relative w-64">
//             <input
//               type="text"
//               placeholder="Search Board..."
//               className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//             />
//             <span className="absolute right-3 top-2.5 text-gray-400">
//               🔍
//             </span>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {projects.map((project, index) => (
//             <div
//               key={index}
//               className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-xl font-semibold">{project.title}</h3>
//                 <button className="text-red-400 hover:text-red-500 text-lg">
//                   ✕
//                 </button>
//               </div>
//               <p className="text-gray-400 mb-6">{project.description}</p>
//               <div className="flex gap-2">
//                 <button className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm rounded-md font-semibold text-black">
//                   Open Board
//                 </button>
//                 <button className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 text-sm rounded-md font-medium text-white">
//                   Edit
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
