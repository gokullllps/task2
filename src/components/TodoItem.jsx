import { useState } from 'react';
import { validateTodo } from '../utils/validation';

export default function TodoItem({ todo, onUpdateTodo, onDeleteTodo, onToggleComplete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [errors, setErrors] = useState({});

  function handleSave() {
    const validationErrors = validateTodo(title, description);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onUpdateTodo(todo.id, { title: title.trim(), description: description.trim() });
    setIsEditing(false);
  }

  function handleCancel() {
    setTitle(todo.title);
    setDescription(todo.description);
    setErrors({});
    setIsEditing(false);
  }

  const formattedDate = new Date(todo.createdAt).toLocaleString();

  if (isEditing) {
    return (
      <div className="todo-card todo-card-editing">
        <div className="form-group">
          <input
            className={`todo-input ${errors.title ? 'input-error' : ''}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <textarea
            className={`todo-textarea ${errors.description ? 'input-error' : ''}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
          />
          {errors.description && (
            <span className="error-text">{errors.description}</span>
          )}
        </div>

        <div className="todo-card-actions">
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-card ${todo.completed ? 'todo-card-completed' : ''}`}>
      <div className="todo-card-main">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={() => onToggleComplete(todo.id)}
          aria-label="Mark complete"
        />
        <div className="todo-card-content">
          <h3 className="todo-card-title">{todo.title}</h3>
          <p className="todo-card-description">{todo.description}</p>
          <span className="todo-card-date">Created: {formattedDate}</span>
        </div>
      </div>

      <div className="todo-card-actions">
        <button
          className="btn btn-icon"
          onClick={() => setIsEditing(true)}
          aria-label="Edit task"
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="btn btn-icon btn-danger"
          onClick={() => onDeleteTodo(todo.id)}
          aria-label="Delete task"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}