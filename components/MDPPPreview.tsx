/**
 * MD++ Embeddable Preview Component
 *
 * Renders MD++ markdown as HTML with support for directives and AI context.
 * Can be embedded in any React application.
 *
 * @example
 * ```tsx
 * import { MDPPPreview } from '@gorduan/mdplusplus/components';
 *
 * function MyApp() {
 *   return <MDPPPreview value="# Hello MD++" />;
 * }
 * ```
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MDPlusPlus } from '../src/parser';
import type { RenderResult, RenderError, PluginDefinition } from '../src/types';

export interface MDPPPreviewProps {
  /** The markdown content to render */
  value: string;
  /** Show AI context blocks (default: false) */
  showAIContext?: boolean;
  /** Custom plugins to use */
  plugins?: PluginDefinition[];
  /** Preview height */
  height?: string | number;
  /** Enable dark mode styling (default: true) */
  darkMode?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Callback when rendering is complete */
  onRender?: (result: RenderResult) => void;
  /** Callback on render error */
  onError?: (errors: RenderError[]) => void;
  /** Custom CSS for the preview content */
  contentStyles?: React.CSSProperties;
  /** Sanitize HTML output (default: true) */
  sanitize?: boolean;
  /** Debounce delay in ms (default: 150) */
  debounceMs?: number;
}

const defaultStyles: React.CSSProperties = {
  padding: '16px 24px',
  lineHeight: 1.6,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const darkModeStyles: React.CSSProperties = {
  backgroundColor: '#1e1e1e',
  color: '#cccccc',
};

const lightModeStyles: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#333333',
};

export function MDPPPreview({
  value,
  showAIContext = false,
  plugins = [],
  height = 'auto',
  darkMode = true,
  className,
  style,
  onRender,
  onError,
  contentStyles,
  sanitize = true,
  debounceMs = 150,
}: MDPPPreviewProps) {
  const [html, setHtml] = useState('');
  const [errors, setErrors] = useState<RenderError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create parser instance
  const parser = useMemo(() => {
    return new MDPlusPlus({
      showAIContext,
      plugins,
    });
  }, [showAIContext, plugins]);

  // Sanitize HTML to prevent XSS
  const sanitizeHtml = useCallback((html: string): string => {
    if (!sanitize) return html;

    // Basic sanitization - remove script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }, [sanitize]);

  // Convert markdown to HTML
  useEffect(() => {
    let cancelled = false;

    const convert = async () => {
      setIsLoading(true);
      try {
        const result: RenderResult = await parser.convert(value);
        if (!cancelled) {
          const sanitizedHtml = sanitizeHtml(result.html);
          setHtml(sanitizedHtml);
          setErrors(result.errors);

          if (onRender) {
            onRender({ ...result, html: sanitizedHtml });
          }
          if (result.errors.length > 0 && onError) {
            onError(result.errors);
          }
        }
      } catch (error) {
        if (!cancelled) {
          const err: RenderError = {
            type: 'invalid-syntax',
            message: String(error),
          };
          setErrors([err]);
          if (onError) {
            onError([err]);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    // Debounce conversion
    const timeout = setTimeout(convert, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [value, parser, sanitizeHtml, onRender, onError, debounceMs]);

  const containerStyle: React.CSSProperties = {
    height,
    overflow: 'auto',
    ...(darkMode ? darkModeStyles : lightModeStyles),
    ...style,
  };

  const previewContentStyle: React.CSSProperties = {
    ...defaultStyles,
    ...contentStyles,
  };

  return (
    <div className={`mdpp-preview ${className || ''}`} style={containerStyle}>
      {isLoading && (
        <div className="mdpp-preview-loading" style={{ padding: '8px', opacity: 0.7 }}>
          Processing...
        </div>
      )}
      {errors.length > 0 && (
        <div
          className="mdpp-preview-errors"
          style={{
            padding: '8px 16px',
            backgroundColor: darkMode ? 'rgba(241, 76, 76, 0.1)' : 'rgba(241, 76, 76, 0.05)',
            borderBottom: '1px solid #f14c4c',
            color: '#f14c4c',
            fontSize: '12px',
          }}
        >
          {errors.map((error, index) => (
            <div key={index}>
              <strong>{error.type}:</strong> {error.message}
              {error.line && ` (Line ${error.line})`}
            </div>
          ))}
        </div>
      )}
      <div
        className="mdpp-preview-content"
        style={previewContentStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .mdpp-preview-content h1 {
          font-size: 2em;
          margin-bottom: 0.5em;
          padding-bottom: 0.3em;
          border-bottom: 1px solid ${darkMode ? '#3c3c3c' : '#e1e4e8'};
        }
        .mdpp-preview-content h2 {
          font-size: 1.5em;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          padding-bottom: 0.3em;
          border-bottom: 1px solid ${darkMode ? '#3c3c3c' : '#e1e4e8'};
        }
        .mdpp-preview-content h3 {
          font-size: 1.25em;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .mdpp-preview-content code {
          font-family: 'Fira Code', Consolas, monospace;
          background-color: ${darkMode ? '#2d2d2d' : '#f4f4f4'};
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .mdpp-preview-content pre {
          background-color: ${darkMode ? '#2d2d2d' : '#f4f4f4'};
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin-bottom: 1em;
        }
        .mdpp-preview-content pre code {
          background: none;
          padding: 0;
        }
        .mdpp-preview-content blockquote {
          border-left: 4px solid ${darkMode ? '#0e639c' : '#0366d6'};
          margin: 0 0 1em 0;
          padding: 0.5em 1em;
          color: ${darkMode ? '#858585' : '#6a737d'};
          background-color: ${darkMode ? '#2d2d2d' : '#f6f8fa'};
        }
        .mdpp-preview-content a {
          color: ${darkMode ? '#4ec9b0' : '#0366d6'};
          text-decoration: none;
        }
        .mdpp-preview-content a:hover {
          text-decoration: underline;
        }
        .mdpp-preview-content .mdpp-ai-context {
          background-color: ${darkMode ? 'rgba(220, 220, 170, 0.1)' : 'rgba(220, 180, 50, 0.1)'};
          border: 1px dashed ${darkMode ? '#cca700' : '#b08800'};
          border-radius: 4px;
          padding: 12px 16px;
          margin: 1em 0;
          position: relative;
        }
        .mdpp-preview-content .mdpp-ai-context::before {
          content: 'AI Context';
          position: absolute;
          top: -10px;
          left: 12px;
          background-color: ${darkMode ? '#1e1e1e' : '#ffffff'};
          padding: 0 8px;
          font-size: 11px;
          color: ${darkMode ? '#cca700' : '#b08800'};
          font-weight: 600;
        }
        .mdpp-preview-content .mdpp-ai-context.hidden {
          display: none;
        }
      `}</style>
    </div>
  );
}
