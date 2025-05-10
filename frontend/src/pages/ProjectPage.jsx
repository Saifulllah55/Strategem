import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectById } from "../Store/features/projectSlice";
// import { fetchTools } from "../Store/features/toolSlice";
// import { fetchAnnouncements } from "../Store/features/announcementSlice";
import { fetchActivities } from "../Store/features/activitySlice";
import ModalComponent from "../components/ModalComponent";

const ProjectPage = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  // Project data
  const project = useSelector((state) => state.projects.byId[projectId]);
  const projectLoading = useSelector((state) => state.projects.fetchSingleLoading);
  const projectError = useSelector((state) => state.projects.fetchSingleError);

  // Tools data
  const tools = useSelector((state) => state.tools?.items || []);
  const toolsLoading = useSelector((state) => state.tools?.loading || false);
  const toolsError = useSelector((state) => state.tools?.error || null);

  // Announcements data
  const announcements = useSelector((state) => state.announcements?.items || []);
  const announcementsLoading = useSelector((state) => state.announcements?.loading || false);
  const announcementsError = useSelector((state) => state.announcements?.error || null);

  // Activities data
  const activities = useSelector((state) => state.activities?.items || []);
  const activitiesLoading = useSelector((state) => state.activities?.loading || false);
  const activitiesError = useSelector((state) => state.activities?.error || null);

  useEffect(() => {
    dispatch(fetchProjectById(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (project) {
      // dispatch(fetchTools(projectId));
      // dispatch(fetchAnnouncements(projectId));
      dispatch(fetchActivities(projectId));
    }
  }, [dispatch, projectId, project]);

  const formatToolName = (key) => {
    const nameMap = {
      messageBoard: "Message Board",
      tasks: "Tasks",
      docsFiles: "Docs & Files",
      chat: "Chat",
      schedule: "Schedule",
    };
    return nameMap[key] || key;
  };

  const getToolIcon = (key) => {
    const iconMap = {
      messageBoard: "📝",
      tasks: "✅",
      docsFiles: "📄",
      chat: "💬",
      schedule: "📅",
    };
    return iconMap[key] || "🔧";
  };

  if (projectLoading) return <p className="text-center text-white mt-10">Loading project...</p>;
  if (projectError) return <p className="text-center text-red-400 mt-10">Error: {projectError}</p>;
  if (!project && !projectLoading) return <p className="text-center text-white mt-10">Project not found.</p>;

  return (
    <div className="min-h-screen bg-[#121620] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center space-y-3 mb-10">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-400">{project.description}</p>
          <div className="flex justify-center gap-3 mt-4">
            <button className="flex items-center gap-1 border border-gray-400 px-4 py-2 rounded-md hover:bg-white hover:text-black transition text-sm">
              👥 Add People
            </button>
            <button className="flex items-center gap-1 border border-gray-400 px-4 py-2 rounded-md hover:bg-white hover:text-black transition text-sm">
              🔔 Notifications
            </button>
          </div>
        </header>

        {/* Tools */}
        <section className="bg-[#1c2331] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tools</h2>
          {toolsLoading ? (
            <p className="text-center text-gray-400">Loading tools...</p>
          ) : toolsError ? (
            <p className="text-center text-red-400">Error loading tools: {toolsError}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.entries(project.tools || {})
                .filter(([_, enabled]) => enabled)
                .map(([toolKey]) => (
                  <div
                    key={toolKey}
                    onClick={() => {
                      setModalTitle(formatToolName(toolKey));
                      setModalOpen(true);
                    }}
                    className="bg-[#2c323f] p-4 rounded-md border border-[#3a404e] text-center hover:bg-[#3a404e] transition cursor-pointer"
                  >
                    <div className="text-2xl mb-2">{getToolIcon(toolKey)}</div>
                    <span className="text-sm text-gray-300">{formatToolName(toolKey)}</span>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Announcements */}
        <section className="bg-[#1c2331] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Announcements</h2>
            <button className="flex items-center gap-1 text-gray-400 hover:text-white text-sm px-2 py-1 rounded-md">
              ➕ Add
            </button>
          </div>
          {announcementsLoading ? (
            <p className="text-center text-gray-400">Loading announcements...</p>
          ) : announcementsError ? (
            <p className="text-center text-red-400">Error loading announcements: {announcementsError}</p>
          ) : announcements.length === 0 ? (
            <div className="bg-[#2c323f] p-4 rounded-md">
              <p className="text-sm text-gray-300">No announcements yet.</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="bg-[#2c323f] p-4 rounded-md mb-4">
                <h3 className="text-lg font-medium mb-2">{announcement.title}</h3>
                <p className="text-sm text-gray-300">{announcement.content}</p>
              </div>
            ))
          )}
        </section>

        {/* Activities */}
        <section className="bg-[#1c2331] rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Project Activity</h2>
          {activitiesLoading ? (
            <p className="text-center text-gray-400">Loading activities...</p>
          ) : activitiesError ? (
            <p className="text-center text-red-400">Error loading activities: {activitiesError}</p>
          ) : activities.length === 0 ? (
            <p className="text-center text-gray-400">No activities yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-1/2 w-0.5 h-full bg-[#3a404e] transform -translate-x-1/2"></div>
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex ${activity.isCurrentUser ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`w-1/2 ${activity.isCurrentUser ? "pr-8" : "pl-8"}`}>
                      <div className="bg-[#2c323f] p-4 rounded-md relative">
                        <div
                          className={`absolute ${activity.isCurrentUser ? "right-0" : "left-0"} top-1/2 transform ${
                            activity.isCurrentUser ? "translate-x-1/2" : "-translate-x-1/2"
                          } -translate-y-1/2 w-3 h-3 rounded-full bg-[#3a404e] border-2 border-[#1c2331]`}
                        ></div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{activity.userName}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">{activity.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-300">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      {modalOpen && (
        <ModalComponent
          projectId={projectId}
          title={modalTitle}
          closeModal={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectPage;
