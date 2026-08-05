import React, { useState, useMemo } from 'react';
import { SearchInput } from './ui/Input';
import { Chip } from './ui/Badge';
import GlassCard from './ui/GlassCard';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import { EmptyTasksIllustration, EmptySearchIllustration } from './EmptyStates';

export default function TasksView({
  todos,
  familyMembers = [],
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
  searchTerm,
  setSearchTerm,
}) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const searchMatch =
        (todo.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.assignedToName || todo.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      switch (activeTab) {
        case 'pending':
          return !todo.completed;
        case 'completed':
          return todo.completed;
        case 'high':
          return todo.priority === 'high';
        case 'medium':
          return todo.priority === 'medium';
        case 'low':
          return todo.priority === 'low';
        default:
          return true;
      }
    });
  }, [todos, searchTerm, activeTab]);

  const tabs = [
    { key: 'all', label: 'All Tasks', count: todos.length },
    { key: 'pending', label: 'Pending', count: todos.filter((t) => !t.completed).length },
    { key: 'completed', label: 'Completed', count: todos.filter((t) => t.completed).length },
    { key: 'high', label: 'High Priority', count: todos.filter((t) => t.priority === 'high').length },
    { key: 'medium', label: 'Medium Priority', count: todos.filter((t) => t.priority === 'medium').length },
    { key: 'low', label: 'Low Priority', count: todos.filter((t) => t.priority === 'low').length },
  ];

  return (
    <div className="tasks-view-container">
      {/* Create Task Form with Family Member Selector */}
      <TodoForm onAddTodo={onAddTodo} familyMembers={familyMembers} />

      {/* Search & Sub-Filter Bar */}
      <div className="tasks-control-bar">
        <SearchInput value={searchTerm} onChange={setSearchTerm} />

        <div className="tasks-tab-bar" role="tablist">
          {tabs.map((tab) => (
            <Chip
              key={tab.key}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="tab-count-badge">{tab.count}</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* Task List / Vector Empty States */}
      {filteredTodos.length === 0 ? (
        <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
          {searchTerm ? (
            <>
              <EmptySearchIllustration size={100} />
              <h3 style={{ marginTop: '16px', fontSize: '1.1rem', fontWeight: 700 }}>No matching tasks found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                No tasks match your search query "{searchTerm}".
              </p>
            </>
          ) : (
            <>
              <EmptyTasksIllustration size={100} />
              <h3 style={{ marginTop: '16px', fontSize: '1.1rem', fontWeight: 700 }}>No tasks in this view</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                Your task list for this category is currently empty. Use the form above to add a new task.
              </p>
            </>
          )}
        </GlassCard>
      ) : (
        <TodoList
          todos={filteredTodos}
          onUpdateTodo={onUpdateTodo}
          onDeleteTodo={onDeleteTodo}
          onToggleComplete={onToggleComplete}
        />
      )}
    </div>
  );
}
