import express from 'express';
import Family, { generateFamilyCode } from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkDbState } from '../middleware/dbMiddleware.js';

const router = express.Router();

// @route   GET /api/family/my-family
// @desc    Get user's current family status, code, owner, active members, and pending requests
router.get('/my-family', protect, checkDbState, async (req, res) => {
  try {
    const membership = await FamilyMember.findOne({
      user: req.user._id,
      status: { $in: ['Active', 'Pending'] },
    }).populate('family');

    if (!membership || !membership.family) {
      return res.json({
        success: true,
        hasFamily: false,
        isOwner: false,
        status: null,
        membership: null,
        family: null,
        members: [],
        pendingRequests: [],
      });
    }

    const family = membership.family;
    const isOwner = family.owner.toString() === req.user._id.toString();
    const isActive = membership.status === 'Active';

    let members = [];
    if (isActive) {
      members = await FamilyMember.find({
        family: family._id,
        status: 'Active',
      }).sort({ createdAt: 1 });
    }

    let pendingRequests = [];
    if (isOwner && isActive) {
      pendingRequests = await FamilyMember.find({
        family: family._id,
        status: 'Pending',
      }).sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      hasFamily: isActive,
      isOwner,
      status: membership.status, // 'Active' or 'Pending'
      membership,
      family: {
        _id: family._id,
        name: family.name,
        nickname: family.nickname || '',
        code: family.code,
        owner: family.owner,
        createdAt: family.createdAt,
      },
      members,
      pendingRequests,
    });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch family system details.' });
  }
});

// @route   POST /api/family/add-member
// @desc    Owner directly adds a family member
router.post('/add-member', protect, checkDbState, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const membership = await FamilyMember.findOne({ user: req.user._id, status: 'Active' }).populate('family');
    if (!membership || !membership.family) {
      return res.status(404).json({ success: false, message: 'Family not found.' });
    }

    if (membership.family.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can add members.' });
    }

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    let targetUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!targetUser) {
      targetUser = await User.create({
        username: name.trim().replace(/\s+/g, '_').toLowerCase() + '_' + Math.floor(Math.random() * 1000),
        email: email.trim().toLowerCase(),
        password: 'TemporaryPassword123!',
      });
    }

    const newMember = await FamilyMember.create({
      family: membership.family._id,
      user: targetUser._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      role: role || 'Member',
      status: 'Active',
    });

    await Activity.create({
      user: req.user._id,
      type: 'MEMBER_ADDED',
      details: `Added member "${newMember.name}" to family`,
    }).catch(() => {});

    res.status(201).json({ success: true, message: 'Member added successfully!', member: newMember });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to add member.' });
  }
});

// @route   PUT /api/family/member/:id
// @desc    Owner edits member credentials & role
router.put('/member/:id', protect, checkDbState, async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;

    const member = await FamilyMember.findById(req.params.id).populate('family');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const isOwner = member.family.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can edit members.' });
    }

    if (name) member.name = name.trim();
    if (email) member.email = email.trim().toLowerCase();
    if (phone !== undefined) member.phone = phone.trim();
    if (role && member.role !== 'Owner') member.role = role;
    if (status) member.status = status;

    await member.save();

    res.json({ success: true, message: 'Member profile updated successfully!', member });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update member.' });
  }
});

// @route   POST /api/family/transfer-ownership
// @desc    Owner transfers ownership to another active member
router.post('/transfer-ownership', protect, checkDbState, async (req, res) => {
  try {
    const { newOwnerMemberId } = req.body;

    const currentOwnerMem = await FamilyMember.findOne({ user: req.user._id, status: 'Active' }).populate('family');
    if (!currentOwnerMem || !currentOwnerMem.family) {
      return res.status(404).json({ success: false, message: 'Family not found.' });
    }

    const family = currentOwnerMem.family;
    if (family.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can transfer ownership.' });
    }

    const targetMember = await FamilyMember.findById(newOwnerMemberId);
    if (!targetMember || targetMember.family.toString() !== family._id.toString()) {
      return res.status(404).json({ success: false, message: 'Target family member not found.' });
    }

    family.owner = targetMember.user;
    await family.save();

    currentOwnerMem.role = 'Admin';
    await currentOwnerMem.save();

    targetMember.role = 'Owner';
    targetMember.status = 'Active';
    await targetMember.save();

    await Notification.create({
      recipient: targetMember.user,
      sender: req.user._id,
      family: family._id,
      type: 'REQUEST_ACCEPTED',
      message: `You are now the Family Owner of "${family.name}".`,
    });

    res.json({ success: true, message: `Ownership transferred to ${targetMember.name} successfully!` });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to transfer ownership.' });
  }
});

