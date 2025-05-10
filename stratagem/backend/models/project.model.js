import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["lead", "member", "viewer"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tools: {
      messageBoard: {
        type: Boolean,
        default: false,
      },
      todos: {
        type: Boolean,
        default: false,
      },
      docsFiles: {
        type: Boolean,
        default: false,
      },
      chat: {
        type: Boolean,
        default: false,
      },
      schedule: {
        type: Boolean,
        default: false,
      },
      cardTable: {
        type: Boolean,
        default: false,
      },
    },
    announcements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    dueDate: {
      type: Date
    },
    status: { type: String, default: 'planning' },
    startDate: Date,
    endDate: Date,
    priority: { type: String, default: 'medium' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Virtual for tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project'
});

projectSchema.set('toObject', { virtuals: true });
projectSchema.set('toJSON', { virtuals: true });

// Add a method to calculate project progress
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });

  if (tasks.length === 0) {
    this.progress = 0;
    return;
  }

  // Option 2: weighted average
  function getTaskProgress(status) {
    if (status === 'submitted') return 25;
    if (status === 'revision') return 50;
    if (status === 'approved') return 75;
    if (status === 'completed') return 100;
    // created, assigned
    return 0;
  }

  const total = tasks.reduce((sum, task) => sum + getTaskProgress(task.status), 0);
  this.progress = Math.round(total / tasks.length);
  await this.save();
};

const Project = mongoose.model("Project", projectSchema);

export default Project;
