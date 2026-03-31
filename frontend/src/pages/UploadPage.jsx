import React from 'react';
import ExcelUpload from '../components/Upload/ExcelUpload';
import useUnitStore from '../store/unitStore';
import useUiStore from '../store/uiStore';
import { useAuth } from '../hooks/useAuth';

export default function UploadPage() {
  const { uploadExcel, loading } = useUnitStore();
  const { addToast } = useUiStore();
  const { isAdmin } = useAuth();

  const handleUpload = async (file, onProgress, clearExisting) => {
    try {
      const result = await uploadExcel(file, onProgress, clearExisting);
      addToast({ type: 'success', message: 'Excel file processed successfully!' });
      return result;
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to process Excel file' });
      throw err;
    }
  };

  if (!isAdmin) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Excel Upload</h1>
          <p className="page-subtitle">Import police unit data from Excel files</p>
        </div>
        <div className="page-body">
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <div className="empty-state-title">Access Restricted</div>
            <div className="empty-state-text">
              Only administrators can upload Excel data files.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Excel Upload</h1>
        <p className="page-subtitle">Import police unit hierarchy data from Excel files</p>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <h2>Upload Excel File</h2>
          </div>
          <ExcelUpload onUpload={handleUpload} loading={loading} />
        </div>

        {/* Expected Format Info */}
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h2>Expected Excel Format</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
            Your Excel file should contain the following columns:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Description</th>
                  <th>Required</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code style={{ color: 'var(--accent-tertiary)' }}>unitCode</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Unique identifier for the unit</td>
                  <td><span className="badge badge-zone">Required</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>AP001</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-tertiary)' }}>name</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Name of the police unit</td>
                  <td><span className="badge badge-zone">Required</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>Vijayawada Zone</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-tertiary)' }}>unitType</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Type: zone, range, district, circle, station</td>
                  <td><span className="badge badge-zone">Required</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>zone</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-tertiary)' }}>parentUnitCode</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Unit code of the parent (empty for root)</td>
                  <td><span className="badge badge-circle">Optional</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>AP000</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-tertiary)' }}>ministry</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Ministry name</td>
                  <td><span className="badge badge-circle">Optional</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>Home Ministry</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-tertiary)' }}>department</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Department name</td>
                  <td><span className="badge badge-circle">Optional</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>AP Police</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-tertiary)' }}>legacyReference</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Legacy reference code</td>
                  <td><span className="badge badge-circle">Optional</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>REF-001</td>
                </tr>
                <tr>
                  <td><code style={{ color: 'var(--accent-tertiary)' }}>isVirtual</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>Whether the unit is virtual (true/false)</td>
                  <td><span className="badge badge-circle">Optional</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>false</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
