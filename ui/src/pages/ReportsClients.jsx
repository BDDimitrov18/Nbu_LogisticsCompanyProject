import { useData } from '../context/DataContext';

const ReportsClients = () => {
  const {
    clients, cargo,
    getUserById, getCompanyById,
    cargoStatus
  } = useData();

  // Helper to get status value (backend uses cargoStatus)
  const getStatusValue = (c) => c.cargoStatus ?? c.status;

  const clientStats = clients.map(client => {
    const user = getUserById(client.userId);
    const company = getCompanyById(client.companyId);
    const sentCargo = cargo.filter(c => c.senderId === client.id);
    const receivedCargo = cargo.filter(c => c.receiverId === client.id);

    return {
      id: client.id,
      name: user?.name || 'N/A',
      email: user?.email || 'N/A',
      phone: user?.phone || 'N/A',
      company: company?.name || 'N/A',
      sent: sentCargo.length,
      received: receivedCargo.length,
      totalCargo: sentCargo.length + receivedCargo.length,
      sentPending: sentCargo.filter(c => getStatusValue(c) === cargoStatus.CREATED).length,
      sentInTransit: sentCargo.filter(c => getStatusValue(c) === cargoStatus.IN_TRANSIT).length,
      sentDelivered: sentCargo.filter(c => getStatusValue(c) === cargoStatus.DELIVERED).length,
      spentAmount: sentCargo.reduce((sum, c) => sum + (c.price || 0), 0)
    };
  });

  const sortedBySpent = [...clientStats].sort((a, b) => b.spentAmount - a.spentAmount);
  const sortedBySent = [...clientStats].sort((a, b) => b.sent - a.sent);
  const sortedByReceived = [...clientStats].sort((a, b) => b.received - a.received);

  const totalSent = clientStats.reduce((sum, c) => sum + c.sent, 0);
  const totalReceived = clientStats.reduce((sum, c) => sum + c.received, 0);
  const totalSpent = clientStats.reduce((sum, c) => sum + c.spentAmount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Справка по клиенти</h1>
      </div>

      <div className="stats-overview">
        <h2>Обобщена статистика</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{clients.length}</div>
            <div className="stat-label">Общо клиенти</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalSent}</div>
            <div className="stat-label">Изпратени пратки</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalReceived}</div>
            <div className="stat-label">Получени пратки</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{totalSpent.toFixed(2)} лв.</div>
            <div className="stat-label">Общо платено</div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Всички клиенти</h2>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Име</th>
                <th>Компания</th>
                <th>Изпратени</th>
                <th>Получени</th>
                <th>Чакащи</th>
                <th>В транзит</th>
                <th>Доставени</th>
                <th>Платено</th>
              </tr>
            </thead>
            <tbody>
              {clientStats.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="cell-main">{client.name}</div>
                    <div className="cell-sub">{client.email}</div>
                  </td>
                  <td>{client.company}</td>
                  <td><strong>{client.sent}</strong></td>
                  <td><strong>{client.received}</strong></td>
                  <td>{client.sentPending}</td>
                  <td>{client.sentInTransit}</td>
                  <td>{client.sentDelivered}</td>
                  <td><strong>{client.spentAmount.toFixed(2)} лв.</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2"><strong>Общо</strong></td>
                <td><strong>{totalSent}</strong></td>
                <td><strong>{totalReceived}</strong></td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td><strong>{totalSpent.toFixed(2)} лв.</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="stats-grid-3">
        <div className="stats-section">
          <h2>Топ по изпратени пратки</h2>
          <div className="ranking-list compact">
            {sortedBySent.slice(0, 5).map((client, index) => (
              <div key={client.id} className="ranking-item">
                <div className="ranking-position">#{index + 1}</div>
                <div className="ranking-info">
                  <div className="ranking-name">{client.name}</div>
                </div>
                <div className="ranking-stats">
                  <div className="ranking-value">{client.sent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <h2>Топ по получени пратки</h2>
          <div className="ranking-list compact">
            {sortedByReceived.slice(0, 5).map((client, index) => (
              <div key={client.id} className="ranking-item">
                <div className="ranking-position">#{index + 1}</div>
                <div className="ranking-info">
                  <div className="ranking-name">{client.name}</div>
                </div>
                <div className="ranking-stats">
                  <div className="ranking-value">{client.received}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <h2>Топ по платена сума</h2>
          <div className="ranking-list compact">
            {sortedBySpent.slice(0, 5).map((client, index) => (
              <div key={client.id} className="ranking-item">
                <div className="ranking-position">#{index + 1}</div>
                <div className="ranking-info">
                  <div className="ranking-name">{client.name}</div>
                </div>
                <div className="ranking-stats">
                  <div className="ranking-value">{client.spentAmount.toFixed(2)} лв.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsClients;
