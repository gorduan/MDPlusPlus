import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'app/electron/main.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
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
