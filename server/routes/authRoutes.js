import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkDbState } from '../middleware/dbMiddleware.js';

const router = express.Router();

// Apply DB state check to all auth routes
router.use(checkDbState);

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_todo_app_2026_xyz!@#',
    { expiresIn: '7d' }
  );
};

// Helper function to escape special regex characters safely
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @route   POST /api/auth/register
// @desc    Register a new user (Starts without a family; user chooses to Create or Join a Family)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Duplicate Username Check
    const escapedUsername = escapeRegex(trimmedUsername);
    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') },
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Duplicate Email Check
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create User
    const user = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password,
    });

    if (user) {
      try {
        await Activity.create({
          user: user._id,
          type: 'LOGIN',
          details: 'User registered and logged in',
        });
      } catch (activityErr) {
        console.warn('[Activity Track Warning]', activityErr.message);
      }

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data provided',
      });
    }
  } catch (error) {
    console.error('[Register Error Details]:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `An account with this ${duplicateField} already exists`,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Registration failed due to a server error',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password',
      });
    }

    const trimmedIdentifier = identifier.trim().toLowerCase();
    const escapedIdentifier = escapeRegex(trimmedIdentifier);

    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } },
        { email: trimmedIdentifier },
      ],
    });

    if (user && (await user.matchPassword(password))) {
      try {
        await Activity.create({
          user: user._id,
          type: 'LOGIN',
          details: 'User logged in',
        });
      } catch (activityErr) {
        console.warn('[Activity Track Warning]', activityErr.message);
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your username/email and password.',
      });
    }
  } catch (error) {
    console.error('[Login Error Details]:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Login failed due to a server error',
    });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', protect, async (req, res) => {
  try {
    await Activity.create({
      user: req.user._id,
      type: 'LOGOUT',
      details: 'User logged out',
    });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Logout Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Get Me Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
