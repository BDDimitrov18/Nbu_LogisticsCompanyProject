// Data Service - CRUD operations for all entities

import api from './api';

// Users Service
export const usersService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByEmail: (email) => api.get(`/users/by-email/${email}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, { id, ...data }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Companies Service
export const companiesService = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  getByName: (name) => api.get(`/companies/by-name/${name}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, { id, ...data }),
  delete: (id) => api.delete(`/companies/${id}`),
};

// Offices Service
export const officesService = {
  getById: (id) => api.get(`/offices/${id}`),
  getByCompany: (companyId) => api.get(`/offices/by-company/${companyId}`),
  create: (data) => api.post('/offices', data),
  update: (id, data) => api.put(`/offices/${id}`, { id, ...data }),
  delete: (id) => api.delete(`/offices/${id}`),
};

// Employees Service
export const employeesService = {
  getById: (id) => api.get(`/companyemployees/${id}`),
  getByUser: (userId) => api.get(`/companyemployees/by-user/${userId}`),
  getByCompany: (companyId) => api.get(`/companyemployees/by-company/${companyId}`),
  getByOffice: (officeId) => api.get(`/companyemployees/by-office/${officeId}`),
  getByRole: (role) => api.get(`/companyemployees/by-role/${role}`),
  create: (data) => api.post('/companyemployees', data),
  update: (id, data) => api.put(`/companyemployees/${id}`, { id, ...data }),
  delete: (id) => api.delete(`/companyemployees/${id}`),
};

// Clients Service
export const clientsService = {
  getById: (id) => api.get(`/clients/${id}`),
  getByUser: (userId) => api.get(`/clients/by-user/${userId}`),
  getByCompany: (companyId) => api.get(`/clients/by-company/${companyId}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, { id, ...data }),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Cargo Service
export const cargoService = {
  getById: (id) => api.get(`/cargos/${id}`),
  getByCompany: (companyId) => api.get(`/cargos/by-company/${companyId}`),
  getBySender: (senderId) => api.get(`/cargos/by-sender/${senderId}`),
  getByReceiver: (receiverId) => api.get(`/cargos/by-reciever/${receiverId}`),
  getByEmployee: (employeeId) => api.get(`/cargos/by-employee/${employeeId}`),
  getByStatus: (status) => api.get(`/cargos/by-status/${status}`),
  create: (data) => api.post('/cargos', data),
  update: (id, data) => api.put(`/cargos/${id}`, { id, ...data }),
  delete: (id) => api.delete(`/cargos/${id}`),
};

// Export all services
export default {
  users: usersService,
  companies: companiesService,
  offices: officesService,
  employees: employeesService,
  clients: clientsService,
  cargo: cargoService,
};
