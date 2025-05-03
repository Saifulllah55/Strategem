import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, addTask, deleteTask } from "../Store/features/task";

const TaskBoard = ({ projectId, userRole }) => {
  const dispatch = useDispatch();

  // Access the entire task slice safely
  const taskState = useSelector((state) => state.tasks);
  const tasks = taskState?.tasks || [];
  const loading = taskState?.loading;
  const error = taskState?.error;

  const [newTask, setNewTask] = useState("");

  // Fetch tasks when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  const handleAddTask = () => {
    if (!newTask.trim()) return;

    const taskObj = {
      title: newTask,
      status: "Pending",
      projectId,
      assignedBy: "Leader",
      assignedTo: "Collaborator",
    };

    dispatch(addTask(taskObj));
    setNewTask("");
  };

  const handleDeleteTask = (id) => {
    dispatch(deleteTask(id));
  };

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">TaskBoard</h2>

      {/* Show errors if any */}
      {error && <p className="text-red-500 mb-3">Error: {error}</p>}

      {/* Add Task (Only for Leader) */}
      {userRole === "leader" && (
        <div className="mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="p-2 rounded text-black w-2/3"
            placeholder="Enter task title"
          />
          <button
            onClick={handleAddTask}
            className="ml-2 bg-cyan-600 px-4 py-2 rounded"
          >
            Add Task
          </button>
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <p className="text-gray-300">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400">No tasks yet.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="bg-zinc-700 p-3 rounded flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold">{task.title}</h4>
                <p className="text-sm text-gray-400">
                  Assigned by: {task.assignedBy} | Status: {task.status}
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={task.status}
                  onChange={(e) => console.log("TODO: handleStatusChange")}
                  className="text-black rounded px-2 py-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* Delete Only for Leader */}
                {userRole === "leader" && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-600 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskBoard;
