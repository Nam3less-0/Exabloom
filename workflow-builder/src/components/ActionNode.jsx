import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { createPortal } from 'react-dom';

const ActionNode = ({ id, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleSave = () => {
    data.onChange(id, label);
    setIsOpen(false);
  };

  const handleDelete = () => {
    data.onDelete(id);
    setIsOpen(false);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        style={{
          fontSize: 14,
          background: '#f0f0f0', // Light gray like default node
          border: '1px solid #999',
          borderRadius: 6,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          padding: 10,
          minWidth: 120,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <Handle type="target" position={Position.Top} />
        {data.label}
        <Handle type="source" position={Position.Bottom} />
      </div>

      {isOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '50vw',
            height: '100vh',
            background: '#fff',
            borderLeft: '1px solid #e1e4e8',
            padding: 0,
            zIndex: 1000,
            boxShadow: '-2px 0 15px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header section with title and close button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e1e4e8',
            background: '#f8f9fa',
          }}>
            <h3 style={{ margin: 0, color: '#24292e', fontSize: '18px', fontWeight: 600 }}>Edit Action</h3>
            <button 
              onClick={() => {
                setLabel(data.label);
                setIsOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#6e7781',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              ×
            </button>
          </div>

          {/* Content section */}
          <div style={{ 
            padding: '24px 20px', 
            flex: 1,
            overflow: 'auto',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 500,
                  color: '#24292e',
                  fontSize: '14px',
                }}
              >
                Action Name
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={{
                  width: '90%',
                  padding: '2%',
                  fontSize: '14px',
                  border: '1px solid #d0d7de',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#0969da'}
                onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
              />
            </div>

            {/* Additional form fields could be added here */}
          </div>

          {/* Footer with buttons */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #e1e4e8',
            background: '#f8f9fa',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}>
            <button
              onClick={() => {
                setLabel(data.label);
                setIsOpen(false);
              }}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #d0d7de',
                color: '#24292e',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#f8f2f4',
                border: '1px solid #cf222e',
                color: '#cf222e',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#fcdee3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f8f2f4'}
            >
              Delete
            </button>
            
            <button 
              onClick={handleSave} 
              style={{
                backgroundColor: '#2da44e',
                border: '1px solid #2da44e',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2c974b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2da44e'}
            >
              Save
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ActionNode;