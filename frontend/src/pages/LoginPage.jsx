import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>
      <div className="login-bg-overlay"></div>

      <div className="login-card">
        <div className="login-logo-container">
          <img
            src="/assets/images/ap_logo.png"
            alt="Andhra Pradesh Police Logo"
            className="login-logo-img"
          />
        </div>

        <div className="login-header">
          <h1>Andhra Pradesh Police</h1>
          <p>Hierarchy Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} id="login-form">
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              color: '#ef4444',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="input-block">
            <label htmlFor="login-username">Official Identifier</label>
            <input
              id="login-username"
              type="text"
              className="login-input-field"
              placeholder="Username or Unit ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-block">
            <label htmlFor="login-password">Access Credentials</label>
            <input
              id="login-password"
              type="password"
              className="login-input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading} id="login-submit-btn">
            {loading ? 'Authenticating...' : 'Authorize Access'}
          </button>
        </form>

        <div className="login-footer-branding">
          <p>Ministry of Home Affairs</p>
          <p><strong>Government of Andhra Pradesh</strong></p>
        </div>
      </div>
    </div>
  );
}
