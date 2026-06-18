import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({
	path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
});

const app = express();

import connectDB from './db/init.js';

app.use(express.json());

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || '*',
	})
);

app.get('/', (req, res) => {
	res.json({
		status: 'success',
		message: 'Welcome to TaskFlow API',
	});
});

import { authrouter } from './routes/auth.route.js';
app.use('/api/v1/auth', authrouter);

import { tasksrouter } from './routes/tasks.route.js';
app.use('/api/v1/tasks', tasksrouter);

const PORT = process.env.PORT || 8000;

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB', err);
	});
