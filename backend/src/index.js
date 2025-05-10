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

import { connectDB } from "../lib/database.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
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

app.listen(5000, () => {
  console.log("Server is running on port 5000");
  connectDB();
});