import express from 'express';
import Todo from '../models/Todo.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all todo routes
router.use(protect);

// @route   GET /api/todos
// @desc    Get all todos for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { user: req.user._id };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 });

    // Format output with virtual 'id' for frontend compatibility
    const formattedTodos = todos.map((t) => ({
      id: t._id.toString(),
      _id: t._id.toString(),
      title: t.title,
      description: t.description,
      completed: t.completed,
      priority: t.priority,
      category: t.category,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.json({ success: true, count: formattedTodos.length, todos: formattedTodos });
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
    const { title, description, priority, category, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const todo = await Todo.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || null,
    });

    // Track activity
    await Activity.create({
      user: req.user._id,
      type: 'TODO_CREATED',
      details: `Created task: "${todo.title}"`,
    });

    const formatted = {
      id: todo._id.toString(),
      _id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };

    return res.status(201).json({ success: true, todo: formatted });
  } catch (error) {
    console.error('[Create Todo Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

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

    const updatedTodo = await todo.save();

    // Track Activity based on completion status or update
    if (req.body.completed !== undefined && req.body.completed !== wasCompleted) {
      const activityType = req.body.completed ? 'TODO_COMPLETED' : 'TODO_UPDATED';
      const actionText = req.body.completed ? 'Completed' : 'Marked pending';
      await Activity.create({
        user: req.user._id,
        type: activityType,
        details: `${actionText} task: "${updatedTodo.title}"`,
      });
    } else {
      await Activity.create({
        user: req.user._id,
        type: 'TODO_UPDATED',
        details: `Updated task: "${updatedTodo.title}"`,
      });
    }

    const formatted = {
      id: updatedTodo._id.toString(),
      _id: updatedTodo._id.toString(),
      title: updatedTodo.title,
      description: updatedTodo.description,
      completed: updatedTodo.completed,
      priority: updatedTodo.priority,
      category: updatedTodo.category,
      dueDate: updatedTodo.dueDate,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
    };

    return res.json({ success: true, todo: formatted });
  } catch (error) {
    console.error('[Update Todo Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    const todoTitle = todo.title;
    await todo.deleteOne();

    // Track activity
    await Activity.create({
      user: req.user._id,
      type: 'TODO_DELETED',
      details: `Deleted task: "${todoTitle}"`,
    });

    return res.json({ success: true, message: 'Todo deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('[Delete Todo Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
