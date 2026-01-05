/**
 * MarkdownScript Executor
 *
 * Executes JavaScript code in a sandboxed environment.
 * Provides controlled access to global APIs based on security level.
 */

import type { ScriptBlockData, ScriptExecutionResult, ScriptError } from './types';
import type { ScriptContext } from './ScriptContext';

/**
 * Allowed globals by security level
 */
const ALLOWED_GLOBALS = {
  // Strict: Only safe math and data operations
  strict: {
    Math,
    JSON,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    Map,
    Set,
  },

  // Standard: Add more utilities, but no network/timers
  standard: {
    Math,
    JSON,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    encodeURI,
    decodeURI,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Promise,
    Symbol,
    Proxy,
    Reflect,
    RegExp,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    // Structured clone for deep copy
    structuredClone: typeof structuredClone !== 'undefined' ? structuredClone : undefined,
  },

  // Permissive: Add fetch and more
  permissive: {
    Math,
    JSON,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    encodeURI,
    decodeURI,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Promise,
    Symbol,
    Proxy,
    Reflect,
    RegExp,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    structuredClone: typeof structuredClone !== 'undefined' ? structuredClone : undefined,
    fetch: typeof fetch !== 'undefined' ? fetch : undefined,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    Blob,
    FormData,
    Headers,
    Request,
    Response,
  },
} as const;

/**
 * Script executor with sandboxed execution
 */
export class ScriptExecutor {
  private context: ScriptContext;
  private securityLevel: keyof typeof ALLOWED_GLOBALS;
  private timeout: number;

  constructor(
    context: ScriptContext,
    securityLevel: keyof typeof ALLOWED_GLOBALS = 'standard',
    timeout = 5000
  ) {
    this.context = context;
    this.securityLevel = securityLevel;
    this.timeout = timeout;
  }

  /**
   * Execute a script block
   */
  async execute(script: ScriptBlockData): Promise<ScriptExecutionResult> {
    const startTime = performance.now();

    // Check cache first for output scripts
    if (script.cache && script.mode === 'output' && this.context.hasCached(script.id)) {
      return {
        id: script.id,
        success: true,
        output: String(this.context.getCached(script.id)),
        duration: 0,
        cached: true,
      };
    }

    try {
      // Create the sandboxed function
      const fn = this.createSandboxedFunction(script);

      // Execute with timeout
      const result = await this.executeWithTimeout(fn, script.async ? this.timeout : this.timeout / 2);

      // Cache if enabled for output scripts
      if (script.cache && script.mode === 'output' && result !== undefined) {
        this.context.setCached(script.id, result);
      }

      return {
        id: script.id,
        success: true,
        output: script.mode === 'output' && result !== undefined ? String(result) : undefined,
        duration: performance.now() - startTime,
        cached: false,
      };
    } catch (error) {
      return {
        id: script.id,
        success: false,
        error: this.formatError(error, script),
        duration: performance.now() - startTime,
        cached: false,
      };
    }
  }

  /**
   * Create a sandboxed function from script code
   */
  private createSandboxedFunction(script: ScriptBlockData): () => unknown {
    // Get allowed globals for security level
    const globals = ALLOWED_GLOBALS[this.securityLevel];

    // Get context API
    const api = this.context.getAPI();

    // Create custom console that captures logs
    const scriptId = script.id;
    const contextRef = this.context;
    const customConsole = {
      log: (...args: unknown[]) => contextRef.addLog('log', args, scriptId),
      warn: (...args: unknown[]) => contextRef.addLog('warn', args, scriptId),
      error: (...args: unknown[]) => contextRef.addLog('error', args, scriptId),
      info: (...args: unknown[]) => contextRef.addLog('info', args, scriptId),
    };

    // Combine scope
    const scope: Record<string, unknown> = {
      ...globals,
      ...api,
      console: customConsole,
    };

    // Get all variable names and values
    const scopeKeys = Object.keys(scope);
    const scopeValues = scopeKeys.map(k => scope[k]);

    // Wrap code appropriately
    let wrappedCode: string;

    if (script.mode === 'output') {
      // Output mode: wrap code to return last expression or explicit return
      if (script.async) {
        wrappedCode = `return (async () => { ${script.code} })()`;
      } else {
        // Check if code already has return statement
        if (/\breturn\b/.test(script.code)) {
          wrappedCode = `{ ${script.code} }`;
        } else {
          // Try to return last expression
          const lines = script.code.trim().split('\n');
          const lastLine = lines[lines.length - 1];

          // If last line is an expression, return it
          if (lastLine && !lastLine.match(/^(const|let|var|if|for|while|function|class|try|switch)/)) {
            lines[lines.length - 1] = `return (${lastLine})`;
            wrappedCode = `{ ${lines.join('\n')} }`;
          } else {
            wrappedCode = `{ ${script.code} }`;
          }
        }
      }
    } else {
      // Execute mode: just run the code
      if (script.async) {
        wrappedCode = `return (async () => { ${script.code} })()`;
      } else {
        wrappedCode = `{ ${script.code} }`;
      }
    }

    // Create function with scope
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const fn = new Function(...scopeKeys, wrappedCode);
      return () => fn.apply(null, scopeValues);
    } catch (error) {
      // Syntax error in script
      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout(fn: () => unknown, timeout: number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Script timed out after ${timeout}ms`));
      }, timeout);

      try {
        const result = fn();

        // Handle promise
        if (result instanceof Promise) {
          result
            .then((value) => {
              clearTimeout(timer);
              resolve(value);
            })
            .catch((error) => {
              clearTimeout(timer);
              reject(error);
            });
        } else {
          clearTimeout(timer);
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Format error with line info
   */
  private formatError(error: unknown, script: ScriptBlockData): ScriptError {
    const err = error instanceof Error ? error : new Error(String(error));

    // Try to extract line/column from stack
    let line: number | undefined;
    let column: number | undefined;

    if (err.stack) {
      // Look for line info in stack trace
      // Format: "at eval (...:line:column)"
      const match = err.stack.match(/<anonymous>:(\d+):(\d+)/);
      if (match) {
        // Adjust for wrapper code
        line = parseInt(match[1], 10) - 1;
        column = parseInt(match[2], 10);
      }
    }

    return {
      message: err.message,
      stack: err.stack,
      line,
      column,
    };
  }

  /**
   * Update security level
   */
  setSecurityLevel(level: keyof typeof ALLOWED_GLOBALS): void {
    this.securityLevel = level;
  }

  /**
   * Update timeout
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}

export default ScriptExecutor;
