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

// Define a function to create edge with orthogonal routing
const createEdge = (id, source, target, options = {}) => {
  return {
    id,
    source,
    target,
    type: 'custom',
    data: {
      ...options.data,
    },
    style: {
      strokeWidth: 2,
      stroke: '#b1b1b7',
    },
    ...(options.sourceHandle ? { sourceHandle: options.sourceHandle } : {}),
    ...(options.targetHandle ? { targetHandle: options.targetHandle } : {}),
    interactionWidth: 20,
  };
};

const initialNodes = [
  {
    id: 'start',
    type: 'default',
    data: { label: 'Start Node' },
    position: { x: 100, y: 100 },
  },
  {
    id: 'end',
    type: 'default',
    data: { label: 'END' },
    position: { x: 100, y: 300 },
  },
];

const initialEdges = [
  createEdge('e-start-end', 'start', 'end'),
];

const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeIdCounter = useRef(0);
  const [nodeSelectorProps, setNodeSelectorProps] = useState(null);

  // Function to push nodes down that are below a certain Y position
  const pushNodesDown = useCallback((nds, positionY, amount, excludeIds = []) => {
    return nds.map(node => {
      if (node.position.y >= positionY && !excludeIds.includes(node.id)) {
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

  // Define the delete node handler
  const handleDeleteNode = useCallback(
    (id) => {
      const incoming = edges.find((e) => e.target === id);
      const outgoing = edges.find((e) => e.source === id);

      const updatedEdges = edges.filter(
        (e) => e.source !== id && e.target !== id
      );

      if (incoming && outgoing) {
        updatedEdges.push(
          createEdge(`e-${incoming.source}-${outgoing.target}`, incoming.source, outgoing.target)
        );
      }

      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges(updatedEdges);
    },
    [edges, setNodes, setEdges]
  );

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

  // Direct branch update when a conditional node changes
  const updateBranchNodes = useCallback((conditionalNodeId, branches, elseName) => {
    console.log(`Updating branch nodes for ${conditionalNodeId}`);
    console.log(`Branches: ${JSON.stringify(branches)}, Else: ${elseName}`);
    
    // Step 1: Find all edges that connect from this conditional node
    const connectedEdges = edges.filter(e => e.source === conditionalNodeId);
    console.log(`Found ${connectedEdges.length} connected edges`);
    
    // Step 2: Update the connected nodes based on the edges
    setNodes(nds => {
      return nds.map(node => {
        // Find if this node is connected to the conditional node
        const connectingEdge = connectedEdges.find(e => e.target === node.id);
        
        if (!connectingEdge) {
          // Not connected to this conditional node, leave it unchanged
          return node;
        }
        
        // Check what type of handle the edge is connected to
        if (connectingEdge.sourceHandle && connectingEdge.sourceHandle.startsWith('branch-')) {
          // It's a branch connection - get the branch index
          const branchIndex = parseInt(connectingEdge.sourceHandle.split('-')[1], 10);
          
          // If we have branch data for this index, update the node
          if (branches[branchIndex]) {
            console.log(`Updating branch node ${node.id} to ${branches[branchIndex].name}`);
            return {
              ...node,
              data: {
                ...node.data,
                label: branches[branchIndex].name
              }
            };
          }
        } else if (connectingEdge.sourceHandle === 'else') {
          // It's an else connection
          console.log(`Updating else node ${node.id} to ${elseName}`);
          return {
            ...node,
            data: {
              ...node.data,
              label: elseName
            }
          };
        }
        
        // No matching handle or branch, leave it unchanged
        return node;
      });
    });
    
    // Step 3: Check if we need to create new branch nodes
    const existingBranchIndices = connectedEdges
      .filter(e => e.sourceHandle && e.sourceHandle.startsWith('branch-'))
      .map(e => parseInt(e.sourceHandle.split('-')[1], 10));
    
    console.log(`Existing branch indices: ${existingBranchIndices.join(', ')}`);
    
    // Find indices that need new branches
    const newBranchIndices = [];
    branches.forEach((branch, index) => {
      if (!existingBranchIndices.includes(index)) {
        newBranchIndices.push(index);
      }
    });
    
    console.log(`New branch indices: ${newBranchIndices.join(', ')}`);
    
    // If we have new branches to create
    if (newBranchIndices.length > 0) {
      // Find the conditional node to get its position
      const conditionalNode = nodes.find(n => n.id === conditionalNodeId);
      if (!conditionalNode) return;
      
      const VERTICAL_SPACING = 120;
      const HORIZONTAL_SPACING = 200;
      
      // Calculate base position
      const baseX = conditionalNode.position.x;
      const baseY = conditionalNode.position.y + VERTICAL_SPACING;
      
      // Calculate spacing based on the total number of branches
      const branchCount = branches.length;
      const spaceBetween = branchCount > 1 
        ? HORIZONTAL_SPACING / (branchCount - 1) 
        : HORIZONTAL_SPACING;
      
      // Create new branches for each new index
      const newNodes = [];
      const newEdges = [];
      
      newBranchIndices.forEach(index => {
        const branchName = branches[index].name;
        
        // Calculate position for this branch
        let xPosition = baseX;
        if (branchCount > 1) {
          xPosition = baseX - HORIZONTAL_SPACING/2 + (index * spaceBetween);
        }
        
        const branchPosition = {
          x: xPosition,
          y: baseY
        };
        
        // Create new branch node
        const newBranchId = `branch-${nodeIdCounter.current++}`;
        const branchNode = {
          id: newBranchId,
          type: 'branch',
          data: { label: branchName },
          position: branchPosition,
        };
        
        // Create edge from conditional to branch
        const branchEdge = createEdge(
          `e-${conditionalNodeId}-${newBranchId}`,
          conditionalNodeId,
          newBranchId,
          { sourceHandle: `branch-${index}` }
        );
        
        // Create end node for the branch
        const branchEndId = `branch-end-${nodeIdCounter.current++}`;
        const branchEndNode = {
          id: branchEndId,
          type: 'default',
          data: { label: 'END' },
          position: {
            x: branchPosition.x,
            y: branchPosition.y + VERTICAL_SPACING,
          },
        };
        
        // Create edge from branch to end
        const endEdge = createEdge(
          `e-${newBranchId}-${branchEndId}`,
          newBranchId,
          branchEndId
        );
        
        // Add all new nodes and edges
        newNodes.push(branchNode, branchEndNode);
        newEdges.push(branchEdge, endEdge);
      });
      
      // Update with new nodes and edges
      setNodes(nds => [...nds, ...newNodes]);
      setEdges(eds => [...eds, ...newEdges]);
    }
    
    // Step 4: Check if we need to remove branch nodes
    if (branches.length < existingBranchIndices.length) {
      const indicesToRemove = existingBranchIndices.filter(index => index >= branches.length);
      console.log(`Indices to remove: ${indicesToRemove.join(', ')}`);
      
      if (indicesToRemove.length > 0) {
        // Find edges with these source handles
        const edgesToRemove = connectedEdges.filter(edge => {
          if (!edge.sourceHandle || !edge.sourceHandle.startsWith('branch-')) return false;
          const index = parseInt(edge.sourceHandle.split('-')[1], 10);
          return indicesToRemove.includes(index);
        });
        
        // Find target nodes to remove
        const nodeIdsToRemove = edgesToRemove.map(edge => edge.target);
        
        // Also find any downstream nodes
        const downstreamIds = [];
        const processedNodes = new Set();
        
        // Helper to find downstream nodes
        const findDownstream = (nodeId) => {
          if (processedNodes.has(nodeId)) return;
          processedNodes.add(nodeId);
          
          const outgoingEdges = edges.filter(e => e.source === nodeId);
          outgoingEdges.forEach(edge => {
            downstreamIds.push(edge.target);
            findDownstream(edge.target);
          });
        };
        
        // Find all downstream nodes
        nodeIdsToRemove.forEach(nodeId => {
          findDownstream(nodeId);
        });
        
        // Combine all nodes to remove
        const allNodesToRemove = [...nodeIdsToRemove, ...downstreamIds];
        console.log(`Removing nodes: ${allNodesToRemove.join(', ')}`);
        
        // Remove the nodes and edges
        setNodes(nds => nds.filter(n => !allNodesToRemove.includes(n.id)));
        setEdges(eds => eds.filter(e => 
          !allNodesToRemove.includes(e.source) && 
          !allNodesToRemove.includes(e.target)
        ));
      }
    }
  }, [edges, nodes, nodeIdCounter, setNodes, setEdges]);

  // Enhanced node change handler - simplified direct approach
  const handleNodeChange = useCallback(
    (id, newLabel, branches = null, elseName = null) => {
      console.log(`Node change - Node: ${id}, New label: ${newLabel}`);
      if (branches) {
        console.log(`Branches: ${JSON.stringify(branches)}, Else: ${elseName}`);
      }
      
      // First, update the node itself with the new data
      setNodes((nds) => {
        return nds.map((n) => {
          if (n.id === id) {
            // For conditional nodes, update with branch data
            if (n.type === 'conditional') {
              return {
                ...n,
                data: {
                  ...n.data,
                  label: newLabel,
                  branches: branches,
                  elseName: elseName,
                  onDelete: handleDeleteNode,
                  onChange: handleNodeChange,
                },
              };
            } else {
              // For regular nodes, just update the label
              return {
                ...n,
                data: {
                  ...n.data,
                  label: newLabel,
                  onDelete: handleDeleteNode,
                  onChange: handleNodeChange,
                },
              };
            }
          }
          return n;
        });
      });
      
      // If this is a conditional node with branches, also update the connected branch nodes
      if (branches) {
        // Use the dedicated function to update branch nodes
        setTimeout(() => {
          updateBranchNodes(id, branches, elseName);
        }, 0);
      }
    },
    [setNodes, handleDeleteNode, updateBranchNodes]
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

      // Create a new node ID
      const newNodeId = `node-${nodeIdCounter.current++}`;
      
      // Calculate insertion position
      const newNodePosition = {
        x: sourceNode.position.x, // Keep same x as source for vertical alignment
        y: sourceNode.position.y + 120, // Place below source node with spacing
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
      };

      // Create two new edges to connect the new node
      const newEdges = [
        createEdge(`e-${edge.source}-${newNodeId}`, edge.source, newNodeId),
        createEdge(`e-${newNodeId}-${edge.target}`, newNodeId, edge.target),
      ];

      // Update nodes - push all nodes below the new node position down
      setNodes((nds) => {
        // First push nodes down to make room
        const pushedNodes = pushNodesDown(
          nds, 
          newNodePosition.y, 
          120, // Push down by the vertical spacing
          [sourceNode.id]
        );
        
        // Then add the new node
        return [...pushedNodes, newNode];
      });
      
      // Update edges
      setEdges((eds) => [...eds.filter((e) => e.id !== edgeId), ...newEdges]);
    },
    [edges, nodes, setNodes, setEdges, handleDeleteNode, handleNodeChange, pushNodesDown]
  );

  // Add conditional node implementation with multiple branches
  const addConditionalNode = useCallback(
    (edgeId, position) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      // Find source and target nodes
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Define the vertical and horizontal spacing
      const VERTICAL_SPACING = 120;
      const HORIZONTAL_SPACING = 200;
      
      // Create the conditional node
      const ifNodeId = `if-${nodeIdCounter.current++}`;
      const branchNodeId = `branch-${nodeIdCounter.current++}`;
      const elseNodeId = `else-${nodeIdCounter.current++}`;
      
      // Define initial branch data with timestamp-based IDs for uniqueness
      const initialBranches = [{ id: `branch-${Date.now()}`, name: 'Branch' }];
      const initialElseName = 'Else';
      
      // Position the if node directly below the source
      const ifNodePosition = {
        x: sourceNode.position.x,
        y: sourceNode.position.y + VERTICAL_SPACING
      };
      
      // Position branch and else nodes horizontally spaced below the if node
      const branchNodePosition = {
        x: ifNodePosition.x - HORIZONTAL_SPACING/2, 
        y: ifNodePosition.y + VERTICAL_SPACING
      };
      
      const elseNodePosition = {
        x: ifNodePosition.x + HORIZONTAL_SPACING/2, 
        y: ifNodePosition.y + VERTICAL_SPACING
      };
      
      // Create nodes
      const ifNode = {
        id: ifNodeId,
        type: 'conditional',
        data: {
          label: 'If / Else',
          branches: initialBranches,
          elseName: initialElseName,
          onDelete: handleDeleteNode,
          onChange: handleNodeChange,
        },
        position: ifNodePosition,
      };
      
      const branchNode = {
        id: branchNodeId,
        type: 'branch',
        data: {
          label: initialBranches[0].name
        },
        position: branchNodePosition,
      };
      
      const elseNode = {
        id: elseNodeId,
        type: 'else',
        data: {
          label: initialElseName
        },
        position: elseNodePosition,
      };
      
      // Create edges for the conditional structure with proper handles
      const conditionalEdges = [
        // Connect source to if
        createEdge(`e-${edge.source}-${ifNodeId}`, edge.source, ifNodeId),
        // Connect if to branch - specify branch-0 sourceHandle
        createEdge(`e-${ifNodeId}-${branchNodeId}`, ifNodeId, branchNodeId, {
          sourceHandle: 'branch-0'
        }),
        // Connect if to else - specify else sourceHandle
        createEdge(`e-${ifNodeId}-${elseNodeId}`, ifNodeId, elseNodeId, {
          sourceHandle: 'else'
        }),
      ];
      
      // Create end node for just the else path
      const elseEndId = `else-end-${nodeIdCounter.current++}`;
      
      // Create else end node
      const elseEndNode = {
        id: elseEndId,
        type: 'default',
        data: { label: 'END' },
        position: {
          x: elseNodePosition.x,
          y: elseNodePosition.y + VERTICAL_SPACING,
        },
      };
      
      // Connect else to its end node
      const endEdges = [
        createEdge(`e-${elseNodeId}-${elseEndId}`, elseNodeId, elseEndId),
      ];
      
      // Place the target node below the branch node
      const targetNewPosition = {
        x: branchNodePosition.x,
        y: branchNodePosition.y + VERTICAL_SPACING,
      };
      
      // Connect branch directly to target (no branch end node)
      const connectToTargetEdge = createEdge(
        `e-${branchNodeId}-${targetNode.id}`, 
        branchNodeId, 
        targetNode.id
      );

      // Update nodes and edges
      setNodes((nds) => {
        // Push nodes down to make room for the conditional structure
        const pushedNodes = pushNodesDown(
          nds, 
          ifNodePosition.y, 
          VERTICAL_SPACING * 3, // Make room for the entire conditional structure
          [sourceNode.id]
        );
        
        // Update the target node position
        const updatedNodes = pushedNodes.map(n => 
          n.id === targetNode.id
            ? { ...n, position: targetNewPosition }
            : n
        );
        
        // Add all new nodes
        return [
          ...updatedNodes, 
          ifNode,
          branchNode, 
          elseNode, 
          elseEndNode
        ];
      });
      
      setEdges((eds) => {
        // Remove the original edge
        const remainingEdges = eds.filter(e => e.id !== edgeId);
        
        // Add all new edges
        return [
          ...remainingEdges, 
          ...conditionalEdges, 
          ...endEdges,
          connectToTargetEdge
        ];
      });
    },
    [edges, nodes, setNodes, setEdges, handleDeleteNode, handleNodeChange, pushNodesDown]
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
    data: { 
      ...e.data,
      onShowNodeSelector: handleShowNodeSelector,
    },
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
        nodesDraggable={true}
        defaultEdgeOptions={{
          type: 'custom',
        }}
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