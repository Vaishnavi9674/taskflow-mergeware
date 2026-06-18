import Task from '../models/task.model.js';
import mongoose from 'mongoose';

const isValidTaskId = (id) => mongoose.Types.ObjectId.isValid(id);

const findOwnedTask = async (req, res) => {
	if (!isValidTaskId(req.params.id)) {
		res.status(400).json({ message: 'Invalid task id' });
		return null;
	}

	const task = await Task.findById(req.params.id);
	if (!task) {
		res.status(404).json({ message: 'Task not found' });
		return null;
	}

	if (task.userId.toString() !== req.user.id) {
		res.status(403).json({ message: 'Not authorized' });
		return null;
	}

	return task;
};

const createTask = async (req, res) => {
	try {
		const body = req.body || {};
		const title = String(body.title || '').trim();
		const description = String(body.description || '').trim();
		const category = String(body.category || 'None').trim();

		if (!title) {
			return res.status(400).json({ message: 'Title is required' });
		}

		// Find task with lowest order to place new task at the top (order = minOrder - 1)
		const minOrderTask = await Task.findOne({ userId: req.user.id }).sort({ order: 1 }).select('order');
		const order = minOrderTask && typeof minOrderTask.order === 'number' ? minOrderTask.order - 1 : 0;

		const task = new Task({ title, description, category, order, userId: req.user.id });
		await task.save();
		res.status(201).json(task);
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
};

const getTasks = async (req, res) => {
	try {
		const tasks = await Task.find({ userId: req.user.id }).sort({ order: 1 });
		res.status(200).json(tasks);
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
};

const getTaskById = async (req, res) => {
	try {
		const task = await findOwnedTask(req, res);
		if (!task) return;

		res.status(200).json(task);
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
};

const updateTask = async (req, res) => {
	try {
		const body = req.body || {};
		const task = await findOwnedTask(req, res);
		if (!task) return;

		if (body.title !== undefined) {
			const title = String(body.title || '').trim();
			if (!title) {
				return res.status(400).json({ message: 'Title cannot be empty' });
			}
			task.title = title;
		}

		if (body.description !== undefined) {
			task.description = String(body.description || '').trim();
		}

		if (body.category !== undefined) {
			task.category = String(body.category || 'None').trim();
		}

		if (body.completed !== undefined) {
			if (typeof body.completed !== 'boolean') {
				return res.status(400).json({ message: 'Completed must be a boolean' });
			}
			task.completed = body.completed;
		}

		await task.save();
		res.status(200).json(task);
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
};

const deleteTask = async (req, res) => {
	try {
		const task = await findOwnedTask(req, res);
		if (!task) return;

		await task.deleteOne();
		res.status(200).json({ message: 'Task deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
};

const reorderTasks = async (req, res) => {
	try {
		const { taskIds } = req.body || {};
		if (!Array.isArray(taskIds)) {
			return res.status(400).json({ message: 'taskIds must be an array' });
		}

		const bulkOps = taskIds.map((id, index) => ({
			updateOne: {
				filter: { _id: id, userId: req.user.id },
				update: { $set: { order: index } },
			},
		}));

		await Task.bulkWrite(bulkOps);
		res.status(200).json({ message: 'Tasks reordered successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
};

export { createTask, getTasks, getTaskById, updateTask, deleteTask, reorderTasks };
