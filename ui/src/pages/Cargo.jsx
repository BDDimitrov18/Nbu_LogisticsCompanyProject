import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Dropdown from '../components/Dropdown';

const Cargo = () => {
  const {
    cargo, companies, offices, employees, users,
    updateCargo, deleteCargo,
    cargoStatus, arrivalLocationType,
    fetchCompanies, fetchAllOffices, fetchAllEmployees, fetchAllClients, fetchAllCargo, fetchUsers
  } = useData();

  const {
    currentUser,
    isAssociatedWithCompany,
    canManageCargo,
    getAssociatedCompanyIds
  } = useAuth();

  const { showError, showSuccess } = useToast();
  const { confirm } = useConfirm();

  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get companies user is associated with
  const associatedCompanyIds = getAssociatedCompanyIds();
  const associatedCompanies = companies.filter(c => associatedCompanyIds.includes(c.id));


  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      await Promise.all([
        fetchCompanies(),
        fetchAllOffices(),
        fetchAllEmployees(),
        fetchAllClients(),
        fetchAllCargo(),
        fetchUsers()
      ]);
      setPageLoading(false);
    };
    loadData();
  }, [fetchCompanies, fetchAllOffices, fetchAllEmployees, fetchAllClients, fetchAllCargo, fetchUsers]);

  const getStatusLabel = (status) => {
    // Handle null/undefined
    if (status === null || status === undefined) return 'Неизвестен';

    const labels = {
      // Numeric enum values from backend (CargoStatusEnum)
      0: 'Чакаща',       // Created
      1: 'Назначена',    // Assigned
      2: 'Взета',        // PickedUp
      3: 'В транзит',    // InTransit
      4: 'Доставена',    // Delivered
      5: 'Отменена',     // Cancelled
      // String values
      'Created': 'Чакаща',
      'Assigned': 'Назначена',
      'PickedUp': 'Взета',
      'InTransit': 'В транзит',
      'Delivered': 'Доставена',
      'Cancelled': 'Отменена',
    };
    return labels[status] !== undefined ? labels[status] : `Статус ${status}`;
  };

  const getStatusClass = (status) => {
    // Handle null/undefined
    if (status === null || status === undefined) return 'pending';

    const classes = {
      // Numeric enum values from backend (CargoStatusEnum)
      0: 'pending',      // Created
      1: 'assigned',     // Assigned
      2: 'picked-up',    // PickedUp
      3: 'in-transit',   // InTransit
      4: 'delivered',    // Delivered
      5: 'cancelled',    // Cancelled
      // String values
      'Created': 'pending',
      'Assigned': 'assigned',
      'PickedUp': 'picked-up',
      'InTransit': 'in-transit',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled',
    };
    return classes[status] !== undefined ? classes[status] : 'pending';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'N/A';
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return 'N/A';
    const user = users.find(u => u.id === employee.userId);
    return user?.name || 'N/A';
  };

  // Filter cargo based on:
  // 1. Company filter and status filter
  // 2. User can see cargo if they're associated with the company OR they're the sender
  const filteredCargo = cargo.filter(c => {
    const cargoStatusValue = c.cargoStatus ?? c.status;

    // Filter by status (compare as numbers since select values are strings)
    if (statusFilter !== 'all' && parseInt(cargoStatusValue) !== parseInt(statusFilter)) return false;

    // Filter by company
    if (companyFilter !== 'all' && c.companyId !== parseInt(companyFilter)) return false;

    // User can see if:
    // - They're associated with the cargo's company
    // - They're the sender
    const isSender = c.senderId === currentUser?.id;
    const isAssociated = isAssociatedWithCompany(c.companyId);

    return isSender || isAssociated;
  }).sort((a, b) => a.id - b.id);

  const handleStatusChange = async (cargoId, newStatus) => {
    setIsUpdating(true);
    try {
      const cargoItem = cargo.find(c => c.id === cargoId);
      if (cargoItem) {
        const newArrivalDate = newStatus === cargoStatus.DELIVERED ? new Date().toISOString() : cargoItem.arrivalDate;
        await updateCargo(cargoId, {
          ...cargoItem,
          cargoStatus: newStatus,
          arrivalDate: newArrivalDate
        });
        if (selectedCargo && selectedCargo.id === cargoId) {
          setSelectedCargo({
            ...selectedCargo,
            cargoStatus: newStatus,
            arrivalDate: newArrivalDate
          });
        }
        await fetchAllCargo();
      }
    } catch (error) {
      showError('Грешка при промяна на статус: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Изтриване на пратка',
      message: 'Сигурни ли сте, че искате да изтриете тази пратка?',
      confirmText: 'Изтрий',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteCargo(id);
        showSuccess('Пратката е изтрита успешно');
      } catch (error) {
        showError('Грешка при изтриване: ' + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h1>Пратки</h1>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Статус:</label>
          <Dropdown
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Всички' },
              { value: cargoStatus.CREATED, label: 'Чакащи' },
              { value: cargoStatus.ASSIGNED, label: 'Назначени' },
              { value: cargoStatus.PICKED_UP, label: 'Взети' },
              { value: cargoStatus.IN_TRANSIT, label: 'В транзит' },
              { value: cargoStatus.DELIVERED, label: 'Доставени' },
              { value: cargoStatus.CANCELLED, label: 'Отменени' }
            ]}
            searchable={false}
          />
        </div>

        {associatedCompanies.length > 1 && (
          <div className="filter-group">
            <label>Компания:</label>
            <Dropdown
              name="companyFilter"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Всички' },
                ...associatedCompanies.map(company => ({
                  value: company.id,
                  label: company.name
                }))
              ]}
              searchable={false}
            />
          </div>
        )}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Подател</th>
              <th>Получател</th>
              <th>Компания</th>
              <th>Тегло</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Дата на доставка</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredCargo.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">Няма намерени пратки</td>
              </tr>
            ) : (
              filteredCargo.map(item => {
                // Use ?? instead of || because 0 is a valid status (Created)
                const statusValue = item.cargoStatus ?? item.status;
                const canManage = canManageCargo(item.companyId);

                return (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{getUserName(item.senderId)}</td>
                    <td>{getUserName(item.recieverId || item.receiverId)}</td>
                    <td>{companies.find(c => c.id === item.companyId)?.name || 'N/A'}</td>
                    <td>{item.weight} кг</td>
                    <td>{(item.price || 0).toFixed(2)} лв.</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(statusValue)}`}>
                        {getStatusLabel(statusValue)}
                      </span>
                    </td>
                    <td>{formatDate(item.arrivalDate)}</td>
                    <td className="actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setSelectedCargo(item)}
                      >
                        Детайли
                      </button>
                      {canManage && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Изтрий
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedCargo && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Пратка #{selectedCargo.id}</h2>
              <button className="modal-close" onClick={() => setSelectedCargo(null)}>&times;</button>
            </div>
            <div className="cargo-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Подател:</label>
                  <span>{getUserName(selectedCargo.senderId)}</span>
                </div>
                <div className="detail-item">
                  <label>Получател:</label>
                  <span>{getUserName(selectedCargo.recieverId || selectedCargo.receiverId)}</span>
                </div>
                <div className="detail-item">
                  <label>Адрес на подател:</label>
                  <span>{selectedCargo.senderAddress}</span>
                </div>
                <div className="detail-item">
                  <label>Адрес на получател:</label>
                  <span>
                    {selectedCargo.arrivalLocationType === arrivalLocationType.OFFICE
                      ? `До офис: ${offices.find(o => o.id === selectedCargo.officeDeliveredToId)?.location || 'N/A'}`
                      : selectedCargo.recieverAddress || selectedCargo.receiverAddress}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Тегло:</label>
                  <span>{selectedCargo.weight} кг</span>
                </div>
                <div className="detail-item">
                  <label>Цена:</label>
                  <span>{(selectedCargo.price || 0).toFixed(2)} лв.</span>
                </div>
                <div className="detail-item">
                  <label>Компания:</label>
                  <span>{companies.find(c => c.id === selectedCargo.companyId)?.name}</span>
                </div>
                <div className="detail-item">
                  <label>Регистрирана от:</label>
                  <span>{getEmployeeName(selectedCargo.employeeId)}</span>
                </div>
                <div className="detail-item">
                  <label>Дата на доставка:</label>
                  <span>{formatDate(selectedCargo.arrivalDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Статус:</label>
                  <span className={`status-badge ${getStatusClass(selectedCargo.cargoStatus ?? selectedCargo.status)}`}>
                    {getStatusLabel(selectedCargo.cargoStatus ?? selectedCargo.status)}
                  </span>
                </div>
              </div>

              {canManageCargo(selectedCargo.companyId) && (
                <div className="status-actions">
                  <label>Промени статус:</label>
                  <div className="status-buttons">
                    <button
                      className={`btn btn-sm ${(selectedCargo.cargoStatus ?? selectedCargo.status) === cargoStatus.CREATED ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleStatusChange(selectedCargo.id, cargoStatus.CREATED)}
                      disabled={isUpdating}
                    >
                      Чакаща
                    </button>
                    <button
                      className={`btn btn-sm ${(selectedCargo.cargoStatus ?? selectedCargo.status) === cargoStatus.ASSIGNED ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleStatusChange(selectedCargo.id, cargoStatus.ASSIGNED)}
                      disabled={isUpdating}
                    >
                      Назначена
                    </button>
                    <button
                      className={`btn btn-sm ${(selectedCargo.cargoStatus ?? selectedCargo.status) === cargoStatus.PICKED_UP ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleStatusChange(selectedCargo.id, cargoStatus.PICKED_UP)}
                      disabled={isUpdating}
                    >
                      Взета
                    </button>
                    <button
                      className={`btn btn-sm ${(selectedCargo.cargoStatus ?? selectedCargo.status) === cargoStatus.IN_TRANSIT ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleStatusChange(selectedCargo.id, cargoStatus.IN_TRANSIT)}
                      disabled={isUpdating}
                    >
                      В транзит
                    </button>
                    <button
                      className={`btn btn-sm ${(selectedCargo.cargoStatus ?? selectedCargo.status) === cargoStatus.DELIVERED ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleStatusChange(selectedCargo.id, cargoStatus.DELIVERED)}
                      disabled={isUpdating}
                    >
                      Доставена
                    </button>
                    <button
                      className={`btn btn-sm ${(selectedCargo.cargoStatus ?? selectedCargo.status) === cargoStatus.CANCELLED ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleStatusChange(selectedCargo.id, cargoStatus.CANCELLED)}
                      disabled={isUpdating}
                    >
                      Отменена
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedCargo(null)}>
                Затвори
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cargo;
