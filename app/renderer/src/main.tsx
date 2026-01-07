/**
 * MD++ Editor - Renderer Entry Point
 */

// Polyfill Buffer for gray-matter (Node.js dependency)
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initI18n } from '../../i18n';
// New SCSS-based styling system
import './scss/style.scss';
// Legacy CSS (backup - can be removed after testing)
// import './styles/global.css';

// Initialize i18n asynchronously and render
async function bootstrap() {
  // Get language from main process (saved setting or system language)
  const language = await window.electronAPI.getLanguage();
  initI18n(language);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
