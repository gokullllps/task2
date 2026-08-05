import ThemeToggle from './ThemeToggle';

export default function Navbar({ onLogout, theme, setTheme }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">
          <span className="navbar-icon">📝</span> Todo App
        </h1>
        <div className="navbar-actions">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button className="btn btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}