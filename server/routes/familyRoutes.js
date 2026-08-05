import express from 'express';
import FamilyMember from '../models/FamilyMember.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkDbState } from '../middleware/dbMiddleware.js';

const router = express.Router();

// @route   GET /api/family
// @desc    Get all family members for authenticated user
router.get('/', protect, checkDbState, async (req, res) => {
  try {
    const members = await FamilyMember.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, members });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch family members.' });
  }
});

// @route   POST /api/family
// @desc    Add a new family member
router.post('/', protect, checkDbState, async (req, res) => {
  try {
    const { name, email, phone, role, status, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required fields.' });
    }

    const newMember = await FamilyMember.create({
      user: req.user._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      role: role || 'Member',
      status: status || 'Active',
      avatar: avatar || null,
    });

    // Log Activity
    await Activity.create({
      user: req.user._id,
      type: 'FAMILY_MEMBER_ADDED',
      details: `Added new family member "${newMember.name}" (${newMember.role})`,
    }).catch((err) => console.error('Activity log error:', err.message));

    res.status(201).json({ success: true, member: newMember });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create family member.' });
  }
});

// @route   PUT /api/family/:id
// @desc    Update an existing family member
router.put('/:id', protect, checkDbState, async (req, res) => {
  try {
    const { name, email, phone, role, status, avatar } = req.body;

    const member = await FamilyMember.findOne({ _id: req.params.id, user: req.user._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Family member not found.' });
    }

    if (name) member.name = name.trim();
    if (email) member.email = email.trim().toLowerCase();
    if (phone !== undefined) member.phone = phone.trim();
    if (role) member.role = role;
    if (status) member.status = status;
    if (avatar !== undefined) member.avatar = avatar;

    await member.save();

    // Log Activity
    await Activity.create({
      user: req.user._id,
      type: 'FAMILY_MEMBER_UPDATED',
      details: `Updated family member "${member.name}" credentials`,
    }).catch((err) => console.error('Activity log error:', err.message));

    res.json({ success: true, member });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update family member.' });
  }
});

// @route   DELETE /api/family/:id
// @desc    Delete a family member
router.delete('/:id', protect, checkDbState, async (req, res) => {
  try {
    const member = await FamilyMember.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Family member not found.' });
    }

    // Log Activity
    await Activity.create({
      user: req.user._id,
      type: 'FAMILY_MEMBER_DELETED',
      details: `Removed family member "${member.name}"`,
    }).catch((err) => console.error('Activity log error:', err.message));

    res.json({ success: true, message: 'Family member removed successfully.' });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete family member.' });
  }
});

export default router;
