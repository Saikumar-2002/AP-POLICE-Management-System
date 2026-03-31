import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineOfficeBuilding, HiOutlineUpload, HiOutlineLogout, HiOutlineMenu } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import useUiStore from '../../store/uiStore';

const navItems = [
  { to: '/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
  { to: '/units', icon: <HiOutlineOfficeBuilding />, label: 'Unit Management' },
  { to: '/upload', icon: <HiOutlineUpload />, label: 'Excel Upload', adminOnly: true },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">🏛</div>
        <div>
          <div className="sidebar-title">Police Station Hierarchy</div>
          <div className="sidebar-subtitle">Management System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{user?.role || 'viewer'}</div>
          </div>
          <button className="btn-ghost btn-icon" onClick={handleLogout} title="Logout" style={{ marginLeft: 'auto' }}>
            <HiOutlineLogout />
          </button>
        </div>
      </div>
    </aside>
  );
}
