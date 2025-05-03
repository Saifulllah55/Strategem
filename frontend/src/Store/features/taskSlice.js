import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../lib/axios";

// === Thunks ===

// Fetch tasks for a project
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (projectId, thunkAPI) => {
    try {
      const res = await api.get(`/tasks/${projectId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Failed to fetch tasks");
    }
  }
);

// Add a task to a project
export const addTask = createAsyncThunk(
  "tasks/addTask",
  async ({ projectId, task }, thunkAPI) => {
    try {
      const res = await api.post(`/tasks/${projectId}`, task);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Failed to add task");
    }
  }
);

// Delete a task by ID
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, thunkAPI) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Failed to delete task");
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateStatus",
  async ({ taskId, status }, thunkAPI) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      return { taskId, status };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Failed to update task status");
    }
  }
);

// === Slice ===
const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })

      // Delete
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      })

      // Update
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const task = state.tasks.find((t) => t._id === action.payload.taskId);
        if (task) {
          task.status = action.payload.status;
        }
      });
  },
});

export default taskSlice.reducer;
