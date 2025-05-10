import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["task_created", "task_submitted", "task_approved", "announcement_created"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Activity = mongoose.model("Activity", activitySchema);

export default Activity; 