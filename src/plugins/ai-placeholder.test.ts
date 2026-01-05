/**
 * Tests for AI Placeholder Plugin
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MDPlusPlus } from '../parser';
import {
  extractPlaceholdersFromHTML,
  replacePlaceholderContent,
  interpolatePlaceholders,
  resetPlaceholderIdCounter
} from './ai-placeholder';
import type { AIPlaceholderData } from '../types';

describe('AI Placeholder Plugin', () => {
  beforeEach(() => {
    resetPlaceholderIdCounter();
  });

  describe('Block Placeholders (:::ai-generate)', () => {
    it('parses block placeholder with prompt', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:::ai-generate{prompt="Write a summary"}
:::
`);

      expect(result.placeholders).toHaveLength(1);
      expect(result.placeholders[0].type).toBe('block');
      expect(result.placeholders[0].prompt).toBe('Write a summary');
      expect(result.placeholders[0].format).toBe('paragraph');
      expect(result.placeholders[0].status).toBe('pending');
    });

    it('parses block placeholder with format attribute', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:::ai-generate{prompt="List top 5 features" format="list"}
:::
`);

      expect(result.placeholders).toHaveLength(1);
      expect(result.placeholders[0].format).toBe('list');
    });

    it('parses block placeholder with fallback', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:::ai-generate{prompt="Generate content" fallback="Default text"}
:::
`);

      expect(result.placeholders).toHaveLength(1);
      expect(result.placeholders[0].fallback).toBe('Default text');
    });

    it('generates HTML with data attributes', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:::ai-generate{prompt="Test prompt" format="table"}
:::
`);

      expect(result.html).toContain('class="mdpp-ai-placeholder');
      expect(result.html).toContain('mdpp-ai-block');
      expect(result.html).toContain('data-ai-type="block"');
      expect(result.html).toContain('data-ai-prompt="Test prompt"');
      expect(result.html).toContain('data-ai-format="table"');
      expect(result.html).toContain('data-ai-status="pending"');
    });

    it('shows placeholder text in HTML', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:::ai-generate{prompt="A very long prompt that should be truncated in the placeholder display"}
:::
`);

      expect(result.html).toContain('[AI:');
      expect(result.html).toContain('...');
    });

    it('shows fallback text when provided', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:::ai-generate{prompt="Generate" fallback="Fallback content here"}
:::
`);

      expect(result.html).toContain('Fallback content here');
    });
  });

  describe('Inline Placeholders (:ai{})', () => {
    it('parses inline placeholder with prompt', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
The company was founded in :ai{prompt="founding year"}.
`);

      expect(result.placeholders).toHaveLength(1);
      expect(result.placeholders[0].type).toBe('inline');
      expect(result.placeholders[0].prompt).toBe('founding year');
      expect(result.placeholders[0].format).toBe('inline');
    });

    it('generates inline span element', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
Value: :ai{prompt="get value"}
`);

      expect(result.html).toContain('<span');
      expect(result.html).toContain('mdpp-ai-inline');
      expect(result.html).toContain('data-ai-type="inline"');
    });

    it('handles multiple inline placeholders', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:ai{prompt="first"} and :ai{prompt="second"} values.
`);

      expect(result.placeholders).toHaveLength(2);
      expect(result.placeholders[0].prompt).toBe('first');
      expect(result.placeholders[1].prompt).toBe('second');
    });
  });

  describe('Mixed Placeholders', () => {
    it('parses both block and inline placeholders', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
# Document

Founded: :ai{prompt="year"}

:::ai-generate{prompt="Write introduction"}
:::

Revenue: :ai{prompt="amount"}
`);

      expect(result.placeholders).toHaveLength(3);

      const inline = result.placeholders.filter(p => p.type === 'inline');
      const block = result.placeholders.filter(p => p.type === 'block');

      expect(inline).toHaveLength(2);
      expect(block).toHaveLength(1);
    });
  });

  describe('extractPlaceholdersFromHTML', () => {
    it('extracts block placeholder from HTML', () => {
      const html = `
<div class="mdpp-ai-placeholder mdpp-ai-block" data-ai-id="test-1" data-ai-type="block" data-ai-prompt="Test" data-ai-format="paragraph">
  <div class="mdpp-ai-pending-content">[AI: Test]</div>
</div>
`;

      const placeholders = extractPlaceholdersFromHTML(html);

      expect(placeholders).toHaveLength(1);
      expect(placeholders[0].id).toBe('test-1');
      expect(placeholders[0].type).toBe('block');
      expect(placeholders[0].prompt).toBe('Test');
    });

    it('extracts inline placeholder from HTML', () => {
      const html = `
<p>Value: <span class="mdpp-ai-placeholder mdpp-ai-inline" data-ai-id="test-2" data-ai-type="inline" data-ai-prompt="get value">[AI: get value]</span></p>
`;

      const placeholders = extractPlaceholdersFromHTML(html);

      expect(placeholders).toHaveLength(1);
      expect(placeholders[0].id).toBe('test-2');
      expect(placeholders[0].type).toBe('inline');
    });
  });

  describe('replacePlaceholderContent', () => {
    it('replaces block placeholder content', () => {
      const html = `
<div class="mdpp-ai-placeholder mdpp-ai-block" data-ai-id="ph-1" data-ai-type="block" data-ai-prompt="Test" data-ai-status="pending">
  <div class="mdpp-ai-pending-content">[AI: Test]</div>
</div>
`;

      const result = replacePlaceholderContent(html, 'ph-1', 'Generated content here');

      expect(result).toContain('Generated content here');
      expect(result).toContain('data-ai-status="completed"');
    });

    it('replaces inline placeholder content', () => {
      const html = `
<p>Value: <span class="mdpp-ai-placeholder mdpp-ai-inline" data-ai-id="ph-2" data-ai-type="inline" data-ai-prompt="test" data-ai-status="pending">[AI: test]</span></p>
`;

      const result = replacePlaceholderContent(html, 'ph-2', '42');

      expect(result).toContain('42');
      expect(result).toContain('data-ai-status="completed"');
    });

    it('sets error status on failure', () => {
      const html = `
<div class="mdpp-ai-placeholder" data-ai-id="ph-3" data-ai-type="block" data-ai-prompt="Test" data-ai-status="pending">content</div>
`;

      const result = replacePlaceholderContent(html, 'ph-3', 'Error occurred', false);

      expect(result).toContain('data-ai-status="error"');
    });
  });

  describe('interpolatePlaceholders', () => {
    it('interpolates variables in prompts', () => {
      const placeholders: AIPlaceholderData[] = [
        {
          id: 'p1',
          type: 'block',
          prompt: 'Describe {{product}} for {{audience}}',
          format: 'paragraph',
          status: 'pending',
        },
      ];

      const variables = {
        product: 'Widget Pro',
        audience: 'developers',
      };

      const result = interpolatePlaceholders(placeholders, variables);

      expect(result[0].prompt).toBe('Describe Widget Pro for developers');
      expect(result[0].variables).toEqual(variables);
    });

    it('preserves unknown variables', () => {
      const placeholders: AIPlaceholderData[] = [
        {
          id: 'p1',
          type: 'inline',
          prompt: 'Value is {{known}} and {{unknown}}',
          format: 'inline',
          status: 'pending',
        },
      ];

      const result = interpolatePlaceholders(placeholders, { known: '42' });

      expect(result[0].prompt).toBe('Value is 42 and {{unknown}}');
    });

    it('handles object variables as JSON', () => {
      const placeholders: AIPlaceholderData[] = [
        {
          id: 'p1',
          type: 'block',
          prompt: 'Analyze: {{data}}',
          format: 'paragraph',
          status: 'pending',
        },
      ];

      const result = interpolatePlaceholders(placeholders, {
        data: { name: 'Test', value: 123 }
      });

      expect(result[0].prompt).toContain('"name":"Test"');
      expect(result[0].prompt).toContain('"value":123');
    });
  });

  describe('Integration with Scripts', () => {
    it('extracts both scripts and placeholders', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:::script{lang="js"}
const product = "Widget";
:::

:::ai-generate{prompt="Describe {{product}}"}
:::
`);

      expect(result.scripts).toHaveLength(1);
      expect(result.placeholders).toHaveLength(1);
    });
  });

  describe('Integration with AI Context', () => {
    it('extracts ai-context separately from placeholders', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convertFull(`
:::ai-context{visibility=hidden}
Background information for AI.
:::

:::ai-generate{prompt="Generate based on context"}
:::
`);

      expect(result.aiContexts).toHaveLength(1);
      expect(result.placeholders).toHaveLength(1);
      expect(result.aiContexts[0].content).toContain('Background information');
    });
  });
});
