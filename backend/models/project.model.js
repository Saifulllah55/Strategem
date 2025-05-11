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
    status: {
      type: String,
      enum: ["planning", "in-progress", "on-hold", "completed"],
      default: "planning"
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date
    },
    dueDate: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + 14); // Default due date 2 weeks from creation
        return date;
      }
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    priority: { 
      type: String, 
      enum: ["low", "medium", "high"],
      default: "medium" 
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
    },    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    announcements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],
  },  { timestamps: true }
);

// Add virtual for tasks (for compatibility with both methods of accessing tasks)
projectSchema.virtual('taskVirtual', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project'
});

// Set virtual options to ensure virtuals are included in JSON and object output
projectSchema.set('toObject', { virtuals: true });
projectSchema.set('toJSON', { virtuals: true });

// Add a method to calculate project progress
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  
  // First, check if we have tasks in the project.tasks array
  let tasks = [];
  if (this.tasks && this.tasks.length > 0) {
    // If the tasks are already populated
    if (typeof this.tasks[0] === 'object' && this.tasks[0] !== null) {
      tasks = this.tasks;
    } else {
      // If the tasks are just IDs, fetch the actual tasks
      tasks = await Task.find({ _id: { $in: this.tasks } });
    }
  } else {
    // Fallback: fetch tasks by project reference
    tasks = await Task.find({ project: this._id });
  }
  
  if (tasks.length === 0) {
    this.progress = 0;
    return;
  }

  // Calculate progress based on task status
  const statusValues = {
    'todo': 0,
    'pending': 0,
    'in-progress': 50,
    'completed': 100,
    'revision': 50,
    'submitted': 25,
    'approved': 75,
    'created': 0,
    'assigned': 0
  };

  const total = tasks.reduce((sum, task) => {
    return sum + (statusValues[task.status] || 0);
  }, 0);
  
  this.progress = Math.round(total / tasks.length);
  
  // Also update status based on progress if not manually set
  if (this.progress === 0) {
    this.status = "planning";
  } else if (this.progress === 100) {
    this.status = "completed";
  } else {
    this.status = "in-progress";
  }
  
  await this.save();
};

const Project = mongoose.model("Project", projectSchema);

export default Project;
