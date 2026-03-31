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
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-search" style={{ padding: '16px' }}>
        <input type="text" className="input-field" placeholder="Search menu..." />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
}
