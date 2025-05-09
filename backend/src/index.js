import express from "express";
import cors from "cors";

import authRoutes from "../routes/auth.route.js";
import projectRoutes from "../routes/project.route.js";
import usersRoutes from "../routes/users.route.js"
import taskRoutes from "../routes/task.route.js"

import { connectDB } from "../lib/database.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { protectRoute } from "../middleware/auth.middleware.js";

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


app.use((req, res, next) => {
  console.log(`Received ${req.method} request at ${req.url}`);
  console.log("Request Body:", req.body);
  next();
});

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/users/",usersRoutes);

app.use('/api/tasks', taskRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
  connectDB();
});