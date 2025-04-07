import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { createPortal } from 'react-dom';

const ConditionalNode = ({ id, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nodeName, setNodeName] = useState(data.label || 'If / Else');
  // Initialize branches state with any existing branches from data or defaults
  const [branches, setBranches] = useState(data.branches || [
    { id: 'branch-1', name: 'Branch' }
  ]);
  const [elseName, setElseName] = useState(data.elseName || 'Else');

  // Update state when data changes (e.g., when first loaded)
  useEffect(() => {
    setNodeName(data.label || 'If / Else');
    setBranches(data.branches || [{ id: 'branch-1', name: 'Branch' }]);
    setElseName(data.elseName || 'Else');
  }, [data.label, data.branches, data.elseName]);

  const handleSave = () => {
    // Call parent's onChange with all updated data
    data.onChange(id, nodeName, branches, elseName);
    setIsOpen(false);
  };

  const handleDelete = () => {
    data.onDelete(id);
    setIsOpen(false);
  };

  const addBranch = () => {
    const newBranchId = `branch-${branches.length + 1}`;
    setBranches([...branches, { id: newBranchId, name: `Branch ${branches.length + 1}` }]);
  };

  const removeBranch = (index) => {
    if (branches.length > 1) {
      const newBranches = [...branches];
      newBranches.splice(index, 1);
      setBranches(newBranches);
    }
  };

  const updateBranchName = (index, newName) => {
    const newBranches = [...branches];
    newBranches[index] = { ...newBranches[index], name: newName };
    setBranches(newBranches);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        style={{
          fontSize: 14,
          background: '#fff8dc', // Light yellow for conditional nodes
          border: '1px solid #daa520', // Golden rod border
          borderRadius: 6,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          padding: 12,
          minWidth: 150,
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <Handle type="target" position={Position.Top} />
        <div style={{ fontWeight: 'bold' }}>{nodeName}</div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: 12, 
          marginTop: 8,
          borderTop: '1px dashed #daa520',
          paddingTop: 4
        }}>
          {/* Show branch names */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            width: '100%' 
          }}>
            {branches.map((branch, index) => (
              <div key={branch.id}>{branch.name}</div>
            ))}
            <div>{elseName}</div>
          </div>
        </div>
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          style={{ background: '#333', left: '50%' }}
        />
      </div>

      {isOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '40vw',
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
          {/* Header section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e1e4e8',
            background: '#f8f9fa',
          }}>
            <h3 style={{ margin: 0, color: '#24292e', fontSize: '18px', fontWeight: 600 }}>Edit Conditional Node</h3>
            <button 
              onClick={() => {
                // Reset to original values on cancel
                setNodeName(data.label || 'If / Else');
                setBranches(data.branches || [{ id: 'branch-1', name: 'Branch' }]);
                setElseName(data.elseName || 'Else');
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
            {/* Node name field */}
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
                Condition Name
              </label>
              <input
                type="text"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                style={{
                  width: '95%',
                  padding: '10px 12px',
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

            {/* Branch section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '12px' 
              }}>
                <label 
                  style={{ 
                    fontWeight: 500,
                    color: '#24292e',
                    fontSize: '14px',
                  }}
                >
                  Branches
                </label>
                <button 
                  onClick={addBranch}
                  style={{
                    backgroundColor: '#f6f8fa',
                    border: '1px solid #d0d7de',
                    color: '#24292e',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  + Add Branch
                </button>
              </div>

              {/* Branch list */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px' 
              }}>
                {branches.map((branch, index) => (
                  <div 
                    key={branch.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}
                  >
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => updateBranchName(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #d0d7de',
                        borderRadius: '6px',
                      }}
                    />
                    {branches.length > 1 && (
                      <button 
                        onClick={() => removeBranch(index)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#cf222e',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Else name field */}
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
                Else Name
              </label>
              <input
                type="text"
                value={elseName}
                onChange={(e) => setElseName(e.target.value)}
                style={{
                  width: '95%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d0d7de',
                  borderRadius: '6px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fffbdd', 
              borderRadius: '6px', 
              fontSize: '13px',
              marginBottom: '16px',
              border: '1px solid #d4a72c'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>Conditional Node Info:</p>
              <p style={{ margin: '0 0 8px 0' }}>- Each branch represents a potential path in your workflow</p>
              <p style={{ margin: '0 0 8px 0' }}>- Customize branch names based on your business logic</p>
              <p style={{ margin: 0 }}>- The Else path is taken when no branch conditions are met</p>
            </div>
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
                // Reset to original values on cancel
                setNodeName(data.label || 'If / Else');
                setBranches(data.branches || [{ id: 'branch-1', name: 'Branch' }]);
                setElseName(data.elseName || 'Else');
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

export default ConditionalNode;