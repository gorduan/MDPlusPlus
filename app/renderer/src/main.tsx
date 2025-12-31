/**
 * MD++ Editor - Renderer Entry Point
 */

// Polyfill Buffer for gray-matter (Node.js dependency)
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
