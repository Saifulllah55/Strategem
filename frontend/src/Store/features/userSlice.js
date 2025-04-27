import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/axios";

console.log("userslice js(FE)");
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (userCredentials, thunkAPI) => {
    try {
      console.log("User credentials: (try1)", userCredentials);
      const response = await api.post("/auth/login", userCredentials);
      localStorage.setItem("user", JSON.stringify(response.data));

      console.log("try2");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Signup user
export const signupUser = createAsyncThunk(
  "user/signupUser",
  async (userCredentials, thunkAPI) => {
    try {
      console.log("User credentials: (try signup)", userCredentials);
      const response = await api.post("/signup", userCredentials);
      localStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);



const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    user: null,
    error: null,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(state.user)); 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});


export const { logoutUser, setUser } = userSlice.actions;
export default userSlice.reducer;
