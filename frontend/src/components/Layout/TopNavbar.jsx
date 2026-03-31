import React, { useRef } from 'react';
import { HiOutlineBell, HiOutlineLogout, HiChevronDown, HiMenu, HiCamera } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import useUiStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../../services/api';

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUiStore();
  const { updateUser } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Upload image
      const uploadRes = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const imageUrl = uploadRes.data.url;
        
        // 2. Update user profile
        const profileRes = await api.put('/auth/profile', { avatar_url: imageUrl });
        
        if (profileRes.data.success) {
          updateUser(profileRes.data.user);
        }
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    }
  };

  // Base URL for images
  const API_BASE_URL = BASE_URL;

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        {/* ... existing code ... */}
        <button className="btn-ghost btn-icon sidebar-toggle-btn d-md-none" onClick={toggleSidebar} style={{ color: 'white' }}>
          <HiMenu size={24} />
        </button>
        <div className="navbar-brand">
          <div className="brand-logo" style={{ fontSize: '28px', display: 'flex' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="3" fill="#ff4757" />
              <path d="M7 12c1.5-2 3-2 10 0" stroke="#00e5ff" strokeWidth="1" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="text-white font-bold" style={{ fontWeight: 800 }}>POLICE MANAGEMENT</span>
            <span className="text-cyan font-bold" style={{ fontWeight: 400, color: '#00e5ff' }}>HIRERARCHY SYSTEM</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn notification-btn">
          <HiOutlineBell size={20} />
          <span className="badge-dot">1</span>
        </button>
        <button className="navbar-icon-btn logout-btn" onClick={handleLogout} title="Logout">
          <HiOutlineLogout size={20} />
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange}
        />

        <div className="navbar-user">
          <div className="user-avatar-wrapper" onClick={handleAvatarClick} title="Change Profile Picture">
            {user?.avatar_url ? (
              <img 
                src={`${API_BASE_URL}${user.avatar_url}`} 
                alt="User Avatar" 
                className="user-profile-img"
              />
            ) : (
              <div className="user-avatar-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
            <div className="avatar-edit-overlay">
              <HiCamera size={14} />
            </div>
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Police'}</div>
          </div>
          <HiChevronDown className="user-dropdown-icon" />
        </div>
      </div>
    </header>
  );
}
