/**
 * MD++ Script Block Plugin
 *
 * Remark plugin for parsing :::script and :::script:output directives.
 * Transforms script blocks into HTML elements with data attributes
 * that can be processed by the renderer for execution.
 *
 * Syntax:
 *   :::script{lang="js" async="true"}
 *   const x = 1;
 *   :::
 *
 *   :::script:output{lang="js"}
 *   return `Hello ${name}!`;
 *   :::
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { ScriptBlockData, ScriptMode } from '../types';

// Counter for generating unique IDs
let scriptIdCounter = 0;

/**
 * Generate a unique script block ID
 */
function generateScriptId(): string {
  return `mdsc-${Date.now().toString(36)}-${(scriptIdCounter++).toString(36)}`;
}

/**
 * Reset the ID counter (useful for testing)
 */
export function resetScriptIdCounter(): void {
  scriptIdCounter = 0;
}

/**
 * Extract text content from a directive node's children
 */
function extractCode(node: any): string {
  if (!node.children || node.children.length === 0) {
    return '';
  }

  // Collect all text content from children
  const parts: string[] = [];

  function collectText(n: any): void {
    if (n.type === 'text') {
      parts.push(n.value);
    } else if (n.type === 'paragraph') {
      // Paragraphs in directives contain the actual text
      if (n.children) {
        n.children.forEach(collectText);
      }
      parts.push('\n');
    } else if (n.children) {
      n.children.forEach(collectText);
    }
  }

  node.children.forEach(collectText);

  // Clean up: remove trailing newline, trim
  return parts.join('').trim();
}

/**
 * Parse boolean attribute value
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Remark plugin for script blocks
 *
 * Transforms :::script and :::script:output directives into
 * div elements with data attributes for later processing.
 */
export const remarkScriptBlock: Plugin = function () {
  return (tree: any, file: any) => {
    // Collect script data for the file
    const scripts: ScriptBlockData[] = [];

    visit(tree, (node: any) => {
      // Only process container directives
      if (node.type !== 'containerDirective') {
        return;
      }

      // Check if this is a script directive
      // Supports: :::script, :::script:output, :::script_output (preprocessed)
      const name = node.name || '';
      const isScript = name === 'script' || name.startsWith('script:') || name.startsWith('script_');

      if (!isScript) {
        return;
      }

      // Determine mode
      const isOutput = name.includes('output');
      const mode: ScriptMode = isOutput ? 'output' : 'execute';

      // Get attributes
      const attrs = node.attributes || {};
      const id = attrs.id || generateScriptId();
      const lang = attrs.lang || 'js';
      const isAsync = parseBoolean(attrs.async, false);
      const cache = parseBoolean(attrs.cache, true);

      // Extract the code content
      const code = extractCode(node);

      // Get position info for error reporting
      const line = node.position?.start?.line;

      // Create script data
      const scriptData: ScriptBlockData = {
        id,
        code,
        mode,
        lang: 'js', // Only JS supported for now
        async: isAsync,
        cache,
        line,
      };

      // Store for later extraction
      scripts.push(scriptData);

      // Transform node to HTML element with data attributes
      node.data = node.data || {};
      node.data.hName = 'div';
      node.data.hProperties = {
        className: [
          'mdsc-script-block',
          `mdsc-${mode}`,
          isAsync ? 'mdsc-async' : '',
        ].filter(Boolean),
        'data-script-id': id,
        'data-script-mode': mode,
        'data-script-lang': lang,
        'data-script-async': String(isAsync),
        'data-script-cache': String(cache),
        'data-script-code': encodeURIComponent(code),
        'data-script-line': line ? String(line) : undefined,
      };

      // Replace children with placeholder content
      // The actual output will be injected by the renderer
      node.children = [
        {
          type: 'paragraph',
          data: {
            hName: 'div',
            hProperties: {
              className: ['mdsc-placeholder'],
            },
          },
          children: [
            {
              type: 'text',
              value: mode === 'output'
                ? '/* Script output will appear here */'
                : '/* Script block */',
            },
          ],
        },
      ];
    });

    // Store scripts in file data for extraction
    if (file && file.data) {
      file.data.scripts = scripts;
    }
  };
};

/**
 * Extract script blocks from parsed file data
 */
export function extractScriptsFromFile(file: any): ScriptBlockData[] {
  return file?.data?.scripts || [];
}

/**
 * Extract script blocks from HTML string
 * Parses data attributes from rendered script block elements
 */
export function extractScriptsFromHTML(html: string): ScriptBlockData[] {
  const scripts: ScriptBlockData[] = [];

  // Match script block divs with their data attributes
  const blockRegex = /<div[^>]*class="[^"]*mdsc-script-block[^"]*"[^>]*data-script-id="([^"]*)"[^>]*data-script-mode="([^"]*)"[^>]*data-script-code="([^"]*)"[^>]*>/g;

  let match;
  while ((match = blockRegex.exec(html)) !== null) {
    const id = match[1];
    const mode = match[2] as ScriptMode;
    const code = decodeURIComponent(match[3]);

    // Parse additional attributes
    const fullMatch = match[0];
    const asyncMatch = fullMatch.match(/data-script-async="([^"]*)"/);
    const cacheMatch = fullMatch.match(/data-script-cache="([^"]*)"/);
    const lineMatch = fullMatch.match(/data-script-line="([^"]*)"/);

    scripts.push({
      id,
      code,
      mode,
      lang: 'js',
      async: asyncMatch ? asyncMatch[1] === 'true' : false,
      cache: cacheMatch ? cacheMatch[1] !== 'false' : true,
      line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
    });
  }

  return scripts;
}

export default remarkScriptBlock;
