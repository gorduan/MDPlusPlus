/**
 * MD++ Electron Main Process
 * Handles file operations, window management, and system integration
 */

import { app, BrowserWindow, ipcMain, dialog, Menu, shell, screen } from 'electron';
import { join, dirname, resolve, basename } from 'path';
import { readFile, writeFile, stat, readdir, rm, rename } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';

// ============================================
// Session & Recovery Types
// ============================================

interface TabState {
  id: string;
  filePath: string | null;
  title: string;
  isModified: boolean;
  recoveryFile?: string;
  cursorPosition?: { line: number; column: number };
  scrollPosition?: number;
  viewMode?: 'editor' | 'preview' | 'split';
}

interface RecentFile {
  path: string;
  lastOpened: string;
  pinned?: boolean;
}

// Legacy session format (for migration)
interface SessionState {
  version: number;
  lastOpened: string;
  activeTabId: string;
  tabs: TabState[];
  recentFiles: RecentFile[];
}

// ============================================
// Multi-Instance Types
// ============================================

interface WindowState {
  displayId: string;        // Monitor identification
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

interface InstanceSession {
  instanceId: string;
  version: number;
  lastOpened: string;
  windowState: WindowState;
  activeTabId: string;
  tabs: TabState[];
  recentFiles: RecentFile[];
}

interface InstanceInfo {
  displayName: string;
  lastOpened: string;
  tabCount: number;
}

interface InstancesIndex {
  version: number;
  lastUsedInstanceId: string;
  instances: Record<string, InstanceInfo>;
}

// ============================================
// App Data Paths
// ============================================

const APP_DATA_PATH = join(homedir(), 'AppData', 'Roaming', 'MDPlusPlus');
const SESSION_FILE = join(APP_DATA_PATH, 'session.json'); // Legacy, for migration
const SESSIONS_DIR = join(APP_DATA_PATH, 'sessions');
const INSTANCES_INDEX_FILE = join(SESSIONS_DIR, 'instances.json');
const RECOVERY_DIR = join(APP_DATA_PATH, 'recovery');
const APP_WELCOME_FILE = join(APP_DATA_PATH, 'welcome.md');

// Force software rendering to fix GPU crashes on Windows
app.disableHardwareAcceleration();

// Application state
let mainWindow: BrowserWindow | null = null;
let currentFilePath: string | null = null;
let isModified = false;
let currentInstanceId: string | null = null;

// Recent files storage (loaded from session)
let recentFiles: string[] = [];
const MAX_RECENT_FILES = 10;

// ============================================
// UUID Generation
// ============================================

function generateInstanceId(): string {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================
// Display Identification
// ============================================

function getDisplayId(bounds: Electron.Rectangle): string {
  const display = screen.getDisplayMatching(bounds);
  return `${display.bounds.x}_${display.bounds.y}_${display.size.width}x${display.size.height}`;
}

function getCurrentWindowState(): WindowState | null {
  if (!mainWindow) return null;

  const bounds = mainWindow.getBounds();
  return {
    displayId: getDisplayId(bounds),
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: mainWindow.isMaximized(),
    isFullScreen: mainWindow.isFullScreen(),
  };
}

function restoreWindowBounds(windowState: WindowState): Electron.Rectangle {
  const displays = screen.getAllDisplays();
  const targetDisplay = displays.find(
    (d) => getDisplayId(d.bounds) === windowState.displayId
  );

  if (targetDisplay) {
    // Ensure window is within display bounds
    const x = Math.max(
      targetDisplay.bounds.x,
      Math.min(windowState.x, targetDisplay.bounds.x + targetDisplay.bounds.width - windowState.width)
    );
    const y = Math.max(
      targetDisplay.bounds.y,
      Math.min(windowState.y, targetDisplay.bounds.y + targetDisplay.bounds.height - windowState.height)
    );
    return { x, y, width: windowState.width, height: windowState.height };
  }

  // Fallback: center on primary display
  const primary = screen.getPrimaryDisplay();
  const x = Math.round((primary.workAreaSize.width - windowState.width) / 2);
  const y = Math.round((primary.workAreaSize.height - windowState.height) / 2);
  return { x, y, width: windowState.width, height: windowState.height };
}

// ============================================
// Session & Recovery Functions
// ============================================

/**
 * Ensure app data directories exist
 */
function ensureAppDataDirs(): void {
  if (!existsSync(APP_DATA_PATH)) {
    mkdirSync(APP_DATA_PATH, { recursive: true });
  }
  if (!existsSync(RECOVERY_DIR)) {
    mkdirSync(RECOVERY_DIR, { recursive: true });
  }
  if (!existsSync(SESSIONS_DIR)) {
    mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

// ============================================
// Instance Session Functions (Multi-Instance Support)
// ============================================

function getInstanceSessionPath(instanceId: string): string {
  return join(SESSIONS_DIR, `${instanceId}.json`);
}

function getInstanceLockPath(instanceId: string): string {
  return join(SESSIONS_DIR, `${instanceId}.lock`);
}

/**
 * Try to acquire lock for an instance
 * Returns true if lock acquired, false if already locked by another process
 */
function tryAcquireInstanceLock(instanceId: string): boolean {
  const lockPath = getInstanceLockPath(instanceId);

  try {
    // Check if lock file exists and is still valid
    if (existsSync(lockPath)) {
      const lockContent = require('fs').readFileSync(lockPath, 'utf-8');
      const lockData = JSON.parse(lockContent);
      const lockPid = lockData.pid;

      // Check if the process is still running
      try {
        process.kill(lockPid, 0); // Signal 0 = check if process exists
        // Process exists, lock is held
        console.log(`[Session] Instance ${instanceId} is locked by PID ${lockPid}`);
        return false;
      } catch {
        // Process doesn't exist, stale lock - remove it
        console.log(`[Session] Removing stale lock for instance ${instanceId}`);
        require('fs').unlinkSync(lockPath);
      }
    }

    // Create lock file with our PID
    require('fs').writeFileSync(lockPath, JSON.stringify({ pid: process.pid, timestamp: Date.now() }), 'utf-8');
    console.log(`[Session] Acquired lock for instance ${instanceId} (PID ${process.pid})`);
    return true;
  } catch (error) {
    console.error(`[Session] Failed to acquire lock for ${instanceId}:`, error);
    return false;
  }
}

/**
 * Release lock for an instance
 */
function releaseInstanceLock(instanceId: string): void {
  const lockPath = getInstanceLockPath(instanceId);

  try {
    if (existsSync(lockPath)) {
      require('fs').unlinkSync(lockPath);
      console.log(`[Session] Released lock for instance ${instanceId}`);
    }
  } catch (error) {
    console.error(`[Session] Failed to release lock for ${instanceId}:`, error);
  }
}

/**
 * Load instance session with backup fallback
 */
async function loadInstanceSession(instanceId: string): Promise<InstanceSession | null> {
  const filePath = getInstanceSessionPath(instanceId);
  const backupPath = `${filePath}.backup`;

  try {
    if (existsSync(filePath)) {
      const content = await readFile(filePath, 'utf-8');

      try {
        const parsed = JSON.parse(content) as InstanceSession;
        console.log(`[Session] Loaded instance ${instanceId}`);

        // Create backup on successful load
        await writeFile(backupPath, content, 'utf-8');

        // Update recent files in memory
        if (parsed.recentFiles) {
          recentFiles = parsed.recentFiles.map((rf) => rf.path);
        }

        return parsed;
      } catch (parseError) {
        console.error(`[Session] JSON parse error for instance ${instanceId}, trying backup:`, parseError);

        // Try backup if main file corrupted
        if (existsSync(backupPath)) {
          const backupContent = await readFile(backupPath, 'utf-8');
          const backupParsed = JSON.parse(backupContent) as InstanceSession;
          console.log(`[Session] Restored instance ${instanceId} from backup`);
          return backupParsed;
        }

        throw parseError;
      }
    }
    console.log(`[Session] No session file found for instance ${instanceId}`);
    return null;
  } catch (error) {
    console.error(`[Session] Failed to load instance ${instanceId}:`, error);
    return null;
  }
}

/**
 * Save instance session with atomic write
 */
async function saveInstanceSession(session: InstanceSession): Promise<void> {
  try {
    ensureAppDataDirs();
    const filePath = getInstanceSessionPath(session.instanceId);
    const tempPath = `${filePath}.tmp`;
    const jsonContent = JSON.stringify(session, null, 2);

    // Atomic write: temp file → delete old → rename
    await writeFile(tempPath, jsonContent, 'utf-8');

    if (existsSync(filePath)) {
      await rm(filePath);
    }

    await rename(tempPath, filePath);
    console.log(`[Session] Saved instance ${session.instanceId}`);
  } catch (error) {
    console.error(`[Session] Failed to save instance ${session.instanceId}:`, error);
  }
}

/**
 * Delete instance session
 */
async function deleteInstanceSession(instanceId: string): Promise<void> {
  try {
    const filePath = getInstanceSessionPath(instanceId);
    const backupPath = `${filePath}.backup`;

    if (existsSync(filePath)) {
      await rm(filePath);
    }
    if (existsSync(backupPath)) {
      await rm(backupPath);
    }

    console.log(`[Session] Deleted instance ${instanceId}`);
  } catch (error) {
    console.error(`[Session] Failed to delete instance ${instanceId}:`, error);
  }
}

// ============================================
// Instances Index Functions
// ============================================

/**
 * Load instances index with backup fallback
 */
async function loadInstancesIndex(): Promise<InstancesIndex> {
  const backupPath = `${INSTANCES_INDEX_FILE}.backup`;

  try {
    if (existsSync(INSTANCES_INDEX_FILE)) {
      const content = await readFile(INSTANCES_INDEX_FILE, 'utf-8');

      try {
        const parsed = JSON.parse(content) as InstancesIndex;
        console.log(`[Session] Loaded instances index`);

        // Create backup on successful load
        await writeFile(backupPath, content, 'utf-8');

        return parsed;
      } catch (parseError) {
        console.error(`[Session] JSON parse error for instances index, trying backup:`, parseError);

        if (existsSync(backupPath)) {
          const backupContent = await readFile(backupPath, 'utf-8');
          const backupParsed = JSON.parse(backupContent) as InstancesIndex;
          console.log(`[Session] Restored instances index from backup`);
          return backupParsed;
        }

        throw parseError;
      }
    }
  } catch (error) {
    console.error(`[Session] Failed to load instances index:`, error);
  }

  // Return empty index
  return {
    version: 1,
    lastUsedInstanceId: '',
    instances: {},
  };
}

/**
 * Save instances index with atomic write
 */
async function saveInstancesIndex(index: InstancesIndex): Promise<void> {
  try {
    ensureAppDataDirs();
    const tempPath = `${INSTANCES_INDEX_FILE}.tmp`;
    const jsonContent = JSON.stringify(index, null, 2);

    await writeFile(tempPath, jsonContent, 'utf-8');

    if (existsSync(INSTANCES_INDEX_FILE)) {
      await rm(INSTANCES_INDEX_FILE);
    }

    await rename(tempPath, INSTANCES_INDEX_FILE);
    console.log(`[Session] Saved instances index`);
  } catch (error) {
    console.error(`[Session] Failed to save instances index:`, error);
  }
}

/**
 * Update instance info in index
 */
async function updateInstanceInIndex(
  instanceId: string,
  displayName: string,
  tabCount: number
): Promise<void> {
  const index = await loadInstancesIndex();

  index.instances[instanceId] = {
    displayName,
    lastOpened: new Date().toISOString(),
    tabCount,
  };
  index.lastUsedInstanceId = instanceId;

  await saveInstancesIndex(index);
}

/**
 * Remove instance from index
 */
async function removeInstanceFromIndex(instanceId: string): Promise<void> {
  const index = await loadInstancesIndex();

  delete index.instances[instanceId];

  // Update lastUsedInstanceId if it was this instance
  if (index.lastUsedInstanceId === instanceId) {
    const remaining = Object.keys(index.instances);
    index.lastUsedInstanceId = remaining.length > 0 ? remaining[0] : '';
  }

  await saveInstancesIndex(index);
}

// ============================================
// Legacy Session Functions (for migration)
// ============================================

/**
 * Load legacy session state from disk
 */
async function loadLegacySession(): Promise<SessionState | null> {
  try {
    if (existsSync(SESSION_FILE)) {
      const content = await readFile(SESSION_FILE, 'utf-8');
      const session = JSON.parse(content) as SessionState;
      return session;
    }
  } catch (error) {
    console.error('Failed to load legacy session:', error);
  }
  return null;
}

/**
 * Migrate legacy session to new instance format
 */
async function migrateLegacySession(): Promise<string | null> {
  const legacySession = await loadLegacySession();

  if (!legacySession) {
    return null;
  }

  console.log(`[Session] Migrating legacy session...`);

  const instanceId = generateInstanceId();
  const primaryDisplay = screen.getPrimaryDisplay();

  // Create new instance session
  const instanceSession: InstanceSession = {
    instanceId,
    version: 1,
    lastOpened: legacySession.lastOpened || new Date().toISOString(),
    windowState: {
      displayId: getDisplayId(primaryDisplay.bounds),
      x: Math.round((primaryDisplay.workAreaSize.width - 1200) / 2),
      y: Math.round((primaryDisplay.workAreaSize.height - 800) / 2),
      width: 1200,
      height: 800,
      isMaximized: false,
      isFullScreen: false,
    },
    activeTabId: legacySession.activeTabId,
    tabs: legacySession.tabs,
    recentFiles: legacySession.recentFiles,
  };

  // Save as new instance
  await saveInstanceSession(instanceSession);

  // Update index
  await updateInstanceInIndex(
    instanceId,
    'Migrierte Session',
    legacySession.tabs.length
  );

  // Delete legacy session file
  try {
    await rm(SESSION_FILE);
    console.log(`[Session] Deleted legacy session file`);
  } catch {
    console.log(`[Session] Could not delete legacy session file`);
  }

  console.log(`[Session] Migration complete, new instance: ${instanceId}`);
  return instanceId;
}

/**
 * Save session state to disk (legacy format, for backward compatibility)
 */
async function saveSession(session: SessionState): Promise<void> {
  // Convert to instance session and save
  if (currentInstanceId) {
    const windowState = getCurrentWindowState();
    const instanceSession: InstanceSession = {
      instanceId: currentInstanceId,
      version: 1,
      lastOpened: session.lastOpened,
      windowState: windowState || {
        displayId: '',
        x: 0,
        y: 0,
        width: 1200,
        height: 800,
        isMaximized: false,
        isFullScreen: false,
      },
      activeTabId: session.activeTabId,
      tabs: session.tabs,
      recentFiles: session.recentFiles,
    };

    await saveInstanceSession(instanceSession);

    // Update index
    await updateInstanceInIndex(
      currentInstanceId,
      `Instanz`,
      session.tabs.length
    );
  }
}

/**
 * Save recovery file for a tab
 */
async function saveRecoveryFile(tabId: string, content: string): Promise<void> {
  try {
    ensureAppDataDirs();
    const recoveryPath = join(RECOVERY_DIR, `${tabId}.md`);
    await writeFile(recoveryPath, content, 'utf-8');
  } catch (error) {
    console.error('Failed to save recovery file:', error);
  }
}

/**
 * Read recovery file for a tab
 */
async function readRecoveryFile(tabId: string): Promise<string | null> {
  try {
    const recoveryPath = join(RECOVERY_DIR, `${tabId}.md`);
    if (existsSync(recoveryPath)) {
      return await readFile(recoveryPath, 'utf-8');
    }
  } catch (error) {
    console.error('Failed to read recovery file:', error);
  }
  return null;
}

/**
 * Delete recovery file for a tab
 */
async function deleteRecoveryFile(tabId: string): Promise<void> {
  try {
    const recoveryPath = join(RECOVERY_DIR, `${tabId}.md`);
    if (existsSync(recoveryPath)) {
      await rm(recoveryPath);
    }
  } catch (error) {
    console.error('Failed to delete recovery file:', error);
  }
}

/**
 * Clean up orphaned recovery files
 */
async function cleanupRecoveryFiles(validTabIds: string[]): Promise<void> {
  try {
    if (!existsSync(RECOVERY_DIR)) return;

    const files = await readdir(RECOVERY_DIR);
    for (const file of files) {
      const tabId = file.replace('.md', '');
      if (!validTabIds.includes(tabId)) {
        await rm(join(RECOVERY_DIR, file));
      }
    }
  } catch (error) {
    console.error('Failed to cleanup recovery files:', error);
  }
}

/**
 * Setup welcome file (copy from resources if not exists)
 */
async function setupWelcomeFile(): Promise<void> {
  ensureAppDataDirs();

  if (!existsSync(APP_WELCOME_FILE)) {
    // Copy from resources
    const resourceWelcome = join(__dirname, '../../resources/welcome.md');
    if (existsSync(resourceWelcome)) {
      const content = await readFile(resourceWelcome, 'utf-8');
      await writeFile(APP_WELCOME_FILE, content, 'utf-8');
      console.log('Welcome file created at:', APP_WELCOME_FILE);
    }
  }
}

/**
 * Get welcome file content
 */
async function getWelcomeContent(): Promise<string> {
  try {
    if (existsSync(APP_WELCOME_FILE)) {
      return await readFile(APP_WELCOME_FILE, 'utf-8');
    }
    // Fallback to resources
    const resourceWelcome = join(__dirname, '../../resources/welcome.md');
    if (existsSync(resourceWelcome)) {
      return await readFile(resourceWelcome, 'utf-8');
    }
  } catch (error) {
    console.error('Failed to load welcome file:', error);
  }
  return '# Welcome to MD++\n\nStart typing to begin...';
}

// Debounce utility for window state saving
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Track pending window state (for debounced save)
let pendingWindowStateSave: (() => Promise<void>) | null = null;

/**
 * Save current window state to instance session
 */
async function saveCurrentWindowState(): Promise<void> {
  if (!mainWindow || !currentInstanceId) return;

  const windowState = getCurrentWindowState();
  if (!windowState) return;

  // Load current instance session and update window state
  const session = await loadInstanceSession(currentInstanceId);
  if (session) {
    session.windowState = windowState;
    session.lastOpened = new Date().toISOString();
    await saveInstanceSession(session);
  }
}

// Debounced version for frequent events (move/resize)
const debouncedSaveWindowState = debounce(() => {
  saveCurrentWindowState();
}, 500);

/**
 * Setup window state tracking events
 */
function setupWindowStateTracking(): void {
  if (!mainWindow) return;

  // Debounced save for frequent events
  mainWindow.on('move', () => {
    if (!mainWindow?.isMaximized() && !mainWindow?.isFullScreen()) {
      debouncedSaveWindowState();
    }
  });

  mainWindow.on('resize', () => {
    if (!mainWindow?.isMaximized() && !mainWindow?.isFullScreen()) {
      debouncedSaveWindowState();
    }
  });

  // Immediate save for state changes
  mainWindow.on('maximize', () => {
    saveCurrentWindowState();
  });

  mainWindow.on('unmaximize', () => {
    saveCurrentWindowState();
  });

  mainWindow.on('enter-full-screen', () => {
    saveCurrentWindowState();
  });

  mainWindow.on('leave-full-screen', () => {
    saveCurrentWindowState();
  });
}

/**
 * Create the main application window
 */
async function createWindow(): Promise<void> {
  // Determine instance ID and load session
  ensureAppDataDirs();

  // Check for legacy session to migrate
  const migratedInstanceId = await migrateLegacySession();

  // Load instances index
  const instancesIndex = await loadInstancesIndex();

  // Determine which instance to use
  let instanceSession: InstanceSession | null = null;

  if (migratedInstanceId) {
    // Use migrated session (and acquire lock)
    if (tryAcquireInstanceLock(migratedInstanceId)) {
      currentInstanceId = migratedInstanceId;
      instanceSession = await loadInstanceSession(migratedInstanceId);
    }
  }

  // Try to restore last used instance if not already set
  if (!currentInstanceId && instancesIndex.lastUsedInstanceId) {
    // Try to acquire lock for last used instance
    if (tryAcquireInstanceLock(instancesIndex.lastUsedInstanceId)) {
      currentInstanceId = instancesIndex.lastUsedInstanceId;
      instanceSession = await loadInstanceSession(instancesIndex.lastUsedInstanceId);
    } else {
      // Last used instance is locked, create new instance
      console.log(`[Session] Last used instance is in use, creating new instance`);
    }
  }

  // If no existing instance (or locked), create new one
  if (!currentInstanceId) {
    currentInstanceId = generateInstanceId();
    tryAcquireInstanceLock(currentInstanceId);
    console.log(`[Session] Created new instance: ${currentInstanceId}`);
  }

  // Determine window bounds
  let windowBounds = { x: undefined as number | undefined, y: undefined as number | undefined, width: 1200, height: 800 };
  let shouldMaximize = false;
  let shouldFullScreen = false;

  if (instanceSession?.windowState) {
    const restored = restoreWindowBounds(instanceSession.windowState);
    windowBounds = { x: restored.x, y: restored.y, width: restored.width, height: restored.height };
    shouldMaximize = instanceSession.windowState.isMaximized;
    shouldFullScreen = instanceSession.windowState.isFullScreen;
  }

  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    x: windowBounds.x,
    y: windowBounds.y,
    title: 'MD++ Editor',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      spellcheck: true,
    },
    show: false, // Show after positioning
    backgroundColor: '#1e1e1e',
  });

  // Apply window state (maximize/fullscreen)
  if (shouldMaximize) {
    mainWindow.maximize();
  }
  if (shouldFullScreen) {
    mainWindow.setFullScreen(true);
  }

  // Setup window state tracking
  setupWindowStateTracking();

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
    // Release instance lock when window closes
    if (currentInstanceId) {
      releaseInstanceLock(currentInstanceId);
    }
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

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) return;

