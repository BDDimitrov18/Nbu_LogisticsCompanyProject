import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  companiesService,
  officesService,
  employeesService,
  clientsService,
  cargoService,
  usersService,
} from '../services/dataService';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Enums matching backend
export const employeeRoles = {
  OFFICE: 'Office',
  COURIER: 'Courier',
  ADMIN: 'Admin',
  // Backwards compatibility
  OFFICE_STAFF: 'Office',
};

// Cargo status enum values (must match backend CargoStatusEnum)
export const cargoStatus = {
  CREATED: 0,      // Created / Pending
  ASSIGNED: 1,     // Assigned to courier
  PICKED_UP: 2,    // Picked up by courier
  IN_TRANSIT: 3,   // In transit
  DELIVERED: 4,    // Delivered
  CANCELLED: 5,    // Cancelled / Returned
  // Legacy aliases
  PENDING: 0,
  RETURNED: 5,
};

// Helper to convert status string to numeric value
const statusToNumber = (status) => {
  if (typeof status === 'number') return status;
  const map = {
    'Created': 0, 'created': 0, 'CREATED': 0, 'pending': 0, 'PENDING': 0,
    'Assigned': 1, 'assigned': 1, 'ASSIGNED': 1,
    'PickedUp': 2, 'pickedUp': 2, 'picked_up': 2, 'PICKED_UP': 2,
    'InTransit': 3, 'inTransit': 3, 'in_transit': 3, 'IN_TRANSIT': 3,
    'Delivered': 4, 'delivered': 4, 'DELIVERED': 4,
    'Cancelled': 5, 'cancelled': 5, 'CANCELLED': 5, 'returned': 5, 'RETURNED': 5,
  };
  return map[status] ?? 0;
};

// Arrival location type enum (must match backend)
export const arrivalLocationType = {
  OFFICE: 0,   // Office
  ADDRESS: 1,  // Address
};

// Helper to convert arrival location type string to numeric value
const locationTypeToNumber = (type) => {
  if (typeof type === 'number') return type;
  const map = {
    'Office': 0, 'office': 0, 'OFFICE': 0,
    'Address': 1, 'address': 1, 'ADDRESS': 1,
  };
  return map[type] ?? 1;
};

