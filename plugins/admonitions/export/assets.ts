/**
 * Admonitions Export Assets
 *
 * CSS styles needed for admonitions in exported HTML/PDF documents.
 */

import type { ExportAssets } from '../../../src/plugin-system/contribution-types';

/**
 * Admonitions Export Assets Configuration
 */
export const admonitionsExportAssets: ExportAssets = {
  // No external CSS needed - styles are embedded
  css: [],

  // No JavaScript needed - admonitions are pure CSS
  js: [],

  // Inline CSS for admonition styling
  inlineStyles: `
/* Admonition Base Styles */
.admonition {
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid var(--admonition-border, #448aff);
  background: var(--admonition-bg, #e3f2fd);
  border-radius: 4px;
}

.admonition-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admonition-icon {
  font-size: 1.2em;
}

/* Note */
.admonition-note {
  --admonition-border: #448aff;
  --admonition-bg: #e3f2fd;
}

/* Tip */
.admonition-tip {
  --admonition-border: #00c853;
  --admonition-bg: #e8f5e9;
}

/* Warning */
.admonition-warning {
  --admonition-border: #ff9100;
  --admonition-bg: #fff3e0;
}

/* Danger */
.admonition-danger {
  --admonition-border: #ff5252;
  --admonition-bg: #ffebee;
}

/* Info */
.admonition-info {
  --admonition-border: #2196f3;
  --admonition-bg: #e3f2fd;
}

/* Success */
.admonition-success {
  --admonition-border: #4caf50;
  --admonition-bg: #e8f5e9;
}

/* Question */
.admonition-question {
  --admonition-border: #64b5f6;
  --admonition-bg: #e3f2fd;
}

/* Quote */
.admonition-quote {
  --admonition-border: #9e9e9e;
  --admonition-bg: #fafafa;
  font-style: italic;
}

/* Example */
.admonition-example {
  --admonition-border: #7c4dff;
  --admonition-bg: #ede7f6;
}

/* Bug */
.admonition-bug {
  --admonition-border: #f44336;
  --admonition-bg: #ffebee;
}

/* Abstract */
.admonition-abstract {
  --admonition-border: #00bcd4;
  --admonition-bg: #e0f7fa;
}

/* Dark theme overrides */
@media (prefers-color-scheme: dark) {
  .admonition-note { --admonition-bg: #1a237e20; }
  .admonition-tip { --admonition-bg: #1b5e2020; }
  .admonition-warning { --admonition-bg: #e6510020; }
  .admonition-danger { --admonition-bg: #b7141420; }
  .admonition-info { --admonition-bg: #0d47a120; }
  .admonition-success { --admonition-bg: #2e7d3220; }
  .admonition-question { --admonition-bg: #1565c020; }
  .admonition-quote { --admonition-bg: #42424220; }
  .admonition-example { --admonition-bg: #4527a020; }
  .admonition-bug { --admonition-bg: #c6282820; }
  .admonition-abstract { --admonition-bg: #00697020; }
}

/* Collapsible admonitions */
.admonition-collapsible .admonition-title {
  cursor: pointer;
  user-select: none;
}

.admonition-collapsible .admonition-toggle {
  margin-left: auto;
  transition: transform 0.2s;
}

.admonition-collapsed .admonition-content {
  display: none;
}

.admonition-collapsed .admonition-toggle {
  transform: rotate(-90deg);
}
`.trim(),

  /**
   * Check if admonition assets are needed for this content
   */
  isNeeded: (html: string): boolean => {
    return (
      html.includes('class="admonition') ||
      html.includes('data-type="admonition') ||
      html.includes('class="callout') ||
      html.includes('data-callout=')
    );
  },
};

// Default export for dynamic import
export default admonitionsExportAssets;
