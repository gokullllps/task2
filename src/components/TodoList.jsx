import TodoItem from './TodoItem';

export default function TodoList({ todos, onUpdateTodo, onDeleteTodo, onToggleComplete }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-icon">🗒️</p>
        <p className="empty-text">No tasks found. Add one above to get started!</p>
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