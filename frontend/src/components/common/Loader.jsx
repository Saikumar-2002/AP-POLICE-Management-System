import React from 'react';

export default function Loader({ text = 'Loading...', inline = false }) {
  if (inline) {
    return (
      <div className="flex items-center gap-sm">
        <span className="spinner-inline"></span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{text}</span>
      </div>
    );
  }

  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
      <div className="loader-text">{text}</div>
    </div>
  );
}
