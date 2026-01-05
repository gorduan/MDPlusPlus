/**
 * MD++ Electron Main Process
 * Handles file operations, window management, and system integration
 */

import { app, BrowserWindow, ipcMain, dialog, Menu, shell, screen } from 'electron';
import { join, dirname, resolve } from 'path';
import { readFile, writeFile, stat } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

// Force software rendering to fix GPU crashes on Windows
app.disableHardwareAcceleration();

// Application state
let mainWindow: BrowserWindow | null = null;
let currentFilePath: string | null = null;
let isModified = false;

// Recent files storage
const recentFiles: string[] = [];
const MAX_RECENT_FILES = 10;

/**
 * Create the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'MD++ Editor',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      spellcheck: true,
    },
    show: true,
    center: true,
    backgroundColor: '#1e1e1e',
  });

  // Enable spellcheck for German and English
  mainWindow.webContents.session.setSpellCheckerLanguages(['de', 'en-US']);

  // Handle file drop
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Prevent navigation from dropped files - handle them instead
    if (url.startsWith('file://')) {
      event.preventDefault();
      const filePath = decodeURIComponent(url.replace('file:///', '').replace('file://', ''));
      if (filePath.match(/\.(md|mdpp|mdsc|markdown|txt)$/i)) {
        openFilePath(filePath);
      }
    }
  });

  // Notify renderer when DevTools state changes
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow?.webContents.send('devtools-state', true);
  });
  mainWindow.webContents.on('devtools-closed', () => {
    mainWindow?.webContents.send('devtools-state', false);
  });

  // Handle close with unsaved changes
  mainWindow.on('close', async (e) => {
    if (isModified) {
      e.preventDefault();
      const result = await dialog.showMessageBox(mainWindow!, {
        type: 'warning',
        buttons: ['Save', "Don't Save", 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        title: 'Unsaved Changes',
        message: 'Do you want to save the changes before closing?',
      });

      if (result.response === 0) {
        // Save
        const saved = await saveFile();
        if (saved) {
          mainWindow?.destroy();
        }
      } else if (result.response === 1) {
        // Don't save
        mainWindow?.destroy();
      }
      // Cancel - do nothing
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Load the renderer
  const rendererPath = join(__dirname, '../renderer/index.html');
  console.log('Loading renderer from:', rendererPath);

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    dialog.showErrorBox('Load Error', `Failed to load: ${errorDescription}`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer loaded successfully');
  });

  mainWindow.loadFile(rendererPath);

  // Force window to front and ensure it's visible on primary display
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) return;

    // Get primary display bounds
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // Center on primary display
    const winBounds = mainWindow.getBounds();
    const x = Math.round((screenWidth - winBounds.width) / 2);
    const y = Math.round((screenHeight - winBounds.height) / 2);
    mainWindow.setBounds({ x, y, width: winBounds.width, height: winBounds.height });

    // Force visibility
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true);
    mainWindow.focus();

    // Remove always-on-top after a short delay
    setTimeout(() => {
      mainWindow?.setAlwaysOnTop(false);
    }, 500);

    console.log('Window shown on primary display at:', x, y);

    // Load welcome file on startup
    loadWelcomeFile();
  });

  // Create application menu
  createMenu();
}

/**
 * Load welcome file on startup
 */
async function loadWelcomeFile(): Promise<void> {
  // Wait for renderer to be fully loaded
  await new Promise(resolve => setTimeout(resolve, 500));

  const welcomePath = join(__dirname, '../../examples/welcome.md');

  try {
    if (existsSync(welcomePath)) {
      const content = await readFile(welcomePath, 'utf-8');
      // Don't set currentFilePath - treat as untitled until saved
      mainWindow?.webContents.send('file-opened', { path: null, content });
      console.log('Welcome file loaded');
    }
  } catch (error) {
    console.log('Could not load welcome file:', error);
  }
}

/**
 * Update window title based on current file
 */
function updateWindowTitle(): void {
  if (!mainWindow) return;

  let title = 'MD++ Editor';
  if (currentFilePath) {
    const fileName = currentFilePath.split(/[\\/]/).pop() || 'Untitled';
    title = `${isModified ? '*' : ''}${fileName} - MD++ Editor`;
  } else if (isModified) {
    title = '*Untitled - MD++ Editor';
  }
  mainWindow.setTitle(title);
}

