import React from 'react';
import TodoItem from './TodoItem';
import { EmptyTasksIcon } from './Icons';

export default function TodoList({ todos, onUpdateTodo, onDeleteTodo, onToggleComplete }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrapper">
          <EmptyTasksIcon size={38} />
        </div>
        <h3 className="empty-title">No tasks found</h3>
        <p className="empty-text">Your list is clear. Add a new task above to get started!</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdateTodo={onUpdateTodo}
          onDeleteTodo={onDeleteTodo}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
}