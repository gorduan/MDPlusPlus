/**
 * MD++ Help Dialog Component
 * Shows keyboard shortcuts and quick reference
 */

import React from 'react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Datei',
    shortcuts: [
      { keys: 'Ctrl+N', description: 'Neue Datei' },
      { keys: 'Ctrl+O', description: 'Datei öffnen' },
      { keys: 'Ctrl+S', description: 'Speichern' },
      { keys: 'Ctrl+Shift+S', description: 'Speichern unter' },
      { keys: 'Ctrl+E', description: 'Als HTML exportieren' },
      { keys: 'Ctrl+Shift+E', description: 'Als PDF exportieren' },
    ],
  },
  {
    title: 'Bearbeiten',
    shortcuts: [
      { keys: 'Ctrl+Z', description: 'Rückgängig' },
      { keys: 'Ctrl+Y', description: 'Wiederholen' },
      { keys: 'Ctrl+X', description: 'Ausschneiden' },
      { keys: 'Ctrl+C', description: 'Kopieren' },
      { keys: 'Ctrl+V', description: 'Einfügen' },
      { keys: 'Ctrl+A', description: 'Alles auswählen' },
      { keys: 'Ctrl+F', description: 'Suchen' },
      { keys: 'Ctrl+H', description: 'Suchen & Ersetzen' },
    ],
  },
  {
    title: 'Ansicht',
    shortcuts: [
      { keys: 'Ctrl+1', description: 'Nur Editor' },
      { keys: 'Ctrl+2', description: 'Nur Vorschau' },
      { keys: 'Ctrl+3', description: 'Split-Ansicht' },
      { keys: 'Ctrl+,', description: 'Einstellungen' },
      { keys: 'Ctrl+Shift+A', description: 'AI-Kontext anzeigen' },
      { keys: 'F1', description: 'Hilfe (dieses Fenster)' },
      { keys: 'F12', description: 'Entwicklertools' },
    ],
  },
  {
    title: 'Formatierung',
    shortcuts: [
      { keys: 'Ctrl+B', description: 'Fett' },
      { keys: 'Ctrl+I', description: 'Kursiv' },
      { keys: 'Ctrl+`', description: 'Code (inline)' },
      { keys: 'Ctrl+K', description: 'Link einfügen' },
      { keys: 'Ctrl+Shift+I', description: 'Bild einfügen' },
      { keys: 'Ctrl+Alt+1', description: 'Überschrift 1' },
      { keys: 'Ctrl+Alt+2', description: 'Überschrift 2' },
      { keys: 'Ctrl+Alt+3', description: 'Überschrift 3' },
    ],
  },
  {
    title: 'Suchen',
    shortcuts: [
      { keys: 'Enter', description: 'Nächster Treffer' },
      { keys: 'Shift+Enter', description: 'Vorheriger Treffer' },
      { keys: 'Escape', description: 'Suche schließen' },
    ],
  },
];

const MARKDOWN_REFERENCE = [
  { syntax: '**text**', description: 'Fett' },
  { syntax: '*text*', description: 'Kursiv' },
  { syntax: '~~text~~', description: 'Durchgestrichen' },
  { syntax: '`code`', description: 'Inline-Code' },
  { syntax: '[text](url)', description: 'Link' },
  { syntax: '![alt](url)', description: 'Bild' },
  { syntax: '# H1', description: 'Überschrift 1' },
  { syntax: '## H2', description: 'Überschrift 2' },
  { syntax: '- item', description: 'Aufzählung' },
  { syntax: '1. item', description: 'Nummerierung' },
  { syntax: '> quote', description: 'Zitat' },
  { syntax: '---', description: 'Horizontale Linie' },
  { syntax: '```lang', description: 'Code-Block' },
  { syntax: '$math$', description: 'Inline-Formel' },
  { syntax: '$$math$$', description: 'Block-Formel' },
];

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog help-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>MD++ Hilfe</h2>
          <button className="dialog-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z" />
            </svg>
          </button>
        </div>

        <div className="dialog-content help-content">
          <div className="help-section">
            <h3>Tastenkürzel</h3>
            <div className="shortcut-groups">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title} className="shortcut-group">
                  <h4>{group.title}</h4>
                  <div className="shortcut-list">
                    {group.shortcuts.map((shortcut) => (
                      <div key={shortcut.keys} className="shortcut-item">
                        <kbd>{shortcut.keys}</kbd>
                        <span>{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="help-section">
            <h3>Markdown-Kurzreferenz</h3>
            <div className="markdown-reference">
              {MARKDOWN_REFERENCE.map((item) => (
                <div key={item.syntax} className="reference-item">
                  <code>{item.syntax}</code>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="help-section">
            <h3>MD++ Erweiterungen</h3>
            <div className="markdown-reference">
              <div className="reference-item">
                <code>:::ai-context</code>
                <span>AI-Kontext-Block</span>
              </div>
              <div className="reference-item">
                <code>:::plugin:component</code>
                <span>Plugin-Komponente</span>
              </div>
              <div className="reference-item">
                <code>```mermaid</code>
                <span>Mermaid-Diagramm</span>
              </div>
              <div className="reference-item">
                <code>&gt; [!NOTE]</code>
                <span>Callout-Box</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
