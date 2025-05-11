import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Thunk to fetch all projects
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

// Thunk to fetch a single project by ID
export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (projectId, { rejectWithValue, getState }) => {
    
    const state = getState();
    if (state.projects.byId[projectId]) {
      return state.projects.byId[projectId]; 
    }
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch project"
      );
    }
  }
);

// Thunk to create a new project
export const createProject = createAsyncThunk(
  "projects/create",
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post("/projects/create", projectData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create project"
      );
    }
  }
);

export const addMembers = createAsyncThunk(
  "projects/addMembers",
  async ({ projectId, memberIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/members`, { memberIds });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add members"
      );
    }
  }
);

// Initial state
const initialState = {
  byId: {},
  allIds: [],

  fetchAllLoading: false,
  fetchAllError: null,

  fetchSingleLoading: false,
  fetchSingleError: null,

  createLoading: false,
  createError: null,
  createSuccess: false,
  createdProject: null,

  addMembersLoading: false,
  addMembersError: null,
};

// Slice
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
    // Fetch all projects
    builder.addCase(fetchProjects.pending, (state) => {
      state.fetchAllLoading = true;
      state.fetchAllError = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.fetchAllLoading = false;
      const projects = action.payload;
      state.byId = {};
      state.allIds = [];

      projects.forEach((project) => {
        state.byId[project._id] = project;
        state.allIds.push(project._id);
      });
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.fetchAllLoading = false;
      state.fetchAllError = action.payload;
    });

    // Fetch single project by ID
    builder.addCase(fetchProjectById.pending, (state) => {
      state.fetchSingleLoading = true;
      state.fetchSingleError = null;
    });
    builder.addCase(fetchProjectById.fulfilled, (state, action) => {
      state.fetchSingleLoading = false;
      const project = action.payload;
      state.byId[project._id] = project;
      if (!state.allIds.includes(project._id)) {
        state.allIds.push(project._id);
      }
    });
    builder.addCase(fetchProjectById.rejected, (state, action) => {
      state.fetchSingleLoading = false;
      state.fetchSingleError = action.payload;
    });

    // Create project
    builder.addCase(createProject.pending, (state) => {
      state.createLoading = true;
      state.createError = null;
      state.createSuccess = false;
    });
    builder.addCase(createProject.fulfilled, (state, action) => {
      const project = action.payload;
      state.createLoading = false;
      state.createSuccess = true;
      state.createdProject = project;
      state.byId[project._id] = project;
      if (!state.allIds.includes(project._id)) {
        state.allIds.push(project._id);
      }
    });
    builder.addCase(createProject.rejected, (state, action) => {
      state.createLoading = false;
      state.createError = action.payload;
    });

    // Add members
    builder.addCase(addMembers.pending, (state) => {
      state.addMembersLoading = true;
      state.addMembersError = null;
    });
    builder.addCase(addMembers.fulfilled, (state, action) => {
      state.addMembersLoading = false;
      state.byId[action.payload._id] = action.payload;
    });
    builder.addCase(addMembers.rejected, (state, action) => {
      state.addMembersLoading = false;
      state.addMembersError = action.payload;
    });
  },
});

export const { resetCreateStatus } = projectSlice.actions;
export default projectSlice.reducer;
