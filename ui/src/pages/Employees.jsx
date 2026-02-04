import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Dropdown from '../components/Dropdown';

const Employees = () => {
  const {
    employees, companies, offices, users,
    addEmployee, updateEmployee, deleteEmployee,
    fetchCompanies, fetchAllOffices, fetchAllEmployees, fetchUsers
  } = useData();

  const {
    currentUser,
    isAdminOfCompany,
    isAssociatedWithCompany,
    refreshRoles
  } = useAuth();

  const { showError, showSuccess } = useToast();
  const { confirm } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    companyId: '',
    officeId: '',
    role: 'Office'
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Името трябва да е поне 2 символа';
    }

    if (!editingEmployee) {
      if (!formData.username || formData.username.trim().length < 3) {
        newErrors.username = 'Потребителското име трябва да е поне 3 символа';
      }

      if (!formData.password || formData.password.length < 4) {
        newErrors.password = 'Паролата трябва да е поне 4 символа';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Моля, въведете валиден email адрес';
    }

    if (!formData.phone || formData.phone.trim().length < 6) {
      newErrors.phone = 'Телефонният номер трябва да е поне 6 символа';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Моля, изберете компания';
    }

    if (!formData.officeId) {
      const companyOffices = offices.filter(o => o.companyId === parseInt(formData.companyId));
      newErrors.officeId = companyOffices.length === 0
        ? 'Първо добавете офис за тази компания'
        : 'Моля, изберете офис';
    }

    if (!formData.role) {
      newErrors.role = 'Моля, изберете роля';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get companies where user is admin (for adding employees)
  const adminCompanies = companies.filter(c => isAdminOfCompany(c.id));

  // Filter employees to only those in companies user is associated with
  const visibleEmployees = employees.filter(e => isAssociatedWithCompany(e.companyId)).sort((a, b) => a.id - b.id);

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      await Promise.all([
        fetchCompanies(),
        fetchAllOffices(),
        fetchAllEmployees(),
        fetchUsers()
      ]);
      setPageLoading(false);
    };
    loadData();
  }, [fetchCompanies, fetchAllOffices, fetchAllEmployees, fetchUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset officeId when company changes
    if (name === 'companyId') {
      const companyOffices = offices.filter(o => o.companyId === parseInt(value));
      setFormData(prev => ({
        ...prev,
        [name]: value,
        officeId: companyOffices[0]?.id || ''
      }));
      setErrors(prev => ({ ...prev, companyId: null, officeId: null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  // Convert role string to number for backend
  const roleToNumber = (role) => {
    const roleMap = { 'Office': 0, 'Courier': 1, 'Admin': 2 };
    return roleMap[role] ?? 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Моля, попълнете всички полета правилно');
      return;
    }

    setIsSubmitting(true);

    const { name, username, password, email, phone, companyId, officeId, role } = formData;
    const roleNumber = roleToNumber(role);

    try {
      if (editingEmployee) {
        await updateEmployee(
          editingEmployee.id,
          { companyId: parseInt(companyId), officeId: parseInt(officeId), role: roleNumber },
          { name, email, phone }
        );
        showSuccess('Служителят е редактиран успешно');
      } else {
        await addEmployee(
          { companyId: parseInt(companyId), officeId: parseInt(officeId), role: roleNumber },
          { name, username, password, email, phone }
        );
        showSuccess('Служителят е добавен успешно');
      }
      closeModal();
      await fetchAllEmployees();
    } catch (error) {
      showError('Грешка: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (employee = null) => {
    if (employee) {
      const user = users.find(u => u.id === employee.userId);
      setEditingEmployee(employee);
      setFormData({
        name: user?.name || '',
        username: user?.username || '',
        password: '',
        email: user?.email || '',
        phone: user?.phone || '',
        companyId: employee.companyId,
        officeId: employee.officeId,
        role: typeof employee.role === 'number'
          ? (employee.role === 0 ? 'Office' : employee.role === 1 ? 'Courier' : 'Admin')
          : employee.role
      });
    } else {
      setEditingEmployee(null);
      const firstAdminCompany = adminCompanies[0];
      const companyOffices = firstAdminCompany
        ? offices.filter(o => o.companyId === firstAdminCompany.id)
        : [];
      setFormData({
        name: '',
        username: '',
        password: '',
        email: '',
        phone: '',
        companyId: firstAdminCompany?.id || '',
        officeId: companyOffices[0]?.id || '',
        role: 'Office'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setErrors({});
  };

  const handleDelete = async (employee) => {
    const isOwnRecord = employee.userId === currentUser?.id;

    const confirmed = await confirm({
      title: isOwnRecord ? 'Напускане на компания' : 'Изтриване на служител',
      message: isOwnRecord
        ? 'Сигурни ли сте, че искате да премахнете себе си от тази компания?'
        : 'Сигурни ли сте, че искате да изтриете този служител?',
      confirmText: isOwnRecord ? 'Напусни' : 'Изтрий',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteEmployee(employee.id);
        if (isOwnRecord) {
          await refreshRoles();
        }
        showSuccess(isOwnRecord ? 'Напуснахте компанията успешно' : 'Служителят е изтрит успешно');
      } catch (error) {
        showError('Грешка при изтриване: ' + error.message);
      }
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'Admin' || role === 2) return 'Администратор';
    if (role === 'Courier' || role === 1) return 'Куриер';
    return 'Офис служител';
  };

  const getRoleClass = (role) => {
    if (role === 'Admin' || role === 2) return 'admin';
    if (role === 'Courier' || role === 1) return 'courier';
    return 'office';
  };

  const filteredOffices = offices.filter(o => o.companyId === parseInt(formData.companyId));

  // For editing, filter to companies where user is admin
  const editableCompanies = editingEmployee
    ? companies.filter(c => isAdminOfCompany(c.id))
    : adminCompanies;

  if (pageLoading) {
    return (
      <div className="page">
        <div className="loading">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Служители</h1>
        {adminCompanies.length > 0 && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Добави служител
          </button>
        )}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Име</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Компания</th>
              <th>Офис</th>
              <th>Роля</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {visibleEmployees.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">Няма служители за показване</td>
              </tr>
            ) : (
              visibleEmployees.map(employee => {
                const user = users.find(u => u.id === employee.userId);
                const company = companies.find(c => c.id === employee.companyId);
                const office = offices.find(o => o.id === employee.officeId);
                const canEdit = isAdminOfCompany(employee.companyId);
                const canDelete = canEdit || employee.userId === currentUser?.id;

                return (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{user?.name || 'N/A'}</td>
                    <td>{user?.email || 'N/A'}</td>
                    <td>{user?.phone || 'N/A'}</td>
                    <td>{company?.name || 'N/A'}</td>
                    <td>{office?.location || 'N/A'}</td>
                    <td>
                      <span className={`role-badge ${getRoleClass(employee.role)}`}>
                        {getRoleLabel(employee.role)}
                      </span>
                    </td>
                    <td className="actions">
                      {canEdit && (
                        <button className="btn btn-sm btn-secondary" onClick={() => openModal(employee)}>
                          Редактирай
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(employee)}>
                          {employee.userId === currentUser?.id ? 'Напусни' : 'Изтрий'}
                        </button>
                      )}
                      {!canEdit && !canDelete && <span className="text-muted">-</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{editingEmployee ? 'Редактиране на служител' : 'Нов служител'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                  <label htmlFor="name">Име</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Име и фамилия"
                    disabled={isSubmitting}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                {!editingEmployee && (
                  <>
                    <div className={`form-group ${errors.username ? 'has-error' : ''}`}>
                      <label htmlFor="username">Потребителско име</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Потребителско име"
                        disabled={isSubmitting}
                      />
                      {errors.username && <span className="error-text">{errors.username}</span>}
                    </div>

                    <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                      <label htmlFor="password">Парола</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Парола"
                        disabled={isSubmitting}
                      />
                      {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>
                  </>
                )}

                <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email адрес"
                    disabled={isSubmitting}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                  <label htmlFor="phone">Телефон</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Телефон"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className={`form-group ${errors.companyId ? 'has-error' : ''}`}>
                  <label htmlFor="companyId">Компания</label>
                  <Dropdown
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    options={editableCompanies.map(company => ({
                      value: company.id,
                      label: company.name
                    }))}
                    placeholder="Изберете компания"
                    searchable={false}
                  />
                  {errors.companyId && <span className="error-text">{errors.companyId}</span>}
                </div>

                <div className={`form-group ${errors.officeId ? 'has-error' : ''}`}>
                  <label htmlFor="officeId">Офис</label>
                  {filteredOffices.length > 0 ? (
                    <Dropdown
                      id="officeId"
                      name="officeId"
                      value={formData.officeId}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      options={filteredOffices.map(office => ({
                        value: office.id,
                        label: office.location
                      }))}
                      placeholder="Изберете офис"
                      searchable={false}
                    />
                  ) : (
                    <p className="form-hint" style={{ color: 'var(--warning-color)' }}>
                      Няма офиси за тази компания. Първо добавете офис.
                    </p>
                  )}
                  {errors.officeId && <span className="error-text">{errors.officeId}</span>}
                </div>

                <div className={`form-group ${errors.role ? 'has-error' : ''}`}>
                  <label htmlFor="role">Роля</label>
                  <Dropdown
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    options={[
                      { value: 'Office', label: 'Офис служител' },
                      { value: 'Courier', label: 'Куриер' },
                      { value: 'Admin', label: 'Администратор' }
                    ]}
                    placeholder="Изберете роля"
                    searchable={false}
                  />
                  {errors.role && <span className="error-text">{errors.role}</span>}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Зареждане...' : (editingEmployee ? 'Запази' : 'Добави')}
                </button>
                <button type="button" className="btn btn-danger" onClick={closeModal} disabled={isSubmitting}>
                  Отказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
