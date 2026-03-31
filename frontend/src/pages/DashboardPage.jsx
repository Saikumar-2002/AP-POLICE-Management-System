import React, { useEffect, useState } from 'react';
import { HiOutlineGlobeAlt, HiOutlineMap, HiOutlineBuildingOffice2, HiOutlineMapPin, HiOutlineShieldCheck, HiOutlineSquares2X2 } from 'react-icons/hi2';
import HierarchyTree from '../components/Tree/HierarchyTree';
import Modal from '../components/common/Modal';
import UnitForm from '../components/Units/UnitForm';
import useUnitStore from '../store/unitStore';
import useUiStore from '../store/uiStore';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export default function DashboardPage() {
  const { tree, stats, loading, fetchTree, fetchAllUnits, units, createUnit, updateUnit, deleteUnit } = useUnitStore();
  const { addToast } = useUiStore();
  const { canEdit } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [parentForNew, setParentForNew] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchTree();
    fetchAllUnits();
  }, []);

  const handleAdd = (parentNode) => {
    setParentForNew(parentNode);
    setEditUnit(null);
    setShowCreateModal(true);
  };

  const handleEdit = (node) => {
    setEditUnit(node);
    setParentForNew(null);
    setShowCreateModal(true);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      await deleteUnit(showDeleteConfirm.id);
      addToast({ type: 'success', message: `"${showDeleteConfirm.name}" deleted successfully` });
      setShowDeleteConfirm(null);
    } catch {
      addToast({ type: 'error', message: 'Failed to delete unit' });
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editUnit) {
        await updateUnit(editUnit.id, data);
        addToast({ type: 'success', message: `"${data.name}" updated successfully` });
      } else {
        await createUnit(data);
        addToast({ type: 'success', message: `"${data.name}" created successfully` });
      }
      setShowCreateModal(false);
      setEditUnit(null);
      setParentForNew(null);
    } catch {
      addToast({ type: 'error', message: 'Operation failed. Please try again.' });
    }
  };

  const statCards = [
    { label: 'Total Units', value: stats.total, icon: <HiOutlineSquares2X2 />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
    { label: 'Zones', value: stats.zones, icon: <HiOutlineGlobeAlt />, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)' },
    { label: 'Ranges', value: stats.ranges, icon: <HiOutlineMap />, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)' },
    { label: 'Districts', value: stats.districts, icon: <HiOutlineBuildingOffice2 />, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
    { label: 'Circles', value: stats.circles, icon: <HiOutlineMapPin />, color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' },
    { label: 'Stations', value: stats.stations, icon: <HiOutlineShieldCheck />, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of the police hierarchy structure</p>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          {statCards.map((card, i) => (
            <div className="stat-card" key={card.label} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-card-value" style={{ color: card.color }}>{card.value}</div>
              <div className="stat-card-label">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tree */}
        <div className="card">
          <div className="card-header">
            <h2>Hierarchy Tree</h2>
            {canEdit && (
              <button className="btn btn-primary btn-sm" onClick={() => handleAdd(null)} id="add-root-unit-btn">
                + Add Root Unit
              </button>
            )}
          </div>
          {loading && tree.length === 0 ? (
            <Loader inline text="Loading hierarchy..." />
          ) : (
            <HierarchyTree
              tree={tree}
              onEdit={handleEdit}
              onDelete={(node) => setShowDeleteConfirm(node)}
              onAdd={handleAdd}
              canEdit={canEdit}
              loading={loading}
              onRefresh={fetchTree}
            />
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditUnit(null);
          setParentForNew(null);
        }}
        title={editUnit ? 'Edit Unit' : 'Create New Unit'}
      >
        <UnitForm
          initialData={editUnit}
          parentUnit={parentForNew}
          allUnits={units}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowCreateModal(false);
            setEditUnit(null);
            setParentForNew(null);
          }}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Unit"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete-btn">
              Delete
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{showDeleteConfirm?.name}"</strong>?
        </p>
        <p style={{ color: 'var(--warning)', fontSize: '0.8125rem', marginTop: '8px' }}>
          ⚠ Child units will become root-level units after deletion.
        </p>
      </Modal>
    </div>
  );
}
