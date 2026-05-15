import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// index for faster lookups by user
taskSchema.index({ userId: 1 });

// static helper to find tasks for a given user id
taskSchema.statics.findByUser = function (userId) {
  return this.find({ userId });
};

const Task = mongoose.model("Task", taskSchema);

export default Task;