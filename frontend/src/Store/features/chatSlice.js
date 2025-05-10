import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Get project messages
export const getProjectMessages = createAsyncThunk(
  "chat/getProjectMessages",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/project/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Send message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ projectId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat/project/${projectId}`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get messages
      .addCase(getProjectMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(getProjectMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch messages";
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to send message";
      });
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer; 