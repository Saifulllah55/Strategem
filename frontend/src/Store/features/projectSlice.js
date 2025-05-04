import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, thunkAPI) => {
    try {
      const response = await api.post("/projects/create", projectData);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create project"
      );
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    createLoading: false,
    createError: null,
    createSuccess: false,
    createdProject: null,
  },
  reducers: {
    resetCreateStatus: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
      state.createdProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.createdProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
  },
});

export const { resetCreateStatus } = projectSlice.actions;

export default projectSlice.reducer;
