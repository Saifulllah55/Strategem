import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["created", "assigned", "submitted", "revision", "approved"],
    default: "created",
  },
  dueDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  link: { 
    url: { type: String },
    type: { 
      type: String, 
      enum: ["figma", "github", "drive", "other"],
      default: "other"
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
