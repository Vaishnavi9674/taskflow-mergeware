import Task from "../models/task.model.js";

const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = new Task({ title, description, userId: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { createTask, getTasks, getTaskById, updateTask, deleteTask };