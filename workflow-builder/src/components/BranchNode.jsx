import React from 'react';
import { Handle, Position } from 'reactflow';

const BranchNode = ({ id, data }) => {
  // This node is non-editable, so we only need to display it
  return (
    <div
      style={{
        fontSize: 14,
        background: '#e3f2fd', // Light blue for branch nodes
        border: '1px solid #2196f3',
        borderRadius: 6,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        padding: 12,
        minWidth: 120,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 'bold' }}>{data.label || 'Branch'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default BranchNode;