import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({
	path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const normalizeEmail = (email) =>
	String(email || '')
		.trim()
		.toLowerCase();

const createToken = (user) => {
	const payload = { user: { id: user._id.toString() } };
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

export const register = async (req, res) => {
	try {
		const body = req.body || {};
		const name = String(body.name || '').trim();
		const email = normalizeEmail(body.email);
		const password = String(body.password || '');

		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required' });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const hashed = await bcrypt.hash(password, 10);
		const user = new User({ name, email, password: hashed });
		await user.save();
		res.status(201).json({ token: createToken(user) });
	} catch (error) {
		if (error?.code === 11000) {
			return res.status(400).json({ message: 'User already exists' });
		}

		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const login = async (req, res) => {
	try {
		const body = req.body || {};
		const email = normalizeEmail(body.email);
		const password = String(body.password || '');

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}
		res.status(200).json({ token: createToken(user) });
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
};

export default { register, login };
