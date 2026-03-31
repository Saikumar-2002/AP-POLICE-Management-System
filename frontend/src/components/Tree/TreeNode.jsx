import React, { useState } from 'react';
import { HiChevronRight, HiPencil, HiTrash, HiPlus, HiMinus } from 'react-icons/hi';
import { HiOutlineBuildingOffice2, HiOutlineMapPin, HiOutlineMap, HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineBuildingLibrary, HiOutlineSquares2X2 } from 'react-icons/hi2';

const typeIcons = {
  ministry: <HiOutlineBuildingLibrary />,
  zone: <HiOutlineGlobeAlt />,
  range: <HiOutlineMap />,
  district: <HiOutlineBuildingOffice2 />,
  division: <HiOutlineSquares2X2 />,
  circle: <HiOutlineMapPin />,
  station: <HiOutlineShieldCheck />,
  other: <HiOutlineSquares2X2 />,
};

export default function TreeNode({ node, level = 0, onEdit, onDelete, onAdd, canEdit, selectedId, onSelect, globalExpandState }) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const unitType = node.unit_type || node.unitType || 'other';
  const isSelected = selectedId === node.id;

  React.useEffect(() => {
    if (globalExpandState?.type === 'EXPAND_ALL') setExpanded(true);
    if (globalExpandState?.type === 'COLLAPSE_ALL') setExpanded(false);
  }, [globalExpandState]);

  return (
    <div className="tree-node" style={{ animationDelay: `${level * 30}ms` }}>
      <div
        className={`tree-node-content ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect && onSelect(node)}
      >
        <div className="tree-node-left" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span
            className={`tree-toggle ${!hasChildren ? 'no-children' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {hasChildren ? (expanded ? <HiMinus /> : <HiPlus />) : <span style={{ width: '14px' }}></span>}
          </span>

          <span className={`tree-icon tree-icon-${unitType}`}>
            {typeIcons[unitType] || typeIcons.other}
          </span>

          <span className="tree-name" title={node.name} style={{ fontWeight: level === 0 ? 700 : 500 }}>
            {node.name}
          </span>
        </div>

        <div className="tree-node-right" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <span className={`badge badge-${unitType}`} style={{ minWidth: '80px', justifyContent: 'center' }}>
            {unitType}
          </span>
          <span className="tree-meta" style={{ minWidth: '150px', color: 'var(--text-accent)', fontFamily: 'monospace' }}>
            {node.unitCode}
          </span>

          {canEdit && (
            <div className="tree-actions">
              <button
                className="tree-action-btn"
                title="Add child unit"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd && onAdd(node);
                }}
              >
                <HiPlus />
              </button>
              <button
                className="tree-action-btn"
                title="Edit unit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(node);
                }}
              >
                <HiPencil />
              </button>
              <button
                className="tree-action-btn delete"
                title="Delete unit"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(node);
                }}
              >
                <HiTrash />
              </button>
            </div>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              canEdit={canEdit}
              selectedId={selectedId}
              onSelect={onSelect}
              globalExpandState={globalExpandState}
            />
          ))}
        </div>
      )}
    </div>
  );
}
