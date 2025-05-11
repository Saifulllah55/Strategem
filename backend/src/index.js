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
import reminderRoutes from "../routes/reminder.route.js";
import customReminderRoutes from "../routes/customReminder.route.js";
import reportRoutes from "../routes/report.route.js";
import { checkDueReminders } from "../controllers/reminder.controller.js";
import { customReminderController } from "../controllers/customReminder.controller.js";

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
app.use("/api/reminders", reminderRoutes);
app.use("/api/custom-reminders", customReminderRoutes);
app.use("/api/reports", reportRoutes);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
      // Set up a scheduled task to check for due reminders every 15 minutes
    console.log('Setting up reminder check scheduler...');
    setInterval(() => {
      console.log('Running scheduled reminder check...');
      // Create a mock request and response object to pass to checkDueReminders
      const mockReq = { query: { api: 'true' } };
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`Reminder check completed: ${data.message}`);
          }
        }),
        headersSent: false
      };
      
      // Check regular reminders
      checkDueReminders(mockReq, mockRes).catch(err => {
        console.error('Error running scheduled reminder check:', err);
      });
      
      // Check custom reminders
      customReminderController.getRemindersToNotify(mockReq, mockRes).catch(err => {
        console.error('Error running scheduled custom reminder check:', err);
      });
    }, 15 * 60 * 1000); // 15 minutes
  });
});
