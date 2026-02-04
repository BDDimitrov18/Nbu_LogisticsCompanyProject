import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Dropdown from '../components/Dropdown';

const Offices = () => {
  const {
    offices, companies, employees,
    addOffice, updateOffice, deleteOffice,
    fetchCompanies, fetchAllOffices, fetchAllEmployees
  } = useData();

  const {
    isAdminOfCompany,
    isAssociatedWithCompany
  } = useAuth();

  const { showError, showSuccess, showWarning } = useToast();
  const { confirm } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    companyId: ''
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyId) {
      newErrors.companyId = 'Моля, изберете компания';
    }

    if (!formData.location || formData.location.trim().length < 5) {
      newErrors.location = 'Адресът трябва да е поне 5 символа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get companies where user is admin (for adding/editing offices)
  const adminCompanies = companies.filter(c => isAdminOfCompany(c.id));

  // Filter offices to only those in companies user is associated with
  const visibleOffices = offices.filter(o => isAssociatedWithCompany(o.companyId)).sort((a, b) => a.id - b.id);

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

    const officeData = {
      location: formData.location,
      companyId: parseInt(formData.companyId)
    };

    try {
      if (editingOffice) {
        await updateOffice(editingOffice.id, officeData);
        showSuccess('Офисът е редактиран успешно');
      } else {
        await addOffice(officeData);
        showSuccess('Офисът е добавен успешно');
      }
      closeModal();
    } catch (error) {
      showError('Грешка: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (office = null) => {
    if (office) {
      setEditingOffice(office);
      setFormData({
        location: office.location,
        companyId: office.companyId
      });
    } else {
      setEditingOffice(null);
      setFormData({
        location: '',
        companyId: adminCompanies[0]?.id || ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOffice(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    const officeEmployees = employees.filter(e => e.officeId === id);
    if (officeEmployees.length > 0) {
      showWarning('Не можете да изтриете офис, в който работят служители!');
      return;
    }

    const confirmed = await confirm({
      title: 'Изтриване на офис',
      message: 'Сигурни ли сте, че искате да изтриете този офис?',
      confirmText: 'Изтрий',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteOffice(id);
        showSuccess('Офисът е изтрит успешно');
      } catch (error) {
        showError('Грешка при изтриване: ' + error.message);
      }
    }
  };

  const getEmployeeCount = (officeId) => {
    return employees.filter(e => e.officeId === officeId).length;
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
        <h1>Офиси</h1>
        {adminCompanies.length > 0 && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Добави офис
          </button>
        )}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Локация</th>
              <th>Компания</th>
              <th>Служители</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {visibleOffices.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">Няма офиси за показване</td>
              </tr>
            ) : (
              visibleOffices.map(office => {
                const company = companies.find(c => c.id === office.companyId);
                const canEdit = isAdminOfCompany(office.companyId);
                return (
                  <tr key={office.id}>
                    <td>{office.id}</td>
                    <td>{office.location}</td>
                    <td>{company?.name || 'N/A'}</td>
                    <td>{getEmployeeCount(office.id)}</td>
                    <td className="actions">
                      {canEdit ? (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => openModal(office)}>
                            Редактирай
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(office.id)}>
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
              <h2>{editingOffice ? 'Редактиране на офис' : 'Нов офис'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
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

              <div className={`form-group ${errors.location ? 'has-error' : ''}`}>
                <label htmlFor="location">Локация / Адрес</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Въведете адрес на офиса"
                  disabled={isSubmitting}
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Зареждане...' : (editingOffice ? 'Запази' : 'Добави')}
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

export default Offices;
