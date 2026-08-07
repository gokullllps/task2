import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import HomeView from '../components/HomeView';
import TasksView from '../components/TasksView';
import ActivityView from '../components/ActivityView';
import FamilyView from '../components/FamilyView';
import ProfileView from '../components/ProfileView';
import SettingsView from '../components/SettingsView';
import api from '../utils/api';
import '../styles/dashboard.css';

const CalendarView = React.lazy(() => import('../components/CalendarView'));

export default function Dashboard({ onLogout, theme, setTheme, user }) {
  const [currentUserObj, setCurrentUserObj] = useState(
    typeof user === 'object' ? user : { username: user || 'User' }
  );

  const currentUsername = currentUserObj?.username || 'User';

  const [currentView, setCurrentView] = useState('home');
  const [todos, setTodos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [familyData, setFamilyData] = useState({
    hasFamily: false,
    isOwner: false,
    family: null,
    members: [],
    pendingRequests: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch todos, activities, family system, and notifications
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [todoRes, activityRes, familyRes, notifRes] = await Promise.allSettled([
        api.getTodos(),
        api.getActivities(30),
        api.getMyFamily(),
        api.getNotifications(),
      ]);

      if (todoRes.status === 'fulfilled' && todoRes.value.success && Array.isArray(todoRes.value.todos)) {
        setTodos(todoRes.value.todos);
      } else {
        setTodos([]);
      }

      if (activityRes.status === 'fulfilled' && activityRes.value.success && Array.isArray(activityRes.value.activities)) {
        setActivities(activityRes.value.activities);
      } else {
        setActivities([]);
      }

      if (familyRes.status === 'fulfilled' && familyRes.value.success) {
        setFamilyData({
          hasFamily: familyRes.value.hasFamily,
          isOwner: familyRes.value.isOwner,
          family: familyRes.value.family,
          members: familyRes.value.members || [],
          pendingRequests: familyRes.value.pendingRequests || [],
        });
      }

      if (notifRes.status === 'fulfilled' && notifRes.value.success) {
        setNotifications(notifRes.value.notifications || []);
        setUnreadCount(notifRes.value.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[Dashboard] Could not fetch data from API server:', err.message);
      setError('Operating in offline mode or backend server disconnected.');
    } finally {
      setLoading(false);
    }
  }, [currentUsername]);

  const fetchFamilySystem = useCallback(async () => {
    try {
      const familyRes = await api.getMyFamily();
      if (familyRes.success) {
        setFamilyData({
          hasFamily: familyRes.hasFamily,
          isOwner: familyRes.isOwner,
          family: familyRes.family,
          members: familyRes.members || [],
          pendingRequests: familyRes.pendingRequests || [],
        });
      }
    } catch (err) {
      console.warn('[Dashboard] Could not fetch family system:', err.message);
    }
  }, []);

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchData();
    } catch (err) {
      console.error('Notification mark read error:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchData();
    } catch (err) {
      console.error('Mark all notifications error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle Account Switching in-memory without page refresh
  const handleSwitchUser = (selectedUser) => {
    setCurrentUserObj(selectedUser);
    setTodos([]);
    setActivities([]);
    setFamilyData({
      hasFamily: false,
      isOwner: false,
      family: null,
      members: [],
      pendingRequests: [],
    });
    setNotifications([]);
    setUnreadCount(0);
    setTimeout(() => {
      fetchData();
    }, 100);
  };

  const handleAddAccount = () => {
    onLogout();
  };

  // Handle Create Todo
  async function handleAddTodo(title, description, extra = {}) {
    try {
      const payload = {
        title,
        description,
        priority: extra.priority || 'medium',
        assignedToName: extra.assignedToName || 'Unassigned',
        assignedToMember: extra.assignedToMember || null,
      };
      const res = await api.createTodo(payload);
      if (res.success && res.todo) {
        setTodos((prev) => [res.todo, ...prev]);
        fetchData();
      }
    } catch (err) {
      console.error('[Dashboard] Create todo error:', err);
      const fallbackTodo = {
        id: Date.now().toString(),
        title,
        description,
        priority: extra.priority || 'medium',
        assignedToName: extra.assignedToName || 'Unassigned',
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos((prev) => [fallbackTodo, ...prev]);
    }
  }

  // Handle Update Todo
  async function handleUpdateTodo(id, updates) {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id || todo._id === id ? { ...todo, ...updates } : todo))
    );
    try {
      await api.updateTodo(id, updates);
    } catch (err) {
      console.error('[Dashboard] Update todo error:', err);
    }
  }

  // Handle Delete Todo
  async function handleDeleteTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id && todo._id !== id));
    try {
      await api.deleteTodo(id);
    } catch (err) {
      console.error('[Dashboard] Delete todo error:', err);
    }
  }

  // Handle Toggle Completion
  async function handleToggleComplete(id) {
    const targetTodo = todos.find((t) => t.id === id || t._id === id);
    if (!targetTodo) return;

    const newCompleted = !targetTodo.completed;
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id || todo._id === id ? { ...todo, completed: newCompleted } : todo
      )
    );

    try {
      await api.updateTodo(id, { completed: newCompleted });
      fetchData();
    } catch (err) {
      console.error('[Dashboard] Toggle complete error:', err);
    }
  }

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="dashboard-layout">
      <Sidebar
        user={currentUserObj}
        onLogout={onLogout}
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        totalCount={totalCount}
        completedCount={completedCount}
        pendingCount={pendingCount}
      />

      <div className="dashboard-body">
        <Navbar
          onLogout={onLogout}
          theme={theme}
          setTheme={setTheme}
          user={currentUserObj}
          todos={todos}
          currentView={currentView}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSwitchUser={handleSwitchUser}
          onAddAccount={handleAddAccount}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        />

        <main className="dashboard-main">
          <div className="dashboard-container">
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: '20px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                }}
              >
                Offline mode active.
              </div>
            )}

            {/* View Router */}
            {currentView === 'home' && (
              <HomeView
                todos={todos}
                user={currentUserObj}
                onNavigateToTasks={() => setCurrentView('tasks')}
                onNavigateToActivity={() => setCurrentView('activity')}
              />
            )}

            {currentView === 'tasks' && (
              <TasksView
                todos={todos}
                familyMembers={familyData.members}
                onAddTodo={handleAddTodo}
                onUpdateTodo={handleUpdateTodo}
                onDeleteTodo={handleDeleteTodo}
                onToggleComplete={handleToggleComplete}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            )}

            {currentView === 'calendar' && (
              <Suspense fallback={<div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Calendar Module...</div>}>
                <CalendarView
                  todos={todos}
                  familyMembers={familyData.members}
                  user={currentUserObj}
                  onAddTodo={handleAddTodo}
                  onUpdateTodo={handleUpdateTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onToggleComplete={handleToggleComplete}
                />
              </Suspense>
            )}

            {currentView === 'activity' && (
              <ActivityView activities={activities} onRefresh={fetchData} />
            )}

            {currentView === 'family' && (
              <FamilyView
                user={currentUserObj}
                todos={todos}
                familySystemData={familyData}
                onRefreshFamily={fetchFamilySystem}
              />
            )}

            {currentView === 'profile' && (
              <ProfileView
                user={currentUserObj}
                todos={todos}
                onUpdateUser={setCurrentUserObj}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                user={currentUserObj}
                theme={theme}
                setTheme={setTheme}
                onLogout={onLogout}
                todos={todos}
                onUpdateUser={setCurrentUserObj}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}