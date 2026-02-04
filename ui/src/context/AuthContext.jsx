import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { employeesService, clientsService } from '../services/dataService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Decode JWT token to get payload
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [employeeRecords, setEmployeeRecords] = useState([]); // All employee records for user
  const [clientRecords, setClientRecords] = useState([]); // All client records for user
  const [loading, setLoading] = useState(true);

  // Fetch user's roles from backend
  const fetchUserRoles = useCallback(async (userId) => {
    try {
      const [employees, clients] = await Promise.all([
        employeesService.getByUser(userId).catch(() => []),
        clientsService.getByUser(userId).catch(() => [])
      ]);

      const empArray = Array.isArray(employees) ? employees : (employees ? [employees] : []);
      const clientArray = Array.isArray(clients) ? clients : (clients ? [clients] : []);

      setEmployeeRecords(empArray);
      setClientRecords(clientArray);

      return { employees: empArray, clients: clientArray };
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return { employees: [], clients: [] };
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('currentUser');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData.user);
          setEmployeeRecords(userData.employees || []);
          setClientRecords(userData.clients || []);

          // Refresh roles from backend
          if (userData.user?.id) {
            await fetchUserRoles(userData.user.id);
          }
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, [fetchUserRoles]);

  const login = async (username, password) => {
    try {
      // Call login API
      const response = await authService.login(username, password);

      if (!response.token) {
        return { success: false, message: 'Невалиден отговор от сървъра' };
      }

      // Save token
      localStorage.setItem('token', response.token);

      // Decode token to get user info
      const tokenPayload = decodeToken(response.token);
      if (!tokenPayload) {
        localStorage.removeItem('token');
        return { success: false, message: 'Грешка при обработка на токена' };
      }

      // Get user info from token claims
      const userId = parseInt(
        tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      );
      const userUsername = tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      const userEmail = tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      const userName = tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || userUsername;

      // Create user object from token
      const user = {
        id: userId,
        username: userUsername,
        email: userEmail,
        name: userName,
      };

      // Fetch user's roles from backend
      const { employees, clients } = await fetchUserRoles(userId);

      // Save to state and localStorage
      const userData = { user, employees, clients };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      return { success: false, message: error.message || 'Грешка при вход' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setEmployeeRecords([]);
    setClientRecords([]);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  const register = async (userData) => {
    try {
      // Call register API
      await authService.register({
        name: userData.name,
        username: userData.username,
        password: userData.password,
        phone: userData.phone,
        email: userData.email,
        companyId: parseInt(userData.companyId, 10),
      });

      // After successful registration, log the user in
      return await login(userData.username, userData.password);
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message || 'Грешка при регистрация' };
    }
  };

  // Refresh user's roles (call after creating/deleting company associations)
  const refreshRoles = async () => {
    if (currentUser?.id) {
      const { employees, clients } = await fetchUserRoles(currentUser.id);
      const userData = { user: currentUser, employees, clients };
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  };

  // Helper: Check if user is admin of a specific company
  const isAdminOfCompany = (companyId) => {
    const id = parseInt(companyId);
    return employeeRecords.some(e => parseInt(e.companyId) === id && (e.role === 'Admin' || e.role === 2));
  };

  // Helper: Check if user is admin of ANY company
  const isAdminOfAnyCompany = () => {
    return employeeRecords.some(e => e.role === 'Admin' || e.role === 2);
  };

  // Helper: Check if user is employee of a specific company
  const isEmployeeOfCompany = (companyId) => {
    const id = parseInt(companyId);
    return employeeRecords.some(e => parseInt(e.companyId) === id);
  };

  // Helper: Check if user is client of a specific company
  const isClientOfCompany = (companyId) => {
    const id = parseInt(companyId);
    return clientRecords.some(c => parseInt(c.companyId) === id);
  };

  // Helper: Check if user is associated with a company (employee OR client)
  const isAssociatedWithCompany = (companyId) => {
    return isEmployeeOfCompany(companyId) || isClientOfCompany(companyId);
  };

  // Helper: Get user's role in a specific company
  const getRoleInCompany = (companyId) => {
    const id = parseInt(companyId);
    const employee = employeeRecords.find(e => parseInt(e.companyId) === id);
    return employee?.role ?? null;
  };

  // Helper: Get user's employee ID in a specific company
  const getEmployeeIdInCompany = (companyId) => {
    const id = parseInt(companyId);
    const employee = employeeRecords.find(e => parseInt(e.companyId) === id);
    return employee?.id ?? null;
  };

  // Helper: Get all company IDs user is associated with
  const getAssociatedCompanyIds = () => {
    const employeeCompanies = employeeRecords.map(e => e.companyId);
    const clientCompanies = clientRecords.map(c => c.companyId);
    return [...new Set([...employeeCompanies, ...clientCompanies])];
  };

  // Helper: Check if user can edit/delete cargo (must be Admin or Office employee)
  const canManageCargo = (companyId) => {
    const role = getRoleInCompany(companyId);
    return role === 'Admin' || role === 2 || role === 'Office' || role === 0;
  };

  const value = {
    currentUser,
    employeeRecords,
    clientRecords,
    login,
    logout,
    register,
    refreshRoles,
    loading,
    isAuthenticated: !!currentUser,
    // Role check helpers
    isAdminOfCompany,
    isAdminOfAnyCompany,
    isEmployeeOfCompany,
    isClientOfCompany,
    isAssociatedWithCompany,
    getRoleInCompany,
    getEmployeeIdInCompany,
    getAssociatedCompanyIds,
    canManageCargo,
    // Legacy compatibility
    userRole: employeeRecords.length > 0 ? 'employee' : (clientRecords.length > 0 ? 'client' : null),
    userDetails: employeeRecords[0] || clientRecords[0] || null,
    isAdmin: employeeRecords.some(e => e.role === 'Admin' || e.role === 2),
    isEmployee: employeeRecords.length > 0,
    isClient: clientRecords.length > 0,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
