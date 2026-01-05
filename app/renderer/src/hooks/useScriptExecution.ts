/**
 * useScriptExecution Hook
 *
 * React hook for executing MarkdownScript blocks.
 * Manages script context, execution, and results.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ScriptContext, ScriptExecutor } from '../script';
import type {
  ScriptBlockData,
  ScriptExecutionResult,
  UseScriptExecutionOptions,
  ScriptDocumentInfo,
} from '../script/types';

interface UseScriptExecutionReturn {
  /** Execution results by script ID */
  results: Map<string, ScriptExecutionResult>;
  /** Whether scripts are currently executing */
  isExecuting: boolean;
  /** Script context for accessing logs */
  context: ScriptContext | null;
  /** Re-execute all scripts */
  reExecute: () => void;
  /** Clear cache and re-execute */
  clearCacheAndExecute: () => void;
}

/**
 * Hook for executing MarkdownScript blocks
 */
export function useScriptExecution(
  scripts: ScriptBlockData[],
  options: UseScriptExecutionOptions
): UseScriptExecutionReturn {
  const { enabled, securityLevel, timeout = 5000, documentInfo } = options;

  // State
  const [results, setResults] = useState<Map<string, ScriptExecutionResult>>(new Map());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTrigger, setExecutionTrigger] = useState(0);

  // Refs for stable references
  const contextRef = useRef<ScriptContext | null>(null);
  const executorRef = useRef<ScriptExecutor | null>(null);

  // Initialize context
  useEffect(() => {
    if (!contextRef.current) {
      contextRef.current = new ScriptContext(documentInfo);
    } else if (documentInfo) {
      contextRef.current.setDocumentInfo(documentInfo);
    }
  }, [documentInfo]);

  // Initialize executor when options change
  useEffect(() => {
    if (enabled && contextRef.current) {
      executorRef.current = new ScriptExecutor(
        contextRef.current,
        securityLevel,
        timeout
      );
    } else {
      executorRef.current = null;
    }
  }, [enabled, securityLevel, timeout]);

  // Memoize script IDs for change detection
  const scriptIds = useMemo(
    () => scripts.map(s => `${s.id}:${s.code}`).join('|'),
    [scripts]
  );

  // Execute scripts when they change or execution is triggered
  useEffect(() => {
    if (!enabled || !executorRef.current || !contextRef.current || scripts.length === 0) {
      if (scripts.length === 0) {
        setResults(new Map());
      }
      return;
    }

    let cancelled = false;

    const execute = async () => {
      setIsExecuting(true);

      // Reset context for fresh execution
      contextRef.current!.reset();

      const newResults = new Map<string, ScriptExecutionResult>();

      // Execute scripts in order to maintain variable scope
      for (const script of scripts) {
        if (cancelled) break;

        const result = await executorRef.current!.execute(script);
        newResults.set(script.id, result);

        // Update results progressively
        if (!cancelled) {
          setResults(new Map(newResults));
        }
      }

      if (!cancelled) {
        setIsExecuting(false);
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, [enabled, scriptIds, executionTrigger]);

  // Re-execute callback
  const reExecute = useCallback(() => {
    setExecutionTrigger(prev => prev + 1);
  }, []);

  // Clear cache and re-execute
  const clearCacheAndExecute = useCallback(() => {
    if (contextRef.current) {
      contextRef.current.clearCache();
    }
    setExecutionTrigger(prev => prev + 1);
  }, []);

  return {
    results,
    isExecuting,
    context: contextRef.current,
    reExecute,
    clearCacheAndExecute,
  };
}

/**
 * Extract scripts from HTML and return script blocks
 */
export function extractScriptsFromDOM(container: HTMLElement): ScriptBlockData[] {
  const scripts: ScriptBlockData[] = [];

  const elements = container.querySelectorAll('[data-script-id]');

  elements.forEach((el) => {
    const id = el.getAttribute('data-script-id');
    const mode = el.getAttribute('data-script-mode') as 'execute' | 'output';
    const code = el.getAttribute('data-script-code');
    const lang = el.getAttribute('data-script-lang') as 'js';
    const async = el.getAttribute('data-script-async') === 'true';
    const cache = el.getAttribute('data-script-cache') !== 'false';
    const lineStr = el.getAttribute('data-script-line');

    if (id && code) {
      scripts.push({
        id,
        code: decodeURIComponent(code),
        mode: mode || 'execute',
        lang: lang || 'js',
        async,
        cache,
        line: lineStr ? parseInt(lineStr, 10) : undefined,
      });
    }
  });

  return scripts;
}

export default useScriptExecution;
