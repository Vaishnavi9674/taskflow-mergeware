import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';

const authrouter = Router();

authrouter.post('/login', login);
authrouter.post('/register', register);

export { authrouter };
