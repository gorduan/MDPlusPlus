/**
 * Tests for Reveal.js Slides Plugin
 */

import { describe, it, expect } from 'vitest';
import {
  parseSlides,
  generateRevealHtml,
  generateEmbeddedRevealHtml,
  isPresentation,
  REVEAL_THEMES,
  REVEAL_TRANSITIONS,
} from './reveal-slides';

describe('Reveal.js Slides Plugin', () => {
  describe('parseSlides', () => {
    it('should parse simple horizontal slides', () => {
      const markdown = `# Slide 1
Content 1

---

# Slide 2
Content 2

---

# Slide 3
Content 3`;

      const result = parseSlides(markdown);

      expect(result.slides.length).toBe(3);
      expect(result.slides[0].content).toContain('# Slide 1');
      expect(result.slides[1].content).toContain('# Slide 2');
      expect(result.slides[2].content).toContain('# Slide 3');
    });

    it('should parse vertical slides', () => {
      const markdown = `# Main Slide

----

## Vertical 1

----

## Vertical 2

---

# Next Main Slide`;

      const result = parseSlides(markdown);

      expect(result.slides.length).toBe(2);
      expect(result.slides[0].verticalSlides?.length).toBe(2);
      expect(result.slides[1].content).toContain('# Next Main Slide');
    });

    it('should extract speaker notes', () => {
      const markdown = `# Slide with Notes

Some content here

Note: This is a speaker note

---

# Next Slide`;

      const result = parseSlides(markdown);

      expect(result.slides[0].notes).toBe('This is a speaker note');
      expect(result.slides[0].content).not.toContain('Note:');
    });

    it('should parse slide attributes from HTML comments', () => {
      const markdown = `<!-- .slide: data-background="#ff0000" class="center" -->
# Red Background Slide

Content

---

# Normal Slide`;

      const result = parseSlides(markdown);

      expect(result.slides[0].attributes?.['data-background']).toBe('#ff0000');
      expect(result.slides[0].attributes?.class).toBe('center');
    });

    it('should mark as presentation when multiple slides', () => {
      const markdown = `# Slide 1

---

# Slide 2`;

      const result = parseSlides(markdown);

      expect(result.isPresentation).toBe(true);
    });

    it('should handle empty content between separators', () => {
      const markdown = `---

# Slide 1

---

---

# Slide 2`;

      const result = parseSlides(markdown);

      expect(result.slides.length).toBe(2);
    });
  });

  describe('generateRevealHtml', () => {
    it('should generate valid HTML with slides', () => {
      const presentation = parseSlides(`# Hello

---

# World`);

      const processMarkdown = (md: string) => `<p>${md}</p>`;
      const html = generateRevealHtml(presentation, processMarkdown);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<div class="reveal">');
      expect(html).toContain('<div class="slides">');
      expect(html).toContain('<section>');
      expect(html).toContain('Reveal.initialize');
    });

    it('should include theme CSS', () => {
      const presentation = parseSlides(`# Test`, { theme: 'night' });

      const processMarkdown = (md: string) => md;
      const html = generateRevealHtml(presentation, processMarkdown);

      expect(html).toContain('theme/night.css');
    });

    it('should include speaker notes', () => {
      const presentation = parseSlides(`# Slide

Note: Speaker note here`);

      const processMarkdown = (md: string) => md;
      const html = generateRevealHtml(presentation, processMarkdown);

      expect(html).toContain('<aside class="notes">');
      expect(html).toContain('Speaker note here');
    });

    it('should nest vertical slides in section', () => {
      const presentation = parseSlides(`# Main

----

## Vertical`);

      const processMarkdown = (md: string) => md;
      const html = generateRevealHtml(presentation, processMarkdown);

      // Should have nested sections
      expect(html.match(/<section>/g)?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generateEmbeddedRevealHtml', () => {
    it('should generate preview container', () => {
      const presentation = parseSlides(`# Slide 1

---

# Slide 2`);

      const processMarkdown = (md: string) => md;
      const html = generateEmbeddedRevealHtml(presentation, processMarkdown);

      expect(html).toContain('mdpp-reveal-container');
      expect(html).toContain('reveal-preview');
      expect(html).toContain('slide-count');
      expect(html).toContain('2 slides');
    });

    it('should include start presentation button', () => {
      const presentation = parseSlides(`# Test`);

      const processMarkdown = (md: string) => md;
      const html = generateEmbeddedRevealHtml(presentation, processMarkdown);

      expect(html).toContain('Start Presentation');
      expect(html).toContain('reveal-fullscreen-btn');
    });
  });

  describe('isPresentation', () => {
    it('should detect presentation from frontmatter', () => {
      expect(isPresentation('# Test', { presentation: true })).toBe(true);
      expect(isPresentation('# Test', { reveal: true })).toBe(true);
      expect(isPresentation('# Test', { slides: true })).toBe(true);
    });

    it('should detect presentation from multiple separators', () => {
      const markdown = `---
title: Test
---

# Slide 1

---

# Slide 2`;

      // Has 3 or more --- (frontmatter delimiter counts)
      expect(isPresentation(markdown)).toBe(true);
    });

    it('should not detect presentation for regular markdown', () => {
      const markdown = `# Hello World

This is content.

---

More content.`;

      // Only 2 --- (one separator)
      expect(isPresentation(markdown)).toBe(false);
    });
  });

  describe('Constants', () => {
    it('should have valid themes', () => {
      expect(REVEAL_THEMES).toContain('black');
      expect(REVEAL_THEMES).toContain('white');
      expect(REVEAL_THEMES).toContain('night');
      expect(REVEAL_THEMES).toContain('dracula');
    });

    it('should have valid transitions', () => {
      expect(REVEAL_TRANSITIONS).toContain('none');
      expect(REVEAL_TRANSITIONS).toContain('fade');
      expect(REVEAL_TRANSITIONS).toContain('slide');
      expect(REVEAL_TRANSITIONS).toContain('zoom');
    });
  });

  describe('Options', () => {
    it('should use custom separators', () => {
      const markdown = `# Slide 1

***

# Slide 2`;

      const result = parseSlides(markdown, {
        horizontalSeparator: '^\\*\\*\\*$',
      });

      expect(result.slides.length).toBe(2);
    });

    it('should apply theme option', () => {
      const presentation = parseSlides(`# Test`, { theme: 'moon' });

      expect(presentation.options.theme).toBe('moon');
    });

    it('should apply transition option', () => {
      const presentation = parseSlides(`# Test`, { transition: 'fade' });

      expect(presentation.options.transition).toBe('fade');
    });
  });
});
