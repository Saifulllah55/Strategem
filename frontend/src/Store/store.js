import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/userSlice";
import allUsersReducer from "./features/allUsersSlice";
import projectReducer from "./features/projectSlice";
import taskReducer from "./features/taskSlice";
import activityReducer from "./features/activitySlice";
import announcementReducer from "./features/announcementSlice";
import chatReducer from "./features/chatSlice";
import notificationsReducer from "./features/notificationSlice";
import remindersReducer from "./features/reminderSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: allUsersReducer,
    projects: projectReducer,
    tasks: taskReducer,
    activities: activityReducer,
    announcements: announcementReducer,
    chat: chatReducer,
    notifications: notificationsReducer,
    reminders: remindersReducer,
  },

});

export default store;

