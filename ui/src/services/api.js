// API Configuration and Base Fetch Wrapper

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5128/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Base fetch wrapper with authentication
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    // Only redirect if not already on login or register page to prevent infinite loop
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
    throw new Error('Сесията е изтекла. Моля, влезте отново.');
  }

  // Handle no content responses
  if (response.status === 204) {
    return null;
  }

  // Try to parse JSON response
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || data.Message || 'Възникна грешка');
      error.status = response.status;
      throw error;
    }

    return data;
  }

  if (!response.ok) {
    const error = new Error('Възникна грешка');
    error.status = response.status;
    throw error;
  }

  return null;
};

// HTTP methods
export const api = {
  get: (endpoint) => fetchWithAuth(endpoint, { method: 'GET' }),

  post: (endpoint, data) => fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  put: (endpoint, data) => fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (endpoint) => fetchWithAuth(endpoint, { method: 'DELETE' }),
};

// Auth-specific fetch (no token required)
export const fetchWithoutAuth = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || data.Message || 'Възникна грешка');
      error.status = response.status;
      throw error;
    }

    return data;
  }

  if (!response.ok) {
    const error = new Error('Възникна грешка');
    error.status = response.status;
    throw error;
  }

  return null;
};

export default api;
