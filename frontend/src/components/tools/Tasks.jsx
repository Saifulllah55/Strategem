import React, { useEffect, useState, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasksByProjectId,
  createTask,
  updateTask,
} from "../../Store/features/taskSlice";

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

function TaskCard({ task }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { ...task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="bg-[#2c323f] p-3 rounded-md text-white shadow-sm"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}
    >
      <h3 className="font-medium">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-400">{task.description}</p>
      )}
    </div>
  );
}

function TaskColumn({ category, tasks, onDrop }) {
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
          <TaskCard key={task._id} task={task} />
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
  });

  const tasksById = useSelector((state) => state.tasks.byId);
  const allIds = useSelector((state) => state.tasks.allIds);
  const tasks = allIds.map((id) => tasksById[id]);

  useEffect(() => {
    if (projectId) dispatch(fetchTasksByProjectId(projectId));
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

    setFormData({ title: "", description: "", dueDate: "" });
    setModalOpen(false);
  };

  const handleDrop = (item, newStatus) => {
    if (item.status !== newStatus) {
      const updatedTaskData = {
        ...item,
        status: newStatus,
      };
      dispatch(updateTask({ taskId: item._id, updatedTaskData }));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 overflow-x-auto relative bg-[#121620] min-h-screen">
        <div className="flex gap-4 min-w-[1200px]">
          {statusCategories.map((category) => (
            <TaskColumn
              key={category.key}
              category={category}
              tasks={categorizedTasks[category.key]}
              onDrop={handleDrop}
            />
          ))}
        </div>

        <button
          tabIndex={0}
          aria-label="Create new task"
          onClick={() => setModalOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-lg"
        >
          ➕ Create Task
        </button>

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
