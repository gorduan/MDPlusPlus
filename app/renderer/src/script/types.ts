/**
 * MarkdownScript Types for Renderer
 *
 * Re-exports types from core and adds renderer-specific types
 */

// Re-export core types
export type {
  ScriptMode,
  ScriptSecurityLevel,
  ScriptBlockData,
  ScriptError,
  ScriptExecutionResult,
  ScriptLogEntry,
  ScriptAPI,
} from '../../../../src/types';

/**
 * Script execution options
 */
export interface ScriptExecutionOptions {
  /** Security level */
  securityLevel: 'strict' | 'standard' | 'permissive';
  /** Timeout in milliseconds */
  timeout: number;
  /** Enable async/await support */
  allowAsync: boolean;
}

/**
 * Script context state
 */
export interface ScriptContextState {
  /** Variables defined by scripts */
  variables: Map<string, unknown>;
  /** Cached execution results */
  cache: Map<string, unknown>;
  /** Console log entries */
  logs: Array<{
    level: 'log' | 'warn' | 'error' | 'info';
    args: unknown[];
    timestamp: number;
    scriptId: string;
  }>;
}

/**
 * Document info available to scripts
 */
export interface ScriptDocumentInfo {
  /** Document title */
  title: string;
  /** File path */
  path: string;
  /** Frontmatter data */
  frontmatter: Record<string, unknown>;
}

/**
 * Execution hook options
 */
export interface UseScriptExecutionOptions {
  /** Whether scripts should be executed */
  enabled: boolean;
  /** Security level */
  securityLevel: 'strict' | 'standard' | 'permissive';
  /** Timeout per script in ms */
  timeout?: number;
  /** Document info for script context */
  documentInfo?: ScriptDocumentInfo;
}
