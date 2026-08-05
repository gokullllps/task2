import { useState } from 'react';
import { validateTodo } from '../utils/validation';

export default function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateTodo(title, description);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onAddTodo(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setErrors({});
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <div className="todo-form-row">
        <div className="form-group">
          <input
            type="text"
            className={`todo-input ${errors.title ? 'input-error' : ''}`}
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            className={`todo-input ${errors.description ? 'input-error' : ''}`}
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <span className="error-text">{errors.description}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          + Add Task
        </button>
      </div>
    </form>
  );
}