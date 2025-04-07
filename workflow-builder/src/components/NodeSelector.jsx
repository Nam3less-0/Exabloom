import React from 'react';
import { createPortal } from 'react-dom';

const NodeSelector = ({ onClose, onSelectNode, sourceEdgeId, position }) => {
  // This ensures the node selector appears immediately when opened
  return createPortal(
    <>
      {/* Add a transparent overlay to capture clicks outside the panel */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999, // Just below the selector
          background: 'transparent',
        }}
        onClick={onClose}
      />
      
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '300px',
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
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e1e4e8',
            background: '#f8f9fa',
          }}
        >
          <h3 style={{ margin: 0, color: '#24292e', fontSize: '18px', fontWeight: 600 }}>
            Select Node Type
          </h3>
          <button
            onClick={onClose}
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

        {/* Content */}
        <div
          style={{
            padding: '24px 20px',
            flex: 1,
            overflow: 'auto',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#24292e' }}>Choose a node type:</h4>
            
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <button
                onClick={() => onSelectNode('action', sourceEdgeId, position)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: '#f6f8fa',
                  border: '1px solid #d0d7de',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f6f8fa'}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#0969da',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  A
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Action Node</div>
                  <div style={{ fontSize: '12px', color: '#57606a' }}>
                    Simple action with one input and one output.
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectNode('conditional', sourceEdgeId, position)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: '#f6f8fa',
                  border: '1px solid #d0d7de',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f6f8fa'}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#cf222e',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  ?
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>If / Else Node</div>
                  <div style={{ fontSize: '12px', color: '#57606a' }}>
                    Conditional branching with two possible paths.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e1e4e8',
            background: '#f8f9fa',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
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
        </div>
      </div>
    </>,
    document.body
  );
};

export default NodeSelector;