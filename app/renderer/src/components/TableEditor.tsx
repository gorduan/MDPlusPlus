/**
 * MD++ Table Editor Component
 * Visual editor for Markdown tables
 */

import React, { useState, useCallback } from 'react';

interface TableEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
  initialMarkdown?: string;
}

type Alignment = 'left' | 'center' | 'right';

interface TableData {
  headers: string[];
  alignments: Alignment[];
  rows: string[][];
}

function parseMarkdownTable(markdown: string): TableData | null {
  const lines = markdown.trim().split('\n');
  if (lines.length < 2) return null;

  const headers = lines[0]
    .split('|')
    .map((h) => h.trim())
    .filter((h) => h);

  const alignmentLine = lines[1];
  const alignments: Alignment[] = alignmentLine
    .split('|')
    .map((a) => a.trim())
    .filter((a) => a)
    .map((a) => {
      if (a.startsWith(':') && a.endsWith(':')) return 'center';
      if (a.endsWith(':')) return 'right';
      return 'left';
    });

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c !== '');
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return { headers, alignments, rows };
}

function generateMarkdownTable(data: TableData): string {
  const { headers, alignments, rows } = data;

  // Calculate column widths
  const widths = headers.map((h, i) => {
    const cellWidths = rows.map((row) => (row[i] || '').length);
    return Math.max(h.length, ...cellWidths, 3);
  });

  // Generate header row
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(widths[i])).join(' | ') + ' |';

  // Generate alignment row
  const alignmentRow =
    '| ' +
    alignments
      .map((a, i) => {
        const w = widths[i];
        if (a === 'center') return ':' + '-'.repeat(w - 2) + ':';
        if (a === 'right') return '-'.repeat(w - 1) + ':';
        return '-'.repeat(w);
      })
      .join(' | ') +
    ' |';

  // Generate data rows
  const dataRows = rows.map(
    (row) => '| ' + row.map((cell, i) => (cell || '').padEnd(widths[i] || 3)).join(' | ') + ' |'
  );

  return [headerRow, alignmentRow, ...dataRows].join('\n');
}

export default function TableEditor({ isOpen, onClose, onInsert, initialMarkdown }: TableEditorProps) {
  const [headers, setHeaders] = useState<string[]>(['Spalte 1', 'Spalte 2', 'Spalte 3']);
  const [alignments, setAlignments] = useState<Alignment[]>(['left', 'left', 'left']);
  const [rows, setRows] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
  ]);

  // Parse initial markdown if provided
  React.useEffect(() => {
    if (initialMarkdown) {
      const parsed = parseMarkdownTable(initialMarkdown);
      if (parsed) {
        setHeaders(parsed.headers);
        setAlignments(parsed.alignments);
        setRows(parsed.rows);
      }
    }
  }, [initialMarkdown]);

  const updateHeader = useCallback((index: number, value: string) => {
    setHeaders((prev) => {
      const newHeaders = [...prev];
      newHeaders[index] = value;
      return newHeaders;
    });
  }, []);

  const updateCell = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setRows((prev) => {
      const newRows = prev.map((row) => [...row]);
      if (!newRows[rowIndex]) {
        newRows[rowIndex] = [];
      }
      newRows[rowIndex][colIndex] = value;
      return newRows;
    });
  }, []);

  const updateAlignment = useCallback((index: number, alignment: Alignment) => {
    setAlignments((prev) => {
      const newAlignments = [...prev];
      newAlignments[index] = alignment;
      return newAlignments;
    });
  }, []);

  const addColumn = useCallback(() => {
    setHeaders((prev) => [...prev, `Spalte ${prev.length + 1}`]);
    setAlignments((prev) => [...prev, 'left']);
    setRows((prev) => prev.map((row) => [...row, '']));
  }, []);

  const removeColumn = useCallback((index: number) => {
    if (headers.length <= 1) return;
    setHeaders((prev) => prev.filter((_, i) => i !== index));
    setAlignments((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) => prev.map((row) => row.filter((_, i) => i !== index)));
  }, [headers.length]);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, new Array(headers.length).fill('')]);
  }, [headers.length]);

  const removeRow = useCallback((index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  }, [rows.length]);

  const handleInsert = useCallback(() => {
    const markdown = generateMarkdownTable({ headers, alignments, rows });
    onInsert(markdown);
    onClose();
  }, [headers, alignments, rows, onInsert, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="dialog table-editor-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Tabellen-Editor</h2>
          <button className="dialog-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z" />
            </svg>
          </button>
        </div>

        <div className="dialog-content table-editor-content">
          <div className="table-editor-toolbar">
            <button onClick={addColumn} title="Spalte hinzufügen">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
              Spalte
            </button>
            <button onClick={addRow} title="Zeile hinzufügen">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
              Zeile
            </button>
          </div>

          <div className="table-editor-table-wrapper">
            <table className="table-editor-table">
              <thead>
                <tr>
                  {headers.map((header, i) => (
                    <th key={i}>
                      <div className="table-header-cell">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => updateHeader(i, e.target.value)}
                          placeholder={`Spalte ${i + 1}`}
                        />
                        <div className="table-header-actions">
                          <select
                            value={alignments[i]}
                            onChange={(e) => updateAlignment(i, e.target.value as Alignment)}
                            title="Ausrichtung"
                          >
                            <option value="left">Links</option>
                            <option value="center">Mitte</option>
                            <option value="right">Rechts</option>
                          </select>
                          <button
                            className="table-remove-btn"
                            onClick={() => removeColumn(i)}
                            disabled={headers.length <= 1}
                            title="Spalte entfernen"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="table-action-col"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((_, colIndex) => (
                      <td key={colIndex} style={{ textAlign: alignments[colIndex] }}>
                        <input
                          type="text"
                          value={row[colIndex] || ''}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          placeholder=""
                        />
                      </td>
                    ))}
                    <td className="table-action-col">
                      <button
                        className="table-remove-btn"
                        onClick={() => removeRow(rowIndex)}
                        disabled={rows.length <= 1}
                        title="Zeile entfernen"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-editor-preview">
            <h4>Vorschau:</h4>
            <pre>{generateMarkdownTable({ headers, alignments, rows })}</pre>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button className="btn btn-primary" onClick={handleInsert}>
            Einfügen
          </button>
        </div>
      </div>
    </div>
  );
}
