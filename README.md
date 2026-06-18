# TaskFlow

TaskFlow is a task management web application built with a React/Meteor frontend and a Node.js/Express/MongoDB backend. It features user authentication, task categorization, and an interactive drag-and-drop task reordering system.

---

## Features

- **🔒 User Authentication:** Secure registration and login using JWT (JSON Web Tokens).
- **📋 Task Management:** Full CRUD operations for creating, editing, and deleting tasks.
- **🏷️ Task Categories:** Organize your workflow by categorizing tasks into **Work**, **Personal**, or **Urgent** lists (or leave them uncategorized).
- **🔍 Advanced Filtering & Search:** Search tasks in real-time and filter by status (All, Pending, Completed) or category.
- **↕️ Drag-and-Drop Reordering:** Reorder tasks interactively using drag handles (available when no active filters or search terms are applied).
- **🎨 Glassmorphism UI:** Stunning, dark-themed responsive design featuring smooth micro-animations and modern typography.
- **🐳 Dockerized Architecture:** Fully containerized setup using Docker Compose.

---

## Technology Stack

### Frontend (Client)
- **Framework:** [Meteor 3.x](https://www.meteor.com/) with **React 18**
- **Bundler:** [Rspack](https://www.rspack.dev/)
- **Styling:** CSS & Tailwind CSS
- **Icons:** Lucide React

### Backend (Server)
- **Runtime:** Node.js (Express framework)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)

---

## Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

---

### Running with Docker Compose (Recommended)

To run the entire stack (Client, Server, and MongoDB) in containers:

1. **Start the application:**
   ```bash
   docker compose up -d --build
   ```

2. **Access the application:**
   - **Frontend Client:** Open [http://localhost:3000](http://localhost:3000) in your browser.
   - **Backend API:** Access [http://localhost:8000](http://localhost:8000) (internal endpoint).

3. **Stop the containers:**
   ```bash
   docker compose down
   ```

---

### Local Development Setup

If you prefer to run the components locally without Docker:

#### 1. Setup MongoDB
Make sure a local instance of MongoDB is running on port `27017` or use the Docker compose database service:
```bash
docker compose up -d taskflow-mongo
```

#### 2. Run the Backend Server
Navigate to the server directory, install dependencies, and start the development server:
```bash
cd src/server
npm install
npm run dev
```
The server will start running on [http://localhost:8000](http://localhost:8000).

#### 3. Run the Frontend Client
Navigate to the client directory, install dependencies, and start the Meteor development server:
```bash
cd src/client
npm install
npm run start
```
The client will start running on [http://localhost:3000](http://localhost:3000).

---

## API Documentation

All API requests are prefixed with `/api/v1`.

### Authentication
- `POST /auth/register` - Register a new user.
- `POST /auth/login` - Authenticate a user and return a JWT token.

### Tasks (Protected - Requires JWT)
- `GET /tasks` - Retrieve all tasks for the logged-in user (sorted by custom order).
- `POST /tasks` - Create a new task.
- `PUT /tasks/:id` - Update a task (title, description, completion, or category).
- `DELETE /tasks/:id` - Delete a task.
- `PUT /tasks/reorder` - Update the ordering list of all tasks (expects an array of task IDs).
