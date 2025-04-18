import express from "express";

import authRoutes from "../routes/auth.route.js";

import { connectDB } from "../lib/database.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"


const app = express();
app.use(express.json());
app.use(cookieParser());

dotenv.config();

app.use("/api/auth", authRoutes);


app.listen(5000, () => {
  console.log("Server is running on port 5000");
  connectDB();
});
