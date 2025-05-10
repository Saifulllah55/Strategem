import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  announcer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement; 