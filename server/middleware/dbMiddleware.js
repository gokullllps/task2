import { isDbConnected } from '../config/db.js';

export const checkDbState = (req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please verify MongoDB server is running.',
    });
  }
  next();
};
