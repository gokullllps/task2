import React, { useState, useMemo } from 'react';
import { validateTodo } from '../utils/validation';
import { PrimaryButton } from './ui/Button';
import PremiumSelect from './ui/Select';
import { PlusIcon, TaskIcon } from './Icons';

export default function TodoForm({ onAddTodo, familyMembers = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedToName, setAssignedToName] = useState('Unassigned');
  const [errors, setErrors] = useState({});

  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const assignOptions = useMemo(() => {
    const opts = [{ value: 'Unassigned', label: 'Unassigned' }];
    familyMembers.forEach((member) => {
      opts.push({
        value: member.name,
        label: `${member.name} (${member.role})`,
      });
    });
    return opts;
  }, [familyMembers]);

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateTodo(title, description);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const selectedMember = familyMembers.find((m) => m.name === assignedToName);
    onAddTodo(title.trim(), description.trim(), {
      priority,
      assignedToName,
      assignedToMember: selectedMember ? selectedMember._id || selectedMember.id : null,
    });

    setTitle('');
    setDescription('');
    setErrors({});
  }

  return (
    <form className="todo-form glass-panel" onSubmit={handleSubmit} noValidate style={{ padding: '24px', marginBottom: '24px' }}>
      <div className="todo-form-title" style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <TaskIcon size={18} />
        <span>Create New Task</span>
      </div>

      <div className="todo-form-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1.8fr auto', gap: '12px', alignItems: 'end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Title</label>
          <input
            type="text"
            className={`todo-input ${errors.title ? 'input-error' : ''}`}
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Description</label>
          <input
            type="text"
            className={`todo-input ${errors.description ? 'input-error' : ''}`}
            placeholder="Description or context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <span className="error-text">{errors.description}</span>
          )}
        </div>

        {/* Priority PremiumSelect */}
        <PremiumSelect
          label="Priority"
          options={priorityOptions}
          value={priority}
          onChange={(val) => setPriority(val)}
        />

        {/* Assign To PremiumSelect */}
        <PremiumSelect
          label="Assign To"
          options={assignOptions}
          value={assignedToName}
          onChange={(val) => setAssignedToName(val)}
        />

        <div style={{ marginBottom: 0 }}>
          <PrimaryButton type="submit" icon={PlusIcon}>
            Add Task
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}