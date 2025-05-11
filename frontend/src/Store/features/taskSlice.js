import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Async thunk to fetch all tasks for a specific project
export const fetchTasksByProjectId = createAsyncThunk(
  "tasks/fetchByProjectId",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${projectId}`);
      console.log("Fetched Response:", response); // Debugging line
      return {
        projectId,
        tasks: response.data,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

// Async thunk to create a new task
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async ({ projectId, taskData }, { rejectWithValue }) => {
    console.log("Creating task with data:", taskData);
    console.log("Project ID:", projectId);
    try {
      const response = await api.post(`/tasks/${projectId}/createtask`, taskData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create task"
      );
    }
  }
);

// Async thunk to update a task (using PUT to update title, assignedTo, and status)
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ taskId, updatedTaskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}/updatetask`, updatedTaskData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update task"
      );
    }
  }
);

// Initial state
const initialState = {
  byId: {},
  allIds: [],
  fetchLoading: false,
  fetchError: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
};

// Slice
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch tasks by project ID
    builder.addCase(fetchTasksByProjectId.pending, (state) => {
      state.fetchLoading = true;
      state.fetchError = null;
    });
    builder.addCase(fetchTasksByProjectId.fulfilled, (state, action) => {
      state.fetchLoading = false;
      const { tasks } = action.payload;

      console.log("Fetched tasks:", tasks); // Debugging line
      tasks.forEach((task) => {
        state.byId[task._id] = task;
        if (!state.allIds.includes(task._id)) {
          state.allIds.push(task._id);
        }
      });
    });
    builder.addCase(fetchTasksByProjectId.rejected, (state, action) => {
      state.fetchLoading = false;
      state.fetchError = action.payload;
    });

    // Create a task
    builder.addCase(createTask.pending, (state) => {
      state.createLoading = true;
      state.createError = null;
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      const task = action.payload;
      state.createLoading = false;
      state.byId[task._id] = task;
      if (!state.allIds.includes(task._id)) {
        state.allIds.push(task._id);
      }
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.createLoading = false;
      state.createError = action.payload;
    });

    // Update task (using PUT)
    builder.addCase(updateTask.pending, (state) => {
      state.updateLoading = true;
      state.updateError = null;
    });
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const updatedTask = action.payload;
      state.updateLoading = false;

      // Update the task in the state with the new data
      state.byId[updatedTask._id] = updatedTask;
    });
    builder.addCase(updateTask.rejected, (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    });
  },
});

export default taskSlice.reducer;
