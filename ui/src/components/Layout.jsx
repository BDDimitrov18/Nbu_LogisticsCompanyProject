import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo_transparent.png";

const Layout = () => {
  const {
    currentUser,
    logout,
    employeeRecords,
    clientRecords,
    getAssociatedCompanyIds,
    canManageCargo
  } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get associated companies for cargo permission check
  const associatedCompanyIds = getAssociatedCompanyIds();

  // Check if user is an employee (in any company)
  const isEmployee = employeeRecords.length > 0;

  // Check if user can create cargo (Admin or Office employee in any company)
  const canCreateCargo = associatedCompanyIds.some(companyId => canManageCargo(companyId));

  // Debug logging
  console.log('Employee Records:', employeeRecords);
  console.log('Associated Company IDs:', associatedCompanyIds);
  console.log('Can Create Cargo:', canCreateCargo);
  employeeRecords.forEach(e => {
    console.log(`Employee companyId: ${e.companyId}, role: ${e.role}, type of role: ${typeof e.role}`);
  });

  // Check if user is admin of any company
  const isAdminOfAny = employeeRecords.some(e => e.role === 'Admin' || e.role === 2);

  const getRoleName = () => {
    if (isAdminOfAny) return "Администратор";
    if (isEmployee) return "Служител";
    if (clientRecords.length > 0) return "Клиент";
    return "Потребител";
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-brand">
          <img src={logo} alt="Logo" className="header-logo" />
        </div>
        <div className="header-right">
          <span className="user-info">
            {currentUser?.name || currentUser?.username} ({getRoleName()})
          </span>
          <button onClick={handleLogout} className="btn btn-secondary logout-desktop">
            Изход
          </button>
          <button className="hamburger" onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className="main-container">
        {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
        <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <ul className="nav-menu" onClick={closeSidebar}>
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Начало
              </NavLink>
            </li>

            <li className="nav-section">Управление</li>

            {/* Companies - Everyone can see */}
            <li>
              <NavLink
                to="/companies"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Компании
              </NavLink>
            </li>

            {/* Employees - Everyone can see (data filtered by association) */}
            <li>
              <NavLink
                to="/employees"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Служители
              </NavLink>
            </li>

            {/* Clients - Everyone can see (data filtered by association) */}
            <li>
              <NavLink
                to="/clients"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Клиенти
              </NavLink>
            </li>

            {/* Offices - Everyone can see (data filtered by association) */}
            <li>
              <NavLink
                to="/offices"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Офиси
              </NavLink>
            </li>

            <li className="nav-section">Пратки</li>
            <li>
              <NavLink
                to="/cargo"
                end
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Всички пратки
              </NavLink>
            </li>

            {/* New Cargo - Only if user can manage cargo (Admin or Office employee) */}
            {canCreateCargo && (
              <li>
                <NavLink
                  to="/cargo/new"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Нова пратка
                </NavLink>
              </li>
            )}

            <li className="nav-section">Справки</li>
            <li>
              <NavLink
                to="/reports"
                end
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Статистики
              </NavLink>
            </li>

            {/* Reports by employees - Only if user is an employee */}
            {isEmployee && (
              <li>
                <NavLink
                  to="/reports/employees"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  По служители
                </NavLink>
              </li>
            )}

            <li>
              <NavLink
                to="/reports/clients"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                По клиенти
              </NavLink>
            </li>

            <li className="nav-logout">
              <button onClick={handleLogout} className="nav-logout-btn">
                Изход
              </button>
            </li>
          </ul>
          <div className="sidebar-footer">
            <div className="sidebar-user">
              {currentUser?.name || currentUser?.username}
              <span className="sidebar-role">({getRoleName()})</span>
            </div>
            <button onClick={handleLogout} className="btn btn-logout">
              Изход
            </button>
          </div>
        </nav>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
