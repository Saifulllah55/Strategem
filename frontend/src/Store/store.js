import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/userSlice";
import allUsersReducer from "./features/allUsersSlice";
import projectReducer from "./features/projectSlice";
import taskReducer from "./features/taskSlice";
import activityReducer from "./features/activitySlice";
import announcementReducer from "./features/announcementSlice";
import chatReducer from "./features/chatSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: allUsersReducer,
    projects: projectReducer,
    tasks: taskReducer,
    activities: activityReducer,
    announcements: announcementReducer,
    chat: chatReducer,
  },

});

export default store;

