/**
 * MD++ Preview Component
 * Renders MD++ content as HTML with live updates
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MDPlusPlus } from '../../../../src/parser';
import type { RenderResult, RenderError, PluginDefinition } from '../../../../src/types';
import type { ParserSettings } from './SettingsDialog';
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

interface PreviewProps {
  content: string;
  showAIContext?: boolean;
  settings?: ParserSettings;
  theme?: Theme;
}

export default function Preview({ content, showAIContext = false, settings, theme = 'dark' }: PreviewProps) {
  const [html, setHtml] = useState('');
  const [errors, setErrors] = useState<RenderError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

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
      options.enableMath = settings.enableMath;
      options.enableCallouts = settings.enableCallouts;
      options.enableHeadingAnchors = settings.enableHeadingAnchors;
      options.enableDirectives = settings.enableDirectives;
      options.enableAIContext = settings.enableAIContext;
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
      const mathElements = previewRef.current!.querySelectorAll('.math');
      mathElements.forEach((el) => {
        const isDisplay = el.classList.contains('math-display');
        const mathContent = el.textContent || '';

        // Skip if already rendered
        if (el.querySelector('.katex')) return;

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
        // Skip if already highlighted or is mermaid
        if (block.classList.contains('hljs')) return;
        if (block.closest('.mermaid')) return;

        hljs.highlightElement(block as HTMLElement);
      });
    };

    renderMermaid();
    renderKaTeX();
    renderHighlight();
  }, [html, theme]);

  return (
    <div className="preview-container">
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
      {isLoading && (
        <div className="preview-loading">
          <span>Processing...</span>
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
