import express from 'express';
import CalendarEvent from '../models/CalendarEvent.js';
import FamilyMember from '../models/FamilyMember.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkDbState } from '../middleware/dbMiddleware.js';

const router = express.Router();

router.use(protect, checkDbState);

// @route   GET /api/calendar/events
// @desc    Get calendar events for authenticated user and their family
router.get('/events', async (req, res) => {
  try {
    const membership = await FamilyMember.findOne({ user: req.user._id, status: 'Active' });
    const familyId = membership ? membership.family : null;

    const query = {
      $or: [
        { user: req.user._id },
        ...(familyId ? [{ family: familyId }] : []),
      ],
    };

    const events = await CalendarEvent.find(query).sort({ startDate: 1 });
    return res.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error('[Get Calendar Events Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch calendar events.' });
  }
});

// @route   POST /api/calendar/events
// @desc    Create a new calendar event
router.post('/events', async (req, res) => {
  try {
    const { title, description, startDate, endDate, isAllDay, category, color } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ success: false, message: 'Title and start date are required.' });
    }

    const membership = await FamilyMember.findOne({ user: req.user._id, status: 'Active' });

    const event = await CalendarEvent.create({
      user: req.user._id,
      family: membership ? membership.family : null,
      title: title.trim(),
      description: description ? description.trim() : '',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isAllDay: isAllDay !== undefined ? isAllDay : true,
      category: category || 'General',
      color: color || '#10b981',
    });

    return res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('[Create Calendar Event Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to create calendar event.' });
  }
});

// @route   DELETE /api/calendar/events/:id
// @desc    Delete a calendar event
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    return res.json({ success: true, message: 'Calendar event deleted successfully.' });
  } catch (error) {
    console.error('[Delete Calendar Event Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to delete calendar event.' });
  }
});

export default router;
