import React, { useState, useEffect } from 'react';
import { UNIT_TYPE_ORDER } from '../../utils/treeUtils';

const unitTypes = UNIT_TYPE_ORDER.filter((t) => t !== 'other');

export default function UnitForm({ initialData, allUnits = [], onSubmit, onCancel, loading, parentUnit }) {
  const [form, setForm] = useState({
    unit_code: '',
    name: '',
    unit_type: '',
    parent_id: '',
    ministry: '',
    department: '',
    legacy_reference: '',
    is_virtual: false,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        unit_code: initialData.unit_code || '',
        name: initialData.name || '',
        unit_type: initialData.unit_type || initialData.unitType || '',
        parent_id: initialData.parent_id || initialData.parentId || '',
        ministry: initialData.ministry || '',
        department: initialData.department || '',
        legacy_reference: initialData.legacy_reference || initialData.legacyReference || '',
        is_virtual: initialData.is_virtual || initialData.isVirtual || false,
      });
    } else if (parentUnit) {
      setForm((prev) => ({
        ...prev,
        parent_id: parentUnit.id,
        ministry: parentUnit.ministry || '',
        department: parentUnit.department || '',
      }));
    }
  }, [initialData, parentUnit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      parent_id: form.parent_id || null,
    };
    onSubmit(data);
  };

  // Build parent options excluding the current unit and its descendants
  const parentOptions = allUnits.filter((u) => {
    if (initialData && u.id === initialData.id) return false;
    return true;
  });

  return (
    <form onSubmit={handleSubmit} id="unit-form">
      <div className="modal-body">
        <div className="input-group">
          <label htmlFor="unit-code">Unit Code *</label>
          <input
            id="unit-code"
            name="unit_code"
            type="text"
            className="input-field"
            placeholder="e.g., AP001"
            value={form.unit_code}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="unit-name">Name *</label>
          <input
            id="unit-name"
            name="name"
            type="text"
            className="input-field"
            placeholder="e.g., Vijayawada Zone"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="unit-type">Unit Type *</label>
          <select
            id="unit-type"
            name="unit_type"
            className="select-field"
            value={form.unit_type}
            onChange={handleChange}
            required
          >
            <option value="">Select type...</option>
            {unitTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="unit-parent">Parent Unit</label>
          <select
            id="unit-parent"
            name="parent_id"
            className="select-field"
            value={form.parent_id}
            onChange={handleChange}
          >
            <option value="">None (Root unit)</option>
            {parentOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.unit_type || u.unitType}) — {u.unit_code}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="input-group">
            <label htmlFor="unit-ministry">Ministry</label>
            <input
              id="unit-ministry"
              name="ministry"
              type="text"
              className="input-field"
              placeholder="Ministry name"
              value={form.ministry}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="unit-department">Department</label>
            <input
              id="unit-department"
              name="department"
              type="text"
              className="input-field"
              placeholder="Department name"
              value={form.department}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="unit-legacy">Legacy Reference</label>
          <input
            id="unit-legacy"
            name="legacy_reference"
            type="text"
            className="input-field"
            placeholder="Legacy reference code"
            value={form.legacy_reference}
            onChange={handleChange}
          />
        </div>

        <div className="checkbox-group">
          <input
            id="unit-virtual"
            name="is_virtual"
            type="checkbox"
            checked={form.is_virtual}
            onChange={handleChange}
          />
          <label htmlFor="unit-virtual" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
            Virtual Unit
          </label>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner-inline"></span> : null}
          {initialData ? 'Update Unit' : 'Create Unit'}
        </button>
      </div>
    </form>
  );
}
