import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import authMiddleware from '../middleware/auth.midddleware.js';

const tasksrouter = Router();

// protect all task routes
tasksrouter.use(authMiddleware);

tasksrouter.get("/", getTasks);
tasksrouter.post("/", createTask);
tasksrouter.put("/:id", updateTask);
tasksrouter.delete("/:id", deleteTask);

export default tasksrouter;