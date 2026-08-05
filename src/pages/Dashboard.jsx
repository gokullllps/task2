import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import useLocalStorage from '../hooks/useLocalStorage';
import '../styles/dashboard.css';

export default function Dashboard({ onLogout, theme, setTheme }) {
  const [todos, setTodos] = useLocalStorage('todoapp_todos', []);
  const [searchTerm, setSearchTerm] = useState('');

  function handleAddTodo(title, description) {
    const newTodo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
  }

  function handleUpdateTodo(id, updates) {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    );
  }

  function handleDeleteTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function handleToggleComplete(id) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  // Real-time filtering by title, memoized to avoid recomputation on every render
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) =>
      todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [todos, searchTerm]);

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="dashboard">
      <Navbar onLogout={onLogout} theme={theme} setTheme={setTheme} />

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div>
              <h2 className="dashboard-title">My Tasks</h2>
              <p className="dashboard-stats">
                {completedCount} of {totalCount} completed
              </p>
            </div>
          </div>

          <TodoForm onAddTodo={handleAddTodo} />

          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <TodoList
            todos={filteredTodos}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </main>
    </div>
  );
}