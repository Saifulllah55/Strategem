import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "../routes/auth.route.js";
import projectRoutes from "../routes/project.route.js";
import usersRoutes from "../routes/users.route.js";
import taskRoutes from "../routes/task.route.js";
import activityRoutes from "../routes/activity.route.js";
import announcementRoutes from "../routes/announcement.route.js";
import reminderRoutes from "../routes/reminder.route.js";
import customReminderRoutes from "../routes/customReminder.route.js";

import { connectDB } from "../lib/database.js";

const app = express();

// Configure CORS
// Note: You can't use credentials with wildcard origins for security reasons
// So we include specific origins when credentials are needed
app.use(
  cors({
    // Allow requests from any localhost port
    origin: function(origin, callback) {
      // Allow any origin that is localhost or undefined (like direct API calls)
      if (!origin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());
app.use(cookieParser());

dotenv.config();

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/custom-reminders", customReminderRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
  connectDB();
});