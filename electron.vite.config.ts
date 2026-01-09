import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'app/electron/main.ts'),
        },
        external: ['electron', 'sass'],
      },
    },
  },
  preload: {
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'app/electron/preload.ts'),
        },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'app/renderer'),
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'app/renderer/index.html'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'app/renderer/src'),
        '@components': resolve(__dirname, 'components'),
        '@parser': resolve(__dirname, 'src'),
      },
    },
  },
});
