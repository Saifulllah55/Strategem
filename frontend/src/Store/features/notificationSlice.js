import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default notificationSlice.reducer; 