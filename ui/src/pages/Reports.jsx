import { useData } from '../context/DataContext';

const Reports = () => {
  const {
    cargo, companies, employees, clients, offices,
    cargoStatus
  } = useData();

  // Helper to get status value (backend uses cargoStatus)
  const getStatusValue = (c) => c.cargoStatus ?? c.status;

  const stats = {
    totalCompanies: companies.length,
    totalEmployees: employees.length,
    totalClients: clients.length,
    totalOffices: offices.length,
    totalCargo: cargo.length,
    pendingCargo: cargo.filter(c => getStatusValue(c) === cargoStatus.CREATED).length,
    inTransitCargo: cargo.filter(c => getStatusValue(c) === cargoStatus.IN_TRANSIT).length,
    deliveredCargo: cargo.filter(c => getStatusValue(c) === cargoStatus.DELIVERED).length,
    returnedCargo: cargo.filter(c => getStatusValue(c) === cargoStatus.CANCELLED).length,
    totalRevenue: cargo.reduce((sum, c) => sum + (c.price || 0), 0),
    totalWeight: cargo.reduce((sum, c) => sum + (c.weight || 0), 0)
  };

  const companyStats = companies.map(company => {
    const companyCargo = cargo.filter(c => c.companyId === company.id);
    const companyEmployees = employees.filter(e => e.companyId === company.id);
    const companyClients = clients.filter(c => c.companyId === company.id);
    const companyOffices = offices.filter(o => o.companyId === company.id);

    return {
      id: company.id,
      name: company.name,
      employees: companyEmployees.length,
      clients: companyClients.length,
      offices: companyOffices.length,
      totalCargo: companyCargo.length,
      delivered: companyCargo.filter(c => getStatusValue(c) === cargoStatus.DELIVERED).length,
      revenue: companyCargo.reduce((sum, c) => sum + (c.price || 0), 0)
    };
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Статистики и справки</h1>
      </div>

      <div className="stats-overview">
        <h2>Обща статистика</h2>
        <div className="stats-grid large">
          <div className="stat-card">
            <div className="stat-value">{stats.totalCompanies}</div>
            <div className="stat-label">Компании</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalOffices}</div>
            <div className="stat-label">Офиси</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalEmployees}</div>
            <div className="stat-label">Служители</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalClients}</div>
            <div className="stat-label">Клиенти</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCargo}</div>
            <div className="stat-label">Пратки общо</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{stats.totalRevenue.toFixed(2)} лв.</div>
            <div className="stat-label">Общ приход</div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Статус на пратките</h2>
        <div className="status-grid">
          <div className="status-card pending">
            <div className="status-value">{stats.pendingCargo}</div>
            <div className="status-label">Чакащи</div>
            <div className="status-percent">
              {((stats.pendingCargo / stats.totalCargo) * 100 || 0).toFixed(1)}%
            </div>
          </div>
          <div className="status-card in-transit">
            <div className="status-value">{stats.inTransitCargo}</div>
            <div className="status-label">В транзит</div>
            <div className="status-percent">
              {((stats.inTransitCargo / stats.totalCargo) * 100 || 0).toFixed(1)}%
            </div>
          </div>
          <div className="status-card delivered">
            <div className="status-value">{stats.deliveredCargo}</div>
            <div className="status-label">Доставени</div>
            <div className="status-percent">
              {((stats.deliveredCargo / stats.totalCargo) * 100 || 0).toFixed(1)}%
            </div>
          </div>
          <div className="status-card returned">
            <div className="status-value">{stats.returnedCargo}</div>
            <div className="status-label">Върнати</div>
            <div className="status-percent">
              {((stats.returnedCargo / stats.totalCargo) * 100 || 0).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Статистика по компании</h2>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Компания</th>
                <th>Офиси</th>
                <th>Служители</th>
                <th>Клиенти</th>
                <th>Пратки</th>
                <th>Доставени</th>
                <th>Приход</th>
              </tr>
            </thead>
            <tbody>
              {companyStats.map(company => (
                <tr key={company.id}>
                  <td><strong>{company.name}</strong></td>
                  <td>{company.offices}</td>
                  <td>{company.employees}</td>
                  <td>{company.clients}</td>
                  <td>{company.totalCargo}</td>
                  <td>{company.delivered}</td>
                  <td>{company.revenue.toFixed(2)} лв.</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Общо</strong></td>
                <td>{stats.totalOffices}</td>
                <td>{stats.totalEmployees}</td>
                <td>{stats.totalClients}</td>
                <td>{stats.totalCargo}</td>
                <td>{stats.deliveredCargo}</td>
                <td><strong>{stats.totalRevenue.toFixed(2)} лв.</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="stats-section">
        <h2>Допълнителна информация</h2>
        <div className="info-grid">
          <div className="info-card">
            <h4>Средна стойност на пратка</h4>
            <p>{(stats.totalRevenue / stats.totalCargo || 0).toFixed(2)} лв.</p>
          </div>
          <div className="info-card">
            <h4>Средно тегло на пратка</h4>
            <p>{(stats.totalWeight / stats.totalCargo || 0).toFixed(2)} кг</p>
          </div>
          <div className="info-card">
            <h4>Общо тегло</h4>
            <p>{stats.totalWeight.toFixed(2)} кг</p>
          </div>
          <div className="info-card">
            <h4>Процент доставени</h4>
            <p>{((stats.deliveredCargo / stats.totalCargo) * 100 || 0).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
