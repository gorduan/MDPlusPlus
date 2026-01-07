/**
 * Reveal.js Slides Plugin for MD++
 * Converts markdown with slide separators into Reveal.js presentations
 *
 * Slide syntax:
 * ---              Horizontal slide separator
 * ----             Vertical slide separator
 * <!-- .slide: --> Slide attributes
 *
 * Usage:
 * ```markdown
 * ---
 * # Slide 1
 * Content for first slide
 *
 * ---
 * # Slide 2
 * Content for second slide
 *
 * ----
 * ## Slide 2.1 (vertical)
 * Nested slide content
 * ---
 * ```
 *
 * Or with frontmatter:
 * ```yaml
 * ---
 * presentation: true
 * theme: black
 * transition: slide
 * ---
 * ```
 *
 * @see https://revealjs.com/
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

// Reveal.js themes
export const REVEAL_THEMES = [
  'black', 'white', 'league', 'beige', 'sky',
  'night', 'serif', 'simple', 'solarized',
  'blood', 'moon', 'dracula',
] as const;

export type RevealTheme = typeof REVEAL_THEMES[number];

// Reveal.js transitions
export const REVEAL_TRANSITIONS = [
  'none', 'fade', 'slide', 'convex', 'concave', 'zoom',
] as const;

export type RevealTransition = typeof REVEAL_TRANSITIONS[number];

// Plugin options
export interface RevealPluginOptions {
  /** Reveal.js theme (default: black) */
  theme?: RevealTheme;
  /** Slide transition (default: slide) */
  transition?: RevealTransition;
  /** Horizontal slide separator regex (default: ^---$) */
  horizontalSeparator?: string;
  /** Vertical slide separator regex (default: ^----$) */
  verticalSeparator?: string;
  /** Enable slide numbers (default: true) */
  slideNumber?: boolean;
  /** Enable hash navigation (default: true) */
  hash?: boolean;
  /** Reveal.js CDN URL */
  cdnUrl?: string;
  /** Auto-slide interval in ms (0 = disabled) */
  autoSlide?: number;
  /** Enable controls (default: true) */
  controls?: boolean;
  /** Enable progress bar (default: true) */
  progress?: boolean;
  /** Center slides vertically (default: true) */
  center?: boolean;
}

const DEFAULT_OPTIONS: Required<RevealPluginOptions> = {
  theme: 'black',
  transition: 'slide',
  horizontalSeparator: '^---$',
  verticalSeparator: '^----$',
  slideNumber: true,
  hash: true,
  cdnUrl: 'https://unpkg.com/reveal.js@5.2.1',
  autoSlide: 0,
  controls: true,
  progress: true,
  center: true,
};

/**
 * Slide data extracted from markdown
 */
export interface SlideData {
  /** Slide content (markdown/html) */
  content: string;
  /** Slide attributes (class, data-*, etc.) */
  attributes?: Record<string, string>;
  /** Nested vertical slides */
  verticalSlides?: SlideData[];
  /** Speaker notes */
  notes?: string;
}

/**
 * Presentation data extracted from markdown
 */
export interface PresentationData {
  /** All slides */
  slides: SlideData[];
  /** Presentation options from frontmatter */
  options: RevealPluginOptions;
  /** Whether this is a presentation document */
  isPresentation: boolean;
}

/**
 * Parse slide attributes from HTML comment
 * <!-- .slide: data-background="#ff0000" class="center" -->
 */
function parseSlideAttributes(content: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  // Match <!-- .slide: ... --> patterns
  const slideAttrMatch = content.match(/<!--\s*\.slide:\s*(.*?)\s*-->/);
  if (slideAttrMatch) {
    const attrString = slideAttrMatch[1];

    // Parse key="value" or key=value patterns
    const attrRegex = /([\w-]+)\s*=\s*"([^"]*)"|(\w[\w-]*)\s*=\s*(\S+)/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
      if (match[1] && match[2]) {
        attributes[match[1]] = match[2];
      } else if (match[3] && match[4]) {
        attributes[match[3]] = match[4];
      }
    }

    // Parse class shorthand .classname
    const classMatch = attrString.match(/\.(\w[\w-]*)/g);
    if (classMatch) {
      const classes = classMatch.map(c => c.slice(1)).join(' ');
      attributes.class = attributes.class ? `${attributes.class} ${classes}` : classes;
    }

    // Parse id shorthand #idname
    const idMatch = attrString.match(/#(\w[\w-]*)/);
    if (idMatch) {
      attributes.id = idMatch[1];
    }
  }

  return attributes;
}

