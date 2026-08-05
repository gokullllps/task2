import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Todo title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignedToMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      default: null,
    },
    assignedToName: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

const Todo = mongoose.model('Todo', todoSchema);
export default Todo;
