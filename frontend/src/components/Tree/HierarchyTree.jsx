import React, { useState, useMemo } from 'react';
import { HiSearch, HiOutlineRefresh } from 'react-icons/hi';
import TreeNode from './TreeNode';
import { searchTree } from '../../utils/treeUtils';

export default function HierarchyTree({ tree, onEdit, onDelete, onAdd, canEdit, loading, onRefresh }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredTree = useMemo(() => {
    return searchTree(tree, query);
  }, [tree, query]);

  return (
    <div>
      <div className="flex gap-sm" style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <HiSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '1rem',
          }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search units by name, code, or type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
            id="tree-search-input"
          />
        </div>
        {onRefresh && (
          <button className="btn btn-secondary btn-icon" onClick={onRefresh} title="Refresh" id="refresh-tree-btn">
            <HiOutlineRefresh className={loading ? 'spin-animation' : ''} />
          </button>
        )}
      </div>

      <div className="tree-container">
        {filteredTree.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌳</div>
            <div className="empty-state-title">
              {query ? 'No matching units found' : 'No units in hierarchy'}
            </div>
            <div className="empty-state-text">
              {query
                ? 'Try a different search term'
                : 'Upload an Excel file or create units manually to get started'}
            </div>
          </div>
        ) : (
          filteredTree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              canEdit={canEdit}
              selectedId={selectedId}
              onSelect={(n) => setSelectedId(n.id === selectedId ? null : n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
