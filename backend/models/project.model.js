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
    tasks: [
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
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
