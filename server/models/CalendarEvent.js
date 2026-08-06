import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isAllDay: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    color: {
      type: String,
      default: '#10b981',
    },
  },
  { timestamps: true }
);

calendarEventSchema.index({ user: 1, startDate: 1 });
calendarEventSchema.index({ family: 1, startDate: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
