import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  tasks: [
    {
      taskName: { type: String, required: true },
      description: { type: String, required: true },
      dateAssigned: { type: Date, default: Date.now },
      dateDeadline: { type: Date, required: true },
      status: {
        type: String,
        enum: ['assigned', 'completed', 'in progress', 'approved', 'rejected', 'submitted'],
        default: 'assigned'
      }
    }
  ]
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

export default Task;