    const bounds = mainWindow.getBounds();

    // Force visibility
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true);
    mainWindow.focus();

    // Remove always-on-top after a short delay
    setTimeout(() => {
      mainWindow?.setAlwaysOnTop(false);
    }, 500);

    console.log('Window shown on display at:', bounds.x, bounds.y);

    // Initialize app (session restore or welcome)
    initializeApp();
  });

  // Create application menu
  createMenu();
}

/**
 * Initialize app on startup - setup welcome file
 * Note: Session restore is handled entirely by the renderer (App.tsx initializeApp)
 * to avoid race conditions and duplicate tab creation
 */
async function initializeApp(): Promise<void> {
  // Setup welcome file (makes it available for renderer to load if needed)
  await setupWelcomeFile();

  // Rebuild menu with loaded recent files
  createMenu();

  console.log('Main process initialization complete');
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
          label: 'Welcome',
          click: () => mainWindow?.webContents.send('menu-action', 'open-welcome'),
        },
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

/**
 * Load all plugins from the plugins directory
 * @see https://beyondco.de/blog/plugin-system-for-electron-apps-part-1
 */
ipcMain.handle('load-plugins', async () => {
  const pluginsPath = getPluginsPath();
  const plugins: Array<{
    id: string;
    framework: string;
    version: string;
    author?: string;
    description?: string;
    css?: string[];
    js?: string[];
    components: Record<string, unknown>;
  }> = [];

  try {
    if (!existsSync(pluginsPath)) {
      console.log('Plugins directory does not exist:', pluginsPath);
      return plugins;
    }

    const files = await readdir(pluginsPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = join(pluginsPath, file);
          const content = await readFile(filePath, 'utf-8');
          const pluginData = JSON.parse(content);

          // Validate plugin structure
          if (pluginData.framework && pluginData.components) {
            plugins.push({
              id: basename(file, '.json'),
              framework: pluginData.framework,
              version: pluginData.version || '1.0.0',
              author: pluginData.author,
              description: pluginData.description,
              css: pluginData.css,
              js: pluginData.js,
              components: pluginData.components,
            });
          }
        } catch (error) {
          console.error(`Failed to load plugin ${file}:`, error);
        }
      }
    }

    console.log(`Loaded ${plugins.length} plugins`);
    return plugins;
  } catch (error) {
    console.error('Failed to load plugins:', error);
    return plugins;
  }
});

