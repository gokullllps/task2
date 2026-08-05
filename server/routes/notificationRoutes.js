import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkDbState } from '../middleware/dbMiddleware.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for authenticated user
router.get('/', protect, checkDbState, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error('[Notification Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', protect, checkDbState, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, notification });
  } catch (err) {
    console.error('[Notification Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to mark notification read.' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all user notifications as read
router.put('/read-all', protect, checkDbState, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('[Notification Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to mark notifications read.' });
  }
});

export default router;
