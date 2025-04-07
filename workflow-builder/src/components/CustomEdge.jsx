import React from 'react';
import { getBezierPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate the midpoint of the edge for button placement
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const handleAddClick = (event) => {
    // Get the position for the node
    const position = {
      x: midX - 60, // Center the node at midpoint, adjust by half node width
      y: midY - 20, // Center the node at midpoint, adjust by half node height
    };
    
    // Call the onAdd function to show the node selector
    data.onShowNodeSelector(id, position);
    event.stopPropagation(); // Prevent the event from bubbling up
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Add button at the middle of the edge */}
      <foreignObject
        width={24}
        height={24}
        x={midX - 12}
        y={midY - 12}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button
          style={{
            width: '24px',
            height: '24px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '16px',
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
          onClick={handleAddClick}
        >
          +
        </button>
      </foreignObject>
    </>
  );
};

export default CustomEdge;