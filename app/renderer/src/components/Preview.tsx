/**
 * MD++ Preview Component
 * Renders MD++ content as HTML with live updates
 * Supports MarkdownScript (.mdsc) execution
 */

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { MDPlusPlus } from '../../../../src/parser';
import type { RenderResult, RenderError, PluginDefinition } from '../../../../src/types';
import type { ScriptBlockData } from '../script/types';
import type { ParserSettings } from './SettingsDialog';
import ScriptSecurityDialog from './ScriptSecurityDialog';
import { useScriptExecution, extractScriptsFromDOM } from '../hooks/useScriptExecution';
import mermaid from 'mermaid';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';

// Import plugins directly
import bootstrapPlugin from '../../../../plugins/bootstrap.json';
import admonitionsPlugin from '../../../../plugins/admonitions.json';

// Available plugins map
const PLUGINS: Record<string, PluginDefinition> = {
  bootstrap: bootstrapPlugin as PluginDefinition,
  admonitions: admonitionsPlugin as PluginDefinition,
};

type Theme = 'dark' | 'light';
type ScriptPermission = 'pending' | 'allowed' | 'denied';

// Storage key for trusted files
const TRUSTED_FILES_KEY = 'mdpp-trusted-script-files';

interface PreviewProps {
  content: string;
  showAIContext?: boolean;
  settings?: ParserSettings;
  theme?: Theme;
  filePath?: string | null;
  /** Ref for scroll sync - attaches to the scrollable preview container */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  /** Callback when preview is scrolled */
  onScroll?: () => void;
}