// @route   DELETE /api/family/:id
// @desc    Owner deletes family
router.delete('/:id', protect, checkDbState, async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found.' });
    }

    if (family.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can delete the family.' });
    }

    await FamilyMember.deleteMany({ family: family._id });
    await Family.findByIdAndDelete(family._id);

    res.json({ success: true, message: 'Family deleted successfully.' });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete family.' });
  }
});

// @route   PUT /api/family/nickname
router.put('/nickname', protect, checkDbState, async (req, res) => {
  try {
    const { nickname } = req.body;

    const membership = await FamilyMember.findOne({
      user: req.user._id,
      status: 'Active',
    }).populate('family');

    if (!membership || !membership.family) {
      return res.status(404).json({ success: false, message: 'Family not found.' });
    }

    const family = membership.family;

    if (family.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can edit the family nickname.' });
    }

    const trimmedNickname = (nickname || '').trim();

    if (trimmedNickname.length < 3 || trimmedNickname.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Family nickname must be between 3 and 30 characters long.',
      });
    }

    family.nickname = trimmedNickname;
    await family.save();

    await Activity.create({
      user: req.user._id,
      type: 'FAMILY_NICKNAME_UPDATED',
      details: `Updated family nickname to "${family.nickname}"`,
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Family nickname updated successfully!',
      nickname: family.nickname,
      family,
    });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update family nickname.' });
  }
});

// @route   POST /api/family/create
router.post('/create', protect, checkDbState, async (req, res) => {
  try {
    const { name } = req.body;

    const existingMembership = await FamilyMember.findOne({
      user: req.user._id,
      status: 'Active',
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'This account already belongs to another family.',
      });
    }

    const familyName = name ? name.trim() : `${req.user.username}'s Family`;
    const code = generateFamilyCode();

    const family = await Family.create({
      name: familyName,
      code,
      owner: req.user._id,
    });

    const ownerMember = await FamilyMember.create({
      family: family._id,
      user: req.user._id,
      name: req.user.username,
      email: req.user.email,
      role: 'Owner',
      status: 'Active',
    });

    await Activity.create({
      user: req.user._id,
      type: 'FAMILY_CREATED',
      details: `Created family "${family.name}" with code ${family.code}`,
    }).catch(() => {});

    res.status(201).json({ success: true, family, member: ownerMember });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create family.' });
  }
});

// @route   POST /api/family/join
router.post('/join', protect, checkDbState, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Family code is required.' });
    }

    const formattedCode = code.trim().toUpperCase();

    const existingMembership = await FamilyMember.findOne({
      user: req.user._id,
      status: 'Active',
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'This account already belongs to another family.',
      });
    }

    const family = await Family.findOne({ code: formattedCode });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Invalid Family Code. Please check and try again.' });
    }

    let memberReq = await FamilyMember.findOne({
      family: family._id,
      user: req.user._id,
    });

    if (memberReq) {
      if (memberReq.status === 'Active') {
        return res.status(400).json({ success: false, message: 'You are already a member of this family.' });
      }
      if (memberReq.status === 'Pending') {
        return res.status(400).json({ success: false, message: 'Your join request for this family is pending owner approval.' });
      }
      memberReq.status = 'Pending';
      await memberReq.save();
    } else {
      memberReq = await FamilyMember.create({
        family: family._id,
        user: req.user._id,
        name: req.user.username,
        email: req.user.email,
        role: 'Member',
        status: 'Pending',
      });
    }

    await Notification.create({
      recipient: family.owner,
      sender: req.user._id,
      family: family._id,
      type: 'JOIN_REQUEST',
      message: `User "${req.user.username}" requested to join your family "${family.name}".`,
    });

    res.json({
      success: true,
      message: 'Join request sent successfully! Awaiting owner approval.',
      member: memberReq,
    });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to join family.' });
  }
});