/**
 * Extract speaker notes from slide content
 * Notes are marked with "Note:" or "Notes:" at the end
 */
function extractSpeakerNotes(content: string): { content: string; notes?: string } {
  // Match Note: or Notes: section at end of slide
  const notesMatch = content.match(/\n\s*Notes?:\s*([\s\S]*)$/i);
  if (notesMatch) {
    return {
      content: content.slice(0, notesMatch.index).trim(),
      notes: notesMatch[1].trim(),
    };
  }
  return { content };
}

/**
 * Parse markdown into slide structure
 */
export function parseSlides(
  markdown: string,
  options: RevealPluginOptions = {}
): PresentationData {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const horizontalRegex = new RegExp(opts.horizontalSeparator, 'gm');
  const verticalRegex = new RegExp(opts.verticalSeparator, 'gm');

  // Split by horizontal separator first
  const horizontalParts = markdown.split(horizontalRegex);

  const slides: SlideData[] = [];

  for (const part of horizontalParts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    // Check for vertical slides
    if (verticalRegex.test(trimmedPart)) {
      const verticalParts = trimmedPart.split(verticalRegex);
      const verticalSlides: SlideData[] = [];

      for (const vPart of verticalParts) {
        const trimmedVPart = vPart.trim();
        if (!trimmedVPart) continue;

        const attributes = parseSlideAttributes(trimmedVPart);
        const { content, notes } = extractSpeakerNotes(trimmedVPart);

        verticalSlides.push({
          content: content.replace(/<!--\s*\.slide:.*?-->/g, '').trim(),
          attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
          notes,
        });
      }

      if (verticalSlides.length > 0) {
        // First vertical slide becomes main slide
        const mainSlide = verticalSlides[0];
        mainSlide.verticalSlides = verticalSlides.slice(1);
        slides.push(mainSlide);
      }
    } else {
      const attributes = parseSlideAttributes(trimmedPart);
      const { content, notes } = extractSpeakerNotes(trimmedPart);

      slides.push({
        content: content.replace(/<!--\s*\.slide:.*?-->/g, '').trim(),
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        notes,
      });
    }
  }

  return {
    slides,
    options: opts,
    isPresentation: slides.length > 1,
  };
}

/**
 * Generate attributes string from object
 */
