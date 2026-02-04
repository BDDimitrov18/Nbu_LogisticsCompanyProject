import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';

const Companies = () => {
  const {
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    fetchCompanies,
    fetchAllOffices,
    fetchAllEmployees,
    offices,
    employees,
    loading
  } = useData();

  const { isAdminOfCompany, refreshRoles } = useAuth();
  const { showError, showSuccess } = useToast();
  const { confirm } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Името трябва да е поне 2 символа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      await Promise.all([
        fetchCompanies(),
        fetchAllOffices(),
        fetchAllEmployees()
      ]);
      setPageLoading(false);
    };
    loadData();
  }, [fetchCompanies, fetchAllOffices, fetchAllEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Моля, попълнете всички полета правилно');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, formData);
        showSuccess('Компанията е редактирана успешно');
      } else {
        await addCompany(formData);
        // Refresh roles since user becomes admin of new company
        await refreshRoles();
        // Refresh data to show updated employee/office counts
        await Promise.all([fetchCompanies(), fetchAllOffices(), fetchAllEmployees()]);
        showSuccess('Компанията е създадена успешно');
      }
      closeModal();
    } catch (error) {
      showError('Грешка: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({ name: company.name });
    } else {
      setEditingCompany(null);
      setFormData({ name: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setFormData({ name: '' });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Изтриване на компания',
      message: 'Сигурни ли сте, че искате да изтриете тази компания?',
      confirmText: 'Изтрий',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteCompany(id);
        // Refresh roles since user may no longer be associated
        await refreshRoles();
        showSuccess('Компанията е изтрита успешно');
      } catch (error) {
        showError('Грешка при изтриване: ' + error.message);
      }
    }
  };

  if (pageLoading || loading) {
    return (
      <div className="page">
        <div className="loading">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Компании</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Създай компания
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Име</th>
              <th>Офиси</th>
              <th>Служители</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">Няма добавени компании</td>
              </tr>
            ) : (
              [...companies].sort((a, b) => a.id - b.id).map(company => {
                const canManage = isAdminOfCompany(company.id);
                return (
                  <tr key={company.id}>
                    <td>{company.id}</td>
                    <td>{company.name}</td>
                    <td>{offices.filter(o => o.companyId === company.id).length}</td>
                    <td>{employees.filter(e => e.companyId === company.id).length}</td>
                    <td className="actions">
                      {canManage ? (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => openModal(company)}>
                            Редактирай
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(company.id)}>
                            Изтрий
                          </button>
                        </>
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
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCompany ? 'Редактиране на компания' : 'Нова компания'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="name">Име на компанията</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ name: e.target.value });
                    if (errors.name) setErrors({});
                  }}
                  required
                  placeholder="Въведете име на компанията"
                  disabled={isSubmitting}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              {!editingCompany && (
                <p className="form-hint">
                  При създаване на компания ще станете неин администратор.
                </p>
              )}
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Зареждане...' : (editingCompany ? 'Запази' : 'Създай')}
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

export default Companies;
