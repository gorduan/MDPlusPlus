/**
 * MD++ Preview Component
 * Renders MD++ content as HTML with live updates
 */

import React, { useEffect, useState, useMemo } from 'react';
import { MDPlusPlus } from '../../../../src/parser';
import type { RenderResult, RenderError } from '../../../../src/types';
import type { ParserSettings } from './SettingsDialog';

interface PreviewProps {
  content: string;
  showAIContext?: boolean;
  settings?: ParserSettings;
}

export default function Preview({ content, showAIContext = false, settings }: PreviewProps) {
  const [html, setHtml] = useState('');
  const [errors, setErrors] = useState<RenderError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create parser instance with settings
  const parser = useMemo(() => {
    // Build parser options from settings
    const options: Record<string, unknown> = {
      showAIContext,
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
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
