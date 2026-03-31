import React, { useState } from 'react';
import { HiChevronRight, HiPencil, HiTrash, HiPlus } from 'react-icons/hi';
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

export default function TreeNode({ node, level = 0, onEdit, onDelete, onAdd, canEdit, selectedId, onSelect }) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const unitType = node.unit_type || node.unitType || 'other';
  const isSelected = selectedId === node.id;

  return (
    <div className="tree-node" style={{ animationDelay: `${level * 30}ms` }}>
      <div
        className={`tree-node-content ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect && onSelect(node)}
      >
        <span
          className={`tree-toggle ${expanded ? 'expanded' : ''} ${!hasChildren ? 'no-children' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <HiChevronRight />
        </span>

        <span className={`tree-icon tree-icon-${unitType}`}>
          {typeIcons[unitType] || typeIcons.other}
        </span>

        <span className="tree-name" title={node.name}>
          {node.name}
        </span>

        <span className={`badge badge-${unitType}`}>
          {unitType}
        </span>

        {node.unit_code && (
          <span className="tree-meta">{node.unit_code}</span>
        )}

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