export const DataProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [offices, setOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [cargo, setCargo] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to get user's associated company IDs from localStorage
  const getAssociatedCompanyIds = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (!savedUser) return [];
      const userData = JSON.parse(savedUser);
      const employeeCompanies = (userData.employees || []).map(e => e.companyId);
      const clientCompanies = (userData.clients || []).map(c => c.companyId);
      return [...new Set([...employeeCompanies, ...clientCompanies])];
    } catch {
      return [];
    }
  }, []);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Fetch all companies on mount
  const fetchCompanies = useCallback(async () => {
    try {
      const data = await companiesService.getAll();
      setCompanies(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Fetch offices by company
  const fetchOfficesByCompany = useCallback(async (companyId) => {
    try {
      const data = await officesService.getByCompany(companyId);
      return data || [];
    } catch (err) {
      console.error('Error fetching offices:', err);
      return [];
    }
  }, []);

  // Fetch all offices (only from associated companies)
  const fetchAllOffices = useCallback(async () => {
    try {
      const associatedIds = getAssociatedCompanyIds();
      const allOffices = [];
      for (const companyId of associatedIds) {
        try {
          const officesData = await officesService.getByCompany(companyId);
          allOffices.push(...(officesData || []));
        } catch (err) {
          // Silently ignore errors
        }
      }
      setOffices(allOffices);
      return allOffices;
    } catch (err) {
      console.error('Error fetching all offices:', err);
      return [];
    }
  }, [getAssociatedCompanyIds]);

  // Fetch employees by company
  const fetchEmployeesByCompany = useCallback(async (companyId) => {
    try {
      const data = await employeesService.getByCompany(companyId);
      return data || [];
    } catch (err) {
      console.error('Error fetching employees:', err);
      return [];
    }
  }, []);

  // Fetch all employees (only from associated companies)
  const fetchAllEmployees = useCallback(async () => {
    try {
      const associatedIds = getAssociatedCompanyIds();
      const allEmployees = [];
      for (const companyId of associatedIds) {
        try {
          const employeesData = await employeesService.getByCompany(companyId);
          allEmployees.push(...(employeesData || []));
        } catch (err) {
          // Silently ignore errors
        }
      }
      setEmployees(allEmployees);
      return allEmployees;
    } catch (err) {
      console.error('Error fetching all employees:', err);
      return [];
    }
  }, [getAssociatedCompanyIds]);

  // Fetch clients by company
  const fetchClientsByCompany = useCallback(async (companyId) => {
    try {
      const data = await clientsService.getByCompany(companyId);
      return data || [];
    } catch (err) {
      console.error('Error fetching clients:', err);
      return [];
    }
  }, []);

  // Fetch all clients (only from associated companies)
  const fetchAllClients = useCallback(async () => {
    try {
      const associatedIds = getAssociatedCompanyIds();
      const allClients = [];
      for (const companyId of associatedIds) {
        try {
          const clientsData = await clientsService.getByCompany(companyId);
          allClients.push(...(clientsData || []));
        } catch (err) {
          // Silently ignore errors
        }
      }
      setClients(allClients);
      return allClients;
    } catch (err) {
      console.error('Error fetching all clients:', err);
      return [];
    }
  }, [getAssociatedCompanyIds]);

  // Fetch cargo by company
  const fetchCargoByCompany = useCallback(async (companyId) => {
    try {
      const data = await cargoService.getByCompany(companyId);
      return data || [];
    } catch (err) {
      console.error('Error fetching cargo:', err);
      return [];
    }
  }, []);

  // Fetch all cargo (only from associated companies)
  const fetchAllCargo = useCallback(async () => {
    try {
      const associatedIds = getAssociatedCompanyIds();
      const allCargo = [];
      for (const companyId of associatedIds) {
        try {
          const cargoData = await cargoService.getByCompany(companyId);
          allCargo.push(...(cargoData || []));
        } catch (err) {
          // Silently ignore errors
        }
      }
      setCargo(allCargo);
      return allCargo;
    } catch (err) {
      console.error('Error fetching all cargo:', err);
      return [];
    }
  }, [getAssociatedCompanyIds]);

  // Initialize data only if user is authenticated
  useEffect(() => {
    const initData = async () => {
      // Only fetch data if there's a token (user is authenticated)
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      await fetchCompanies();
      setLoading(false);
    };
    initData();
  }, [fetchCompanies]);

  // Helper functions
  const getUserById = (id) => users.find((u) => u.id === id);
  const getCompanyById = (id) => companies.find((c) => c.id === id);
  const getOfficeById = (id) => offices.find((o) => o.id === id);
  const getClientById = (id) => clients.find((c) => c.id === id);
  const getEmployeeById = (id) => employees.find((e) => e.id === id);

  // Companies CRUD
  const addCompany = async (company) => {
    try {
      const newCompany = await companiesService.create(company);
      setCompanies([...companies, newCompany]);
      return newCompany;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCompany = async (id, data) => {
    try {
      await companiesService.update(id, data);
      setCompanies(companies.map((c) => (c.id === id ? { ...c, ...data } : c)));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCompany = async (id) => {
    try {
      // Backend handles cascading delete (cargo, clients, employees, offices, users)
      await companiesService.delete(id);

      // Update local state
      setCargo(cargo.filter((c) => c.companyId !== id));
      setClients(clients.filter((c) => c.companyId !== id));
      setEmployees(employees.filter((e) => e.companyId !== id));
      setOffices(offices.filter((o) => o.companyId !== id));
      setCompanies(companies.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Offices CRUD
  const addOffice = async (office) => {
    try {
      const newOffice = await officesService.create(office);
      setOffices([...offices, newOffice]);
      return newOffice;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateOffice = async (id, data) => {
    try {
      await officesService.update(id, data);
      setOffices(offices.map((o) => (o.id === id ? { ...o, ...data } : o)));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteOffice = async (id) => {
    try {
      await officesService.delete(id);
      setOffices(offices.filter((o) => o.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getOfficesByCompany = (companyId) => offices.filter((o) => o.companyId === companyId);

  // Employees CRUD
  const addEmployee = async (employeeData, userData) => {
    try {
      // Create user first
      const newUser = await usersService.create(userData);
      setUsers([...users, newUser]);

      // Create employee record
      const newEmployee = await employeesService.create({
        userId: newUser.id,
        companyId: employeeData.companyId,
        officeId: employeeData.officeId,
        role: employeeData.role,
      });
      setEmployees([...employees, newEmployee]);
      return { user: newUser, employee: newEmployee };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEmployee = async (id, employeeData, userData) => {
    try {
      const employee = employees.find((e) => e.id === id);
      if (employee && userData) {
        await usersService.update(employee.userId, userData);
        setUsers(users.map((u) => (u.id === employee.userId ? { ...u, ...userData } : u)));
      }
      // Include userId in the employee update data
      const fullEmployeeData = employee
        ? { ...employeeData, userId: employee.userId }
        : employeeData;
      await employeesService.update(id, fullEmployeeData);
      setEmployees(employees.map((e) => (e.id === id ? { ...e, ...employeeData } : e)));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await employeesService.delete(id);
      setEmployees(employees.filter((e) => e.id !== id));
      // Note: User is NOT deleted - they may have cargo or other associations
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getEmployeesByCompany = (companyId) => employees.filter((e) => e.companyId === companyId);

  const getEmployeeWithDetails = (employeeId) => {
    const employee = getEmployeeById(employeeId);
    if (!employee) return null;
    const user = getUserById(employee.userId);
    const company = getCompanyById(employee.companyId);
    const office = getOfficeById(employee.officeId);
    return { ...employee, user, company, office };
  };

  // Clients CRUD
  const addClient = async (clientData, userData) => {
    try {
      // Create user first
      const newUser = await usersService.create(userData);
      setUsers([...users, newUser]);

      // Create client record
      const newClient = await clientsService.create({
        userId: newUser.id,
        companyId: clientData.companyId,
      });
      setClients([...clients, newClient]);
      return { user: newUser, client: newClient };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateClient = async (id, clientData, userData) => {
    try {
      const client = clients.find((c) => c.id === id);
      if (client && userData) {
        await usersService.update(client.userId, userData);
        setUsers(users.map((u) => (u.id === client.userId ? { ...u, ...userData } : u)));
      }
      await clientsService.update(id, clientData);
      setClients(clients.map((c) => (c.id === id ? { ...c, ...clientData } : c)));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      await clientsService.delete(id);
      setClients(clients.filter((c) => c.id !== id));
      // Note: User is NOT deleted - they may have cargo or other associations
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getClientsByCompany = (companyId) => clients.filter((c) => c.companyId === companyId);

  const getClientWithDetails = (clientId) => {
    const client = getClientById(clientId);
    if (!client) return null;
    const user = getUserById(client.userId);
    const company = getCompanyById(client.companyId);
    return { ...client, user, company };
  };

  // Cargo CRUD
  const addCargo = async (cargoData) => {
    try {
      const statusValue = statusToNumber(cargoData.status ?? cargoData.cargoStatus ?? cargoStatus.PENDING);
      const locationValue = locationTypeToNumber(cargoData.arrivalLocationType);

      const newCargo = await cargoService.create({
        employeeId: cargoData.employeeId,
        senderId: cargoData.senderId,
        recieverId: cargoData.receiverId,
        companyId: cargoData.companyId,
        senderAddress: cargoData.senderAddress,
        recieverAddress: cargoData.receiverAddress,
        weight: cargoData.weight,
        price: cargoData.price,
        cargoStatus: statusValue,
        arrivalDate: cargoData.arrivalDate,
        arrivalLocationType: locationValue,
        officeDeliveredToId: cargoData.officeDeliveredToId,
      });
      setCargo([...cargo, newCargo]);
      return newCargo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCargo = async (id, data) => {
    try {
      const cargoItem = cargo.find((c) => c.id === id);
      const statusValue = statusToNumber(data.status ?? data.cargoStatus ?? cargoItem?.cargoStatus);
      const locationValue = locationTypeToNumber(data.arrivalLocationType ?? cargoItem?.arrivalLocationType);

      await cargoService.update(id, {
        employeeId: data.employeeId ?? cargoItem?.employeeId,
        senderId: data.senderId ?? cargoItem?.senderId,
        recieverId: data.receiverId ?? data.recieverId ?? cargoItem?.recieverId,
        companyId: data.companyId ?? cargoItem?.companyId,
        senderAddress: data.senderAddress ?? cargoItem?.senderAddress,
        recieverAddress: data.receiverAddress ?? data.recieverAddress ?? cargoItem?.recieverAddress,
        weight: data.weight ?? cargoItem?.weight,
        price: data.price ?? cargoItem?.price,
        cargoStatus: statusValue,
        arrivalDate: data.arrivalDate ?? cargoItem?.arrivalDate,
        arrivalLocationType: locationValue,
        officeDeliveredToId: data.officeDeliveredToId ?? cargoItem?.officeDeliveredToId,
      });
      setCargo(cargo.map((c) => (c.id === id ? { ...c, ...data } : c)));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCargo = async (id) => {
    try {
      await cargoService.delete(id);
      setCargo(cargo.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getCargoByCompany = (companyId) => cargo.filter((c) => c.companyId === companyId);

  const getCargoByStatus = (status) => cargo.filter((c) => c.cargoStatus === status || c.status === status);

  const getCargoBySender = (senderId) => cargo.filter((c) => c.senderId === senderId);

  const getCargoByReceiver = (receiverId) => cargo.filter((c) => c.recieverId === receiverId || c.receiverId === receiverId);

  const getCargoByEmployee = (employeeId) => cargo.filter((c) => c.employeeId === employeeId);

  const getCargoWithDetails = (cargoId) => {
    const cargoItem = cargo.find((c) => c.id === cargoId);
    if (!cargoItem) return null;

    const sender = getClientWithDetails(cargoItem.senderId);
    const receiver = getClientWithDetails(cargoItem.recieverId || cargoItem.receiverId);
    const employee = getEmployeeWithDetails(cargoItem.employeeId);
    const company = getCompanyById(cargoItem.companyId);
    const deliveryOffice = cargoItem.officeDeliveredToId
      ? getOfficeById(cargoItem.officeDeliveredToId)
      : null;

    return { ...cargoItem, sender, receiver, employee, company, deliveryOffice };
  };

  // Statistics
  const getStatistics = () => {
    const getStatusValue = (c) => c.cargoStatus ?? c.status;
    return {
      totalCompanies: companies.length,
      totalEmployees: employees.length,
      totalClients: clients.length,
      totalOffices: offices.length,
      totalCargo: cargo.length,
      cargoByStatus: {
        created: cargo.filter((c) => getStatusValue(c) === cargoStatus.CREATED).length,
        assigned: cargo.filter((c) => getStatusValue(c) === cargoStatus.ASSIGNED).length,
        pickedUp: cargo.filter((c) => getStatusValue(c) === cargoStatus.PICKED_UP).length,
        inTransit: cargo.filter((c) => getStatusValue(c) === cargoStatus.IN_TRANSIT).length,
        delivered: cargo.filter((c) => getStatusValue(c) === cargoStatus.DELIVERED).length,
        cancelled: cargo.filter((c) => getStatusValue(c) === cargoStatus.CANCELLED).length,
        // Legacy aliases for backwards compatibility
        pending: cargo.filter((c) => getStatusValue(c) === cargoStatus.CREATED).length,
        returned: cargo.filter((c) => getStatusValue(c) === cargoStatus.CANCELLED).length,
      },
      totalRevenue: cargo.reduce((sum, c) => sum + (c.price || 0), 0),
    };
  };

  const value = {
    // Data
    users,
    companies,
    offices,
    employees,
    clients,
    cargo,
    loading,
    error,

    // Enums
    employeeRoles,
    cargoStatus,
    arrivalLocationType,

    // Fetch functions
    fetchUsers,
    fetchCompanies,
    fetchAllOffices,
    fetchOfficesByCompany,
    fetchAllEmployees,
    fetchEmployeesByCompany,
    fetchAllClients,
    fetchClientsByCompany,
    fetchAllCargo,
    fetchCargoByCompany,

    // Helper functions
    getUserById,
    getCompanyById,
    getOfficeById,
    getClientById,
    getEmployeeById,

    // Companies CRUD
    addCompany,
    updateCompany,
    deleteCompany,

    // Offices CRUD
    addOffice,
    updateOffice,
    deleteOffice,
    getOfficesByCompany,

    // Employees CRUD
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByCompany,
    getEmployeeWithDetails,

    // Clients CRUD
    addClient,
    updateClient,
    deleteClient,
    getClientsByCompany,
    getClientWithDetails,

    // Cargo CRUD
    addCargo,
    updateCargo,
    deleteCargo,
    getCargoByCompany,
    getCargoByStatus,
    getCargoBySender,
    getCargoByReceiver,
    getCargoByEmployee,
    getCargoWithDetails,

    // Statistics
    getStatistics,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
