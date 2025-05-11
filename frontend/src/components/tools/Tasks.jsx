import React, { useEffect, useState, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasksByProjectId,
  createTask,
  updateTask,
} from "../../Store/features/taskSlice";
import { fetchUsers } from "../../Store/features/allUsersSlice";

const statusCategories = [
  { key: "created", label: "Created", color: "gray" },
  { key: "assigned", label: "Assigned", color: "blue" },
  { key: "submitted", label: "Submitted", color: "yellow" },
  { key: "revision", label: "Revision", color: "purple" },
  { key: "approved", label: "Approved", color: "green" },
];

const colorClasses = {
  gray: "text-gray-400",
  blue: "text-blue-400",
  yellow: "text-yellow-400",
  purple: "text-purple-400",
  green: "text-green-400",
};

const ItemTypes = { TASK: "task" };

function TaskCard({ task, projectOwner, projectMembers, onAssigneeChange }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { ...task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getLinkIcon = (type) => {
    switch (type) {
      case 'figma':
        return '🎨';
      case 'github':
        return '📦';
      case 'drive':
        return '📁';
      default:
        return '🔗';
    }
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      'You are about to visit an external link. Do you want to continue?'
    );
    if (!confirmed) {
      e.preventDefault();
    }
  };

  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (!url.match(/^https?:\/\//i)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleAssigneeChange = (e) => {
    e.stopPropagation();
    const newAssigneeId = e.target.value;
    onAssigneeChange(task._id, newAssigneeId);
  };

  const currentAssignee = projectMembers.find(member => member._id === task.assignedTo?._id);

  return (
    <div
      ref={drag}
      className="bg-[#2c323f] p-3 rounded-md text-white shadow-sm hover:shadow-md transition-shadow"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}
    >
      <h3 className="font-medium mb-2 line-clamp-1">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {projectOwner ? (
              <select
                value={task.assignedTo?._id || ''}
                onChange={handleAssigneeChange}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1c2331] text-white text-xs rounded px-1 py-0.5 border border-gray-600 max-w-[150px] truncate"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.username}
                  </option>
                ))}
              </select>
            ) : (
              currentAssignee && (
                <div className="flex items-center gap-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    {currentAssignee.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-gray-300 truncate">{currentAssignee.username}</span>
                </div>
              )
            )}
          </div>
          {task.link?.url && (
            <a 
              href={getAbsoluteUrl(task.link.url)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 flex-shrink-0"
              onClick={handleLinkClick}
              title="External link - Opens in new tab"
            >
              <span>{getLinkIcon(task.link.type)}</span>
              <span className="hidden sm:inline">View</span>
            </a>
          )}
        </div>
        <div className="flex justify-end">
          <span className={`px-2 py-1 rounded-full text-xs ${
            task.status === 'approved' ? 'bg-green-900 text-green-300' :
            task.status === 'submitted' ? 'bg-yellow-900 text-yellow-300' :
            task.status === 'revision' ? 'bg-purple-900 text-purple-300' :
            task.status === 'assigned' ? 'bg-blue-900 text-blue-300' :
            'bg-gray-900 text-gray-300'
          }`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TaskColumn({ category, tasks, onDrop, projectOwner, projectMembers, onAssigneeChange }) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item) => onDrop(item, category.key),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-1 bg-[#1c2331] rounded-lg shadow p-4 w-64 min-w-[260px] transition-colors duration-200 ${
        isOver ? "bg-[#2c323f]" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2
          className={`text-sm font-semibold uppercase ${
            colorClasses[category.color]
          }`}
        >
          {category.label}
        </h2>
        <span className="text-xs text-gray-400 bg-[#121620] px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard 
            key={task._id} 
            task={task} 
            projectOwner={projectOwner}
            projectMembers={projectMembers}
            onAssigneeChange={onAssigneeChange}
          />
        ))}
      </div>
    </div>
  );
}