// @route   POST /api/family/cancel-request
router.post('/cancel-request', protect, checkDbState, async (req, res) => {
  try {
    const memberReq = await FamilyMember.findOneAndDelete({
      user: req.user._id,
      status: 'Pending',
    });

    if (!memberReq) {
      return res.status(404).json({ success: false, message: 'No pending join request found.' });
    }

    res.json({ success: true, message: 'Join request cancelled successfully.' });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to cancel join request.' });
  }
});

// @route   POST /api/family/leave
router.post('/leave', protect, checkDbState, async (req, res) => {
  try {
    const membership = await FamilyMember.findOne({
      user: req.user._id,
      status: 'Active',
    }).populate('family');

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Active family membership not found.' });
    }

    if (membership.role === 'Owner') {
      return res.status(400).json({
        success: false,
        message: 'Family Owner cannot leave. You can delete the family or transfer ownership.',
      });
    }

    await FamilyMember.findByIdAndDelete(membership._id);

    await Notification.create({
      recipient: membership.family.owner,
      sender: req.user._id,
      family: membership.family._id,
      type: 'MEMBER_LEFT',
      message: `Member "${req.user.username}" left your family "${membership.family.name}".`,
    });

    res.json({ success: true, message: 'You have left the family.' });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to leave family.' });
  }
});

// @route   POST /api/family/approve-request
router.post('/approve-request', protect, checkDbState, async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await FamilyMember.findById(requestId).populate('family');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Join request not found.' });
    }

    if (request.family.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can approve join requests.' });
    }

    request.status = 'Active';
    await request.save();

    await Notification.create({
      recipient: request.user,
      sender: req.user._id,
      family: request.family._id,
      type: 'REQUEST_ACCEPTED',
      message: `Your request to join family "${request.family.name}" was approved!`,
    });

    res.json({ success: true, message: 'Join request approved successfully.', member: request });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to approve join request.' });
  }
});

// @route   POST /api/family/reject-request
router.post('/reject-request', protect, checkDbState, async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await FamilyMember.findById(requestId).populate('family');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Join request not found.' });
    }

    if (request.family.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can reject join requests.' });
    }

    request.status = 'Rejected';
    await request.save();

    await Notification.create({
      recipient: request.user,
      sender: req.user._id,
      family: request.family._id,
      type: 'REQUEST_REJECTED',
      message: `Your request to join family "${request.family.name}" was declined.`,
    });

    res.json({ success: true, message: 'Join request rejected.' });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to reject join request.' });
  }
});

// @route   POST /api/family/regenerate-code
router.post('/regenerate-code', protect, checkDbState, async (req, res) => {
  try {
    const membership = await FamilyMember.findOne({ user: req.user._id, status: 'Active' }).populate('family');
    if (!membership || !membership.family) {
      return res.status(404).json({ success: false, message: 'Family not found.' });
    }

    if (membership.family.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can regenerate the Family Code.' });
    }

    const newCode = generateFamilyCode();
    const family = membership.family;
    family.code = newCode;
    await family.save();

    res.json({ success: true, code: newCode, message: 'Family code regenerated successfully!' });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to regenerate family code.' });
  }
});

// @route   DELETE /api/family/member/:id
router.delete('/member/:id', protect, checkDbState, async (req, res) => {
  try {
    const member = await FamilyMember.findById(req.params.id).populate('family');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const isOwner = member.family.owner.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Only the Family Owner can remove members.' });
    }

    if (member.role === 'Owner') {
      return res.status(400).json({ success: false, message: 'Family Owner cannot be removed.' });
    }

    await FamilyMember.findByIdAndDelete(member._id);

    await Notification.create({
      recipient: member.user,
      sender: req.user._id,
      family: member.family._id,
      type: 'MEMBER_REMOVED',
      message: `You were removed from family "${member.family.name}".`,
    });

    res.json({ success: true, message: 'Member removed from family successfully.' });
  } catch (err) {
    console.error('[Family Route Error]:', err.message);
    res.status(500).json({ success: false, message: 'Failed to remove member.' });
  }
});

export default router;
