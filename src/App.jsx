import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getSession, clearSession } from './utils/auth';
import useLocalStorage from './hooks/useLocalStorage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [theme, setTheme] = useLocalStorage('todoapp_theme', 'light');

  // Check for an existing login session on first load
  useEffect(() => {
    const session = getSession();
    setIsAuthenticated(!!session);
    setCheckingSession(false);
  }, []);

  // Apply theme to the document root so CSS variables update globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
  };

  // Avoid a flash of the login page while session is being checked
  if (checkingSession) {
    return null;
  }

  return isAuthenticated ? (
    <Dashboard onLogout={handleLogout} theme={theme} setTheme={setTheme} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;