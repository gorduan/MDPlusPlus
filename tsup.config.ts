import { defineConfig } from 'tsup';

export default defineConfig([
  // Core parser library (ESM with external deps - for npm/bundlers)
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    target: 'es2020',
    external: [
      'unified',
      'remark-parse',
      'remark-directive',
      'remark-rehype',
      'rehype-stringify',
      'unist-util-visit',
      'gray-matter',
    ],
  },
  // Browser bundle (IIFE with all deps bundled - for script tag)
  {
    entry: { 'mdplusplus.browser': 'src/index.ts' },
    format: ['iife'],
    globalName: 'MDPlusPlus',
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    target: 'es2020',
    minify: true,
    // Bundle all dependencies for browser use
    noExternal: [/.*/],
    platform: 'browser',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  },
  // Embeddable React components
  {
    entry: ['components/index.ts'],
    format: ['esm'],
    dts: true,
    outDir: 'dist/components',
    splitting: false,
    sourcemap: true,
    target: 'es2020',
    external: [
      'react',
      'react-dom',
      '@monaco-editor/react',
      'monaco-editor',
    ],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
]);
