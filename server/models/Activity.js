import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'TODO_CREATED',
        'TODO_UPDATED',
        'TODO_DELETED',
        'TODO_COMPLETED',
        'FAMILY_CREATED',
        'MEMBER_ADDED',
        'FAMILY_NICKNAME_UPDATED',
        'FAMILY_MEMBER_ADDED',
        'FAMILY_MEMBER_UPDATED',
        'FAMILY_MEMBER_DELETED',
      ],
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
