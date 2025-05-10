import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import allUsersReducer from "./features/allUsersSlice";
import projectReducer from "./features/projectSlice";
import taskReducer from "./features/taskSlice";
import activityReducer from "./features/activitySlice";
import announcementReducer from "./features/announcementSlice";

const store = configureStore({
  reducer: {
    auth: userReducer,
    users: allUsersReducer,
    projects: projectReducer,
    tasks: taskReducer,
    activities: activityReducer,
    announcements: announcementReducer,
  },
});

export default store;

