import mongoose from 'mongoose';
import connectDB, { isDbConnected } from '../config/db.js';

export const checkDbState = async (req, res, next) => {
  if (!isDbConnected()) {
    console.warn('[Database Middleware Warning] Database not connected. Attempting reconnection...');
    try {
      if (mongoose.connection.readyState === 2) {
        // Connecting: wait up to 10 seconds for connection to establish
        let attempts = 0;
        while (mongoose.connection.readyState === 2 && attempts < 20) {
          await new Promise((r) => setTimeout(r, 500));
          attempts++;
        }
      }
      if (!isDbConnected()) {
        await connectDB();
      }
    } catch (err) {
      console.error('[Database Middleware Error] Reconnection failed:', err);
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable. Please check backend MONGODB_URI configuration.',
        error: {
          name: err.name,
          code: err.code || 'DB_NOT_CONNECTED',
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }
  next();
};
