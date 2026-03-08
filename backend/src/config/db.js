import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    if (!config.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }
    
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit process strictly yet, so the rest of the API can still attempt to boot for debugging
  }
};
