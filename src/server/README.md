# Todo API - Server

Base URL: http://localhost:8080

Server entry: [src/main.js](src/main.js#L1)

Environment

- `PORT`: server port (default: `8080`)
- `JWT_SECRET`: secret used to sign JWT tokens (default: `your_jwt_secret`)
- `MONGO_URL` or `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/todoapp`)
- `CORS_ORIGIN`: comma-separated allowed browser origins (default: `http://localhost:3000`)

Authentication

- The API uses JWT. Obtain a token from the Auth endpoints and send it in the `Authorization` header as `Bearer <token>` for protected routes.

Common response shape

- Successful and error responses use a simple JSON structure. Typical responses:

```
{
	"message": "...",
	"token": "...",
	"data": { ... }
}
```

Auth Endpoints ([src/routes/auth.route.js](src/routes/auth.route.js#L1))

- POST /api/auth/register
    - Description: Register a new user and return a JWT token.
    - Body (application/json):
        ```json
        {
        	"name": "User Name",
        	"email": "user@example.com",
        	"password": "secret"
        }
        ```
    - Success: `201 Created`
        ```json
        { "token": "<jwt-token>" }
        ```
    - Errors:
        - `400` if user already exists
        - `500` for server error

- POST /api/auth/login
    - Description: Login with email and password, returns a JWT token.
    - Body (application/json):
        ```json
        {
        	"email": "user@example.com",
        	"password": "secret"
        }
        ```
    - Success: `200 OK`
        ```json
        { "token": "<jwt-token>" }
        ```
    - Errors:
        - `400` for invalid credentials
        - `500` for server error

Task Endpoints (protected) ([src/routes/tasks.route.js](src/routes/tasks.route.js#L1))
All task routes require the `Authorization: Bearer <token>` header. The middleware is in [src/middleware/auth.midddleware.js](src/middleware/auth.midddleware.js#L1).

- GET /api/tasks/
    - Description: Get all tasks for the authenticated user.
    - Headers:
        - `Authorization: Bearer <token>`
    - Success: `200 OK` (array of tasks)
        ```json
        [
        	{
        		"_id": "...",
        		"title": "Buy milk",
        		"description": "2 liters",
        		"completed": false,
        		"userId": "..."
        	}
        ]
        ```
    - Errors:
        - `401` when no/invalid token
        - `500` for server error

- GET /api/tasks/:id
    - Description: Get one task by id. Only the owner may view it.
    - Headers:
        - `Authorization: Bearer <token>`
    - Success: `200 OK` returns the task object
    - Errors:
        - `400` when the task id is invalid
        - `401` when no/invalid token
        - `403` when authenticated user is not the owner
        - `404` when task not found
        - `500` for server error

- POST /api/tasks/
    - Description: Create a new task for the authenticated user.
    - Headers:
        - `Authorization: Bearer <token>`
    - Body (application/json):
        ```json
        {
        	"title": "New task",
        	"description": "Optional description"
        }
        ```
    - Success: `201 Created` returns the created task object
    - Errors:
        - `401` when no/invalid token
        - `500` for server error

- PUT /api/tasks/:id
    - Description: Update an existing task's title, description, and/or completion state. Only the owner may update.
    - Headers:
        - `Authorization: Bearer <token>`
    - Params:
        - `id` - task id
    - Body (application/json): any of the updatable fields:

    ```json
    {
    	"title": "Updated title",
    	"description": "Updated description",
    	"completed": true
    }
    ```
    - Success: `200 OK` returns the updated task object
    - Errors:
        - `400` when the task id is invalid or input is invalid
        - `401` when no/invalid token
        - `403` when authenticated user is not the owner
        - `404` when task not found
        - `500` for server error

- DELETE /api/tasks/:id
    - Description: Delete a task. Only the owner may delete.
    - Headers:
        - `Authorization: Bearer <token>`
    - Params:
        - `id` - task id
    - Success: `200 OK`
        ```json
        { "message": "Task deleted successfully" }
        ```
    - Errors:
        - `400` when the task id is invalid
        - `401` when no/invalid token
        - `403` when authenticated user is not the owner
        - `404` when task not found
        - `500` for server error

Notes & Implementation details

- Models: User schema ([src/models/user.model.js](src/models/user.model.js#L1)) and Task schema ([src/models/task.model.js](src/models/task.model.js#L1)). Fields shown in responses reflect the model definitions.
- JWT token lifetime: 1 hour (see [src/controllers/auth.controller.js](src/controllers/auth.controller.js#L1)).
- Database: uses MongoDB; connection code in [src/db/init.js](src/db/init.js#L1).

Quick curl examples

- Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Alice","email":"alice@example.com","password":"secret"}'
```

- Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"secret"}'
```

- Create task (replace <token>)

```bash
curl -X POST http://localhost:8080/api/tasks/ \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <token>" \
	-d '{"title":"Buy milk","description":"2 liters"}'
```

---

If you want, I can also add example Postman collection or OpenAPI spec.