ipcMain.handle('get-plugin-path', () => {
  return getPluginsPath();
});

// ============================================
// Session & Recovery IPC Handlers
// ============================================

// Get current instance session (replaces legacy get-session)
ipcMain.handle('get-session', async () => {
  if (!currentInstanceId) {
    return null;
  }
  const session = await loadInstanceSession(currentInstanceId);
  // Return in legacy format for backward compatibility with renderer
  if (session) {
    return {
      version: session.version,
      lastOpened: session.lastOpened,
      activeTabId: session.activeTabId,
      tabs: session.tabs,
      recentFiles: session.recentFiles,
    } as SessionState;
  }
  return null;
});

// Save session (converts to instance session internally)
ipcMain.handle('save-session', async (_, session: SessionState) => {
  await saveSession(session);
  // Update recent files in memory for menu
  if (session.recentFiles) {
    recentFiles = session.recentFiles.map(rf => rf.path);
    createMenu();
  }
});

// ============================================
// Instance Management IPC Handlers
// ============================================

// Get current instance ID
ipcMain.handle('get-instance-id', () => {
  return currentInstanceId;
});

// Get all instances
ipcMain.handle('get-all-instances', async () => {
  const index = await loadInstancesIndex();
  return {
    instances: index.instances,
    lastUsedInstanceId: index.lastUsedInstanceId,
  };
});

