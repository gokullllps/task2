import React, { useState } from 'react';
import { validateTodo } from '../utils/validation';
import { PrimaryButton, SecondaryButton, IconButton } from './ui/Button';
import { PriorityBadge } from './ui/Badge';
import { EditIcon, TrashIcon, CheckIcon, CalendarIcon, UserIcon } from './Icons';

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

    onUpdateTodo(todo.id || todo._id, { title: title.trim(), description: description.trim() });
    setIsEditing(false);
  }

  function handleCancel() {
    setTitle(todo.title);
    setDescription(todo.description);
    setErrors({});
    setIsEditing(false);
  }

  const formattedDate = new Date(todo.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const assignedMemberName = todo.assignedToName || todo.assignedTo || null;

  if (isEditing) {
    return (
      <div className="todo-card todo-card-editing">
        <div className="form-group">
          <label>Edit Title</label>
          <input
            className={`todo-input ${errors.title ? 'input-error' : ''}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Edit Description</label>
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
          <PrimaryButton size="sm" onClick={handleSave}>Save Changes</PrimaryButton>
          <SecondaryButton size="sm" onClick={handleCancel}>Cancel</SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-card ${todo.completed ? 'todo-card-completed' : ''}`}>
      <div className="todo-card-main">
        <div className="todo-checkbox-wrapper">
          <input
            type="checkbox"
            id={`todo-check-${todo.id || todo._id}`}
            className="todo-checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id || todo._id)}
            aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
          <CheckIcon size={14} className="checkbox-icon" />
        </div>

        <div className="todo-card-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 className="todo-card-title" style={{ margin: 0 }}>{todo.title}</h3>
            {todo.priority && <PriorityBadge priority={todo.priority} />}
            {assignedMemberName && assignedMemberName !== 'Unassigned' && (
              <span className="profile-joined-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                <UserIcon size={10} />
                <span>{assignedMemberName}</span>
              </span>
            )}
          </div>
          {todo.description && <p className="todo-card-description">{todo.description}</p>}
          <span className="todo-card-date">
            <CalendarIcon size={12} />
            <span>{formattedDate}</span>
          </span>
        </div>
      </div>

      <div className="todo-card-actions">
        <IconButton icon={EditIcon} onClick={() => setIsEditing(true)} title="Edit Task" ariaLabel="Edit Task" />
        <IconButton icon={TrashIcon} danger onClick={() => onDeleteTodo(todo.id || todo._id)} title="Delete Task" ariaLabel="Delete Task" />
      </div>
    </div>
  );
}