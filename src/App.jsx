import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getSession, verifyCurrentSession, clearSession } from './utils/auth';
import useLocalStorage from './hooks/useLocalStorage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [theme, setTheme] = useLocalStorage('todoapp_theme', 'light');

  // Check for an existing login session on first load
  useEffect(() => {
    async function initSession() {
      const localSession = getSession();
      if (localSession) {
        setIsAuthenticated(true);
        setUser(localSession);
      }

      // Verify token with backend
      const verifiedUser = await verifyCurrentSession();
      if (verifiedUser) {
        setIsAuthenticated(true);
        setUser(verifiedUser);
      } else if (!localSession) {
        setIsAuthenticated(false);
        setUser(null);
      }
      setCheckingSession(false);
    }

    initSession();
  }, []);

  // Apply theme to the document root so CSS variables update globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogin = (loggedInUser) => {
    const session = getSession();
    const activeUser =
      session ||
      (typeof loggedInUser === 'object'
        ? loggedInUser
        : { username: loggedInUser });
    setUser(activeUser);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await clearSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Avoid a flash of the login page while session is being checked
  if (checkingSession) {
    return null;
  }

  return isAuthenticated ? (
    <Dashboard
      onLogout={handleLogout}
      user={user}
      theme={theme}
      setTheme={setTheme}
    />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;