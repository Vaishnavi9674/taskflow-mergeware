import test from 'node:test';
import assert from 'node:assert/strict';

import { register, login } from '../src/controllers/auth.controller.js';
import { createTask, getTaskById, updateTask } from '../src/controllers/task.controller.js';

const createResponse = () => {
	const response = {
		statusCode: 200,
		body: undefined,
		status(code) {
			this.statusCode = code;
			return this;
		},
		json(payload) {
			this.body = payload;
			return this;
		},
	};

	return response;
};

test('register rejects missing required fields', async () => {
	const res = createResponse();

	await register({ body: {} }, res);

	assert.equal(res.statusCode, 400);
	assert.equal(res.body.message, 'Name, email, and password are required');
});

test('login rejects missing credentials', async () => {
	const res = createResponse();

	await login({ body: { email: 'user@example.com' } }, res);

	assert.equal(res.statusCode, 400);
	assert.equal(res.body.message, 'Email and password are required');
});

test('createTask rejects an empty title', async () => {
	const res = createResponse();

	await createTask({ body: { title: ' ' }, user: { id: '507f1f77bcf86cd799439011' } }, res);

	assert.equal(res.statusCode, 400);
	assert.equal(res.body.message, 'Title is required');
});

test('getTaskById rejects an invalid task id', async () => {
	const res = createResponse();

	await getTaskById({ params: { id: 'not-an-id' }, user: { id: '507f1f77bcf86cd799439011' } }, res);

	assert.equal(res.statusCode, 400);
	assert.equal(res.body.message, 'Invalid task id');
});

test('updateTask rejects an invalid task id before reading MongoDB', async () => {
	const res = createResponse();

	await updateTask(
		{ params: { id: 'not-an-id' }, body: { title: 'Updated' }, user: { id: '507f1f77bcf86cd799439011' } },
		res
	);

	assert.equal(res.statusCode, 400);
	assert.equal(res.body.message, 'Invalid task id');
});
