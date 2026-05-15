import express from 'express';

const app = express();

import connectDB from './db/init.js';
connectDB()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

app.use(express.json());

app.get('/', (req, res) => {
  res.send({"message": "API server", "status": "running"});
});

import authrouter from './routes/auth.route.js';
app.use('/api/auth', authrouter);

import taskrouter from './routes/tasks.route.js';
app.use('/api/tasks', taskrouter);

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
