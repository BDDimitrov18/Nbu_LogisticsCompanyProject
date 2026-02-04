import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Dropdown from '../components/Dropdown';
import AddressAutocomplete from '../components/AddressAutocomplete';

const NewCargo = () => {
  const {
    companies, offices, users,
    addCargo,
    cargoStatus,
    fetchCompanies, fetchAllOffices, fetchUsers
  } = useData();
  const { employeeRecords, canManageCargo } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  // Get companies where user is Admin or Office (can create cargo)
  const allowedCompanies = companies.filter(company => canManageCargo(company.id));

  // Get employee record for a specific company
  const getEmployeeForCompany = (companyId) => {
    const id = parseInt(companyId);
    return employeeRecords.find(e =>
      parseInt(e.companyId) === id &&
      (e.role === 'Admin' || e.role === 2 || e.role === 'Office' || e.role === 0)
    );
  };

  const defaultCompanyId = allowedCompanies[0]?.id || '';

  const [formData, setFormData] = useState({
    senderId: '',
    receiverId: '',
    companyId: defaultCompanyId,
    senderAddress: '',
    receiverAddress: '',
    weight: '',
    price: '',
    arrivalLocationType: 'address',
    officeDeliveredToId: ''
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyId) {
      newErrors.companyId = 'Моля, изберете компания';
    }

    if (!formData.senderId) {
      newErrors.senderId = 'Моля, изберете подател';
    }

    if (!formData.receiverId) {
      newErrors.receiverId = 'Моля, изберете получател';
    }

    if (formData.senderId && formData.receiverId && formData.senderId === formData.receiverId) {
      newErrors.receiverId = 'Подателят и получателят не могат да бъдат един и същ';
    }

    if (!formData.senderAddress || formData.senderAddress.trim().length < 5) {
      newErrors.senderAddress = 'Моля, въведете валиден адрес (минимум 5 символа)';
    }

    if (formData.arrivalLocationType === 'address') {
      if (!formData.receiverAddress || formData.receiverAddress.trim().length < 5) {
        newErrors.receiverAddress = 'Моля, въведете валиден адрес (минимум 5 символа)';
      }
    } else {
      if (!formData.officeDeliveredToId) {
        newErrors.officeDeliveredToId = 'Моля, изберете офис за доставка';
      }
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Теглото трябва да е положително число';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Цената трябва да е положително число';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCompanies(),
        fetchAllOffices(),
        fetchUsers()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchCompanies, fetchAllOffices, fetchUsers]);

  // Update default company when allowedCompanies loads
  useEffect(() => {
    if (allowedCompanies.length > 0 && !formData.companyId) {
      setFormData(prev => ({ ...prev, companyId: allowedCompanies[0].id }));
    }
  }, [allowedCompanies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Reset sender/receiver when company changes
    if (name === 'companyId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        senderId: '',
        receiverId: '',
        officeDeliveredToId: ''
      }));
      setErrors(prev => ({ ...prev, senderId: null, receiverId: null, officeDeliveredToId: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Моля, попълнете всички задължителни полета правилно');
      return;
    }

    // Get the employee record for the selected company
    const employeeRecord = getEmployeeForCompany(formData.companyId);
    if (!employeeRecord) {
      showError('Нямате права да създавате пратки за тази компания');
      return;
    }

    const newCargo = {
      employeeId: employeeRecord.id,  // Employee record ID for this company
      senderId: parseInt(formData.senderId),  // User ID
      receiverId: parseInt(formData.receiverId),  // User ID
      companyId: parseInt(formData.companyId),
      senderAddress: formData.senderAddress,
      receiverAddress: formData.arrivalLocationType === 'address' ? formData.receiverAddress : null,
      weight: parseFloat(formData.weight),
      price: parseFloat(formData.price),
      status: cargoStatus.CREATED,
      arrivalDate: null,
      arrivalLocationType: formData.arrivalLocationType,
      officeDeliveredToId: formData.arrivalLocationType === 'office' ? parseInt(formData.officeDeliveredToId) : null
    };

    try {
      await addCargo(newCargo);
      showSuccess('Пратката е създадена успешно');
      navigate('/cargo');
    } catch (error) {
      showError('Грешка при създаване на пратка: ' + error.message);
    }
  };

  // Filter offices for the selected company
  const filteredOffices = offices.filter(o => o.companyId === parseInt(formData.companyId));

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Зареждане...</div>
      </div>
    );
  }

  if (allowedCompanies.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Регистриране на нова пратка</h1>
        </div>
        <div className="card">
          <p className="no-data">Нямате права да създавате пратки. Трябва да сте администратор или офис служител в компания.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Регистриране на нова пратка</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="form-large">
          <div className="form-section">
            <h3>Основна информация</h3>
            <div className="form-grid">
              <div className={`form-group ${errors.companyId ? 'has-error' : ''}`}>
                <label htmlFor="companyId">Компания</label>
                <Dropdown
                  id="companyId"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  required
                  options={allowedCompanies.map(company => ({
                    value: company.id,
                    label: company.name
                  }))}
                  placeholder="Изберете компания"
                  searchable={false}
                />
                {errors.companyId && <span className="error-text">{errors.companyId}</span>}
              </div>

              <div className={`form-group ${errors.senderId ? 'has-error' : ''}`}>
                <label htmlFor="senderId">Подател</label>
                <Dropdown
                  id="senderId"
                  name="senderId"
                  value={formData.senderId}
                  onChange={handleChange}
                  required
                  options={users.map(user => ({
                    value: user.id,
                    label: `${user.name} (${user.phone})`
                  }))}
                  placeholder="Изберете подател"
                />
                {errors.senderId && <span className="error-text">{errors.senderId}</span>}
              </div>

              <div className={`form-group ${errors.receiverId ? 'has-error' : ''}`}>
                <label htmlFor="receiverId">Получател</label>
                <Dropdown
                  id="receiverId"
                  name="receiverId"
                  value={formData.receiverId}
                  onChange={handleChange}
                  required
                  options={users.map(user => ({
                    value: user.id,
                    label: `${user.name} (${user.phone})`
                  }))}
                  placeholder="Изберете получател"
                />
                {errors.receiverId && <span className="error-text">{errors.receiverId}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Адреси</h3>
            <div className="form-grid">
              <div className={`form-group full-width ${errors.senderAddress ? 'has-error' : ''}`}>
                <label htmlFor="senderAddress">Адрес на подател</label>
                <AddressAutocomplete
                  id="senderAddress"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  required
                  placeholder="Въведете адрес на подателя"
                />
                {errors.senderAddress && <span className="error-text">{errors.senderAddress}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="arrivalLocationType">Тип доставка</label>
                <Dropdown
                  id="arrivalLocationType"
                  name="arrivalLocationType"
                  value={formData.arrivalLocationType}
                  onChange={handleChange}
                  required
                  options={[
                    { value: 'address', label: 'До адрес' },
                    { value: 'office', label: 'До офис' }
                  ]}
                  placeholder="Изберете тип"
                  searchable={false}
                />
              </div>

              {formData.arrivalLocationType === 'address' ? (
                <div className={`form-group full-width ${errors.receiverAddress ? 'has-error' : ''}`}>
                  <label htmlFor="receiverAddress">Адрес на получател</label>
                  <AddressAutocomplete
                    id="receiverAddress"
                    name="receiverAddress"
                    value={formData.receiverAddress}
                    onChange={handleChange}
                    required
                    placeholder="Въведете адрес на получателя"
                  />
                  {errors.receiverAddress && <span className="error-text">{errors.receiverAddress}</span>}
                </div>
              ) : (
                <div className={`form-group ${errors.officeDeliveredToId ? 'has-error' : ''}`}>
                  <label htmlFor="officeDeliveredToId">Офис за доставка</label>
                  <Dropdown
                    id="officeDeliveredToId"
                    name="officeDeliveredToId"
                    value={formData.officeDeliveredToId}
                    onChange={handleChange}
                    required
                    options={filteredOffices.map(office => ({
                      value: office.id,
                      label: office.location
                    }))}
                    placeholder="Изберете офис"
                  />
                  {errors.officeDeliveredToId && <span className="error-text">{errors.officeDeliveredToId}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Детайли за пратката</h3>
            <div className="form-grid">
              <div className={`form-group ${errors.weight ? 'has-error' : ''}`}>
                <label htmlFor="weight">Тегло (кг)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.001"
                  placeholder="0.000"
                />
                {errors.weight && <span className="error-text">{errors.weight}</span>}
              </div>

              <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
                <label htmlFor="price">Цена (лв.)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Регистрирай пратка
            </button>
            <button type="button" className="btn btn-danger" onClick={() => navigate('/cargo')}>
              Отказ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCargo;
