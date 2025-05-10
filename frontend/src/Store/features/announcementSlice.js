import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const fetchProjectAnnouncements = createAsyncThunk(
  "announcements/fetchByProjectId",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/announcements/project/${projectId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch announcements"
      );
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  "announcements/create",
  async ({ projectId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/announcements/project/${projectId}`, { text });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create announcement"
      );
    }
  }
);

const initialState = {
  byId: {},
  allIds: [],
  fetchLoading: false,
  fetchError: null,
  createLoading: false,
  createError: null,
};

const announcementSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch announcements
      .addCase(fetchProjectAnnouncements.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchProjectAnnouncements.fulfilled, (state, action) => {
        state.fetchLoading = false;
        const announcements = action.payload;
        announcements.forEach((announcement) => {
          state.byId[announcement._id] = announcement;
          if (!state.allIds.includes(announcement._id)) {
            state.allIds.push(announcement._id);
          }
        });
      })
      .addCase(fetchProjectAnnouncements.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
      })
      // Create announcement
      .addCase(createAnnouncement.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.createLoading = false;
        const announcement = action.payload;
        state.byId[announcement._id] = announcement;
        if (!state.allIds.includes(announcement._id)) {
          state.allIds.push(announcement._id);
        }
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
  },
});

export default announcementSlice.reducer; 