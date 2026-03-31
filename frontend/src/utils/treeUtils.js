/**
 * Build a tree structure from a flat list of units.
 * Each unit must have `id` and `parent_id` (or `parentId`).
 */
export function buildTree(flatList) {
  const map = {};
  const roots = [];

  // Create a map of all nodes
  for (const item of flatList) {
    const id = item.id;
    map[id] = { ...item, children: [] };
  }

  // Assign children to parents
  for (const item of flatList) {
    const parentId = item.parent_id || item.parentId;
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  }

  return roots;
}

/**
 * Search the tree for nodes matching a query string.
 * Returns a filtered tree preserving parent paths.
 */
export function searchTree(tree, query) {
  if (!query || !query.trim()) return tree;
  const q = query.toLowerCase().trim();

  function filterNode(node) {
    const nameMatch = (node.name || '').toLowerCase().includes(q);
    const codeMatch = (node.unit_code || node.unitCode || '').toLowerCase().includes(q);
    const typeMatch = (node.unit_type || node.unitType || '').toLowerCase().includes(q);

    const filteredChildren = (node.children || [])
      .map(filterNode)
      .filter(Boolean);

    if (nameMatch || codeMatch || typeMatch || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  }

  return tree.map(filterNode).filter(Boolean);
}

/**
 * Flatten a tree into a list of all nodes.
 */
export function flattenTree(tree) {
  const result = [];
  function walk(nodes) {
    for (const n of nodes) {
      result.push(n);
      if (n.children) walk(n.children);
    }
  }
  walk(tree);
  return result;
}

/**
 * Get the depth/level label for a unit type.
 */
export const UNIT_TYPE_ORDER = ['ministry', 'zone', 'range', 'district', 'division', 'circle', 'station', 'other'];

export function getUnitTypeLevel(type) {
  const idx = UNIT_TYPE_ORDER.indexOf(type);
  return idx >= 0 ? idx : 99;
}

/**
 * Get allowed child types for a given parent type.
 */
export function getAllowedChildTypes(parentType) {
  const idx = UNIT_TYPE_ORDER.indexOf(parentType);
  if (idx < 0) return UNIT_TYPE_ORDER;
  return UNIT_TYPE_ORDER.slice(idx + 1);
}

/**
 * Check if setting `childId` as a child of `parentId` would create a circular reference.
 */
export function wouldCreateCycle(flatList, childId, parentId) {
  if (childId === parentId) return true;
  let current = parentId;
  const visited = new Set();
  while (current) {
    if (visited.has(current)) return true;
    if (current === childId) return true;
    visited.add(current);
    const node = flatList.find((n) => n.id === current);
    current = node ? (node.parent_id || node.parentId) : null;
  }
  return false;
}
