/**
 * MD++ AI Placeholder Plugin
 *
 * Remark plugin for parsing AI placeholder directives:
 * - :::ai-generate{prompt="..."} - Block placeholder (AI generates section)
 * - :ai{prompt="..."} - Inline placeholder (AI fills single value)
 *
 * Transforms placeholders into HTML elements with data attributes
 * that can be processed by an AI agent for content generation.
 *
 * Syntax:
 *   :::ai-generate{prompt="Write a summary" format="paragraph"}
 *   :::
 *
 *   The company was founded in :ai{prompt="founding year"}.
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { AIPlaceholderData, AIPlaceholderFormat } from '../types';

// Counter for generating unique IDs
let placeholderIdCounter = 0;

/**
 * Generate a unique placeholder ID
 */
function generatePlaceholderId(): string {
  return `ai-${Date.now().toString(36)}-${(placeholderIdCounter++).toString(36)}`;
}

/**
 * Reset the ID counter (useful for testing)
 */
export function resetPlaceholderIdCounter(): void {
  placeholderIdCounter = 0;
}

/**
 * Parse format attribute to valid format type
 */
function parseFormat(value: string | undefined): AIPlaceholderFormat {
  const validFormats: AIPlaceholderFormat[] = ['paragraph', 'list', 'table', 'inline'];
  if (value && validFormats.includes(value as AIPlaceholderFormat)) {
    return value as AIPlaceholderFormat;
  }
  return 'paragraph';
}

/**
 * Interpolate variables in prompt string
 * Replaces {{varName}} with actual values from variables map
 */
function interpolatePrompt(prompt: string, variables?: Record<string, unknown>): string {
  if (!variables || !prompt.includes('{{')) {
    return prompt;
  }

  return prompt.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    if (varName in variables) {
      const value = variables[varName];
      // Convert to string representation
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    }
    return match; // Keep original if variable not found
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Remark plugin for AI placeholders
 *
 * Transforms :::ai-generate and :ai{} directives into
 * div/span elements with data attributes for AI processing.
 */
export const remarkAIPlaceholder: Plugin = function () {
  return (tree: any, file: any) => {
    // Collect placeholder data for the file
    const placeholders: AIPlaceholderData[] = [];

    visit(tree, (node: any) => {
      // Handle container directives (:::ai-generate)
      if (node.type === 'containerDirective' || node.type === 'leafDirective') {
        const name = node.name || '';

        // Check for ai-generate directive
        // Supports: :::ai-generate, ::ai-generate (leaf)
        if (name === 'ai-generate' || name === 'ai_generate') {
          processBlockPlaceholder(node, placeholders);
          return;
        }
      }

      // Handle text directives (:ai{})
      if (node.type === 'textDirective') {
        const name = node.name || '';

        if (name === 'ai') {
          processInlinePlaceholder(node, placeholders);
          return;
        }
      }
    });

    // Store placeholders in file data for extraction
    if (file && file.data) {
      file.data.placeholders = placeholders;
    }
  };
};

/**
 * Process a block placeholder (:::ai-generate)
 */
function processBlockPlaceholder(node: any, placeholders: AIPlaceholderData[]): void {
  const attrs = node.attributes || {};
  const id = attrs.id || generatePlaceholderId();
  const prompt = attrs.prompt || '';
  const format = parseFormat(attrs.format);
  const fallback = attrs.fallback;

  // Get position info for error reporting
  const line = node.position?.start?.line;
  const column = node.position?.start?.column;

  // Create placeholder data
  const placeholderData: AIPlaceholderData = {
    id,
    type: 'block',
    prompt,
    format,
    fallback,
    status: 'pending',
    line,
    column,
  };

  placeholders.push(placeholderData);

  // Transform node to HTML element with data attributes
  node.data = node.data || {};
  node.data.hName = 'div';
  node.data.hProperties = {
    className: [
      'mdpp-ai-placeholder',
      'mdpp-ai-block',
      `mdpp-ai-format-${format}`,
    ],
    'data-ai-id': id,
    'data-ai-type': 'block',
    'data-ai-prompt': prompt,
    'data-ai-format': format,
    'data-ai-status': 'pending',
    ...(fallback && { 'data-ai-fallback': fallback }),
    ...(line && { 'data-ai-line': String(line) }),
  };

  // Replace children with placeholder content
  const placeholderText = fallback || `[AI: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}]`;

  node.children = [
    {
      type: 'paragraph',
      data: {
        hName: 'div',
        hProperties: {
          className: ['mdpp-ai-pending-content'],
        },
      },
      children: [
        {
          type: 'text',
          value: placeholderText,
        },
      ],
    },
  ];
}

/**
 * Process an inline placeholder (:ai{})
 */
function processInlinePlaceholder(node: any, placeholders: AIPlaceholderData[]): void {
  const attrs = node.attributes || {};
  const id = attrs.id || generatePlaceholderId();
  const prompt = attrs.prompt || '';
  const fallback = attrs.fallback;

  // Get position info
  const line = node.position?.start?.line;
  const column = node.position?.start?.column;

  // Create placeholder data
  const placeholderData: AIPlaceholderData = {
    id,
    type: 'inline',
    prompt,
    format: 'inline',
    fallback,
    status: 'pending',
    line,
    column,
  };

  placeholders.push(placeholderData);

  // Transform to inline span
  node.data = node.data || {};
  node.data.hName = 'span';
  node.data.hProperties = {
    className: ['mdpp-ai-placeholder', 'mdpp-ai-inline'],
    'data-ai-id': id,
    'data-ai-type': 'inline',
    'data-ai-prompt': prompt,
    'data-ai-status': 'pending',
    ...(fallback && { 'data-ai-fallback': fallback }),
  };

  // Set placeholder text
  const placeholderText = fallback || `[AI: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}]`;

  node.children = [
    {
      type: 'text',
      value: placeholderText,
    },
  ];
}

/**
 * Extract AI placeholders from parsed file data
 */
export function extractPlaceholdersFromFile(file: any): AIPlaceholderData[] {
  return file?.data?.placeholders || [];
}

/**
 * Extract AI placeholders from HTML string
 * Parses data attributes from rendered placeholder elements
 */
export function extractPlaceholdersFromHTML(html: string): AIPlaceholderData[] {
  const placeholders: AIPlaceholderData[] = [];

  // Match placeholder elements with their data attributes
  const regex = /<(div|span)[^>]*class="[^"]*mdpp-ai-placeholder[^"]*"[^>]*data-ai-id="([^"]*)"[^>]*data-ai-type="([^"]*)"[^>]*data-ai-prompt="([^"]*)"[^>]*>/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const id = match[2];
    const type = match[3] as 'inline' | 'block';
    const prompt = match[4];

    // Parse additional attributes
    const fullMatch = match[0];
    const formatMatch = fullMatch.match(/data-ai-format="([^"]*)"/);
    const fallbackMatch = fullMatch.match(/data-ai-fallback="([^"]*)"/);
    const lineMatch = fullMatch.match(/data-ai-line="([^"]*)"/);

    placeholders.push({
      id,
      type,
      prompt,
      format: formatMatch ? parseFormat(formatMatch[1]) : (type === 'inline' ? 'inline' : 'paragraph'),
      fallback: fallbackMatch ? fallbackMatch[1] : undefined,
      status: 'pending',
      line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
    });
  }

  return placeholders;
}