export default function Preview({ content, showAIContext = false, settings, theme = 'dark', filePath, scrollRef, onScroll }: PreviewProps) {
  const [html, setHtml] = useState('');
  const [errors, setErrors] = useState<RenderError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const internalPreviewRef = useRef<HTMLDivElement>(null);

  // Callback ref that updates both internal and external refs
  const setPreviewRef = useCallback((node: HTMLDivElement | null) => {
    // Update internal ref
    (internalPreviewRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    // Update external ref if provided
    if (scrollRef) {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [scrollRef]);

  // For accessing the DOM element in effects
  const previewRef = internalPreviewRef;

  // Script execution state
  const [scripts, setScripts] = useState<ScriptBlockData[]>([]);
  const [scriptPermission, setScriptPermission] = useState<ScriptPermission>('pending');
  const [trustedFiles, setTrustedFiles] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(TRUSTED_FILES_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Check if this is an .mdsc file
  const isMdscFile = filePath?.toLowerCase().endsWith('.mdsc') ?? false;

  // Check if file is trusted
  useEffect(() => {
    if (!isMdscFile) {
      setScriptPermission('denied');
      return;
    }

    if (filePath && trustedFiles.has(filePath)) {
      setScriptPermission('allowed');
    } else {
      setScriptPermission('pending');
    }
  }, [filePath, isMdscFile, trustedFiles]);

  // Script execution hook
  const { results: scriptResults, isExecuting: isScriptExecuting } = useScriptExecution(
    scripts,
    {
      enabled: scriptPermission === 'allowed' && isMdscFile,
      securityLevel: settings?.scriptSecurityLevel || 'standard',
      timeout: 5000,
      documentInfo: filePath ? { title: filePath.split(/[/\\]/).pop() || '', path: filePath, frontmatter: {} } : undefined,
    }
  );

  // Handle script permission
  const handleAllowScripts = (trustPermanently: boolean) => {
    setScriptPermission('allowed');
    if (trustPermanently && filePath) {
      const newTrusted = new Set(trustedFiles);
      newTrusted.add(filePath);
      setTrustedFiles(newTrusted);
      localStorage.setItem(TRUSTED_FILES_KEY, JSON.stringify([...newTrusted]));
    }
  };

  const handleDenyScripts = () => {
    setScriptPermission('denied');
  };

  // Update Mermaid theme when app theme changes
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });
  }, [theme]);

  // Create parser instance with settings
  const parser = useMemo(() => {
    // Get enabled plugins
    const enabledPluginNames = settings?.enabledPlugins || ['bootstrap', 'admonitions'];
    const plugins: PluginDefinition[] = enabledPluginNames
      .filter(name => PLUGINS[name])
      .map(name => PLUGINS[name]);

    // Build parser options from settings
    const options: Record<string, unknown> = {
      showAIContext,
      plugins,
    };

    // Settings are optional - use defaults if not provided
    if (settings) {
      options.enableGfm = settings.enableGfm;
      options.enableHeadingAnchors = settings.enableHeadingAnchors;
      options.enableDirectives = settings.enableDirectives;
      options.enableAIContext = settings.enableAIContext;
      // Math, Mermaid, Callouts are now controlled via enabledPlugins
      options.enableMath = enabledPluginNames.includes('katex');
      options.enableMermaid = enabledPluginNames.includes('mermaid');
      options.enableCallouts = enabledPluginNames.includes('admonitions');
    }

    return new MDPlusPlus(options);
  }, [showAIContext, settings]);

  // Convert markdown to HTML
  useEffect(() => {
    let cancelled = false;

    const convert = async () => {
      setIsLoading(true);
      try {
        const result: RenderResult = await parser.convert(content);
        if (!cancelled) {
          setHtml(result.html);
          setErrors(result.errors);
        }
      } catch (error) {
        if (!cancelled) {
          setErrors([{
            type: 'invalid-syntax',
            message: String(error),
          }]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    // Debounce conversion
    const timeout = setTimeout(convert, 150);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [content, parser]);

  // Render Mermaid diagrams and KaTeX math after HTML updates
  useEffect(() => {
    if (!previewRef.current) return;

    // Enhance admonitions (wrap content, no title bar - colors indicate type)
    const enhanceAdmonitions = () => {
      const admonitions = previewRef.current!.querySelectorAll('.admonition');
      admonitions.forEach((el) => {
        // Skip if already enhanced
        if (el.querySelector('.admonition-content')) return;

        // Wrap existing content
        const contentEl = document.createElement('div');
        contentEl.className = 'admonition-content';
        while (el.firstChild) {
          contentEl.appendChild(el.firstChild);
        }

        // Add data attribute
        el.setAttribute('data-type', 'admonition');

        // Insert content only (no title)
        el.appendChild(contentEl);
      });
    };

    // Render Mermaid diagrams
    const renderMermaid = async () => {
      const mermaidElements = previewRef.current!.querySelectorAll('.mermaid');
      if (mermaidElements.length === 0) return;

      // Store original content and reset for re-rendering
      mermaidElements.forEach((el, index) => {
        // Store original code if not already stored
        if (!el.getAttribute('data-original')) {
          el.setAttribute('data-original', el.textContent || '');
        }

        // Restore original code for re-rendering
        const originalCode = el.getAttribute('data-original');
        if (originalCode) {
          el.textContent = originalCode;
        }

        el.removeAttribute('data-processed');
        el.id = `mermaid-${Date.now()}-${index}`;
      });

      try {
        await mermaid.run({ nodes: mermaidElements as unknown as ArrayLike<HTMLElement> });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    };

    // Render KaTeX math
    const renderKaTeX = () => {
      // Match both .math and .language-math (from remark-math)
      const mathElements = previewRef.current!.querySelectorAll('.math, .language-math');
      mathElements.forEach((el) => {
        const isDisplay = el.classList.contains('math-display');
        const mathContent = el.textContent || '';

        // Skip if already rendered or empty
        if (el.querySelector('.katex') || !mathContent.trim()) return;

        try {
          katex.render(mathContent, el as HTMLElement, {
            displayMode: isDisplay,
            throwOnError: false,
            output: 'html',
          });
        } catch (error) {
          console.error('KaTeX rendering error:', error);
        }
      });
    };

    // Syntax highlighting for code blocks
    const renderHighlight = () => {
      const codeBlocks = previewRef.current!.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        // Skip if already highlighted, is mermaid, or is math
        if (block.classList.contains('hljs')) return;
        if (block.closest('.mermaid')) return;
        if (block.classList.contains('language-math')) return;

        hljs.highlightElement(block as HTMLElement);
      });
    };

    // Check which plugins are enabled
    const enabledPluginNames = settings?.enabledPlugins || ['katex', 'mermaid', 'admonitions', 'bootstrap'];
    const isMermaidEnabled = enabledPluginNames.includes('mermaid');
    const isKatexEnabled = enabledPluginNames.includes('katex');
    const isAdmonitionsEnabled = enabledPluginNames.includes('admonitions');

    // Reset Mermaid diagrams to source code if plugin is disabled
    const resetMermaid = () => {
      const mermaidElements = previewRef.current!.querySelectorAll('.mermaid');
      mermaidElements.forEach((el) => {
        const originalCode = el.getAttribute('data-original');
        if (originalCode) {
          // Clear SVG and show original code
          el.innerHTML = '';
          el.textContent = originalCode;
          el.removeAttribute('data-processed');
        }
      });
    };

    // Only run plugin-specific rendering if the plugin is enabled
    if (isAdmonitionsEnabled) {
      enhanceAdmonitions();
    }
    if (isMermaidEnabled) {
      renderMermaid();
    } else {
      // Reset any rendered diagrams when Mermaid is disabled
      resetMermaid();
    }
    if (isKatexEnabled) {
      renderKaTeX();
    }
    renderHighlight();

    // Extract scripts from DOM for .mdsc files
    if (isMdscFile) {
      const extractedScripts = extractScriptsFromDOM(previewRef.current!);
      setScripts(extractedScripts);
    }
  }, [html, theme, isMdscFile, settings?.enabledPlugins]);

  // Inject script results into the DOM
  useEffect(() => {
    if (!previewRef.current || scriptResults.size === 0) return;

    scriptResults.forEach((result, scriptId) => {
      const el = previewRef.current!.querySelector(`[data-script-id="${scriptId}"]`);
      if (!el) return;

      // Clear previous output
      const existingOutput = el.querySelector('.mdsc-output-content');
      if (existingOutput) {
        existingOutput.remove();
      }
      const existingError = el.querySelector('.mdsc-error');
      if (existingError) {
        existingError.remove();
      }

      if (result.success && result.output) {
        // Render output as HTML (scripts can return markdown that gets rendered)
        const outputEl = document.createElement('div');
        outputEl.className = 'mdsc-output-content';
        outputEl.innerHTML = result.output;
        el.appendChild(outputEl);
        el.setAttribute('data-script-result', 'success');
      } else if (!result.success && result.error) {
        // Display error
        const errorEl = document.createElement('div');
        errorEl.className = 'mdsc-error';
        errorEl.innerHTML = `
          <div class="mdsc-error-header">
            <span class="mdsc-error-icon">!</span>
            <span>Script Error</span>
          </div>
          <div class="mdsc-error-message">${escapeHtml(result.error.message)}</div>
          ${result.error.line ? `<div class="mdsc-error-location">Line ${result.error.line}</div>` : ''}
        `;
        el.appendChild(errorEl);
        el.setAttribute('data-script-result', 'error');
      }
    });
  }, [scriptResults]);

  return (
    <div
      className="preview-container"
      ref={setPreviewRef}
      onScroll={onScroll}
    >
      {/* Script Security Dialog for .mdsc files */}
      {isMdscFile && scriptPermission === 'pending' && scripts.length > 0 && (
        <ScriptSecurityDialog
          filePath={filePath || 'Unknown file'}
          onAllow={handleAllowScripts}
          onDeny={handleDenyScripts}
        />
      )}

      {errors.length > 0 && (
        <div className="preview-errors">
          {errors.map((error, index) => (
            <div key={index} className="preview-error">
              <span className="error-type">{error.type}:</span>
              <span className="error-message">{error.message}</span>
              {error.line && <span className="error-location">Line {error.line}</span>}
            </div>
          ))}
        </div>
      )}

      {(isLoading || isScriptExecuting) && (
        <div className="preview-loading">
          <span>{isScriptExecuting ? 'Executing scripts...' : 'Processing...'}</span>
        </div>
      )}

      <div
        ref={previewRef}
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// Helper to escape HTML in error messages
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