// Get current window state
ipcMain.handle('get-window-state', () => {
  return getCurrentWindowState();
});

// Delete an instance
ipcMain.handle('delete-instance', async (_, instanceId: string) => {
  await deleteInstanceSession(instanceId);
  await removeInstanceFromIndex(instanceId);
});

// Rename an instance
ipcMain.handle('rename-instance', async (_, instanceId: string, newName: string) => {
  const index = await loadInstancesIndex();
  if (index.instances[instanceId]) {
    index.instances[instanceId].displayName = newName;
    await saveInstancesIndex(index);
  }
});

ipcMain.handle('save-recovery', async (_, tabId: string, content: string) => {
  await saveRecoveryFile(tabId, content);
});

ipcMain.handle('read-recovery', async (_, tabId: string) => {
  return await readRecoveryFile(tabId);
});

ipcMain.handle('delete-recovery', async (_, tabId: string) => {
  await deleteRecoveryFile(tabId);
});

ipcMain.handle('cleanup-recovery', async (_, validTabIds: string[]) => {
  await cleanupRecoveryFiles(validTabIds);
});

ipcMain.handle('get-app-paths', () => {
  return {
    appData: APP_DATA_PATH,
    recovery: RECOVERY_DIR,
    welcome: APP_WELCOME_FILE,
    session: SESSION_FILE, // Legacy path
    sessions: SESSIONS_DIR,
  };
});

