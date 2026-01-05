/**
 * Script Security Dialog
 *
 * Prompts the user to allow script execution in .mdsc files.
 * Scripts require explicit permission per file.
 */

import React, { useState } from 'react';

interface ScriptSecurityDialogProps {
  /** File path of the .mdsc file */
  filePath: string;
  /** Callback when user allows scripts */
  onAllow: (trustPermanently: boolean) => void;
  /** Callback when user denies scripts */
  onDeny: () => void;
}

export default function ScriptSecurityDialog({
  filePath,
  onAllow,
  onDeny,
}: ScriptSecurityDialogProps) {
  const [trustPermanently, setTrustPermanently] = useState(false);

  const fileName = filePath.split(/[\\/]/).pop() || 'Unknown file';

  return (
    <div className="script-security-overlay">
      <div className="script-security-dialog">
        <div className="script-security-header">
          <svg
            className="script-security-icon warning"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h2>Script-Ausführung erforderlich</h2>
        </div>

        <div className="script-security-content">
          <p>
            Diese Datei enthält ausführbaren JavaScript-Code:
          </p>
          <code className="script-security-filepath">{fileName}</code>

          <div className="script-security-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>
              Führe Scripts nur aus vertrauenswürdigen Quellen aus.
              Bösartiger Code könnte deine Daten gefährden.
            </p>
          </div>

          <label className="script-security-checkbox">
            <input
              type="checkbox"
              checked={trustPermanently}
              onChange={(e) => setTrustPermanently(e.target.checked)}
            />
            <span>Diese Datei dauerhaft vertrauen</span>
          </label>
        </div>

        <div className="script-security-actions">
          <button
            className="script-security-btn secondary"
            onClick={onDeny}
          >
            Ablehnen
          </button>
          <button
            className="script-security-btn primary"
            onClick={() => onAllow(trustPermanently)}
          >
            Scripts erlauben
          </button>
        </div>
      </div>
    </div>
  );
}
