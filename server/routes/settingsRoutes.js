import express from 'express';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkDbState } from '../middleware/dbMiddleware.js';

const router = express.Router();

router.use(protect, checkDbState);

// @route   GET /api/settings
// @desc    Get user preferences
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('[Get Settings Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

// @route   PUT /api/settings
// @desc    Update user preferences
router.put('/', async (req, res) => {
  try {
    const { theme, emailNotifications, taskReminders, soundEnabled } = req.body;

    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) {
      settings = new Settings({ user: req.user._id });
    }

    if (theme !== undefined) settings.theme = theme;
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (taskReminders !== undefined) settings.taskReminders = taskReminders;
    if (soundEnabled !== undefined) settings.soundEnabled = soundEnabled;

    await settings.save();
    return res.json({ success: true, settings, message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('[Update Settings Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

export default router;
