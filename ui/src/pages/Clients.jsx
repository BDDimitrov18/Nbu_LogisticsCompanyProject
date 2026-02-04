import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Dropdown from '../components/Dropdown';

const Clients = () => {
  const {
    clients, companies, users, cargo,
    addClient, deleteClient,
    fetchCompanies, fetchAllClients, fetchAllCargo, fetchUsers
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
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    companyId: ''
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Get companies where user is admin (for adding clients)
  const adminCompanies = companies.filter(c => isAdminOfCompany(c.id));

  // Filter clients to only those in companies user is associated with
  const visibleClients = clients.filter(c => isAssociatedWithCompany(c.companyId)).sort((a, b) => a.id - b.id);

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      await Promise.all([
        fetchCompanies(),
        fetchAllClients(),
        fetchAllCargo(),
        fetchUsers()
      ]);
      setPageLoading(false);
    };
    loadData();
  }, [fetchCompanies, fetchAllClients, fetchAllCargo, fetchUsers]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Името трябва да е поне 2 символа';
    }

    if (!formData.username || formData.username.trim().length < 3) {
      newErrors.username = 'Потребителското име трябва да е поне 3 символа';
    }

    if (!formData.password || formData.password.length < 4) {
      newErrors.password = 'Паролата трябва да е поне 4 символа';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Моля, попълнете всички полета правилно');
      return;
    }

    setIsSubmitting(true);

    const { name, username, password, email, phone, companyId } = formData;

    try {
      await addClient(
        { companyId: parseInt(companyId) },
        { name, username, password, email, phone }
      );
      showSuccess('Клиентът е добавен успешно');
      closeModal();
      await fetchAllClients();
    } catch (error) {
      showError('Грешка: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    const firstAdminCompany = adminCompanies[0];
    setFormData({
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      companyId: firstAdminCompany?.id || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setErrors({});
  };

  const handleDelete = async (client) => {
    const isOwnRecord = client.userId === currentUser?.id;

    const confirmed = await confirm({
      title: isOwnRecord ? 'Напускане като клиент' : 'Премахване на клиент',
      message: isOwnRecord
        ? 'Сигурни ли сте, че искате да премахнете себе си като клиент от тази компания?'
        : 'Сигурни ли сте, че искате да премахнете този клиент?',
      confirmText: isOwnRecord ? 'Напусни' : 'Премахни',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteClient(client.id);
        if (isOwnRecord) {
          await refreshRoles();
        }
        showSuccess(isOwnRecord ? 'Напуснахте като клиент успешно' : 'Клиентът е премахнат успешно');
      } catch (error) {
        showError('Грешка при изтриване: ' + error.message);
      }
    }
  };

  const getClientStats = (userId) => {
    const sent = cargo.filter(c => c.senderId === userId).length;
    const received = cargo.filter(c => (c.recieverId === userId || c.receiverId === userId)).length;
    return { sent, received };
  };

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
        <h1>Клиенти</h1>
        {adminCompanies.length > 0 && (
          <button className="btn btn-primary" onClick={openModal}>
            + Добави клиент
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
              <th>Изпратени</th>
              <th>Получени</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {visibleClients.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">Няма клиенти за показване</td>
              </tr>
            ) : (
              visibleClients.map(client => {
                const user = users.find(u => u.id === client.userId);
                const company = companies.find(c => c.id === client.companyId);
                const stats = getClientStats(client.userId);
                const canDelete = client.userId === currentUser?.id || isAdminOfCompany(client.companyId);

                return (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>{user?.name || 'N/A'}</td>
                    <td>{user?.email || 'N/A'}</td>
                    <td>{user?.phone || 'N/A'}</td>
                    <td>{company?.name || 'N/A'}</td>
                    <td>{stats.sent}</td>
                    <td>{stats.received}</td>
                    <td className="actions">
                      {canDelete ? (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(client)}>
                          {client.userId === currentUser?.id ? 'Напусни' : 'Премахни'}
                        </button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
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
              <h2>Нов клиент</h2>
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
                    options={adminCompanies.map(company => ({
                      value: company.id,
                      label: company.name
                    }))}
                    placeholder="Изберете компания"
                    searchable={false}
                  />
                  {errors.companyId && <span className="error-text">{errors.companyId}</span>}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Зареждане...' : 'Добави'}
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

export default Clients;
