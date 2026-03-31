import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineShieldCheck } from 'react-icons/hi';
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
      <div className="login-bg">
        <div className="login-bg-orb"></div>
        <div className="login-bg-orb"></div>
        <div className="login-bg-orb"></div>
      </div>

      <div className="login-card">
        <div className="login-logo">
          <HiOutlineShieldCheck />
        </div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Police Hierarchy Management System</p>

        <form className="login-form" onSubmit={handleSubmit} id="login-form">
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              fontSize: '0.8125rem',
            }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="input-field"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit-btn">
            {loading ? <span className="spinner-inline"></span> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-demo-info">
          <p>Demo Credentials</p>
          <code>
            Admin: admin / admin123<br />
            Manager: manager / manager123<br />
            Viewer: viewer / viewer123
          </code>
        </div>
      </div>
    </div>
  );
}
