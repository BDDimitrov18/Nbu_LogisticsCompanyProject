import { useData } from '../context/DataContext';

const ReportsEmployees = () => {
  const {
    employees, cargo,
    getUserById, getCompanyById, getOfficeById,
    employeeRoles, cargoStatus
  } = useData();

  const getRoleLabel = (role) => {
    return role === employeeRoles.COURIER ? 'Куриер' : 'Офис служител';
  };

  // Helper to get status value (backend uses cargoStatus)
  const getStatusValue = (c) => c.cargoStatus ?? c.status;

  const employeeStats = employees.map(employee => {
    const user = getUserById(employee.userId);
    const company = getCompanyById(employee.companyId);
    const office = getOfficeById(employee.officeId);
    const employeeCargo = cargo.filter(c => c.employeeId === employee.id);

    return {
      id: employee.id,
      name: user?.name || 'N/A',
      email: user?.email || 'N/A',
      phone: user?.phone || 'N/A',
      company: company?.name || 'N/A',
      office: office?.location || 'N/A',
      role: employee.role,
      totalCargo: employeeCargo.length,
      pending: employeeCargo.filter(c => getStatusValue(c) === cargoStatus.CREATED).length,
      inTransit: employeeCargo.filter(c => getStatusValue(c) === cargoStatus.IN_TRANSIT).length,
      delivered: employeeCargo.filter(c => getStatusValue(c) === cargoStatus.DELIVERED).length,
      returned: employeeCargo.filter(c => getStatusValue(c) === cargoStatus.CANCELLED).length,
      revenue: employeeCargo.reduce((sum, c) => sum + (c.price || 0), 0)
    };
  });

  const sortedByRevenue = [...employeeStats].sort((a, b) => b.revenue - a.revenue);
  const sortedByCargo = [...employeeStats].sort((a, b) => b.totalCargo - a.totalCargo);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Справка по служители</h1>
      </div>

      <div className="stats-section">
        <h2>Всички служители</h2>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Име</th>
                <th>Компания</th>
                <th>Офис</th>
                <th>Роля</th>
                <th>Пратки</th>
                <th>Чакащи</th>
                <th>В транзит</th>
                <th>Доставени</th>
                <th>Приход</th>
              </tr>
            </thead>
            <tbody>
              {employeeStats.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="cell-main">{emp.name}</div>
                    <div className="cell-sub">{emp.email}</div>
                  </td>
                  <td>{emp.company}</td>
                  <td className="cell-location">{emp.office}</td>
                  <td>
                    <span className={`role-badge ${emp.role}`}>
                      {getRoleLabel(emp.role)}
                    </span>
                  </td>
                  <td><strong>{emp.totalCargo}</strong></td>
                  <td>{emp.pending}</td>
                  <td>{emp.inTransit}</td>
                  <td>{emp.delivered}</td>
                  <td><strong>{emp.revenue.toFixed(2)} лв.</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="stats-section">
        <h2>Топ служители по брой пратки</h2>
        <div className="ranking-list">
          {sortedByCargo.slice(0, 5).map((emp, index) => (
            <div key={emp.id} className="ranking-item">
              <div className="ranking-position">#{index + 1}</div>
              <div className="ranking-info">
                <div className="ranking-name">{emp.name}</div>
                <div className="ranking-details">
                  {emp.company} | {getRoleLabel(emp.role)}
                </div>
              </div>
              <div className="ranking-stats">
                <div className="ranking-value">{emp.totalCargo}</div>
                <div className="ranking-label">пратки</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h2>Топ служители по приход</h2>
        <div className="ranking-list">
          {sortedByRevenue.slice(0, 5).map((emp, index) => (
            <div key={emp.id} className="ranking-item">
              <div className="ranking-position">#{index + 1}</div>
              <div className="ranking-info">
                <div className="ranking-name">{emp.name}</div>
                <div className="ranking-details">
                  {emp.company} | {getRoleLabel(emp.role)}
                </div>
              </div>
              <div className="ranking-stats">
                <div className="ranking-value">{emp.revenue.toFixed(2)} лв.</div>
                <div className="ranking-label">приход</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h2>Статистика по роли</h2>
        <div className="role-stats">
          <div className="role-stat-card">
            <h4>Куриери</h4>
            <div className="role-stat-value">
              {employees.filter(e => e.role === employeeRoles.COURIER).length}
            </div>
            <div className="role-stat-details">
              <span>Пратки: {cargo.filter(c => {
                const emp = employees.find(e => e.id === c.employeeId);
                return emp?.role === employeeRoles.COURIER;
              }).length}</span>
            </div>
          </div>
          <div className="role-stat-card">
            <h4>Офис служители</h4>
            <div className="role-stat-value">
              {employees.filter(e => e.role === employeeRoles.OFFICE_STAFF).length}
            </div>
            <div className="role-stat-details">
              <span>Пратки: {cargo.filter(c => {
                const emp = employees.find(e => e.id === c.employeeId);
                return emp?.role === employeeRoles.OFFICE_STAFF;
              }).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsEmployees;
