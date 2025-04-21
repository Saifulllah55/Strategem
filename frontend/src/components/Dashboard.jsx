import Navbar from "./NavBar";

const projects = [
  {
    title: "Package",
    description:
      "Sets targets and objectives and actively works towards them, whilst raising the quality of the outcomes.",
  },
  {
    title: "Deals app",
    description:
      "Goes out of their way to help the physical, mental, or emotional pains of another and themselves.",
  },
  {
    title: "Brochure products",
    description:
      "Conscious and aware of their own character, feelings and behaviour.",
  },
  {
    title: "Static printing",
    description:
      "Do what they say and say what they do. They bring their whole self to work.",
  },
  {
    title: "Article",
    description: "Short pieces focusing on latest updates or deep dives.",
  },
  {
    title: "Social advertising",
    description: "Engaging campaigns on TikTok, IG, and YouTube Shorts.",
  },
  {
    title: "OLO",
    description: "One-liner objectives for fast-moving teams.",
  },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Projects ({projects.length})</h2>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search Board..."
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <button className="text-red-400 hover:text-red-500 text-lg">
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mb-6">{project.description}</p>
              <div className="flex gap-2">
                <button className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm rounded-md font-semibold text-black">
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
}

export default Dashboard;
