import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import allUsersReducer from "./features/allUsersSlice"
import projectReducer from "./features/projectSlice"

const store = configureStore({
  reducer: {
    user: userReducer,
    users: allUsersReducer,
    projects: projectReducer
  },
});

export default store;
