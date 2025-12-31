import { defineConfig } from 'tsup';

export default defineConfig([
  // Core parser library
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
