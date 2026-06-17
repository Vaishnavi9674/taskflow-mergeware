import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({
	path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
});

const connectDB = async () => {
	const mongoUrl = process.env.MONGO_URI || 'mongodb://admin:admin@127.0.0.1:27017/taskflow-app?authSource=admin';

	await mongoose.connect(mongoUrl);
	console.log('MongoDB connected');
};

export default connectDB;
