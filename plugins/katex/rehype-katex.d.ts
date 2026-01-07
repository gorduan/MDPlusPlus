/**
 * Type declaration for rehype-katex
 * This module is dynamically loaded at runtime
 */
declare module 'rehype-katex' {
  import type { Plugin } from 'unified';

  interface RehypeKatexOptions {
    throwOnError?: boolean;
    errorColor?: string;
    strict?: boolean | 'warn' | 'error' | 'ignore';
    trust?: boolean | ((context: { command: string; url?: string; protocol?: string }) => boolean);
    macros?: Record<string, string>;
    minRuleThickness?: number;
    maxSize?: number;
    maxExpand?: number;
    displayMode?: boolean;
    output?: 'html' | 'mathml' | 'htmlAndMathml';
  }

  const rehypeKatex: Plugin<[RehypeKatexOptions?]>;
  export default rehypeKatex;
}
