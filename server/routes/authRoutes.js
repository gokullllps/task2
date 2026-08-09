import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkDbState } from '../middleware/dbMiddleware.js';
import { sendOtpEmail } from '../services/emailService.js';

const router = express.Router();

// Apply DB state check to all auth routes
router.use(checkDbState);

// Rate limiter for OTP creation/verification to prevent spam & brute-force attacks
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit each IP to 25 OTP requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests from this IP, please try again later.' },
});

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

// Helper Strong Password Regex: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_\-\+=~])[A-Za-z\d@$!%*?&^#_\-\+=~]{8,}$/;

/**
 * Helper function to generate a cryptographically secure 6-digit numeric OTP.
 * Never uses Math.random().
 */
const generate6DigitOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// =========================================================================
// REGISTER OTP FLOW
// =========================================================================

// @route   POST /api/auth/send-register-otp
// @desc    Validate details, generate crypto 6-digit OTP, bcrypt hash & save in Otp collection, send Hostinger SMTP email
// @access  Public
router.post('/send-register-otp', otpRateLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email address, and password.',
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.',
      });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&^#_-+=~).',
      });
    }

    // Check duplicate username
    const escapedUsername = escapeRegex(trimmedUsername);
    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') },
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose a different username.',
      });
    }

    // Single Account Per Email Check (if user exists and is already verified)
    const existingEmailUser = await User.findOne({ email: trimmedEmail });
    if (existingEmailUser && existingEmailUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Only 1 account is allowed per email address.',
      });
    }

    // Create or update unverified User account pending OTP verification
    if (!existingEmailUser) {
      await User.create({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        isVerified: false,
      });
    } else {
      existingEmailUser.username = trimmedUsername;
      existingEmailUser.password = password;
      await existingEmailUser.save();
    }

    // Delete any existing OTPs for this email and REGISTER purpose
    await Otp.deleteMany({ email: trimmedEmail, purpose: 'REGISTER' });

    // Generate 6-digit cryptographically secure OTP
    const plainOtp = generate6DigitOtp();
    const hashedOtp = await Otp.hashOtp(plainOtp);

    // Save to Otp model with 5-minute TTL expiration
    await Otp.create({
      email: trimmedEmail,
      otp: hashedOtp,
      purpose: 'REGISTER',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      verified: false,
    });

    // Send email via Hostinger Nodemailer SMTP
    const mailResult = await sendOtpEmail({
      to: trimmedEmail,
      otpCode: plainOtp,
      purpose: 'REGISTER',
      subjectTitle: 'Confirm Your Email Address',
    });

    if (!mailResult.success && !mailResult.warning) {
      return res.status(500).json({
        success: false,
        message: `SMTP Delivery Failed: ${mailResult.error || 'Check EMAIL_USER & EMAIL_PASS in server/.env'}.`,
      });
    }

    return res.status(200).json({
      success: true,
      email: trimmedEmail,
      message: `A 6-digit verification OTP code has been sent to ${trimmedEmail}. It will expire in 5 minutes.`,
    });
  } catch (error) {
    console.error('[Send Register OTP Error]:', error);
    if (error.code === 11000 || (error.message && error.message.includes('E11000'))) {
      const isEmail = error.message && error.message.includes('email');
      return res.status(400).json({
        success: false,
        message: isEmail
          ? 'An account with this email already exists.'
          : 'Username or email already exists. Please try signing in or use different credentials.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send registration OTP code. Please try again.',
    });
  }
});

// Alias for backward compatibility
router.post('/register', otpRateLimiter, async (req, res) => {
  return router.handle(req, res);
});

