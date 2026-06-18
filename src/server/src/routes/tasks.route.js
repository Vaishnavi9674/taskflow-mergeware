import { Router } from 'express';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, reorderTasks } from '../controllers/task.controller.js';
import authMiddleware from '../middleware/auth.midddleware.js';

const tasksrouter = Router();

// protect all task routes
tasksrouter.use(authMiddleware);

tasksrouter.get('/', getTasks);
tasksrouter.get('/:id', getTaskById);
tasksrouter.post('/', createTask);
tasksrouter.put('/reorder', reorderTasks);
tasksrouter.put('/:id', updateTask);
tasksrouter.delete('/:id', deleteTask);

export { tasksrouter };
