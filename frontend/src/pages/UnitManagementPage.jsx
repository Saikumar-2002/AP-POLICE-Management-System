import React, { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import Modal from '../components/common/Modal';
import UnitForm from '../components/Units/UnitForm';
import Loader from '../components/common/Loader';
import useUnitStore from '../store/unitStore';
import useUiStore from '../store/uiStore';
import { useAuth } from '../hooks/useAuth';
import HierarchyTree from '../components/Tree/HierarchyTree';

export default function UnitManagementPage() {
  const { units, tree, loading, fetchAllUnits, fetchTree, createUnit, updateUnit, deleteUnit } = useUnitStore();
  const { addToast } = useUiStore();
  const { canEdit } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // New State for Tabs
  const [activeTab, setActiveTab] = useState('Units');

  useEffect(() => {
    fetchAllUnits();
    fetchTree();
  }, []);

  const filtered = units.filter((u) => {
    const matchSearch = !search ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.unit_code || '').toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || (u.unit_type || u.unitType) === typeFilter;
    return matchSearch && matchType;
  });

  const handleSubmit = async (data) => {
    try {
      if (editUnit) {
        await updateUnit(editUnit.id, data);
        addToast({ type: 'success', message: `"${data.name}" updated` });
      } else {
        await createUnit(data);
        addToast({ type: 'success', message: `"${data.name}" created` });
      }
      setShowForm(false);
      setEditUnit(null);
    } catch {
      addToast({ type: 'error', message: 'Operation failed' });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteUnit(deleteConfirm.id);
      addToast({ type: 'success', message: `"${deleteConfirm.name}" deleted` });
      setDeleteConfirm(null);
    } catch {
      addToast({ type: 'error', message: 'Delete failed' });
    }
  };

  return (
    <div>
      <div className="page-header" style={{ paddingBottom: '0' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
          <div>
            <h1 className="page-title">Unit Management</h1>
            <p className="page-subtitle">View and manage all police units</p>
          </div>
          {canEdit && activeTab === 'Units' && (
            <button className="btn btn-primary" onClick={() => { setEditUnit(null); setShowForm(true); }} id="add-unit-btn">
              <HiPlus /> Add Unit
            </button>
          )}
        </div>

        {/* Unit Management Tabs */}
        <div className="dash-main-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {['Units', 'Organisation Hierarchy'].map(tab => (
            <button
              key={tab}
              className={`dash-main-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ paddingBottom: '16px', marginBottom: '-1px' }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ height: '1px', background: '#e2e8f0', margin: '0 -32px' }}></div>
      </div>

      <div className="page-body">
        {activeTab === 'Units' ? (
          <>
            {/* Filters */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                  <HiSearch style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)'
                  }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search by name or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                    id="unit-search-input"
                  />
                </div>
                <select
                  className="select-field"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{ width: '180px' }}
                  id="unit-type-filter"
                >
                  <option value="">All Types</option>
                  <option value="ministry">Ministry</option>
                  <option value="zone">Zone</option>
                  <option value="range">Range</option>
                  <option value="district">District</option>
                  <option value="division">Division</option>
                  <option value="circle">Circle</option>
                  <option value="station">Station</option>
                </select>
              </div>
              <div style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'flex-end',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}>
                Overall Records: <span style={{ color: '#1e3a8a', marginLeft: '6px' }}>{units.length}</span>
              </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {loading && units.length === 0 ? (
                <div style={{ padding: '40px' }}>
                  <Loader inline text="Loading units..." />
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-title">No units found</div>
                  <div className="empty-state-text">
                    {search || typeFilter ? 'Try different filters' : 'No units have been created yet'}
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Ministry</th>
                        <th>Department</th>
                        <th>Virtual</th>
                        {canEdit && <th style={{ width: '100px' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((unit) => {
                        const unitType = unit.unit_type || unit.unitType || 'other';
                        return (
                          <tr key={unit.id}>
                            <td style={{ fontWeight: 600 }}>{unit.name}</td>
                            <td>
                              <code style={{ fontSize: '0.8125rem', color: 'var(--text-accent)' }}>
                                {unit.unit_code}
                              </code>
                            </td>
                            <td>
                              <span className={`badge badge-${unitType}`}>{unitType}</span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{unit.ministry || '—'}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{unit.department || '—'}</td>
                            <td>{(unit.is_virtual || unit.isVirtual) ? '✓' : '—'}</td>
                            {canEdit && (
                              <td>
                                <div className="flex gap-xs">
                                  <button
                                    className="btn-ghost btn-icon"
                                    onClick={() => { setEditUnit(unit); setShowForm(true); }}
                                    title="Edit"
                                  >
                                    <HiPencil />
                                  </button>
                                  <button
                                    className="btn-ghost btn-icon"
                                    onClick={() => setDeleteConfirm(unit)}
                                    title="Delete"
                                    style={{ color: 'var(--danger)' }}
                                  >
                                    <HiTrash />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                background: '#f8fafc'
              }}>
                Showing {filtered.length} of {units.length} units
              </div>
            </div>
          </>
        ) : (
          /* Organisation Hierarchy Tab */
          <div className="dash-tree-section">
            <div className="tree-container-card" style={{ border: 'none', background: 'transparent', padding: '0' }}>
              {loading && tree.length === 0 ? (
                <Loader inline text="Loading hierarchy..." />
              ) : (
                <HierarchyTree
                  tree={tree}
                  onEdit={(u) => { setEditUnit(u); setShowForm(true); }}
                  onDelete={(node) => setDeleteConfirm(node)}
                  onAdd={(u) => { setEditUnit(null); setShowForm(true); }}
                  canEdit={canEdit}
                  loading={loading}
                  onRefresh={fetchTree}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditUnit(null); }}
        title={editUnit ? 'Edit Unit' : 'Create Unit'}
      >
        <UnitForm
          initialData={editUnit}
          allUnits={units}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditUnit(null); }}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Unit"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Delete <strong style={{ color: 'var(--text-primary)' }}>"{deleteConfirm?.name}"</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
