import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const Dashboard = () => {
  const { currentUser, userRole, userDetails } = useAuth();
  const {
    getStatistics,
    getCargoByEmployee,
    getCargoBySender,
    getCargoByReceiver,
    fetchCompanies,
    fetchAllOffices,
    fetchAllEmployees,
    fetchAllClients,
    fetchAllCargo,
    cargoStatus
  } = useData();

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      await Promise.all([
        fetchCompanies(),
        fetchAllOffices(),
        fetchAllEmployees(),
        fetchAllClients(),
        fetchAllCargo()
      ]);
      setPageLoading(false);
    };
    loadData();
  }, [fetchCompanies, fetchAllOffices, fetchAllEmployees, fetchAllClients, fetchAllCargo]);

  const stats = getStatistics();

  const getStatusLabel = (status) => {
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

  const renderAdminDashboard = () => (
    <div className="dashboard">
      <h2>Административен панел</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalCompanies}</h3>
          <p>Компании</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalEmployees}</h3>
          <p>Служители</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalClients}</h3>
          <p>Клиенти</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalOffices}</h3>
          <p>Офиси</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalCargo}</h3>
          <p>Пратки общо</p>
        </div>
        <div className="stat-card highlight">
          <h3>{stats.totalRevenue.toFixed(2)} лв.</h3>
          <p>Общ приход</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Статус на пратки</h3>
        <div className="status-grid">
          <div className="status-card pending">
            <h4>{stats.cargoByStatus.pending}</h4>
            <p>Чакащи</p>
          </div>
          <div className="status-card in-transit">
            <h4>{stats.cargoByStatus.inTransit}</h4>
            <p>В транзит</p>
          </div>
          <div className="status-card delivered">
            <h4>{stats.cargoByStatus.delivered}</h4>
            <p>Доставени</p>
          </div>
          <div className="status-card returned">
            <h4>{stats.cargoByStatus.returned}</h4>
            <p>Върнати</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => {
    const myCargo = getCargoByEmployee(userDetails?.id || 0);
    const getStatus = (c) => c.cargoStatus ?? c.status;
    const pendingCargo = myCargo.filter(c => getStatus(c) === cargoStatus.CREATED);
    const inTransitCargo = myCargo.filter(c => getStatus(c) === cargoStatus.IN_TRANSIT);
    const deliveredCargo = myCargo.filter(c => getStatus(c) === cargoStatus.DELIVERED);
    const myRevenue = myCargo.reduce((sum, c) => sum + (c.price || 0), 0);

    return (
      <div className="dashboard">
        <h2>Панел на служител</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{myCargo.length}</h3>
            <p>Мои пратки</p>
          </div>
          <div className="stat-card pending">
            <h3>{pendingCargo.length}</h3>
            <p>Чакащи</p>
          </div>
          <div className="stat-card in-transit">
            <h3>{inTransitCargo.length}</h3>
            <p>В транзит</p>
          </div>
          <div className="stat-card delivered">
            <h3>{deliveredCargo.length}</h3>
            <p>Доставени</p>
          </div>
          <div className="stat-card highlight">
            <h3>{myRevenue.toFixed(2)} лв.</h3>
            <p>Мой приход</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Последни регистрирани пратки</h3>
          {myCargo.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Тегло</th>
                  <th>Цена</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {myCargo.slice(-5).reverse().map(c => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td>{c.weight} кг</td>
                    <td>{(c.price || 0).toFixed(2)} лв.</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(c.cargoStatus ?? c.status)}`}>
                        {getStatusLabel(c.cargoStatus ?? c.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">Нямате регистрирани пратки</p>
          )}
        </div>
      </div>
    );
  };

  const renderClientDashboard = () => {
    const sentCargo = getCargoBySender(userDetails?.id || 0);
    const receivedCargo = getCargoByReceiver(userDetails?.id || 0);
    const allCargo = [...sentCargo, ...receivedCargo.filter(c => !sentCargo.find(s => s.id === c.id))];
    const getStatus = (c) => c.cargoStatus ?? c.status;

    return (
      <div className="dashboard">
        <h2>Панел на клиент</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{sentCargo.length}</h3>
            <p>Изпратени пратки</p>
          </div>
          <div className="stat-card">
            <h3>{receivedCargo.length}</h3>
            <p>Получени пратки</p>
          </div>
          <div className="stat-card">
            <h3>{allCargo.filter(c => getStatus(c) === cargoStatus.IN_TRANSIT).length}</h3>
            <p>В транзит</p>
          </div>
          <div className="stat-card highlight">
            <h3>{sentCargo.reduce((sum, c) => sum + (c.price || 0), 0).toFixed(2)} лв.</h3>
            <p>Общо платено</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Моите пратки</h3>
          {allCargo.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Тип</th>
                  <th>Адрес</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {allCargo.slice(-5).reverse().map(c => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td>{c.senderId === userDetails?.id ? 'Изпратена' : 'Получена'}</td>
                    <td>{c.recieverAddress || c.receiverAddress || 'До офис'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(c.cargoStatus ?? c.status)}`}>
                        {getStatusLabel(c.cargoStatus ?? c.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">Нямате пратки</p>
          )}
        </div>
      </div>
    );
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
      {userRole === 'admin' && renderAdminDashboard()}
      {userRole === 'employee' && renderEmployeeDashboard()}
      {userRole === 'client' && renderClientDashboard()}
    </div>
  );
};

export default Dashboard;
