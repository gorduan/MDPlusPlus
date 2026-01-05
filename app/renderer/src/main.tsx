/**
 * MD++ Editor - Renderer Entry Point
 */

// Polyfill Buffer for gray-matter (Node.js dependency)
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// New SCSS-based styling system
import './scss/style.scss';
// Legacy CSS (backup - can be removed after testing)
// import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
