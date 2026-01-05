/**
 * MarkdownScript Context
 *
 * Provides shared state between script blocks and built-in APIs.
 * Variables defined in one script block persist to subsequent blocks.
 */

import type { ScriptDocumentInfo, ScriptContextState } from './types';

/**
 * Script execution context
 * Maintains shared state across script blocks
 */
export class ScriptContext {
  private variables: Map<string, unknown> = new Map();
  private cache: Map<string, unknown> = new Map();
  private logs: ScriptContextState['logs'] = [];
  private documentInfo: ScriptDocumentInfo;

  constructor(documentInfo?: Partial<ScriptDocumentInfo>) {
    this.documentInfo = {
      title: documentInfo?.title || 'Untitled',
      path: documentInfo?.path || '',
      frontmatter: documentInfo?.frontmatter || {},
    };
  }

  /**
   * Get a variable value
   */
  get(key: string): unknown {
    return this.variables.get(key);
  }

  /**
   * Set a variable value
   */
  set(key: string, value: unknown): void {
    this.variables.set(key, value);
  }

  /**
   * Check if a variable exists
   */
  has(key: string): boolean {
    return this.variables.has(key);
  }

  /**
   * Get all variables as an object
   */
  getAllVariables(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    this.variables.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Get cached result
   */
  getCached(id: string): unknown {
    return this.cache.get(id);
  }

  /**
   * Set cached result
   */
  setCached(id: string, value: unknown): void {
    this.cache.set(id, value);
  }

  /**
   * Check if result is cached
   */
  hasCached(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Add log entry
   */
  addLog(level: 'log' | 'warn' | 'error' | 'info', args: unknown[], scriptId: string): void {
    this.logs.push({
      level,
      args,
      timestamp: Date.now(),
      scriptId,
    });
  }

  /**
   * Get logs for a specific script
   */
  getLogsForScript(scriptId: string): ScriptContextState['logs'] {
    return this.logs.filter(log => log.scriptId === scriptId);
  }

  /**
   * Get all logs
   */
  getAllLogs(): ScriptContextState['logs'] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Reset context for new document (clears variables and logs, keeps cache)
   */
  reset(): void {
    this.variables.clear();
    this.logs = [];
    // Keep cache for performance on re-renders
  }

  /**
   * Full reset (clears everything)
   */
  fullReset(): void {
    this.variables.clear();
    this.cache.clear();
    this.logs = [];
  }

  /**
   * Update document info
   */
  setDocumentInfo(info: Partial<ScriptDocumentInfo>): void {
    if (info.title !== undefined) this.documentInfo.title = info.title;
    if (info.path !== undefined) this.documentInfo.path = info.path;
    if (info.frontmatter !== undefined) this.documentInfo.frontmatter = info.frontmatter;
  }

  /**
   * Get the built-in API object for scripts
   */
  getAPI(): Record<string, unknown> {
    const self = this;

    return {
      // Document metadata
      document: {
        get title() { return self.documentInfo.title; },
        get path() { return self.documentInfo.path; },
        get frontmatter() { return { ...self.documentInfo.frontmatter }; },
      },

      // Utility functions
      utils: {
        /**
         * Format a date
         */
        formatDate(date: Date, format?: string): string {
          if (!format) {
            return date.toLocaleDateString('de-DE');
          }
          // Simple format replacements
          return format
            .replace('YYYY', String(date.getFullYear()))
            .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
            .replace('DD', String(date.getDate()).padStart(2, '0'))
            .replace('HH', String(date.getHours()).padStart(2, '0'))
            .replace('mm', String(date.getMinutes()).padStart(2, '0'))
            .replace('ss', String(date.getSeconds()).padStart(2, '0'));
        },

        /**
         * Escape HTML entities
         */
        html(str: string): string {
          return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        },

        /**
         * Create a markdown table from data
         */
        table(headers: string[], rows: string[][]): string {
          const headerRow = `| ${headers.join(' | ')} |`;
          const separator = `| ${headers.map(() => '---').join(' | ')} |`;
          const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
          return `${headerRow}\n${separator}\n${dataRows}`;
        },

        /**
         * Create a markdown list
         */
        list(items: string[], ordered = false): string {
          return items
            .map((item, i) => ordered ? `${i + 1}. ${item}` : `- ${item}`)
            .join('\n');
        },

        /**
         * Format number with locale
         */
        number(n: number, decimals = 0): string {
          return n.toLocaleString('de-DE', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
        },

        /**
         * Format currency
         */
        currency(n: number, currency = 'EUR'): string {
          return n.toLocaleString('de-DE', {
            style: 'currency',
            currency,
          });
        },
      },

      // Variable access shortcuts
      $: (key: string) => self.get(key),
      $$: (key: string, value: unknown) => self.set(key, value),
    };
  }
}

export default ScriptContext;
