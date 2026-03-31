import React, { useState, useMemo } from 'react';
import { HiSearch, HiOutlineRefresh } from 'react-icons/hi';
import TreeNode from './TreeNode';
import { searchTree } from '../../utils/treeUtils';

export default function HierarchyTree({ tree, onEdit, onDelete, onAdd, canEdit, loading, onRefresh }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [globalExpandState, setGlobalExpandState] = useState(null);

  const filteredTree = useMemo(() => {
    return searchTree(tree, query);
  }, [tree, query]);

  const handleExpandAll = () => setGlobalExpandState({ type: 'EXPAND_ALL', ts: Date.now() });
  const handleCollapseAll = () => setGlobalExpandState({ type: 'COLLAPSE_ALL', ts: Date.now() });

  return (
    <div>
      <div className="flex gap-sm" style={{ marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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
            placeholder="Select a unit to filter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
            id="tree-search-input"
          />
        </div>
        
        <div className="flex gap-sm">
          <button className="btn btn-secondary btn-icon-text" onClick={handleExpandAll} style={{ fontSize: '0.8125rem' }}>
            <span style={{ fontSize: '1rem' }}>⊕</span> Expand All
          </button>
          <button className="btn btn-secondary btn-icon-text" onClick={handleCollapseAll} style={{ fontSize: '0.8125rem' }}>
            <span style={{ fontSize: '1rem' }}>⊖</span> Collapse All
          </button>
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
              globalExpandState={globalExpandState}
            />
          ))
        )}
      </div>
    </div>
  );
}