/**
 * Create application menu
 */
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => newFile(),
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => openFile(),
        },
        {
          label: 'Open Recent',
          submenu: recentFiles.map((file) => ({
            label: file,
            click: () => openFilePath(file),
          })),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => saveFile(),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => saveFileAs(),
        },
        { type: 'separator' },
        {
          label: 'Export as HTML...',
          accelerator: 'CmdOrCtrl+E',
          click: () => exportAsHTML(),
        },
        {
          label: 'Export as PDF...',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => exportAsPDF(),
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow?.webContents.send('menu-action', 'find'),
        },
        {
          label: 'Replace',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow?.webContents.send('menu-action', 'replace'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Editor Only',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow?.webContents.send('view-mode', 'editor'),
        },
        {
          label: 'Preview Only',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow?.webContents.send('view-mode', 'preview'),
        },
        {
          label: 'Split View',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow?.webContents.send('view-mode', 'split'),
        },
        { type: 'separator' },
        {
          label: 'Toggle AI Context',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => mainWindow?.webContents.send('menu-action', 'toggle-ai-context'),
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Insert',
      submenu: [
        {
          label: 'Heading 1',
          accelerator: 'CmdOrCtrl+Alt+1',
          click: () => mainWindow?.webContents.send('insert', '# '),
        },
        {
          label: 'Heading 2',
          accelerator: 'CmdOrCtrl+Alt+2',
          click: () => mainWindow?.webContents.send('insert', '## '),
        },
        {
          label: 'Heading 3',
          accelerator: 'CmdOrCtrl+Alt+3',
          click: () => mainWindow?.webContents.send('insert', '### '),
        },
        { type: 'separator' },
        {
          label: 'Bold',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow?.webContents.send('insert-wrap', '**'),
        },
        {
          label: 'Italic',
          accelerator: 'CmdOrCtrl+I',
          click: () => mainWindow?.webContents.send('insert-wrap', '*'),
        },
        {
          label: 'Code',
          accelerator: 'CmdOrCtrl+`',
          click: () => mainWindow?.webContents.send('insert-wrap', '`'),
        },
        { type: 'separator' },
        {
          label: 'Link',
          accelerator: 'CmdOrCtrl+K',
          click: () => mainWindow?.webContents.send('insert', '[](url)'),
        },
        {
          label: 'Image',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => mainWindow?.webContents.send('insert', '![alt](url)'),
        },
        { type: 'separator' },
        {
          label: 'Code Block',
          click: () => mainWindow?.webContents.send('insert', '```\n\n```'),
        },
        {
          label: 'AI Context Block',
          click: () => mainWindow?.webContents.send('insert', ':::ai-context\n\n:::'),
        },
        {
          label: 'Component Directive',
          click: () => mainWindow?.webContents.send('insert', '::component{}\n\n::'),
        },
        { type: 'separator' },
        {
          label: 'Table...',
          click: () => mainWindow?.webContents.send('menu-action', 'insert-table'),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'F1',
          click: () => mainWindow?.webContents.send('menu-action', 'show-help'),
        },
        { type: 'separator' },
        {
          label: 'MD++ Documentation',
          click: () => shell.openExternal('https://github.com/gorduan/MDPlusPlus'),
        },
        {
          label: 'Markdown Syntax',
          click: () => shell.openExternal('https://www.markdownguide.org/basic-syntax/'),
        },
        { type: 'separator' },
        {
          label: 'About MD++',
          click: () => showAboutDialog(),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Show about dialog
 */
function showAboutDialog(): void {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'About MD++',
    message: 'MD++ (Markdown Plus Plus)',
    detail: `Version 0.2.0\n\nExtended Markdown with Framework-Agnostic Component Directives\n\nStandalone Editor & Embeddable React Components\n\n© 2024 gorduan`,
  });
}

/**
 * Create new file
 */
async function newFile(): Promise<void> {
  if (isModified) {
    const result = await dialog.showMessageBox(mainWindow!, {
      type: 'warning',
      buttons: ['Save', "Don't Save", 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      title: 'Unsaved Changes',
      message: 'Do you want to save the changes?',
    });

    if (result.response === 0) {
      const saved = await saveFile();
      if (!saved) return;
    } else if (result.response === 2) {
      return;
    }
  }

  currentFilePath = null;
  isModified = false;
  updateWindowTitle();
  mainWindow?.webContents.send('file-new');
}

/**
 * Open file dialog
 */
async function openFile(): Promise<void> {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'mdpp', 'mdsc', 'markdown'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    await openFilePath(result.filePaths[0]);
  }
}

/**
 * Open specific file path
 */
async function openFilePath(filePath: string): Promise<void> {
  try {
    const content = await readFile(filePath, 'utf-8');
    currentFilePath = filePath;
    isModified = false;
    updateWindowTitle();
    addToRecentFiles(filePath);
    mainWindow?.webContents.send('file-opened', { path: filePath, content });
  } catch (error) {
    dialog.showErrorBox('Error', `Failed to open file: ${error}`);
  }
}

/**
 * Save current file
 */
async function saveFile(): Promise<boolean> {
  if (!currentFilePath) {
    return await saveFileAs();
  }

  return new Promise((resolve) => {
    ipcMain.once('get-content-response', async (_, content: string) => {
      try {
        await writeFile(currentFilePath!, content, 'utf-8');
        isModified = false;
        updateWindowTitle();
        mainWindow?.webContents.send('file-saved', currentFilePath);
        resolve(true);
      } catch (error) {
        dialog.showErrorBox('Error', `Failed to save file: ${error}`);
        resolve(false);
      }
    });
    mainWindow?.webContents.send('get-content');
  });
}

/**
 * Check if content uses MD++ specific features
 * Returns 'mdsc' for MarkdownScript, 'mdpp' for MD++, or 'md' for plain markdown
 */
function detectFileFormat(content: string): 'mdsc' | 'mdpp' | 'md' {
  // Check for MarkdownScript (:::script blocks)
  if (/:::script(?::output)?[\s{]/.test(content)) {
    return 'mdsc';
  }

  // Check for MD++ specific syntax:
  // - AI context blocks: :::ai-context
  // - Component directives: ::component{} or ::component[]
  // - Leaf directives: :directive{} or :directive[]
  const mdppPatterns = [
    /:::[\w-]+/,           // Container directives (:::ai-context, etc.)
    /::[\w-]+[{\[]/,       // Leaf directives with attributes (::card{}, etc.)
    /:[\w-]+[{\[]/,        // Inline directives with attributes
  ];

  if (mdppPatterns.some(pattern => pattern.test(content))) {
    return 'mdpp';
  }

  return 'md';
}

/**
 * Check if content uses MD++ specific features (legacy wrapper)
 */
function usesMDPlusPlusFeatures(content: string): boolean {
  return detectFileFormat(content) !== 'md';
}

/**
 * Save file as dialog
 */
async function saveFileAs(): Promise<boolean> {
  // Get content first to determine format
  const content = await new Promise<string>((resolve) => {
    ipcMain.once('get-content-response', (_, c: string) => resolve(c));
    mainWindow?.webContents.send('get-content');
  });

  const format = detectFileFormat(content);

  // Determine default extension:
  // 1. If file was opened, keep original extension (unless format changed)
  // 2. For new files, use detected format
  let defaultExt = format; // Default based on content

  if (currentFilePath) {
    // File was opened - preserve original extension unless format upgraded
    const originalExt = currentFilePath.split('.').pop()?.toLowerCase();
    if (originalExt === 'mdsc' || originalExt === 'mdpp' || originalExt === 'md' || originalExt === 'markdown') {
      defaultExt = originalExt === 'markdown' ? 'md' : originalExt;
      // Upgrade .md to .mdpp if MD++ features added
      if (originalExt === 'md' && format === 'mdpp') {
        defaultExt = 'mdpp';
      }
      // Upgrade to .mdsc if script blocks added
      if ((originalExt === 'md' || originalExt === 'mdpp') && format === 'mdsc') {
        defaultExt = 'mdsc';
      }
    }
  }

  const defaultName = currentFilePath
    ? currentFilePath.split(/[\\/]/).pop()?.replace(/\.(md|mdpp|mdsc|markdown)$/, `.${defaultExt}`)
    : `untitled.${defaultExt}`;

  // Order filters based on detected format
  let filters;
  if (format === 'mdsc') {
    filters = [
      { name: 'MarkdownScript Files', extensions: ['mdsc'] },
      { name: 'MD++ Files', extensions: ['mdpp'] },
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] },
    ];
  } else if (format === 'mdpp') {
    filters = [
      { name: 'MD++ Files', extensions: ['mdpp'] },
      { name: 'MarkdownScript Files', extensions: ['mdsc'] },
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] },
    ];
  } else {
    filters = [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'MD++ Files', extensions: ['mdpp'] },
      { name: 'MarkdownScript Files', extensions: ['mdsc'] },
      { name: 'All Files', extensions: ['*'] },
    ];
  }

  const result = await dialog.showSaveDialog(mainWindow!, {
    filters,
    defaultPath: defaultName,
  });

  if (!result.canceled && result.filePath) {
    currentFilePath = result.filePath;
    // Save with already fetched content
    try {
      await writeFile(currentFilePath, content, 'utf-8');
      isModified = false;
      updateWindowTitle();
      mainWindow?.webContents.send('file-saved', currentFilePath);
      return true;
    } catch (error) {
      dialog.showErrorBox('Error', `Failed to save file: ${error}`);
      return false;
    }
  }
  return false;
}

/**
 * Export as HTML
 */
async function exportAsHTML(): Promise<void> {
  // Ask for theme first
  const theme = await showExportThemeDialog();
  if (!theme) return; // User cancelled

  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [{ name: 'HTML Files', extensions: ['html'] }],
    defaultPath: currentFilePath?.replace(/\.(md|mdpp|markdown)$/, '.html') || 'export.html',
  });

  if (!result.canceled && result.filePath) {
    mainWindow?.webContents.send('export-html', { filePath: result.filePath, theme });
  }
}

