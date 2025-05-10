import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["task", "project", "general", "custom"],
      required: true,
    },
    relatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'type',
      required: function() {
        return this.type !== 'custom' && this.type !== 'general';
      },
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hoursBeforeDue: {
      type: Number,
      default: 24,
    },
    notificationDate: {
      type: Date,
      default: function() {
        if (this.dueDate && this.hoursBeforeDue) {
          const date = new Date(this.dueDate);
          date.setHours(date.getHours() - this.hoursBeforeDue);
          return date;
        }
        return null;
      }
    },
    isNotified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder; 