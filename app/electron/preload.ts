/**
 * MD++ Preload Script
 * Exposes secure APIs to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Types for the exposed API
export interface FileResult {
  success: boolean;
  content?: string;
  error?: string;
}

export interface FileOpenedEvent {
  path: string;
  content: string;
}

export type ViewMode = 'editor' | 'preview' | 'split';
export type MenuAction = 'find' | 'replace' | 'toggle-ai-context' | 'insert-table' | 'show-help';
export type ExportTheme = 'dark' | 'light';

export interface ExportOptions {
  filePath: string;
  theme: ExportTheme;
}

// Exposed API
const electronAPI = {
  // File operations
  readFile: (filePath: string): Promise<FileResult> =>
    ipcRenderer.invoke('read-file', filePath),

  writeFile: (filePath: string, content: string): Promise<FileResult> =>
    ipcRenderer.invoke('write-file', filePath, content),

  fileExists: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke('file-exists', filePath),

  getCurrentFile: (): Promise<string | null> =>
    ipcRenderer.invoke('get-current-file'),

  getCurrentDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('get-current-directory'),

  readFileBase64: (filePath: string, basePath?: string): Promise<FileResult & { data?: string }> =>
    ipcRenderer.invoke('read-file-base64', filePath, basePath),

  // Content management
  onGetContent: (callback: () => void) => {
    ipcRenderer.on('get-content', callback);
    return () => ipcRenderer.removeListener('get-content', callback);
  },

  sendContent: (content: string) => {
    ipcRenderer.send('get-content-response', content);
  },

  setModified: (modified: boolean) => {
    ipcRenderer.send('content-modified', modified);
  },

  // File events
  onFileNew: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('file-new', handler);
    return () => ipcRenderer.removeListener('file-new', handler);
  },

  onFileOpened: (callback: (data: FileOpenedEvent) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: FileOpenedEvent) => callback(data);
    ipcRenderer.on('file-opened', handler);
    return () => ipcRenderer.removeListener('file-opened', handler);
  },

  onFileSaved: (callback: (path: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, path: string) => callback(path);
    ipcRenderer.on('file-saved', handler);
    return () => ipcRenderer.removeListener('file-saved', handler);
  },

  // View mode
  onViewMode: (callback: (mode: ViewMode) => void) => {
    const handler = (_: Electron.IpcRendererEvent, mode: ViewMode) => callback(mode);
    ipcRenderer.on('view-mode', handler);
    return () => ipcRenderer.removeListener('view-mode', handler);
  },

  // Menu actions
  onMenuAction: (callback: (action: MenuAction) => void) => {
    const handler = (_: Electron.IpcRendererEvent, action: MenuAction) => callback(action);
    ipcRenderer.on('menu-action', handler);
    return () => ipcRenderer.removeListener('menu-action', handler);
  },

  // Insert actions
  onInsert: (callback: (text: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, text: string) => callback(text);
    ipcRenderer.on('insert', handler);
    return () => ipcRenderer.removeListener('insert', handler);
  },

  onInsertWrap: (callback: (wrapper: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, wrapper: string) => callback(wrapper);
    ipcRenderer.on('insert-wrap', handler);
    return () => ipcRenderer.removeListener('insert-wrap', handler);
  },

  // Export actions
  onExportHTML: (callback: (options: ExportOptions) => void) => {
    const handler = (_: Electron.IpcRendererEvent, options: ExportOptions) => callback(options);
    ipcRenderer.on('export-html', handler);
    return () => ipcRenderer.removeListener('export-html', handler);
  },

  onExportPDF: (callback: (options: ExportOptions) => void) => {
    const handler = (_: Electron.IpcRendererEvent, options: ExportOptions) => callback(options);
    ipcRenderer.on('export-pdf', handler);
    return () => ipcRenderer.removeListener('export-pdf', handler);
  },

  // Print to PDF
  printToPDF: (htmlContent: string, pdfPath: string): Promise<FileResult> =>
    ipcRenderer.invoke('print-to-pdf', htmlContent, pdfPath),

  // Platform info
  platform: process.platform,

  // DevTools toggle
  toggleDevTools: (): Promise<boolean> =>
    ipcRenderer.invoke('toggle-devtools'),

  onDevToolsState: (callback: (isOpen: boolean) => void) => {
    const handler = (_: Electron.IpcRendererEvent, isOpen: boolean) => callback(isOpen);
    ipcRenderer.on('devtools-state', handler);
    return () => ipcRenderer.removeListener('devtools-state', handler);
  },
};

// Expose to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for renderer
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
