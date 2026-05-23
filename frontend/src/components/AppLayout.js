import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { clearTokens } from '../utils/authStorage';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/clients', label: 'Clients' },
  { to: '/insurance-types', label: 'Insurance Types' },
  { to: '/policies', label: 'Policies' },
  { to: '/claims', label: 'Claims' },
  { to: '/payments', label: 'Payments' }
];

function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearTokens();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Insurance</div>
        <nav className="nav flex-column gap-1">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `nav-link sidebar-link ${isActive ? 'active' : ''}`
              }
              end={item.end}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">Management Portal</p>
            <h1 className="topbar-title">Insurance Management System</h1>
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

