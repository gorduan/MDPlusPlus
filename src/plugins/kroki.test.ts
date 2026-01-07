/**
 * Tests for Kroki Plugin
 */

import { describe, it, expect } from 'vitest';
import {
  encodeKrokiDiagram,
  buildKrokiUrl,
  isKrokiLanguage,
  extractKrokiType,
  getKrokiLanguages,
  KROKI_DIAGRAM_TYPES,
} from './kroki';
import { MDPlusPlus } from '../parser';

describe('Kroki Plugin', () => {
  describe('encodeKrokiDiagram', () => {
    it('should encode diagram source to URL-safe base64', () => {
      const source = 'Alice -> Bob: Hello';
      const encoded = encodeKrokiDiagram(source);

      expect(encoded).toBeTruthy();
      // Should be URL-safe (no +, /, or =)
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('should handle multiline diagrams', () => {
      const source = `@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi
@enduml`;
      const encoded = encodeKrokiDiagram(source);

      expect(encoded).toBeTruthy();
      expect(encoded.length).toBeGreaterThan(0);
    });
  });

  describe('buildKrokiUrl', () => {
    it('should build correct URL for plantuml diagram', () => {
      const url = buildKrokiUrl('plantuml', 'Alice -> Bob', 'svg');

      expect(url).toContain('https://kroki.io/plantuml/svg/');
    });

    it('should build correct URL for graphviz diagram', () => {
      const url = buildKrokiUrl('graphviz', 'digraph G { A -> B }', 'png');

      expect(url).toContain('https://kroki.io/graphviz/png/');
    });

    it('should use custom server URL', () => {
      const url = buildKrokiUrl(
        'plantuml',
        'Alice -> Bob',
        'svg',
        'https://my-kroki.example.com'
      );

      expect(url).toContain('https://my-kroki.example.com/plantuml/svg/');
    });
  });

  describe('isKrokiLanguage', () => {
    it('should recognize valid Kroki languages', () => {
      expect(isKrokiLanguage('plantuml')).toBe(true);
      expect(isKrokiLanguage('graphviz')).toBe(true);
      expect(isKrokiLanguage('d2')).toBe(true);
      expect(isKrokiLanguage('mermaid')).toBe(true);
      expect(isKrokiLanguage('erd')).toBe(true);
    });

    it('should recognize kroki- prefixed languages', () => {
      expect(isKrokiLanguage('kroki-plantuml')).toBe(true);
      expect(isKrokiLanguage('kroki-graphviz')).toBe(true);
      expect(isKrokiLanguage('kroki-d2')).toBe(true);
    });

    it('should reject invalid languages', () => {
      expect(isKrokiLanguage('javascript')).toBe(false);
      expect(isKrokiLanguage('python')).toBe(false);
      expect(isKrokiLanguage('html')).toBe(false);
    });
  });

  describe('extractKrokiType', () => {
    it('should extract type from plain language', () => {
      expect(extractKrokiType('plantuml')).toBe('plantuml');
      expect(extractKrokiType('graphviz')).toBe('graphviz');
    });

    it('should extract type from kroki- prefixed language', () => {
      expect(extractKrokiType('kroki-plantuml')).toBe('plantuml');
      expect(extractKrokiType('kroki-d2')).toBe('d2');
    });

    it('should return null for invalid languages', () => {
      expect(extractKrokiType('javascript')).toBeNull();
      expect(extractKrokiType('invalid')).toBeNull();
    });
  });

  describe('getKrokiLanguages', () => {
    it('should return both plain and prefixed variants', () => {
      const languages = getKrokiLanguages();

      expect(languages).toContain('plantuml');
      expect(languages).toContain('kroki-plantuml');
      expect(languages).toContain('graphviz');
      expect(languages).toContain('kroki-graphviz');
    });

    it('should return correct number of languages', () => {
      const languages = getKrokiLanguages();

      // Should be twice the number of diagram types (plain + prefixed)
      expect(languages.length).toBe(KROKI_DIAGRAM_TYPES.length * 2);
    });
  });

  describe('MDPlusPlus with Kroki', () => {
    it('should render plantuml code block as Kroki diagram', async () => {
      const parser = new MDPlusPlus({ enableKroki: true });

      const markdown = `# Test

\`\`\`plantuml
@startuml
Alice -> Bob: Hello
@enduml
\`\`\`
`;

      const result = await parser.convert(markdown);

      expect(result.html).toContain('mdpp-kroki-diagram');
      expect(result.html).toContain('data-kroki-type="plantuml"');
      expect(result.html).toContain('https://kroki.io/plantuml/svg/');
    });

    it('should render kroki-graphviz code block', async () => {
      const parser = new MDPlusPlus({ enableKroki: true });

      const markdown = `\`\`\`kroki-graphviz
digraph G {
  A -> B
  B -> C
}
\`\`\`
`;

      const result = await parser.convert(markdown);

      expect(result.html).toContain('mdpp-kroki-diagram');
      expect(result.html).toContain('data-kroki-type="graphviz"');
    });

    it('should not render regular code blocks as Kroki', async () => {
      const parser = new MDPlusPlus({ enableKroki: true });

      const markdown = `\`\`\`javascript
console.log('Hello');
\`\`\`
`;

      const result = await parser.convert(markdown);

      expect(result.html).not.toContain('mdpp-kroki-diagram');
      expect(result.html).toContain('language-javascript');
    });

    it('should use custom Kroki server URL', async () => {
      const parser = new MDPlusPlus({
        enableKroki: true,
        krokiServerUrl: 'https://my-kroki.example.com',
      });

      const markdown = `\`\`\`plantuml
Alice -> Bob
\`\`\`
`;

      const result = await parser.convert(markdown);

      expect(result.html).toContain('https://my-kroki.example.com/plantuml/svg/');
    });

    it('should not render Kroki when disabled', async () => {
      const parser = new MDPlusPlus({ enableKroki: false });

      const markdown = `\`\`\`plantuml
Alice -> Bob
\`\`\`
`;

      const result = await parser.convert(markdown);

      expect(result.html).not.toContain('mdpp-kroki-diagram');
    });
  });
});
