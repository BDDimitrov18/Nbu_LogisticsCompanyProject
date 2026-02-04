// Authentication Service

import { fetchWithoutAuth } from './api';

export const authService = {
  // Login user
  login: async (username, password) => {
    const response = await fetchWithoutAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response;
  },

  // Register new user
  register: async (userData) => {
    const response = await fetchWithoutAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  },

  // Fetch companies without authentication (for registration page)
  getCompaniesPublic: async () => {
    const response = await fetchWithoutAuth('/companies', {
      method: 'GET',
    });
    return response;
  },
};

export default authService;
