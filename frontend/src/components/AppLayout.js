import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import httpClient from '../api/httpClient';
import { clearTokens, getRefreshToken } from '../utils/authStorage';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'DB', end: true },
  { to: '/clients', label: 'Clients', icon: 'CL' },
  { to: '/insurance-types', label: 'Insurance Types', icon: 'IT' },
  { to: '/policies', label: 'Policies', icon: 'PO' },
  { to: '/claims', label: 'Claims', icon: 'CA' },
  { to: '/payments', label: 'Payments', icon: 'PY' }
];

function AppLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await httpClient.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error(error);
      }
    }

    clearTokens();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">IM</span>
          <span>
            Insurance
            <small>Management</small>
          </span>
        </div>
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
              <span className="sidebar-icon">{item.icon}</span>
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
          <div className="topbar-actions">
            <span className="user-pill">Active session</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