// @route   POST /api/auth/verify-register-otp
// @desc    Verify 6-digit OTP, enforce 5-attempt security limit, create User account in MongoDB & return JWT token
// @access  Public
router.post('/verify-register-otp', otpRateLimiter, async (req, res) => {
  try {
    const { username, email, password, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and 6-digit OTP code.',
      });
    }

    const trimmedUsername = (username || '').trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    // Find active OTP record
    const otpRecord = await Otp.findOne({
      email: trimmedEmail,
      purpose: 'REGISTER',
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP code has expired or does not exist. Please request a new OTP.',
      });
    }

    // Check expiration
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP code has expired (5-minute limit). Please request a new OTP.',
      });
    }

    // Max 5 attempts check
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded (5/5). Please request a new OTP.',
      });
    }

    // Verify hashed OTP
    const isMatch = await otpRecord.matchOtp(trimmedOtp);

    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts exceeded (5/5). Please request a new OTP.',
        });
      }

      const remainingAttempts = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`,
      });
    }

    // OTP matched! Mark verified and delete OTP
    otpRecord.verified = true;
    await Otp.deleteOne({ _id: otpRecord._id });

    // Mark User account verified
    let user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      user = await User.create({
        username: trimmedUsername || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        password: password || 'DefaultPass123!',
        isVerified: true,
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    try {
      await Activity.create({
        user: user._id,
        type: 'LOGIN',
        details: 'Email OTP verified and account created',
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
      message: 'Email address verified and account created successfully! Welcome to your workspace.',
    });
  } catch (error) {
    console.error('[Verify Register OTP Error]:', error);
    if (error.code === 11000 || (error.message && error.message.includes('E11000'))) {
      const isEmail = error.message && error.message.includes('email');
      return res.status(400).json({
        success: false,
        message: isEmail
          ? 'An account with this email already exists.'
          : 'Username or email already exists. Please try signing in.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify registration OTP code.',
    });
  }
});

// Alias for backward compatibility
router.post('/verify-otp', otpRateLimiter, async (req, res) => {
  return router.handle(req, res);
});

// Alias for backward compatibility resend
router.post('/resend-otp', otpRateLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, message: 'Please provide email address.' });
  
  // Re-trigger send-register-otp logic
  req.url = '/send-register-otp';
  return router.handle(req, res);
});

// =========================================================================
// FORGOT PASSWORD OTP FLOW
// =========================================================================

// @route   POST /api/auth/send-forgot-otp
// @desc    Check account existence, generate crypto 6-digit OTP, bcrypt hash & save in Otp collection, send Hostinger SMTP email
// @access  Public
router.post('/send-forgot-otp', otpRateLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address. Please check for typos or create a new account.',
      });
    }

    // Delete any existing OTPs for this email and FORGOT_PASSWORD purpose
    await Otp.deleteMany({ email: trimmedEmail, purpose: 'FORGOT_PASSWORD' });

    // Generate 6-digit cryptographically secure OTP
    const plainOtp = generate6DigitOtp();
    const hashedOtp = await Otp.hashOtp(plainOtp);

    // Save to Otp model with 5-minute expiration
    await Otp.create({
      email: trimmedEmail,
      otp: hashedOtp,
      purpose: 'FORGOT_PASSWORD',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      verified: false,
    });

    // Send email via Hostinger Nodemailer SMTP
    const mailResult = await sendOtpEmail({
      to: trimmedEmail,
      otpCode: plainOtp,
      purpose: 'FORGOT_PASSWORD',
      subjectTitle: 'Password Reset OTP Code',
    });

    if (!mailResult.success && !mailResult.warning) {
      return res.status(500).json({
        success: false,
        message: `SMTP Delivery Failed: ${mailResult.error || 'Check EMAIL_USER & EMAIL_PASS in server/.env'}.`,
      });
    }

    return res.status(200).json({
      success: true,
      email: trimmedEmail,
      message: `Password reset OTP has been sent to ${trimmedEmail}. It will expire in 5 minutes.`,
    });
  } catch (error) {
    console.error('[Send Forgot OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send password reset OTP.',
    });
  }
});

// Alias for backward compatibility
router.post('/forgot-password', otpRateLimiter, async (req, res) => {
  req.url = '/send-forgot-otp';
  return router.handle(req, res);
});

// @route   POST /api/auth/verify-forgot-otp
// @desc    Verify 6-digit password reset OTP and mark OTP verified
// @access  Public
router.post('/verify-forgot-otp', otpRateLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and 6-digit OTP code.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    const otpRecord = await Otp.findOne({
      email: trimmedEmail,
      purpose: 'FORGOT_PASSWORD',
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP code has expired or does not exist. Please request a new OTP.',
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP code has expired (5-minute limit). Please request a new OTP.',
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded (5/5). Please request a new OTP.',
      });
    }

    const isMatch = await otpRecord.matchOtp(trimmedOtp);

    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts exceeded (5/5). Please request a new OTP.',
        });
      }

      const remainingAttempts = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`,
      });
    }

    // OTP matched! Mark verified
    otpRecord.verified = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully! You may now set a new password.',
    });
  } catch (error) {
    console.error('[Verify Forgot OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP code.',
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password using verified OTP session & bcrypt hash
// @access  Public
router.post('/reset-password', otpRateLimiter, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and new password.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'New password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&^#_-+=~).',
      });
    }

    // Verify verified OTP record exists or verify candidate OTP
    let otpRecord = await Otp.findOne({
      email: trimmedEmail,
      purpose: 'FORGOT_PASSWORD',
      verified: true,
    });

    if (!otpRecord && otp) {
      // Allow single-step reset if candidate OTP is passed
      otpRecord = await Otp.findOne({
        email: trimmedEmail,
        purpose: 'FORGOT_PASSWORD',
      });

      if (otpRecord) {
        const isMatch = await otpRecord.matchOtp(otp.trim());
        if (!isMatch) otpRecord = null;
      }
    }

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset session. Please request a new OTP.',
      });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Update user password (pre-save hook in User model hashes password using bcrypt)
    user.password = newPassword;
    user.isVerified = true;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Consume and delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password.',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user using Username/Email & Password directly
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { identifier, username, password } = req.body || {};
    const inputUsername = (username || identifier || '').trim();

    if (!inputUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are both required to sign in',
      });
    }

    const escapedUsername = escapeRegex(inputUsername);

    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } },
        { email: inputUsername.toLowerCase() },
      ],
    });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }

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
          phone: user.phone || '',
          bio: user.bio || '',
          avatar: user.avatar || '',
          emailNotifications: user.emailNotifications ?? true,
          deadlineReminders: user.deadlineReminders ?? true,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username/email and password.',
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
        phone: req.user.phone || '',
        bio: req.user.bio || '',
        avatar: req.user.avatar || '',
        emailNotifications: req.user.emailNotifications ?? true,
        deadlineReminders: req.user.deadlineReminders ?? true,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Get Me Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details in MongoDB database
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.emailNotifications !== undefined) user.emailNotifications = req.body.emailNotifications;
    if (req.body.deadlineReminders !== undefined) user.deadlineReminders = req.body.deadlineReminders;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated in MongoDB successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        emailNotifications: user.emailNotifications ?? true,
        deadlineReminders: user.deadlineReminders ?? true,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