/**
 * Replace placeholder content in HTML with generated content
 */
export function replacePlaceholderContent(
  html: string,
  placeholderId: string,
  content: string,
  success: boolean = true
): string {
  // Find the placeholder element and replace its content
  const escapedId = placeholderId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match the placeholder div/span
  const blockRegex = new RegExp(
    `(<div[^>]*data-ai-id="${escapedId}"[^>]*>)[\\s\\S]*?(</div>)`,
    'g'
  );

  const inlineRegex = new RegExp(
    `(<span[^>]*data-ai-id="${escapedId}"[^>]*>)[\\s\\S]*?(</span>)`,
    'g'
  );

  // Update status attribute and content
  const statusAttr = success ? 'completed' : 'error';
  const escapedContent = escapeHtml(content);

  // Try block first, then inline
  let result = html.replace(blockRegex, (match, open, close) => {
    const updatedOpen = open.replace(/data-ai-status="[^"]*"/, `data-ai-status="${statusAttr}"`);
    return `${updatedOpen}<div class="mdpp-ai-content">${escapedContent}</div>${close}`;
  });

  result = result.replace(inlineRegex, (match, open, close) => {
    const updatedOpen = open.replace(/data-ai-status="[^"]*"/, `data-ai-status="${statusAttr}"`);
    return `${updatedOpen}${escapedContent}${close}`;
  });

  return result;
}

/**
 * Utility: Interpolate variables in all placeholders
 */
export function interpolatePlaceholders(
  placeholders: AIPlaceholderData[],
  variables: Record<string, unknown>
): AIPlaceholderData[] {
  return placeholders.map(p => ({
    ...p,
    prompt: interpolatePrompt(p.prompt, variables),
    variables,
  }));
}

export default remarkAIPlaceholder;
