import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectById } from "../Store/features/projectSlice";
import { fetchProjectActivities } from "../Store/features/activitySlice";
import { createSelector } from "@reduxjs/toolkit";
import ModalComponent from "../components/ModalComponent";
import AddMembersModal from "../components/AddMembersModal";
import NotificationDropdown from "../components/NotificationDropdown";

const ProjectPage = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const selectProject = useMemo(
    () =>
      createSelector(
        [(state) => state.projects.byId],
        (byId) => byId[projectId]
      ),
    [projectId]
  );

  const selectProjectLoading = useMemo(
    () =>
      createSelector(
        [(state) => state.projects],
        (projects) => projects.fetchSingleLoading
      ),
    []
  );

  const selectProjectError = useMemo(
    () =>
      createSelector(
        [(state) => state.projects],
        (projects) => projects.fetchSingleError
      ),
    []
  );

  const selectActivities = useMemo(
    () =>
      createSelector(
        [(state) => state.activities.byId],
        (byId) => Object.values(byId)
      ),
    []
  );

  const selectActivitiesLoading = useMemo(
    () =>
      createSelector(
        [(state) => state.activities],
        (activities) => activities.fetchLoading
      ),
    []
  );

  const selectActivitiesError = useMemo(
    () =>
      createSelector(
        [(state) => state.activities],
        (activities) => activities.fetchError
      ),
    []
  );

  const project = useSelector(selectProject);
  const projectLoading = useSelector(selectProjectLoading);
  const projectError = useSelector(selectProjectError);
  const activities = useSelector(selectActivities);
  const activitiesLoading = useSelector(selectActivitiesLoading);
  const activitiesError = useSelector(selectActivitiesError);

  useEffect(() => {
    dispatch(fetchProjectById(projectId));
    dispatch(fetchProjectActivities(projectId));
  }, [dispatch, projectId]);

  const toolMeta = {
    messageBoard: {
      title: "Message Board",
      icon: "📝",
      iconBg: "bg-blue-500",
      desc: "Post announcements, pitch ideas, and keep discussions on-topic.",
      action: "Write a message",
    },
    todos: {
      title: "To-dos",
      icon: "✅",
      iconBg: "bg-green-500",
      desc: "Organize work across teams. Assign tasks, set due dates, and discuss.",
      action: "Make a to-do list",
    },
    docsFiles: {
      title: "Docs & Files",
      icon: "📁",
      iconBg: "bg-yellow-700",
      desc: "Share and organize docs, spreadsheets, images, and other files.",
      action: "Add docs & files",
    },
    chat: {
      title: "Chat",
      icon: "💬",
      iconBg: "bg-cyan-600",
      desc: "Chat with your team in real time and keep everyone in sync.",
      action: "Open chat",
    },
    schedule: {
      title: "Schedule",
      icon: "📅",
      iconBg: "bg-pink-500",
      desc: "Set important dates on a shared schedule and subscribe to events.",
      action: "Schedule an event",
    },
    cardTable: {
      title: "Card Table",
      icon: "🃏",
      iconBg: "bg-purple-600",
      desc: "Organize and manage cards for tasks, ideas, or workflows.",
      action: "Open card table",
    },
  };

  if (projectLoading)
    return <p className="text-center text-white mt-10">Loading project...</p>;
  if (projectError)
    return (
      <p className="text-center text-red-400 mt-10">Error: {projectError}</p>
    );
  if (!project && !projectLoading)
    return (
      <p className="text-center text-white mt-10">Project not found.</p>
    );

  return (
    <div className="min-h-screen bg-[#121620] text-white px-4 py-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center space-y-3 mb-10 relative">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-400">{project.description}</p>
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => setAddMembersModalOpen(true)}
              className="flex items-center gap-1 border border-gray-400 px-4 py-2 rounded-md hover:bg-white hover:text-black transition text-sm"
            >
              👥 Add People
            </button>
            <NotificationDropdown />
          </div>
        </header>

        {/* Tools */}
        <section className="mb-8">
          <div className="flex flex-wrap justify-center bg-[#1c2331] rounded-xl shadow-lg w-full max-w-5xl mx-auto">
            {Object.entries(project.tools || {})
              .filter(([_, enabled]) => enabled)
              .map(([toolKey]) => {
                const tool = toolMeta[toolKey] || {
                  title: toolKey,
                  icon: "🔧",
                  iconBg: "bg-gray-500",
                  desc: "",
                  action: "Open",
                };
                return (
                  <div
                    key={toolKey}
                    onClick={() => {
                      setModalTitle(tool.title);
                      setModalOpen(true);
                    }}
                    className="w-full sm:w-1/2 md:w-1/3 p-4 cursor-pointer hover:bg-[#232b36] transition"
                  >
                    <div className="flex flex-col items-center justify-center p-6 h-full shadow-inner">
                      <div className="text-4xl mb-3">{tool.icon}</div>
                      <h3 className="text-lg font-bold mb-1 text-center">
                        {tool.title}
                      </h3>
                      <p className="text-gray-300 text-center mb-4 text-xs">
                        {tool.desc}
                      </p>
                      <button className="px-3 py-1 rounded-full text-xs text-gray-200 hover:bg-white hover:text-black transition">
                        {tool.action}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Activities Timeline */}
        <section className="bg-[#1c2331] rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Project Activity</h2>
          {activitiesLoading ? (
            <p className="text-center text-gray-400">Loading activities...</p>
          ) : activitiesError ? (
            <p className="text-center text-red-400">
              Error loading activities: {activitiesError}
            </p>
          ) : activities.length === 0 ? (
            <p className="text-center text-gray-400">No activities yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-1/2 w-0.5 h-full bg-[#3a404e] transform -translate-x-1/2"></div>
              <div className="space-y-6">
                {activities.map((activity) => {
                  const isOwnActivity =
                    activity.user?._id === user?._id;

                  return (
                    <div
                      key={activity._id}
                      className={`flex ${
                        isOwnActivity ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="w-1/2 px-4">
                        <div className="bg-[#2c323f] p-4 rounded-md relative">
                          <div
                            className={`absolute ${
                              isOwnActivity ? "right-0" : "left-0"
                            } top-1/2 transform ${
                              isOwnActivity
                                ? "translate-x-1/2"
                                : "-translate-x-1/2"
                            } -translate-y-1/2 w-3 h-3 rounded-full bg-[#3a404e] border-2 border-[#1c2331]`}
                          ></div>
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {activity.user?.username || "Unknown"}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">
                                {new Date(
                                  activity.createdAt
                                ).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300">
                              {activity.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {/* Add Members Modal */}
      {addMembersModalOpen && (
        <AddMembersModal
          projectId={projectId}
          closeModal={() => setAddMembersModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectPage;