ipcMain.handle('get-welcome-content', async () => {
  return await getWelcomeContent();
});

ipcMain.handle('get-welcome-path', () => {
  return APP_WELCOME_FILE;
});

// ============================================
// Settings Storage IPC Handlers (JSON files)
// ============================================

const SETTINGS_DIR = join(APP_DATA_PATH, 'settings');

/**
 * Ensure settings directory exists
 */
function ensureSettingsDir(): void {
  if (!existsSync(SETTINGS_DIR)) {
    mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}

/**
 * Get the path for a settings file
 */
function getSettingsFilePath(key: string): string {
  // Sanitize key to prevent directory traversal
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return join(SETTINGS_DIR, `${safeKey}.json`);
}

ipcMain.handle('load-settings', async (_, key: string) => {
  try {
    const filePath = getSettingsFilePath(key);
    const backupPath = `${filePath}.backup`;

    if (existsSync(filePath)) {
      const content = await readFile(filePath, 'utf-8');

      // Try to parse the content
      try {
        const parsed = JSON.parse(content);
        console.log(`[Settings] Loaded ${key} from:`, filePath);

        // Create a backup of the successfully loaded file
        await writeFile(backupPath, content, 'utf-8');

        return parsed;
      } catch (parseError) {
        console.error(`[Settings] JSON parse error for ${key}, trying backup:`, parseError);

        // Try loading from backup if main file is corrupted
        if (existsSync(backupPath)) {
          const backupContent = await readFile(backupPath, 'utf-8');
          const backupParsed = JSON.parse(backupContent);
          console.log(`[Settings] Restored ${key} from backup`);
          return backupParsed;
        }

        throw parseError;
      }
    }
    console.log(`[Settings] No file found for ${key} at:`, filePath);
    return null;
  } catch (error) {
    console.error(`[Settings] Failed to load ${key}:`, error);
    return null;
  }
});

ipcMain.handle('save-settings', async (_, key: string, data: unknown) => {
  try {
    ensureSettingsDir();
    const filePath = getSettingsFilePath(key);
    const tempPath = `${filePath}.tmp`;
    const jsonContent = JSON.stringify(data, null, 2);

    // Write to temp file first, then rename (atomic operation)
    await writeFile(tempPath, jsonContent, 'utf-8');

    // On Windows, we need to remove the target file first if it exists
    if (existsSync(filePath)) {
      await rm(filePath);
    }

    // Rename temp file to final file (atomic operation)
    await rename(tempPath, filePath);

    console.log(`[Settings] Saved ${key} to:`, filePath);
    return true;
  } catch (error) {
    console.error(`[Settings] Failed to save ${key}:`, error);
    return false;
  }
});

/**
 * Get the path to the plugins directory
 */
function getPluginsPath(): string {
  // In development, use the project's plugins directory
  // In production, use the app's resources directory
  const devPath = join(__dirname, '../../plugins');
  const prodPath = join(process.resourcesPath || '', 'plugins');

  if (existsSync(devPath)) {
    return devPath;
  } else if (existsSync(prodPath)) {
    return prodPath;
  }

  // Fallback to development path (will be created if needed)
  return devPath;
}

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
  // Release instance lock before quitting
  if (currentInstanceId) {
    releaseInstanceLock(currentInstanceId);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Also release lock on app quit (covers edge cases)
app.on('will-quit', () => {
  if (currentInstanceId) {
    releaseInstanceLock(currentInstanceId);
  }
});

// Handle file drop
app.on('open-file', async (event, path) => {
  event.preventDefault();
  if (mainWindow) {
    await openFilePath(path);
  }
});
