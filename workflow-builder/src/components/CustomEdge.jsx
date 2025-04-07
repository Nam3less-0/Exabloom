import React from 'react';
import { getSmoothStepPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  style = {},
  source,
  target,
  markerEnd,
}) => {
  // Use default orthogonal routing
  const [edgePath, edgeCenterX, edgeCenterY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8 // Slightly rounded corners
  });

  // Add a small circle in the middle of the edge for node selector interaction
  const handleClick = (event) => {
    event.stopPropagation();
    if (data?.onShowNodeSelector) {
      data.onShowNodeSelector(id, { x: edgeCenterX, y: edgeCenterY });
    }
  };

  // Check if this is an edge from if/else node to branch or else node
  // We can detect this by checking if the source id contains "if-" and 
  // the target id contains "branch-" or "else-"
  const isIfToBranchOrElse = source.includes('if-') && 
    (target.includes('branch-') || target.includes('else-'));

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#b1b1b7',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Add button - only if this is NOT an if-to-branch/else edge */}
      {!isIfToBranchOrElse && (
        <g
          transform={`translate(${edgeCenterX}, ${edgeCenterY})`}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Larger click area (transparent) */}
          <circle r="12" fill="transparent" />
          
          {/* Button outline */}
          <circle r="8" fill="white" stroke="#b1b1b7" strokeWidth="1" />
          
          {/* Plus symbol */}
          <path
            d="M-4,0 H4 M0,-4 V4"
            stroke="#b1b1b7"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      )}
    </>
  );
};

export default CustomEdge;