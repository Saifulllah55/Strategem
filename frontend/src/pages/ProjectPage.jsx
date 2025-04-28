import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";

const ProjectPage = () => {
  const { id, projectname } = useParams();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="flex px-8 py-10 gap-8">
        {/* Sidebar */}
        <div className="w-1/4 bg-zinc-900 p-6 rounded-2xl shadow-md">
          <h3 className="text-2xl font-bold mb-6">Project Menu</h3>
          <ul className="space-y-4 text-gray-400">
            <li className="hover:text-cyan-400 cursor-pointer">Overview</li>
            <li className="hover:text-cyan-400 cursor-pointer">Tasks</li>
            <li className="hover:text-cyan-400 cursor-pointer">Discussions</li>
            <li className="hover:text-cyan-400 cursor-pointer">Settings</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6">{decodeURIComponent(projectname)}</h2>
          <div className="bg-zinc-800 p-8 rounded-2xl shadow-md">
            <p className="text-gray-400">
              Welcome to <span className="text-cyan-400 font-semibold">{decodeURIComponent(projectname)}</span> board! 
              Here you can manage tasks, team discussions, and settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
