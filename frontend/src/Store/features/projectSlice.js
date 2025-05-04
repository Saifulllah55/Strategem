import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib//axios"; // Assuming api instance is set up

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/projects/getall");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch projects"
      );
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post("/projects/create", projectData); // Direct API call to create project
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create project"
      );
    }
  }
);

const initialState = {
  projects: [],
  fetchLoading: false,
  fetchError: null,

  createLoading: false,
  createError: null,
  createSuccess: false,
  createdProject: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
      state.createdProject = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder.addCase(fetchProjects.pending, (state) => {
      state.fetchLoading = true;
      state.fetchError = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.fetchLoading = false;
      state.projects = action.payload; // Set fetched projects
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.fetchLoading = false;
      state.fetchError = action.payload;
    });

    // Create Project
    builder.addCase(createProject.pending, (state) => {
      state.createLoading = true;
      state.createError = null;
      state.createSuccess = false;
    });
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.createLoading = false;
      state.createSuccess = true;
      state.createdProject = action.payload;
      state.projects.push(action.payload); // Add the new project to list
    });
    builder.addCase(createProject.rejected, (state, action) => {
      state.createLoading = false;
      state.createError = action.payload;
    });
  },
});

export const { resetCreateStatus } = projectSlice.actions;
export default projectSlice.reducer;
