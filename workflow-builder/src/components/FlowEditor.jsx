import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ActionNode from './ActionNode';
import CustomEdge from './CustomEdge';
import NodeSelector from './NodeSelector';
import ConditionalNode from './ConditionalNode';
import BranchNode from './BranchNode';
import ElseNode from './ElseNode';

const nodeTypes = {
  action: ActionNode,
  conditional: ConditionalNode,
  branch: BranchNode,
  else: ElseNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Define spacing constants
const VERTICAL_SPACING = 120;
const HORIZONTAL_SPACING = 250;

// Grid structure to track branches and node positions
const initialNodes = [
  {
    id: 'start',
    type: 'default',
    data: { label: 'Start Node' },
    position: { x: 100, y: 100 },
    branchId: 'main', // Main branch identifier
  },
  {
    id: 'end',
    type: 'default',
    data: { label: 'END' },
    position: { x: 100, y: 300 },
    branchId: 'main', // Main branch identifier
  },
];

const initialEdges = [
  {
    id: 'e-start-end',
    source: 'start',
    target: 'end',
    type: 'custom',
    data: {},
  },
];

const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeIdCounter = useRef(0);
  const branchIdCounter = useRef(0);
  const [nodeSelectorProps, setNodeSelectorProps] = useState(null);

  // Helper function to get all nodes in a specific branch
  const getNodesInBranch = useCallback((allNodes, branchId) => {
    return allNodes.filter(node => node.branchId === branchId);
  }, []);

  // Find all downstream nodes and edges from a specific node
  const findDownstreamElements = useCallback((startNodeId, allNodes, allEdges, visited = new Set()) => {
    if (visited.has(startNodeId)) return { nodes: [], edges: [] };
    visited.add(startNodeId);
    
    const downstreamNodes = [];
    const downstreamEdges = [];
    
    // Find outgoing edges from this node
    const outgoingEdges = allEdges.filter(e => e.source === startNodeId);
    
    for (const edge of outgoingEdges) {
      downstreamEdges.push(edge);
      const targetNode = allNodes.find(n => n.id === edge.target);
      
      if (targetNode) {
        downstreamNodes.push(targetNode);
        // Recursively find downstream elements
        const { nodes: furtherNodes, edges: furtherEdges } = 
          findDownstreamElements(edge.target, allNodes, allEdges, visited);
        
        downstreamNodes.push(...furtherNodes);
        downstreamEdges.push(...furtherEdges);
      }
    }
    
    return { nodes: downstreamNodes, edges: downstreamEdges };
  }, []);

  // Pushes nodes down within a branch by the specified amount
  const pushNodesDown = useCallback((allNodes, positionY, amount, branchId, excludeIds = []) => {
    return allNodes.map(node => {
      // Only affect nodes in the specified branch
      if (node.branchId === branchId && 
          node.position.y >= positionY && 
          !excludeIds.includes(node.id)) {
        return {
          ...node,
          position: {
            ...node.position,
            y: node.position.y + amount
          }
        };
      }
      return node;
    });
  }, []);

  // Recalculate positions of nodes in a branch to maintain proper spacing
  const recalculateBranchPositions = useCallback((allNodes, branchId) => {
    // Get all nodes in the branch
    const branchNodes = getNodesInBranch(allNodes, branchId);
    
    // Sort nodes by Y position
    branchNodes.sort((a, b) => a.position.y - b.position.y);
    
    // Create a map to track the new positions
    const newPositions = new Map();
    
    // Determine the branch's X position (use the first node's X)
    const branchX = branchNodes.length > 0 ? branchNodes[0].position.x : 0;
    
    // Assign proper Y positions with consistent spacing
    let currentY = branchNodes.length > 0 ? branchNodes[0].position.y : 0;
    
    branchNodes.forEach((node, index) => {
      if (index === 0) {
        // Keep the first node's position
        newPositions.set(node.id, { x: branchX, y: currentY });
      } else {
        // Position subsequent nodes with proper spacing
        currentY += VERTICAL_SPACING;
        newPositions.set(node.id, { x: branchX, y: currentY });
      }
    });
    
    // Apply the new positions
    return allNodes.map(node => {
      const newPos = newPositions.get(node.id);
      if (newPos) {
        return {
          ...node,
          position: newPos
        };
      }
      return node;
    });
  }, [getNodesInBranch]);

  // Define the show node selector handler
  const handleShowNodeSelector = useCallback((edgeId, position) => {
    setNodeSelectorProps({
      sourceEdgeId: edgeId,
      position: position,
    });
  }, []);

  // Define the close node selector handler
  const handleCloseNodeSelector = useCallback(() => {
    setNodeSelectorProps(null);
  }, []);

  // Define the delete node handler
  const handleDeleteNode = useCallback(
    (id) => {
      const nodeToDelete = nodes.find(n => n.id === id);
      if (!nodeToDelete) return;
      
      const branchId = nodeToDelete.branchId;
      const incoming = edges.find((e) => e.target === id);
      const outgoing = edges.find((e) => e.source === id);

      const updatedEdges = edges.filter(
        (e) => e.source !== id && e.target !== id
      );

      if (incoming && outgoing) {
        updatedEdges.push({
          id: `e-${incoming.source}-${outgoing.target}`,
          source: incoming.source,
          target: outgoing.target,
          type: 'custom',
          data: {},
        });
      }

      setNodes((nds) => {
        // Remove the node
        const updatedNodes = nds.filter((n) => n.id !== id);
        // Recalculate positions for the branch
        return recalculateBranchPositions(updatedNodes, branchId);
      });
      
      setEdges(updatedEdges);
    },
    [edges, nodes, setNodes, setEdges, recalculateBranchPositions]
  );

  // Define node change handler
  const handleNodeChange = useCallback(
    (id, newLabel) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  label: newLabel,
                  onDelete: handleDeleteNode,
                  onChange: handleNodeChange,
                },
              }
            : n
        )
      );
    },
    [setNodes, handleDeleteNode]
  );

  // Add action node implementation
  const addActionNode = useCallback(
    (edgeId, position) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      // Find source and target nodes
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;

      // Get the branch ID from the source node
      const branchId = sourceNode.branchId;
      
      // Create a new node ID
      const newNodeId = `node-${nodeIdCounter.current++}`;
      
      // Get all nodes in this branch to find the center x position
      const branchNodes = getNodesInBranch(nodes, branchId);
      const branchCenter = branchNodes.reduce((sum, node) => sum + node.position.x, 0) / 
                          (branchNodes.length || 1);
      
      // Calculate insertion position - use the branch center x position for proper centering
      const newNodePosition = {
        x: branchCenter, // Use the center of the branch for proper alignment
        y: sourceNode.position.y + VERTICAL_SPACING, // Place below source node
      };
      
      // Create the new node
      const newNode = {
        id: newNodeId,
        type: 'action',
        data: {
          label: 'Action',
          onDelete: handleDeleteNode,
          onChange: handleNodeChange,
        },
        position: newNodePosition,
        branchId: branchId, // Inherit branch from source
      };

      // Create two new edges to connect the new node
      const newEdges = [
        {
          id: `e-${edge.source}-${newNodeId}`,
          source: edge.source,
          target: newNodeId,
          type: 'custom',
          data: {},
        },
        {
          id: `e-${newNodeId}-${edge.target}`,
          source: newNodeId,
          target: edge.target,
          type: 'custom',
          data: {},
        },
      ];

      // Update nodes - push only nodes in the same branch down
      setNodes((nds) => {
        // Add the new node
        const updatedNodes = [...nds, newNode];
        
        // Push nodes in the same branch down to make room
        const pushedNodes = pushNodesDown(
          updatedNodes,
          newNodePosition.y,
          VERTICAL_SPACING,
          branchId,
          [sourceNode.id, newNodeId]
        );
        
        // Recalculate all positions in the branch for consistency
        return recalculateBranchPositions(pushedNodes, branchId);
      });
      
      // Update edges
      setEdges((eds) => [...eds.filter((e) => e.id !== edgeId), ...newEdges]);
    },
    [edges, nodes, setNodes, setEdges, handleDeleteNode, handleNodeChange, pushNodesDown, recalculateBranchPositions]
  );

  // Add conditional node implementation
  const addConditionalNode = useCallback(
    (edgeId, position) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      // Find source and target nodes
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Get all downstream elements from the target node (including the target)
      const downstream = findDownstreamElements(edge.target, nodes, edges);
      
      // Calculate positions for new nodes
      const ifNodePosition = {
        x: sourceNode.position.x,
        y: sourceNode.position.y + VERTICAL_SPACING
      };
      
      // Create branch identifiers
      const parentBranchId = sourceNode.branchId;
      const branchBranchId = `branch-${branchIdCounter.current++}`;
      const elseBranchId = `else-${branchIdCounter.current++}`;
      
      // Create position for branch and else nodes
      const branchPosition = {
        x: ifNodePosition.x - HORIZONTAL_SPACING/2,
        y: ifNodePosition.y + VERTICAL_SPACING
      };
      
      const elsePosition = {
        x: ifNodePosition.x + HORIZONTAL_SPACING/2,
        y: ifNodePosition.y + VERTICAL_SPACING
      };
      
      // Create node IDs
      const ifNodeId = `if-${nodeIdCounter.current++}`;
      const branchNodeId = `branch-${nodeIdCounter.current++}`;
      const elseNodeId = `else-${nodeIdCounter.current++}`;
      
      // Create the new nodes
      const ifNode = {
        id: ifNodeId,
        type: 'conditional',
        data: {
          label: 'If / Else',
          onDelete: handleDeleteNode,
          onChange: handleNodeChange,
        },
        position: ifNodePosition,
        branchId: parentBranchId, // Keep if node in the same branch as source
      };
      
      const branchNode = {
        id: branchNodeId,
        type: 'branch',
        data: {
          label: 'Branch'
        },
        position: branchPosition,
        branchId: branchBranchId, // Start of branch path
      };
      
      const elseNode = {
        id: elseNodeId,
        type: 'else',
        data: {
          label: 'Else'
        },
        position: elsePosition,
        branchId: elseBranchId, // Start of else path
      };
      
      // Create connections for if, branch, and else
      const conditionalEdges = [
        // Connect source to if
        {
          id: `e-${edge.source}-${ifNodeId}`,
          source: edge.source,
          target: ifNodeId,
          type: 'custom',
          data: {},
        },
        // Connect if to branch
        {
          id: `e-${ifNodeId}-${branchNodeId}`,
          source: ifNodeId,
          target: branchNodeId,
          sourceHandle: 'branch',
          type: 'custom',
          data: {},
        },
        // Connect if to else
        {
          id: `e-${ifNodeId}-${elseNodeId}`,
          source: ifNodeId,
          target: elseNodeId,
          sourceHandle: 'else',
          type: 'custom',
          data: {},
        },
      ];
      
      // Create duplicate nodes and edges for branch path
      const branchPathNodes = [];
      const branchPathEdges = [];
      const branchPathMap = new Map(); // Maps original ID to branch path duplicated ID
      
      // Handle the case where there are no downstream nodes
      if (downstream.nodes.length === 0) {
        // Add an END node to the branch path
        const branchEndId = `branch-end-${nodeIdCounter.current++}`;
        branchPathNodes.push({
          id: branchEndId,
          type: 'default',
          data: { label: 'END' },
          position: {
            x: branchPosition.x,
            y: branchPosition.y + VERTICAL_SPACING
          },
          branchId: branchBranchId,
        });
        
        branchPathEdges.push({
          id: `e-${branchNodeId}-${branchEndId}`,
          source: branchNodeId,
          target: branchEndId,
          type: 'custom',
          data: {},
        });
      } else {
        // Duplicate downstream nodes for branch path
        downstream.nodes.forEach((node, index) => {
          const duplicatedNodeId = `branch-${node.id}-${nodeIdCounter.current++}`;
          branchPathMap.set(node.id, duplicatedNodeId);
          
          branchPathNodes.push({
            id: duplicatedNodeId,
            type: node.type,
            data: {
              ...node.data,
              label: node.data.label,
              onDelete: handleDeleteNode,
              onChange: handleNodeChange,
            },
            position: {
              x: branchPosition.x,
              y: branchPosition.y + VERTICAL_SPACING * (index + 1)
            },
            branchId: branchBranchId,
          });
        });
        
        // Duplicate edges for branch path
        downstream.edges.forEach(originalEdge => {
          const branchSourceId = branchPathMap.get(originalEdge.source);
          const branchTargetId = branchPathMap.get(originalEdge.target);
          
          if (branchSourceId && branchTargetId) {
            branchPathEdges.push({
              id: `branch-${originalEdge.id}-${nodeIdCounter.current++}`,
              source: branchSourceId,
              target: branchTargetId,
              sourceHandle: originalEdge.sourceHandle,
              targetHandle: originalEdge.targetHandle,
              type: 'custom',
              data: {},
            });
          }
        });
        
        // Connect branch node to the first duplicated node
        if (branchPathNodes.length > 0) {
          branchPathEdges.push({
            id: `e-${branchNodeId}-${branchPathNodes[0].id}`,
            source: branchNodeId,
            target: branchPathNodes[0].id,
            type: 'custom',
            data: {},
          });
        }
      }
      
      // Create duplicate nodes and edges for else path
      const elsePathNodes = [];
      const elsePathEdges = [];
      const elsePathMap = new Map(); // Maps original ID to else path duplicated ID
      
      // Handle the case where there are no downstream nodes
      if (downstream.nodes.length === 0) {
        // Add an END node to the else path
        const elseEndId = `else-end-${nodeIdCounter.current++}`;
        elsePathNodes.push({
          id: elseEndId,
          type: 'default',
          data: { label: 'END' },
          position: {
            x: elsePosition.x,
            y: elsePosition.y + VERTICAL_SPACING
          },
          branchId: elseBranchId,
        });
        
        elsePathEdges.push({
          id: `e-${elseNodeId}-${elseEndId}`,
          source: elseNodeId,
          target: elseEndId,
          type: 'custom',
          data: {},
        });
      } else {
        // Duplicate downstream nodes for else path
        downstream.nodes.forEach((node, index) => {
          const duplicatedNodeId = `else-${node.id}-${nodeIdCounter.current++}`;
          elsePathMap.set(node.id, duplicatedNodeId);
          
          elsePathNodes.push({
            id: duplicatedNodeId,
            type: node.type,
            data: {
              ...node.data,
              label: node.data.label,
              onDelete: handleDeleteNode,
              onChange: handleNodeChange,
            },
            position: {
              x: elsePosition.x,
              y: elsePosition.y + VERTICAL_SPACING * (index + 1)
            },
            branchId: elseBranchId,
          });
        });
        
        // Duplicate edges for else path
        downstream.edges.forEach(originalEdge => {
          const elseSourceId = elsePathMap.get(originalEdge.source);
          const elseTargetId = elsePathMap.get(originalEdge.target);
          
          if (elseSourceId && elseTargetId) {
            elsePathEdges.push({
              id: `else-${originalEdge.id}-${nodeIdCounter.current++}`,
              source: elseSourceId,
              target: elseTargetId,
              sourceHandle: originalEdge.sourceHandle,
              targetHandle: originalEdge.targetHandle,
              type: 'custom',
              data: {},
            });
          }
        });
        
        // Connect else node to the first duplicated node
        if (elsePathNodes.length > 0) {
          elsePathEdges.push({
            id: `e-${elseNodeId}-${elsePathNodes[0].id}`,
            source: elseNodeId,
            target: elsePathNodes[0].id,
            type: 'custom',
            data: {},
          });
        }
      }
      
      // Update nodes
      setNodes((nds) => {
        // Remove downstream nodes including the target
        const remainingNodes = nds.filter(n => 
          !downstream.nodes.some(dn => dn.id === n.id) && n.id !== edge.target
        );
        
        // Create all nodes to add
        const allNewNodes = [
          ifNode, 
          branchNode, 
          elseNode, 
          ...branchPathNodes,
          ...elsePathNodes
        ];
        
        // Calculate how much to push down nodes after the if node
        const pushDownAmount = VERTICAL_SPACING * 2; // Make room for the branch and else nodes
        
        // Push nodes in the parent branch down
        const pushedNodes = pushNodesDown(
          remainingNodes, 
          ifNodePosition.y, 
          pushDownAmount,
          parentBranchId, 
          [sourceNode.id, ifNodeId]
        );
        
        // Combine all nodes
        const combinedNodes = [...pushedNodes, ...allNewNodes];
        
        // Recalculate positions for each branch for consistency
        let result = combinedNodes;
        result = recalculateBranchPositions(result, parentBranchId);
        result = recalculateBranchPositions(result, branchBranchId);
        result = recalculateBranchPositions(result, elseBranchId);
        
        return result;
      });
      
      // Update edges
      setEdges((eds) => {
        // Remove the original edge and all downstream edges
        const remainingEdges = eds.filter(e => 
          e.id !== edgeId && !downstream.edges.some(de => de.id === e.id)
        );
        
        // Combine all new edges
        return [
          ...remainingEdges,
          ...conditionalEdges,
          ...branchPathEdges,
          ...elsePathEdges
        ];
      });
    },
    [
      edges, 
      nodes, 
      setNodes, 
      setEdges, 
      handleDeleteNode, 
      handleNodeChange, 
      findDownstreamElements, 
      pushNodesDown, 
      recalculateBranchPositions
    ]
  );

  // Handle node type selection
  const handleSelectNodeType = useCallback(
    (nodeType, edgeId, position) => {
      if (nodeType === 'action') {
        addActionNode(edgeId, position);
      } else if (nodeType === 'conditional') {
        addConditionalNode(edgeId, position);
      }
      setNodeSelectorProps(null);
    },
    [addActionNode, addConditionalNode]
  );

  // Apply the showNodeSelector callback to all edges
  const edgesWithData = edges.map((e) => ({
    ...e,
    data: { onShowNodeSelector: handleShowNodeSelector },
  }));

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edgesWithData}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={true} // Allow nodes to be dragged
      >
        <Background />
      </ReactFlow>

      {nodeSelectorProps && (
        <NodeSelector
          onClose={handleCloseNodeSelector}
          onSelectNode={handleSelectNodeType}
          sourceEdgeId={nodeSelectorProps.sourceEdgeId}
          position={nodeSelectorProps.position}
        />
      )}
    </div>
  );
};

export default FlowEditor;