const Task = ({ projectId }) => {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    link: {
      url: "",
      type: "other"
    }
  });

  const tasksById = useSelector((state) => state.tasks.byId);
  const allIds = useSelector((state) => state.tasks.allIds);
  const tasks = allIds.map((id) => tasksById[id]);
  const currentUser = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.projects.byId[projectId]);
  const isProjectOwner = project?.owner?._id === currentUser?._id;
  
  // Get all users from the store
  const allUsers = useSelector((state) => state.users.users);
  const allUsersLoading = useSelector((state) => state.users.loading);

  // Filter project members from all users
  const projectMembers = useMemo(() => {
    if (!project || !allUsers) return [];
    
    const memberIds = new Set([
      project.owner._id,
      ...project.members.map(member => member.user._id)
    ]);
    
    return allUsers.filter(user => memberIds.has(user._id));
  }, [project, allUsers]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasksByProjectId(projectId));
      dispatch(fetchUsers());
    }
  }, [dispatch, projectId]);

  const categorizedTasks = useMemo(() => {
    const map = {};
    statusCategories.forEach(({ key }) => {
      map[key] = tasks.filter((task) => task.status === key);
    });
    return map;
  }, [tasks]);

  const handleCreateTask = () => {
    if (!formData.title.trim()) return;

    dispatch(
      createTask({
        projectId,
        taskData: {
          ...formData,
          status: "created",
          project: projectId,
        },
      })
    );

    setFormData({ title: "", description: "", dueDate: "", link: { url: "", type: "other" } });
    setModalOpen(false);
  };

  const handleDrop = (item, newStatus) => {
    // Prevent assigned tasks from being moved to created status
    if (newStatus === 'created' && item.assignedTo) {
      return;
    }
    
    if (item.status !== newStatus) {
      const updatedTaskData = {
        ...item,
        status: newStatus,
      };
      dispatch(updateTask({ taskId: item._id, updatedTaskData }));
    }
  };

  const handleAssigneeChange = (taskId, newAssigneeId) => {
    const task = tasksById[taskId];
    if (!task) return;

    // Find the new assignee from project members
    const newAssignee = projectMembers.find(member => member._id === newAssigneeId);

    const updatedTaskData = {
      ...task,
      assignedTo: newAssigneeId,
      assignee: newAssignee, // Add the full assignee object
      // If task was in created status and is being assigned, move it to assigned status
      status: task.status === 'created' ? 'assigned' : task.status
    };

    dispatch(updateTask({ taskId, updatedTaskData }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 overflow-x-auto relative bg-[#121620] min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-white">Task Board</h1>
          <button
            tabIndex={0}
            aria-label="Create new task"
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Task
          </button>
        </div>

        <div className="flex gap-4 min-w-[1200px]">
          {statusCategories.map((category) => (
            <TaskColumn
              key={category.key}
              category={category}
              tasks={categorizedTasks[category.key]}
              onDrop={handleDrop}
              projectOwner={isProjectOwner}
              projectMembers={projectMembers}
              onAssigneeChange={handleAssigneeChange}
            />
          ))}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1c2331] p-6 rounded-lg w-full max-w-md text-white">
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-[#2c323f] p-2 mb-3 rounded-md text-sm"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-[#2c323f] p-2 mb-3 rounded-md text-sm"
              />

              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full bg-[#2c323f] p-2 mb-3 rounded-md text-sm"
              />

              <div className="mb-3">
                <label className="block text-sm text-gray-400 mb-1">Link Type</label>
                <select
                  value={formData.link.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      link: { ...formData.link, type: e.target.value }
                    })
                  }
                  className="w-full bg-[#2c323f] p-2 rounded-md text-sm"
                >
                  <option value="figma">Figma</option>
                  <option value="github">GitHub</option>
                  <option value="drive">Google Drive</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <input
                type="url"
                placeholder="Link URL"
                value={formData.link.url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    link: { ...formData.link, url: e.target.value }
                  })
                }
                className="w-full bg-[#2c323f] p-2 mb-4 rounded-md text-sm"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-1 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-md"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Task;
