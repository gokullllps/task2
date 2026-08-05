import express from 'express';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/activities
// @desc    Get activity logs for authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const formattedActivities = activities.map((act) => ({
      id: act._id.toString(),
      type: act.type,
      details: act.details,
      createdAt: act.createdAt,
    }));

    return res.json({ success: true, count: formattedActivities.length, activities: formattedActivities });
  } catch (error) {
    console.error('[Get Activities Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