/**
 * Export as PDF
 */
async function exportAsPDF(): Promise<void> {
  // Ask for theme (default to light for PDF/printing)
  const theme = await showExportThemeDialog();
  if (!theme) return; // User cancelled

  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    defaultPath: currentFilePath?.replace(/\.(md|mdpp|markdown)$/, '.pdf') || 'export.pdf',
  });

  if (!result.canceled && result.filePath) {
    mainWindow?.webContents.send('export-pdf', { filePath: result.filePath, theme });
  }
}

/**
 * Show export theme selection dialog
 */
async function showExportThemeDialog(): Promise<'dark' | 'light' | null> {
  const result = await dialog.showMessageBox(mainWindow!, {
    type: 'question',
    buttons: ['Light Theme', 'Dark Theme', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    title: 'Export Theme',
    message: 'Which theme should be used for the export?',
    detail: 'Light theme is recommended for printing and PDF export.',
  });

  if (result.response === 0) return 'light';
  if (result.response === 1) return 'dark';
  return null;
}

/**
 * Add file to recent files list
 */
function addToRecentFiles(filePath: string): void {
  const index = recentFiles.indexOf(filePath);
  if (index > -1) {
    recentFiles.splice(index, 1);
  }
  recentFiles.unshift(filePath);
  if (recentFiles.length > MAX_RECENT_FILES) {
    recentFiles.pop();
  }
  createMenu(); // Rebuild menu with updated recent files
}

// IPC Handlers

// Track content modifications from renderer
ipcMain.on('content-modified', (_, modified: boolean) => {
  isModified = modified;
  updateWindowTitle();
});

// Menu-triggered file operations from renderer keyboard shortcuts
ipcMain.on('menu-open-file', () => openFile());
ipcMain.on('menu-save-file', () => saveFile());
ipcMain.on('menu-save-file-as', () => saveFileAs());
ipcMain.on('menu-export-html', () => exportAsHTML());
ipcMain.on('menu-export-pdf', () => exportAsPDF());

// Direct file open handler that returns the file content (workaround for event issues)
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'mdpp', 'mdsc', 'markdown'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    try {
      const content = await readFile(filePath, 'utf-8');
      currentFilePath = filePath;
      isModified = false;
      updateWindowTitle();
      addToRecentFiles(filePath);
      return { success: true, path: filePath, content };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  return { success: false, canceled: true };
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    const content = await readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  try {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    await writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('file-exists', async (_, filePath: string) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('get-current-file', () => currentFilePath);

// Read file as base64 for image embedding
ipcMain.handle('read-file-base64', async (_, filePath: string, basePath?: string) => {
  try {
    // Resolve relative paths based on the current file's directory
    let fullPath = filePath;
    if (!filePath.match(/^[a-zA-Z]:/) && !filePath.startsWith('/') && basePath) {
      fullPath = resolve(dirname(basePath), filePath);
    }

    const data = await readFile(fullPath);
    const base64 = data.toString('base64');

    // Determine MIME type from extension
    const ext = fullPath.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'ico': 'image/x-icon',
      'bmp': 'image/bmp',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    return { success: true, data: `data:${mimeType};base64,${base64}` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Get current file directory for relative path resolution
ipcMain.handle('get-current-directory', () => {
  return currentFilePath ? dirname(currentFilePath) : null;
});

ipcMain.handle('print-to-pdf', async (_, htmlContent: string, pdfPath: string) => {
  try {
    // Create a hidden window for PDF generation
    const pdfWindow = new BrowserWindow({
      width: 800,
      height: 1200,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
      },
    });

    // Load the HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Wait for all rendering to complete (Mermaid, KaTeX, etc.)
    // Poll for the renderingComplete flag with timeout
    const maxWaitTime = 30000; // 30 seconds max
    const pollInterval = 200; // Check every 200ms
    let waited = 0;

    while (waited < maxWaitTime) {
      const isComplete = await pdfWindow.webContents.executeJavaScript('window.renderingComplete === true');
      if (isComplete) {
        // Give a little extra time for SVGs to finalize
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      waited += pollInterval;
    }

    // Generate PDF
    const pdfData = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5,
      },
    });

    // Write PDF to file
    await writeFile(pdfPath, pdfData);

    // Close the hidden window
    pdfWindow.destroy();

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('toggle-devtools', () => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
      return false;
    } else {
      mainWindow.webContents.openDevTools();
      return true;
    }
  }
  return false;
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle file drop
app.on('open-file', async (event, path) => {
  event.preventDefault();
  if (mainWindow) {
    await openFilePath(path);
  }
});
