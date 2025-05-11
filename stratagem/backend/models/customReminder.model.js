import mongoose from "mongoose";

const customReminderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    dueDate: {
      type: Date,
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
    }
  },
  { timestamps: true }
);

// Add index for efficiently querying reminder notifications
customReminderSchema.index({ notificationDate: 1, isNotified: 1, status: 1 });

const CustomReminder = mongoose.model("CustomReminder", customReminderSchema);

export default CustomReminder; 