function generateAttributesString(attrs?: Record<string, string>): string {
  if (!attrs || Object.keys(attrs).length === 0) return '';

  return ' ' + Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

/**
 * Generate Reveal.js HTML from presentation data
 */
export function generateRevealHtml(
  presentation: PresentationData,
  processMarkdown: (md: string) => string
): string {
  const { slides, options } = presentation;
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let slidesHtml = '';

  for (const slide of slides) {
    const attrs = generateAttributesString(slide.attributes);
    const content = processMarkdown(slide.content);
    const notes = slide.notes ? `<aside class="notes">${processMarkdown(slide.notes)}</aside>` : '';

    if (slide.verticalSlides && slide.verticalSlides.length > 0) {
      // Create vertical slide stack
      slidesHtml += '<section>\n';
      slidesHtml += `  <section${attrs}>\n${content}\n${notes}</section>\n`;

      for (const vSlide of slide.verticalSlides) {
        const vAttrs = generateAttributesString(vSlide.attributes);
        const vContent = processMarkdown(vSlide.content);
        const vNotes = vSlide.notes ? `<aside class="notes">${processMarkdown(vSlide.notes)}</aside>` : '';
        slidesHtml += `  <section${vAttrs}>\n${vContent}\n${vNotes}</section>\n`;
      }

      slidesHtml += '</section>\n';
    } else {
      slidesHtml += `<section${attrs}>\n${content}\n${notes}</section>\n`;
    }
  }

  // Generate full Reveal.js HTML document
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD++ Presentation</title>
  <link rel="stylesheet" href="${opts.cdnUrl}/dist/reset.css">
  <link rel="stylesheet" href="${opts.cdnUrl}/dist/reveal.css">
  <link rel="stylesheet" href="${opts.cdnUrl}/dist/theme/${opts.theme}.css">
  <link rel="stylesheet" href="${opts.cdnUrl}/plugin/highlight/monokai.css">
  <style>
    .reveal pre { box-shadow: none; }
    .reveal code { font-family: 'Fira Code', monospace; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slidesHtml}
    </div>
  </div>
  <script src="${opts.cdnUrl}/dist/reveal.js"></script>
  <script src="${opts.cdnUrl}/plugin/notes/notes.js"></script>
  <script src="${opts.cdnUrl}/plugin/markdown/markdown.js"></script>
  <script src="${opts.cdnUrl}/plugin/highlight/highlight.js"></script>
  <script src="${opts.cdnUrl}/plugin/math/math.js"></script>
  <script>
    Reveal.initialize({
      hash: ${opts.hash},
      slideNumber: ${opts.slideNumber},
      transition: '${opts.transition}',
      autoSlide: ${opts.autoSlide},
      controls: ${opts.controls},
      progress: ${opts.progress},
      center: ${opts.center},
      plugins: [ RevealNotes, RevealMarkdown, RevealHighlight, RevealMath.KaTeX ]
    });
  </script>
</body>
</html>`;
}

/**
 * Generate embeddable Reveal.js HTML (for preview pane)
 */
export function generateEmbeddedRevealHtml(
  presentation: PresentationData,
  processMarkdown: (md: string) => string
): string {
  const { slides, options } = presentation;
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let slidesHtml = '';

  for (const slide of slides) {
    const attrs = generateAttributesString(slide.attributes);
    const content = processMarkdown(slide.content);

    if (slide.verticalSlides && slide.verticalSlides.length > 0) {
      slidesHtml += '<section>\n';
      slidesHtml += `  <section${attrs}>${content}</section>\n`;

      for (const vSlide of slide.verticalSlides) {
        const vAttrs = generateAttributesString(vSlide.attributes);
        const vContent = processMarkdown(vSlide.content);
        slidesHtml += `  <section${vAttrs}>${vContent}</section>\n`;
      }

      slidesHtml += '</section>\n';
    } else {
      slidesHtml += `<section${attrs}>${content}</section>\n`;
    }
  }

  return `<div class="mdpp-reveal-container" data-theme="${opts.theme}">
  <div class="reveal-preview">
    <div class="slides-preview">
${slidesHtml}
    </div>
  </div>
  <div class="reveal-info">
    <span class="slide-count">${slides.length} slides</span>
    <button class="reveal-fullscreen-btn" onclick="window.mdppOpenPresentation && window.mdppOpenPresentation()">
      ▶ Start Presentation
    </button>
  </div>
</div>`;
}

/**
 * Remark plugin for Reveal.js slides
 * Note: This plugin marks presentation documents but doesn't transform them directly.
 * Use parseSlides() and generateRevealHtml() for actual rendering.
 */
export const remarkRevealSlides: Plugin<[RevealPluginOptions?]> = (options = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return (tree, file) => {
    // Check frontmatter for presentation mode
    const frontmatter = (file.data as any)?.frontmatter || {};
    const isPresentation = frontmatter.presentation === true ||
                           frontmatter.reveal === true ||
                           frontmatter.slides === true;

    if (!isPresentation) {
      // Not a presentation, skip processing
      return;
    }

    // Store presentation info in file data
    (file.data as any).isPresentation = true;
    (file.data as any).revealOptions = {
      ...opts,
      theme: frontmatter.theme || opts.theme,
      transition: frontmatter.transition || opts.transition,
    };

    // Mark the document as a presentation
    visit(tree, 'root', (node: any) => {
      // Add a marker at the start
      const presentationMarker = {
        type: 'html',
        value: `<!-- mdpp-presentation: ${JSON.stringify((file.data as any).revealOptions)} -->`,
      };

      if (node.children) {
        node.children.unshift(presentationMarker);
      }
    });
  };
};

/**
 * Check if markdown content is a presentation
 */
export function isPresentation(markdown: string, frontmatter?: Record<string, unknown>): boolean {
  // Check frontmatter
  if (frontmatter?.presentation === true || frontmatter?.reveal === true || frontmatter?.slides === true) {
    return true;
  }

  // Check for multiple horizontal separators (indicates slides)
  const separatorCount = (markdown.match(/^---$/gm) || []).length;
  return separatorCount >= 3; // At least 2 slides (frontmatter + 2 separators)
}

export default remarkRevealSlides;
