/**
 * MermaidVisualEditor - Visual flowchart editor using ReactFlow
 * Converts between Mermaid syntax and ReactFlow nodes/edges
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

interface MermaidVisualEditorProps {
  code: string;
  onChange: (code: string) => void;
}

interface ParsedNode {
  id: string;
  label: string;
  shape: 'rect' | 'rounded' | 'diamond' | 'circle' | 'stadium';
}

interface ParsedEdge {
  source: string;
  target: string;
  label?: string;
  type: 'arrow' | 'line' | 'dotted';
}

// Parse Mermaid flowchart to nodes and edges
function parseMermaidToFlow(code: string): { nodes: ParsedNode[]; edges: ParsedEdge[] } {
  const nodes: ParsedNode[] = [];
  const edges: ParsedEdge[] = [];
  const nodeMap = new Map<string, ParsedNode>();

  const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('graph') && !l.startsWith('flowchart'));

  for (const line of lines) {
    // Skip comments and subgraph declarations
    if (line.startsWith('%%') || line.startsWith('subgraph') || line === 'end') continue;

    // Parse edges: A --> B, A --- B, A -.-> B, etc.
    const edgeMatch = line.match(/^(\w+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\}|\(\(([^)]+)\)\))?(?:\s*(-->|---|-\.->|==>|-.-)(?:\|([^|]+)\|)?\s*)(\w+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\}|\(\(([^)]+)\)\))?$/);

    if (edgeMatch) {
      const [, sourceId, sourceLabel1, sourceLabel2, sourceLabel3, sourceLabel4, arrow, edgeLabel, targetId, targetLabel1, targetLabel2, targetLabel3, targetLabel4] = edgeMatch;

      // Add source node if not exists
      if (!nodeMap.has(sourceId)) {
        const label = sourceLabel1 || sourceLabel2 || sourceLabel3 || sourceLabel4 || sourceId;
        const shape: ParsedNode['shape'] = sourceLabel1 ? 'rect' : sourceLabel2 ? 'rounded' : sourceLabel3 ? 'diamond' : sourceLabel4 ? 'circle' : 'rect';
        const node: ParsedNode = { id: sourceId, label, shape };
        nodeMap.set(sourceId, node);
        nodes.push(node);
      }

      // Add target node if not exists
      if (!nodeMap.has(targetId)) {
        const label = targetLabel1 || targetLabel2 || targetLabel3 || targetLabel4 || targetId;
        const shape: ParsedNode['shape'] = targetLabel1 ? 'rect' : targetLabel2 ? 'rounded' : targetLabel3 ? 'diamond' : targetLabel4 ? 'circle' : 'rect';
        const node: ParsedNode = { id: targetId, label, shape };
        nodeMap.set(targetId, node);
        nodes.push(node);
      }

      // Add edge
      const edgeType = arrow === '---' ? 'line' : arrow === '-.->' || arrow === '-.-' ? 'dotted' : 'arrow';
      edges.push({
        source: sourceId,
        target: targetId,
        label: edgeLabel,
        type: edgeType,
      });
      continue;
    }

    // Parse standalone node definitions: A[Label]
    const nodeMatch = line.match(/^(\w+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\}|\(\(([^)]+)\)\))$/);
    if (nodeMatch) {
      const [, id, label1, label2, label3, label4] = nodeMatch;
      if (!nodeMap.has(id)) {
        const label = label1 || label2 || label3 || label4 || id;
        const shape: ParsedNode['shape'] = label1 ? 'rect' : label2 ? 'rounded' : label3 ? 'diamond' : label4 ? 'circle' : 'rect';
        const node: ParsedNode = { id, label, shape };
        nodeMap.set(id, node);
        nodes.push(node);
      }
    }
  }

  return { nodes, edges };
}

// Convert ReactFlow nodes/edges back to Mermaid
function flowToMermaid(nodes: Node[], edges: Edge[], direction: string = 'TD'): string {
  let code = `graph ${direction}\n`;

  // Add node definitions with labels
  for (const node of nodes) {
    const label = (node.data as { label?: string })?.label || node.id;
    const shape = (node.data as { shape?: string })?.shape || 'rect';

    let nodeDef: string;
    switch (shape) {
      case 'rounded':
        nodeDef = `  ${node.id}(${label})`;
        break;
      case 'diamond':
        nodeDef = `  ${node.id}{${label}}`;
        break;
      case 'circle':
        nodeDef = `  ${node.id}((${label}))`;
        break;
      case 'stadium':
        nodeDef = `  ${node.id}([${label}])`;
        break;
      default:
        nodeDef = `  ${node.id}[${label}]`;
    }
    code += nodeDef + '\n';
  }

  // Add edges
  for (const edge of edges) {
    const edgeLabel = edge.label ? `|${edge.label}|` : '';
    const arrowType = edge.style?.strokeDasharray ? '-.->' : '-->';
    code += `  ${edge.source} ${arrowType}${edgeLabel} ${edge.target}\n`;
  }

  return code;
}

// Auto-layout using dagre
function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 75,
        y: nodeWithPosition.y - 25,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function MermaidVisualEditor({ code, onChange }: MermaidVisualEditorProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>('');

  // Parse initial code
  const initialData = useMemo(() => {
    const { nodes: parsedNodes, edges: parsedEdges } = parseMermaidToFlow(code);

    const rfNodes: Node[] = parsedNodes.map((node, index) => ({
      id: node.id,
      type: 'default',
      data: { label: node.label, shape: node.shape },
      position: { x: 0, y: index * 100 },
    }));

    const rfEdges: Edge[] = parsedEdges.map((edge, index) => ({
      id: `e${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      markerEnd: edge.type === 'arrow' ? { type: MarkerType.ArrowClosed } : undefined,
      style: edge.type === 'dotted' ? { strokeDasharray: '5,5' } : undefined,
    }));

    return getLayoutedElements(rfNodes, rfEdges);
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  // Update Mermaid code when nodes/edges change
  const syncToMermaid = useCallback(() => {
    const newCode = flowToMermaid(nodes, edges);
    onChange(newCode);
  }, [nodes, edges, onChange]);

  // Handle node changes
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Handle edge changes
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Handle new connections
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds));
  }, [setEdges]);

  // Add new node
  const addNode = useCallback(() => {
    const newId = `node${nodes.length + 1}`;
    const newNode: Node = {
      id: newId,
      type: 'default',
      data: { label: 'New Node', shape: 'rect' },
      position: { x: 100, y: nodes.length * 80 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  // Delete selected node
  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Auto-layout
  const autoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    setEditingLabel((node.data as { label?: string })?.label || '');
  }, []);

  // Handle double-click to edit
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const newLabel = prompt('Edit node label:', (node.data as { label?: string })?.label || '');
    if (newLabel !== null) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
        )
      );
    }
  }, [setNodes]);

  // Sync to Mermaid when nodes/edges change
  useEffect(() => {
    const timer = setTimeout(syncToMermaid, 300);
    return () => clearTimeout(timer);
  }, [nodes, edges, syncToMermaid]);

  return (
    <div className="mermaid-visual-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <Panel position="top-right" className="mermaid-visual-panel">
          <button type="button" onClick={addNode} title="Add Node">
            <Plus size={16} />
          </button>
          <button type="button" onClick={deleteSelected} disabled={!selectedNode} title="Delete Selected">
            <Trash2 size={16} />
          </button>
          <button type="button" onClick={autoLayout} title="Auto Layout">
            <RotateCcw size={16} />
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
