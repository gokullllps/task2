import express from 'express';
import Todo from '../models/Todo.js';
import Activity from '../models/Activity.js';
import FamilyMember from '../models/FamilyMember.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all todo routes
router.use(protect);

const formatTodo = (t) => ({
  id: t._id.toString(),
  _id: t._id.toString(),
  user: t.user ? t.user.toString() : null,
  title: t.title,
  description: t.description,
  completed: t.completed,
  priority: t.priority,
  category: t.category,
  dueDate: t.dueDate,
  assignedToMember: t.assignedToMember ? t.assignedToMember.toString() : null,
  assignedToName: t.assignedToName || t.assignedTo || '',
  assignedTo: t.assignedTo || t.assignedToName || '',
  assignedUserId: t.assignedUserId ? t.assignedUserId.toString() : null,
  assignedUsername: t.assignedUsername || '',
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

// @route   GET /api/todos
// @desc    Get all todos for logged-in user (created by or assigned to user)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search, page, limit } = req.query;

    const userOrAssignCriteria = [
      { user: req.user._id },
      { assignedUserId: req.user._id },
      { assignedUsername: req.user.username },
      { assignedToName: req.user.username },
      { assignedTo: req.user.username },
    ];

    let query = { $or: userOrAssignCriteria };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $and: [
          { $or: userOrAssignCriteria },
          {
            $or: [
              { title: searchRegex },
              { description: searchRegex },
              { category: searchRegex },
              { assignedToName: searchRegex },
              { assignedUsername: searchRegex },
            ],
          },
        ],
      };
    }

    let todosQuery = Todo.find(query).sort({ createdAt: -1 });

    const totalCount = await Todo.countDocuments(query);

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      todosQuery = todosQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const todos = await todosQuery;
    const formattedTodos = todos.map(formatTodo);

    return res.json({
      success: true,
      count: formattedTodos.length,
      totalCount,
      page: page ? parseInt(page, 10) : 1,
      totalPages: limit ? Math.ceil(totalCount / parseInt(limit, 10)) : 1,
      todos: formattedTodos,
    });
  } catch (error) {
    console.error('[Get Todos Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/todos
// @desc    Create a new todo
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      category,
      dueDate,
      assignedToName,
      assignedToMember,
      assignedTo,
      assignedUserId,
      assignedUsername,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    let finalAssignedToMember = assignedToMember || null;
    let finalAssignedToName = assignedToName || assignedTo || '';
    let finalAssignedUserId = assignedUserId || null;
    let finalAssignedUsername = assignedUsername || finalAssignedToName || '';

    // Look up FamilyMember & User if assignedToName is provided
    if (finalAssignedToName && finalAssignedToName !== 'Unassigned') {
      const member = await FamilyMember.findOne({
        name: new RegExp(`^${finalAssignedToName.trim()}$`, 'i'),
      });
      if (member) {
        finalAssignedToMember = member._id;
        finalAssignedUserId = member.user;
        finalAssignedUsername = member.name;
        finalAssignedToName = member.name;
      } else {
        const targetUser = await User.findOne({
          username: new RegExp(`^${finalAssignedToName.trim()}$`, 'i'),
        });
        if (targetUser) {
          finalAssignedUserId = targetUser._id;
          finalAssignedUsername = targetUser.username;
          finalAssignedToName = targetUser.username;
        }
      }
    }

    const todo = await Todo.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || null,
      assignedToMember: finalAssignedToMember,
      assignedToName: finalAssignedToName,
      assignedTo: finalAssignedToName,
      assignedUserId: finalAssignedUserId,
      assignedUsername: finalAssignedUsername,
    });

    // Activity tracking
    await Activity.create({
      user: req.user._id,
      type: 'TODO_CREATED',
      details: `Created task: "${todo.title}"${finalAssignedToName && finalAssignedToName !== 'Unassigned' ? ` (Assigned to ${finalAssignedToName})` : ''}`,
    }).catch(() => {});

    // Notification if assigned to another user
    if (finalAssignedUserId && finalAssignedUserId.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: finalAssignedUserId,
        sender: req.user._id,
        type: 'TASK_ASSIGNED',
        message: `Task "${todo.title}" was assigned to you by ${req.user.username}.`,
      }).catch(() => {});
    }

    return res.status(201).json({ success: true, todo: formatTodo(todo) });
  } catch (error) {
    console.error('[Create Todo Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo (creator or assigned user)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user._id },
        { assignedUserId: req.user._id },
        { assignedUsername: req.user.username },
        { assignedToName: req.user.username },
        { assignedTo: req.user.username },
      ],
    });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    const wasCompleted = todo.completed;

    if (req.body.title !== undefined) todo.title = req.body.title.trim();
    if (req.body.description !== undefined) todo.description = req.body.description.trim();
    if (req.body.completed !== undefined) todo.completed = req.body.completed;
    if (req.body.priority !== undefined) todo.priority = req.body.priority;
    if (req.body.category !== undefined) todo.category = req.body.category;
    if (req.body.dueDate !== undefined) todo.dueDate = req.body.dueDate;
    if (req.body.assignedToName !== undefined) todo.assignedToName = req.body.assignedToName;
    if (req.body.assignedTo !== undefined) todo.assignedTo = req.body.assignedTo;
    if (req.body.assignedUserId !== undefined) todo.assignedUserId = req.body.assignedUserId;
    if (req.body.assignedUsername !== undefined) todo.assignedUsername = req.body.assignedUsername;
    if (req.body.assignedToMember !== undefined) todo.assignedToMember = req.body.assignedToMember;

    const updatedTodo = await todo.save();

    // Track Activity & Send Notification
    if (req.body.completed !== undefined && req.body.completed !== wasCompleted) {
      const activityType = req.body.completed ? 'TODO_COMPLETED' : 'TODO_UPDATED';
      const actionText = req.body.completed ? 'Completed' : 'Marked pending';

      await Activity.create({
        user: req.user._id,
        type: activityType,
        details: `${actionText} task: "${updatedTodo.title}"`,
      }).catch(() => {});

      // Notify creator if completed by assigned member
      if (updatedTodo.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: updatedTodo.user,
          sender: req.user._id,
          type: 'TASK_COMPLETED',
          message: `Task "${updatedTodo.title}" was ${req.body.completed ? 'completed' : 'updated'} by ${req.user.username}.`,
        }).catch(() => {});
      }
    } else {
      await Activity.create({
        user: req.user._id,
        type: 'TODO_UPDATED',
        details: `Updated task: "${updatedTodo.title}"`,
      }).catch(() => {});
    }

    return res.json({ success: true, todo: formatTodo(updatedTodo) });
  } catch (error) {
    console.error('[Update Todo Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo (creator or assigned user)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user._id },
        { assignedUserId: req.user._id },
        { assignedUsername: req.user.username },
        { assignedToName: req.user.username },
      ],
    });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    const todoTitle = todo.title;
    await todo.deleteOne();

    await Activity.create({
      user: req.user._id,
      type: 'TODO_DELETED',
      details: `Deleted task: "${todoTitle}"`,
    }).catch(() => {});

    return res.json({ success: true, message: 'Todo deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('[Delete Todo Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
