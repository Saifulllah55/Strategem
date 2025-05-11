import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { connectDB } from "../lib/database.js";

import userRoutes from "../routes/users.route.js";
import projectRoutes from "../routes/project.route.js";
import taskRoutes from "../routes/task.route.js";
import activityRoutes from "../routes/activity.route.js";
import announcementRoutes from "../routes/announcement.route.js";
import chatRoutes from "../routes/chat.route.js";
import authRoutes from "../routes/auth.route.js";
import notificationRoutes from "../routes/notification.route.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Make io accessible to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
