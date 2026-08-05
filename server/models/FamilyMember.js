import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Member email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  role: {
    type: String,
    enum: ['Owner', 'Admin', 'Member'],
    default: 'Member',
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Rejected'],
    default: 'Active',
  },
  avatar: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
export default FamilyMember;
