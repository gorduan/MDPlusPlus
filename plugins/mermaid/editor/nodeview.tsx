/**
 * MermaidNodeView - React component for rendering Mermaid diagrams in TipTap
 * Supports three modes: Preview, Code Editor, and Visual Editor (ReactFlow)
 *
 * This component is contributed by the Mermaid plugin.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import mermaid from 'mermaid';
import { Code, Eye, GitBranch, Play, Copy, Check, AlertCircle } from 'lucide-react';
import MermaidVisualEditor from './visual-editor';

type ViewMode = 'preview' | 'code' | 'visual';

export default function MermaidNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const { code, viewMode: savedViewMode } = node.attrs;
  const [viewMode, setViewMode] = useState<ViewMode>(savedViewMode || 'preview');
  const [localCode, setLocalCode] = useState(code);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.body.classList.contains('light') ? 'default' : 'dark',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });
  }, []);

  // Render mermaid diagram
  const renderDiagram = useCallback(async () => {
    if (!localCode.trim()) {
      setSvgContent('');
      setError(null);
      return;
    }

    try {
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, localCode);
      setSvgContent(svg);
      setError(null);
    } catch (err) {
      console.error('Mermaid render error:', err);
      setError(err instanceof Error ? err.message : 'Invalid Mermaid syntax');
      setSvgContent('');
    }
  }, [localCode]);

  // Re-render when code changes
  useEffect(() => {
    if (viewMode === 'preview' || viewMode === 'visual') {
      renderDiagram();
    }
  }, [localCode, viewMode, renderDiagram]);

  // Sync local code with node attributes
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  // Handle code changes
  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode);
  };

  // Apply code changes to node
  const applyChanges = () => {
    updateAttributes({ code: localCode });
    renderDiagram();
  };

  // Handle visual editor changes
  const handleVisualChange = (newCode: string) => {
    setLocalCode(newCode);
    updateAttributes({ code: newCode });
  };

  // Copy code to clipboard
  const copyCode = async () => {
    await navigator.clipboard.writeText(localCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Switch view mode
  const switchMode = (mode: ViewMode) => {
    if (mode === 'code' && viewMode !== 'code') {
      // Apply any pending changes before switching away from code mode
      if (localCode !== code) {
        updateAttributes({ code: localCode });
      }
    }
    setViewMode(mode);
    updateAttributes({ viewMode: mode });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && viewMode === 'code') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(150, textareaRef.current.scrollHeight)}px`;
    }
  }, [localCode, viewMode]);

  // Check if visual editor is supported for this diagram type
  const isFlowchart = localCode.trim().startsWith('graph') ||
                       localCode.trim().startsWith('flowchart');

  return (
    <NodeViewWrapper className={`mermaid-node-view ${selected ? 'selected' : ''}`}>
      <div className="mermaid-container">
        {/* Header with mode toggle */}
        <div className="mermaid-header">
          <div className="mermaid-title">
            <GitBranch size={14} />
            <span>Mermaid Diagram</span>
          </div>

          <div className="mermaid-actions">
            {/* View mode buttons */}
            <div className="mermaid-mode-toggle">
              <button
                type="button"
                onClick={() => switchMode('preview')}
                className={`mermaid-mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
                title="Preview"
              >
                <Eye size={14} />
              </button>
              <button
                type="button"
                onClick={() => switchMode('code')}
                className={`mermaid-mode-btn ${viewMode === 'code' ? 'active' : ''}`}
                title="Code Editor"
              >
                <Code size={14} />
              </button>
              {isFlowchart && (
                <button
                  type="button"
                  onClick={() => switchMode('visual')}
                  className={`mermaid-mode-btn ${viewMode === 'visual' ? 'active' : ''}`}
                  title="Visual Editor (Flowcharts only)"
                >
                  <GitBranch size={14} />
                </button>
              )}
            </div>

            {/* Copy button */}
            <button
              type="button"
              onClick={copyCode}
              className="mermaid-action-btn"
              title="Copy code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="mermaid-content">
          {/* Preview Mode */}
          {viewMode === 'preview' && (
            <div className="mermaid-preview" ref={previewRef}>
              {error ? (
                <div className="mermaid-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              ) : svgContent ? (
                <div
                  className="mermaid-svg"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="mermaid-placeholder">
                  Enter Mermaid code to see diagram
                </div>
              )}
            </div>
          )}

          {/* Code Editor Mode */}
          {viewMode === 'code' && (
            <div className="mermaid-code-editor">
              <textarea
                ref={textareaRef}
                value={localCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                onBlur={applyChanges}
                className="mermaid-textarea"
                placeholder="Enter Mermaid diagram code..."
                spellCheck={false}
              />
              <div className="mermaid-code-footer">
                <button
                  type="button"
                  onClick={applyChanges}
                  className="mermaid-apply-btn"
                >
                  <Play size={14} />
                  <span>Apply & Preview</span>
                </button>
                {error && (
                  <div className="mermaid-inline-error">
                    <AlertCircle size={12} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Visual Editor Mode */}
          {viewMode === 'visual' && (
            <div className="mermaid-visual-editor">
              {isFlowchart ? (
                <MermaidVisualEditor
                  code={localCode}
                  onChange={handleVisualChange}
                />
              ) : (
                <div className="mermaid-visual-unsupported">
                  <AlertCircle size={24} />
                  <p>Visual editing is only available for flowcharts.</p>
                  <p>Switch to Code mode to edit this diagram.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
