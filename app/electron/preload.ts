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
export type MenuAction = 'find' | 'replace' | 'toggle-ai-context' | 'insert-table' | 'show-help' | 'open-welcome';

// Session & Recovery Types
export interface TabState {
  id: string;
  filePath: string | null;
  title: string;
  isModified: boolean;
  recoveryFile?: string;
  cursorPosition?: { line: number; column: number };
  scrollPosition?: number;
  viewMode?: 'editor' | 'preview' | 'split';
}

export interface RecentFile {
  path: string;
  lastOpened: string;
  pinned?: boolean;
}

export interface SessionState {
  version: number;
  lastOpened: string;
  activeTabId: string;
  tabs: TabState[];
  recentFiles: RecentFile[];
}

export interface AppPaths {
  appData: string;
  recovery: string;
  welcome: string;
  session: string;
  sessions: string;
}

// Multi-Instance Types
export interface WindowState {
  displayId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

export interface InstanceInfo {
  displayName: string;
  lastOpened: string;
  tabCount: number;
}

export interface InstancesData {
  instances: Record<string, InstanceInfo>;
  lastUsedInstanceId: string;
}
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

  // Menu-triggered file operations (sent to main process)
  openFile: () => ipcRenderer.send('menu-open-file'),
  saveFile: () => ipcRenderer.send('menu-save-file'),
  saveFileAs: () => ipcRenderer.send('menu-save-file-as'),
  exportHTML: () => ipcRenderer.send('menu-export-html'),
  exportPDF: () => ipcRenderer.send('menu-export-pdf'),

  // Direct file open that returns content (workaround for event issues)
  openFileDialog: (): Promise<{ success: boolean; path?: string; content?: string; error?: string; canceled?: boolean }> =>
    ipcRenderer.invoke('open-file-dialog'),

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

  // Plugin management
  loadPlugins: (): Promise<PluginData[]> =>
    ipcRenderer.invoke('load-plugins'),

  getPluginPath: (): Promise<string> =>
    ipcRenderer.invoke('get-plugin-path'),

  // Session & Recovery
  getSession: (): Promise<SessionState | null> =>
    ipcRenderer.invoke('get-session'),

  saveSession: (session: SessionState): Promise<void> =>
    ipcRenderer.invoke('save-session', session),

  saveRecovery: (tabId: string, content: string): Promise<void> =>
    ipcRenderer.invoke('save-recovery', tabId, content),

  readRecovery: (tabId: string): Promise<string | null> =>
    ipcRenderer.invoke('read-recovery', tabId),

  deleteRecovery: (tabId: string): Promise<void> =>
    ipcRenderer.invoke('delete-recovery', tabId),

  cleanupRecovery: (validTabIds: string[]): Promise<void> =>
    ipcRenderer.invoke('cleanup-recovery', validTabIds),

  getAppPaths: (): Promise<AppPaths> =>
    ipcRenderer.invoke('get-app-paths'),

  getWelcomeContent: (): Promise<string> =>
    ipcRenderer.invoke('get-welcome-content'),

  getWelcomePath: (): Promise<string> =>
    ipcRenderer.invoke('get-welcome-path'),

  // Session restore event
  onSessionRestore: (callback: (session: SessionState) => void) => {
    const handler = (_: Electron.IpcRendererEvent, session: SessionState) => callback(session);
    ipcRenderer.on('session-restore', handler);
    return () => ipcRenderer.removeListener('session-restore', handler);
  },

  // Multi-Instance Management
  getInstanceId: (): Promise<string | null> =>
    ipcRenderer.invoke('get-instance-id'),

  getAllInstances: (): Promise<InstancesData> =>
    ipcRenderer.invoke('get-all-instances'),

  getWindowState: (): Promise<WindowState | null> =>
    ipcRenderer.invoke('get-window-state'),

  deleteInstance: (instanceId: string): Promise<void> =>
    ipcRenderer.invoke('delete-instance', instanceId),

  renameInstance: (instanceId: string, newName: string): Promise<void> =>
    ipcRenderer.invoke('rename-instance', instanceId, newName),

  // Settings storage (profiles and themes as JSON files)
  loadSettings: (key: string): Promise<unknown | null> =>
    ipcRenderer.invoke('load-settings', key),

  saveSettings: (key: string, data: unknown): Promise<boolean> =>
    ipcRenderer.invoke('save-settings', key, data),

  // Language/i18n
  getLanguage: (): Promise<string> =>
    ipcRenderer.invoke('get-language'),

  getSupportedLanguages: (): Promise<Array<{ code: string; name: string; nativeName: string }>> =>
    ipcRenderer.invoke('get-supported-languages'),

  setLanguage: (language: string): Promise<string> =>
    ipcRenderer.invoke('set-language', language),

  // Dialogs
  confirmCloseTab: (tabTitle: string): Promise<'save' | 'discard' | 'cancel'> =>
    ipcRenderer.invoke('confirm-close-tab', tabTitle),

  // SASS Compilation (for custom-styles plugin)
  compileSass: (source: string, options?: { syntax?: 'scss' | 'sass' | 'indented' }): Promise<{ success: boolean; css?: string; error?: string }> =>
    ipcRenderer.invoke('compile-sass', source, options),
};

// Plugin data type
export interface PluginData {
  id: string;
  framework: string;
  version: string;
  author?: string;
  description?: string;
  css?: string[];
  js?: string[];
  /** Initialization script to run after loading JS assets */
  init?: string;
  components: Record<string, unknown>;
  /** Plugin translations loaded from plugin's i18n/ subdirectory */
  i18n?: Record<string, unknown>;
  /** Documentation files from plugin's docs/ subdirectory */
  docs?: Array<{ name: string; path: string }>;
}

// Expose to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for renderer
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
