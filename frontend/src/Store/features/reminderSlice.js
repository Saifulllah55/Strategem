import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Async thunks for reminders
export const fetchReminders = createAsyncThunk(
  "reminders/fetchReminders",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/reminders");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchUpcomingReminders = createAsyncThunk(
  "reminders/fetchUpcomingReminders",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/reminders/upcoming");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const createReminder = createAsyncThunk(
  "reminders/createReminder",
  async (reminderData, thunkAPI) => {
    try {
      const response = await api.post("/reminders", reminderData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const updateReminder = createAsyncThunk(
  "reminders/updateReminder",
  async ({ id, reminderData }, thunkAPI) => {
    try {
      const response = await api.put(`/reminders/${id}`, reminderData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const deleteReminder = createAsyncThunk(
  "reminders/deleteReminder",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/reminders/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Initial state
const initialState = {
  reminders: [],
  upcomingReminders: [],
  loading: false,
  error: null,
};

// Create the slice
const reminderSlice = createSlice({
  name: "reminders",
  initialState,
  reducers: {
    clearReminderErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reminders
      .addCase(fetchReminders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.loading = false;
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch upcoming reminders
      .addCase(fetchUpcomingReminders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingReminders.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingReminders = action.payload;
      })
      .addCase(fetchUpcomingReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create reminder
      .addCase(createReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReminder.fulfilled, (state, action) => {
        state.loading = false;
        state.reminders.push(action.payload);
        // Update upcoming reminders if the new reminder is due within a week
        const dueDate = new Date(action.payload.dueDate);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        if (dueDate >= today && dueDate <= nextWeek && !action.payload.completed) {
          state.upcomingReminders.push(action.payload);
          // Sort by due date
          state.upcomingReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        }
      })
      .addCase(createReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update reminder
      .addCase(updateReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReminder.fulfilled, (state, action) => {
        state.loading = false;
        // Update in reminders array
        const index = state.reminders.findIndex(
          (reminder) => reminder._id === action.payload._id
        );
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
        
        // Update in upcomingReminders array
        const upcomingIndex = state.upcomingReminders.findIndex(
          (reminder) => reminder._id === action.payload._id
        );
        
        // If the reminder is now completed, remove from upcoming
        if (action.payload.completed) {
          if (upcomingIndex !== -1) {
            state.upcomingReminders.splice(upcomingIndex, 1);
          }
        } else {
          // Check if it should be in upcoming
          const dueDate = new Date(action.payload.dueDate);
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          
          if (dueDate >= today && dueDate <= nextWeek) {
            if (upcomingIndex !== -1) {
              state.upcomingReminders[upcomingIndex] = action.payload;
            } else {
              state.upcomingReminders.push(action.payload);
            }
            // Sort by due date
            state.upcomingReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          } else if (upcomingIndex !== -1) {
            // If it exists in upcoming but due date is now outside the range
            state.upcomingReminders.splice(upcomingIndex, 1);
          }
        }
      })
      .addCase(updateReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete reminder
      .addCase(deleteReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.loading = false;
        state.reminders = state.reminders.filter(
          (reminder) => reminder._id !== action.payload
        );
        state.upcomingReminders = state.upcomingReminders.filter(
          (reminder) => reminder._id !== action.payload
        );
      })
      .addCase(deleteReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReminderErrors } = reminderSlice.actions;
export default reminderSlice.reducer;
