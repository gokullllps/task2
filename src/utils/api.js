const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl.replace(/\/+$/, '') : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const TOKEN_KEY = 'todoapp_jwt_token';
const USER_INFO_KEY = 'todoapp_user_info';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
};

/**
 * Custom fetch wrapper to handle authorization headers, 401 handling, and JSON responses
 */
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      removeToken();
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.message ||
        data.error ||
        (data.errors
          ? Array.isArray(data.errors)
            ? data.errors.join(', ')
            : Object.values(data.errors)
                .map((e) => e.message || e)
                .join(', ')
          : null) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
      console.warn('[API Client] Server connection error:', error.message);
      const friendlyError = new Error('Unable to connect to server. Please check your internet connection or backend server status.');
      friendlyError.isNetworkError = true;
      throw friendlyError;
    }
    throw error;
  }
}

// API Endpoints methods
export const api = {
  // Auth endpoints
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  sendRegisterOtp: (userData) => request('/auth/send-register-otp', { method: 'POST', body: JSON.stringify(userData) }),
  verifyRegisterOtp: (data) => request('/auth/verify-register-otp', { method: 'POST', body: JSON.stringify(data) }),
  sendForgotOtp: (email) => request('/auth/send-forgot-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyForgotOtp: (data) => request('/auth/verify-forgot-otp', { method: 'POST', body: JSON.stringify(data) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // Todo endpoints
  getTodos: (search = '') => request(`/todos${search ? `?search=${encodeURIComponent(search)}` : ''}`, { method: 'GET' }),
  createTodo: (todoData) => request('/todos', { method: 'POST', body: JSON.stringify(todoData) }),
  updateTodo: (id, updates) => request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteTodo: (id) => request(`/todos/${id}`, { method: 'DELETE' }),

  // Activity endpoints
  getActivities: (limit = 20) => request(`/activities?limit=${limit}`, { method: 'GET' }),

  // Family System Endpoints
  getMyFamily: () => request('/family/my-family', { method: 'GET' }),
  createFamily: (name) => request('/family/create', { method: 'POST', body: JSON.stringify({ name }) }),
  joinFamily: (code) => request('/family/join', { method: 'POST', body: JSON.stringify({ code }) }),
  cancelJoinRequest: () => request('/family/cancel-request', { method: 'POST' }),
  leaveFamily: () => request('/family/leave', { method: 'POST' }),
  approveJoinRequest: (requestId) => request('/family/approve-request', { method: 'POST', body: JSON.stringify({ requestId }) }),
  rejectJoinRequest: (requestId) => request('/family/reject-request', { method: 'POST', body: JSON.stringify({ requestId }) }),
  regenerateFamilyCode: () => request('/family/regenerate-code', { method: 'POST' }),
  updateFamilyNickname: (nickname) => request('/family/nickname', { method: 'PUT', body: JSON.stringify({ nickname }) }),
  addFamilyMember: (memberData) => request('/family/add-member', { method: 'POST', body: JSON.stringify(memberData) }),
  updateFamilyMember: (id, updates) => request(`/family/member/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  transferFamilyOwnership: (newOwnerMemberId) => request('/family/transfer-ownership', { method: 'POST', body: JSON.stringify({ newOwnerMemberId }) }),
  deleteFamily: (id) => request(`/family/${id}`, { method: 'DELETE' }),
  removeFamilyMember: (id) => request(`/family/member/${id}`, { method: 'DELETE' }),

  // Notifications Endpoints
  getNotifications: () => request('/notifications', { method: 'GET' }),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
};

export default api;
