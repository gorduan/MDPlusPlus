/**
 * MD++ AI Context utilities
 * Extract and manage AI context blocks
 */

import type { AIContext } from './types';

/**
 * Extract AI context blocks from markdown content
 * This is a simpler regex-based extraction for use cases
 * where you need AI context without full parsing
 */
export function extractAIContext(markdown: string): AIContext[] {
  const contexts: AIContext[] = [];

  // Match :::ai-context[visibility] ... ::: blocks
  const regex = /:::ai-context\[?(.*?)\]?\s*([\s\S]*?):::/g;

  let match;
  let lineNumber = 1;

  while ((match = regex.exec(markdown)) !== null) {
    const visibility = match[1]?.trim() || 'hidden';
    const content = match[2]?.trim() || '';

    // Calculate line number
    const beforeMatch = markdown.slice(0, match.index);
    lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;

    contexts.push({
      visible: visibility !== 'hidden',
      content,
      line: lineNumber,
      metadata: parseMetadata(content),
    });
  }

  return contexts;
}

/**
 * Parse key-value metadata from AI context content
 */
function parseMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Match lines like "key: value" or "- key: value"
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^[-*]?\s*(\w+):\s*(.+)$/);
    if (match) {
      metadata[match[1].toLowerCase()] = match[2].trim();
    }
  }

  return metadata;
}

/**
 * Filter visible AI contexts
 */
export function getVisibleContexts(contexts: AIContext[]): AIContext[] {
  return contexts.filter(ctx => ctx.visible);
}

/**
 * Filter hidden AI contexts
 */
export function getHiddenContexts(contexts: AIContext[]): AIContext[] {
  return contexts.filter(ctx => !ctx.visible);
}

/**
 * Format AI context for display
 */
export function formatAIContext(context: AIContext): string {
  let output = context.visible ? '[Visible AI Context]' : '[Hidden AI Context]';
  output += `\n${context.content}`;

  if (context.metadata && Object.keys(context.metadata).length > 0) {
    output += '\nMetadata:';
    for (const [key, value] of Object.entries(context.metadata)) {
      output += `\n  ${key}: ${value}`;
    }
  }

  return output;
}

/**
 * Check if content has any AI context
 */
export function hasAIContext(markdown: string): boolean {
  return /:::ai-context/.test(markdown);
}
