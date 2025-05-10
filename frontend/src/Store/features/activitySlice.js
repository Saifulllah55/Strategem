import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const fetchProjectActivities = createAsyncThunk(
  "activities/fetchByProjectId",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/activities/${projectId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch activities"
      );
    }
  }
);

const initialState = {
  byId: {},
  allIds: [],
  fetchLoading: false,
  fetchError: null,
};

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectActivities.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchProjectActivities.fulfilled, (state, action) => {
        state.fetchLoading = false;
        const activities = action.payload;
        activities.forEach((activity) => {
          state.byId[activity._id] = activity;
          if (!state.allIds.includes(activity._id)) {
            state.allIds.push(activity._id);
          }
        });
      })
      .addCase(fetchProjectActivities.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
      });
  },
});

export default activitySlice.reducer; 