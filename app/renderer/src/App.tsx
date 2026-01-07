/**
 * MD++ Editor - Main Application Component
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import EditorPane, { EditorPaneRef } from './components/EditorPane';
import Preview from './components/Preview';
import Toolbar, { Theme } from './components/Toolbar';
import StatusBar from './components/StatusBar';
import Sidebar from './components/Sidebar';
import SettingsDialog, { ParserSettings, DEFAULT_SETTINGS } from './components/SettingsDialog';
import SearchReplace from './components/SearchReplace';
import HelpDialog from './components/HelpDialog';
import TableEditor from './components/TableEditor';
import ThemeEditor, { getCustomThemeForExport } from './components/ThemeEditor';
import PluginManager, { PluginInfo, ComponentInfo } from './components/PluginManager';
import TabBar, { TabData } from './components/TabBar/TabBar';
import { useScrollSync } from './hooks/useScrollSync';
import type { ViewMode, PluginData, SessionState, TabState as IpcTabState } from '../../electron/preload';

// Empty content for new files
const NEW_FILE_CONTENT = '';

// Helper to generate unique tab IDs
function generateTabId(): string {
  return crypto.randomUUID();
}

// Helper to extract filename from path
function getFileName(filePath: string | null): string {
  if (!filePath) return 'Untitled';
  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 1] || 'Untitled';
}

// Welcome content is now loaded from external file (resources/welcome.md)
// See: app/electron/main.ts setupWelcomeFile() and getWelcomeContent()

export default function App() {
  // Multi-tab state
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Derived state from active tab
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const content = activeTab?.content ?? '';
  const filePath = activeTab?.filePath ?? null;
  const isModified = activeTab?.isModified ?? false;

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showAIContext, setShowAIContext] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ParserSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<Theme>('dark');
  const editorRef = useRef<EditorPaneRef | null>(null);

  // Refs to track current values for IPC handlers (avoids stale closures)
  const contentRef = useRef(content);
  const filePathRef = useRef(filePath);
  const themeRef = useRef(theme);
  const tabsRef = useRef(tabs);
  const activeTabIdRef = useRef(activeTabId);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  useEffect(() => {
    filePathRef.current = filePath;
  }, [filePath]);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);
  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  // New feature states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'find' | 'replace'>('find');
  const [helpOpen, setHelpOpen] = useState(false);
  const [tableEditorOpen, setTableEditorOpen] = useState(false);
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);
  const [pluginManagerOpen, setPluginManagerOpen] = useState(false);
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scroll sync state
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(true);

  // Scroll sync hook - only active in split view
  const {
    previewRef: scrollSyncPreviewRef,
    handleEditorScroll,
    handlePreviewScroll,
    registerEditor,
  } = useScrollSync({
    enabled: scrollSyncEnabled && viewMode === 'split',
    debounceMs: 50,
    direction: 'bidirectional',
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // === TAB MANAGEMENT ===

  // Create a new tab
  const createTab = useCallback((filePathArg?: string | null, contentArg?: string): TabData => {
    const id = generateTabId();
    return {
      id,
      filePath: filePathArg ?? null,
      title: getFileName(filePathArg ?? null),
      isModified: false,
      content: contentArg ?? NEW_FILE_CONTENT,
    };
  }, []);

  // Add a new empty tab
  const handleNewTab = useCallback(() => {
    const newTab = createTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [createTab]);

  // Select a tab
  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  // Update content of active tab
  const updateActiveTabContent = useCallback((newContent: string) => {
    if (!activeTabId) return;
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, content: newContent, isModified: true }
          : tab
      )
    );
  }, [activeTabId]);

  // Mark active tab as saved
  const markActiveTabSaved = useCallback((newFilePath?: string) => {
    if (!activeTabId) return;
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              isModified: false,
              filePath: newFilePath ?? tab.filePath,
              title: getFileName(newFilePath ?? tab.filePath),
            }
          : tab
      )
    );
  }, [activeTabId]);

  // Close a tab
  const handleTabClose = useCallback(async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // If tab is modified, we let the user decide (auto-recovery saves anyway)
    // But we should still prompt
    if (tab.isModified) {
      // For now, just close - recovery system will have saved state
      // In a full implementation, show a dialog
      console.log(`Closing modified tab: ${tab.title}`);
    }

    // Delete recovery file
    try {
      await window.electronAPI?.deleteRecovery(tabId);
    } catch (e) {
      console.error('Failed to delete recovery file:', e);
    }

    // Remove tab
    const remainingTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(remainingTabs);

    // If we closed the active tab, switch to another
    if (tabId === activeTabId) {
      if (remainingTabs.length > 0) {
        // Switch to the last tab
        setActiveTabId(remainingTabs[remainingTabs.length - 1].id);
      } else {
        // No tabs left, create a new one with welcome content
        loadWelcomeAndCreateTab();
      }
    }
  }, [tabs, activeTabId]);

  // Load welcome content and create initial tab
  const loadWelcomeAndCreateTab = useCallback(async () => {
    try {
      const welcomeContent = await window.electronAPI?.getWelcomeContent();
      const welcomePath = await window.electronAPI?.getWelcomePath();
      const newTab = createTab(welcomePath ?? null, welcomeContent ?? '# Welcome to MD++');
      setTabs([newTab]);
      setActiveTabId(newTab.id);
    } catch (e) {
      console.error('Failed to load welcome content:', e);
      const newTab = createTab(null, '# Welcome to MD++\n\nStart writing...');
      setTabs([newTab]);
      setActiveTabId(newTab.id);
    }
  }, [createTab]);

  // Open a file in a new tab or existing tab
  const openFileInTab = useCallback((openFilePath: string, openContent: string) => {
    // Check if file is already open
    const existingTab = tabs.find((t) => t.filePath === openFilePath);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      // Update content if it changed on disk
      setTabs((prev) =>
        prev.map((t) =>
          t.id === existingTab.id && !t.isModified
            ? { ...t, content: openContent }
            : t
        )
      );
      return;
    }

    // Create new tab
    const newTab = createTab(openFilePath, openContent);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs, createTab]);

  // === SESSION MANAGEMENT ===

  // Save session state
  const saveSessionState = useCallback(async () => {
    if (!isInitialized || tabs.length === 0) return;

    const sessionState: SessionState = {
      version: 1,
      lastOpened: new Date().toISOString(),
      activeTabId: activeTabId ?? '',
      tabs: tabs.map((tab) => ({
        id: tab.id,
        filePath: tab.filePath,
        title: tab.title,
        isModified: tab.isModified,
        recoveryFile: tab.isModified ? `${tab.id}.md` : undefined,
      })),
      recentFiles: [], // Will be managed separately
    };

    try {
      await window.electronAPI?.saveSession(sessionState);
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, [tabs, activeTabId, isInitialized]);

  // Auto-save session when tabs change
  useEffect(() => {
    if (isInitialized) {
      saveSessionState();
    }
  }, [tabs, activeTabId, isInitialized, saveSessionState]);

  // Initialize app - restore session or show welcome
  useEffect(() => {
    async function initializeApp() {
      if (isInitialized) return;

      try {
        const session = await window.electronAPI?.getSession();

        if (session && session.tabs && session.tabs.length > 0) {
          // Restore session
          const restoredTabs: TabData[] = await Promise.all(
            session.tabs.map(async (tabState: IpcTabState) => {
              let tabContent = '';

              // Try to load recovery file for modified tabs
              if (tabState.isModified) {
                const recoveryContent = await window.electronAPI?.readRecovery(tabState.id);
                if (recoveryContent) {
                  tabContent = recoveryContent;
                }
              }

              // If no recovery content, try to load from file
              if (!tabContent && tabState.filePath) {
                const result = await window.electronAPI?.readFile(tabState.filePath);
                if (result?.success && result.content) {
                  tabContent = result.content;
                }
              }

              return {
                id: tabState.id,
                filePath: tabState.filePath,
                title: tabState.title,
                isModified: tabState.isModified,
                content: tabContent,
              };
            })
          );

          // Filter out tabs that couldn't be restored
          const validTabs = restoredTabs.filter((t) => t.content !== '' || t.filePath === null);

          if (validTabs.length > 0) {
            setTabs(validTabs);
            // Restore active tab or default to first
            const activeId = validTabs.find((t) => t.id === session.activeTabId)?.id ?? validTabs[0].id;
            setActiveTabId(activeId);
            setIsInitialized(true);
            console.log(`Restored session with ${validTabs.length} tabs`);
            return;
          }
        }

        // No session or empty session - load welcome
        await loadWelcomeAndCreateTab();
        setIsInitialized(true);
      } catch (e) {
        console.error('Failed to initialize app:', e);
        // Fallback to welcome
        await loadWelcomeAndCreateTab();
        setIsInitialized(true);
      }
    }

    initializeApp();
  }, [isInitialized, loadWelcomeAndCreateTab]);

  // Load plugins on startup
  const loadPlugins = useCallback(async () => {
    if (!window.electronAPI?.loadPlugins) return;

    try {
      const loadedPlugins = await window.electronAPI.loadPlugins();

      // Convert PluginData to PluginInfo with enabled state
      const pluginInfos: PluginInfo[] = loadedPlugins.map((p: PluginData) => ({
        id: p.id,
        framework: p.framework,
        version: p.version,
        author: p.author,
        description: p.description,
        css: p.css,
        js: p.js,
        components: p.components as Record<string, ComponentInfo>,
        enabled: settings.enabledPlugins.includes(p.id),
      }));

      setPlugins(pluginInfos);
      console.log(`Loaded ${pluginInfos.length} plugins`);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  }, [settings.enabledPlugins]);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  // Handle plugin toggle
  const handlePluginToggle = useCallback((pluginId: string) => {
    setSettings((prev) => {
      const enabledPlugins = prev.enabledPlugins.includes(pluginId)
        ? prev.enabledPlugins.filter((id) => id !== pluginId)
        : [...prev.enabledPlugins, pluginId];
      return { ...prev, enabledPlugins };
    });

    // Update plugin enabled state
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId ? { ...p, enabled: !p.enabled } : p
      )
    );
  }, []);

  // Auto-recovery functionality (saves to recovery folder, not original file)
  useEffect(() => {
    if (activeTab?.isModified && activeTabId) {
      // Clear any existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set up auto-recovery after 5 seconds of inactivity
      autoSaveTimeoutRef.current = setTimeout(async () => {
        setAutoSaveStatus('saving');
        try {
          await window.electronAPI?.saveRecovery(activeTabId, activeTab.content);
          setAutoSaveStatus('saved');
          // Reset status after 2 seconds
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } catch (error) {
          console.error('Auto-recovery failed:', error);
          setAutoSaveStatus('idle');
        }
      }, 5000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [activeTab?.content, activeTab?.isModified, activeTabId]);

  // Drag & drop handlers
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set to false if leaving the window
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.name.match(/\.(md|mdpp|markdown|txt)$/i)) {
          // The main process will handle opening via will-navigate
          // We just need to allow the default behavior
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Handle content changes - updates active tab
  const handleContentChange = useCallback((newContent: string) => {
    updateActiveTabContent(newContent);
    window.electronAPI?.setModified(true);
  }, [updateActiveTabContent]);

  // Set up electron IPC handlers - file operations (no content dependency)
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    // Handle content requests from main process - uses ref to avoid stale closure
    const unsubGetContent = window.electronAPI.onGetContent(() => {
      window.electronAPI.sendContent(contentRef.current);
    });

    // Handle new file - create new tab
    const unsubNew = window.electronAPI.onFileNew(() => {
      const newTab: TabData = {
        id: generateTabId(),
        filePath: null,
        title: 'Untitled',
        isModified: false,
        content: NEW_FILE_CONTENT,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
      window.electronAPI.setModified(false);
    });

    // Handle file opened - open in new tab or switch to existing
    const unsubOpened = window.electronAPI.onFileOpened((data) => {
      // Check if file is already open
      const existingTab = tabsRef.current.find((t) => t.filePath === data.path);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        // Update content if not modified
        setTabs((prev) =>
          prev.map((t) =>
            t.id === existingTab.id && !t.isModified
              ? { ...t, content: data.content }
              : t
          )
        );
      } else {
        // Create new tab
        const newTab: TabData = {
          id: generateTabId(),
          filePath: data.path,
          title: getFileName(data.path),
          isModified: false,
          content: data.content,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
      window.electronAPI.setModified(false);
    });

    // Handle file saved - update active tab
    const unsubSaved = window.electronAPI.onFileSaved((path) => {
      const currentActiveId = activeTabIdRef.current;
      if (currentActiveId) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === currentActiveId
              ? {
                  ...t,
                  isModified: false,
                  filePath: path,
                  title: getFileName(path),
                }
              : t
          )
        );
        // Delete recovery file since we saved
        window.electronAPI.deleteRecovery(currentActiveId).catch(console.error);
      }
      window.electronAPI.setModified(false);
    });

    // Handle welcome menu action
    const unsubSessionRestore = window.electronAPI.onSessionRestore?.(async () => {
      // Reload welcome file
      try {
        const welcomeContent = await window.electronAPI.getWelcomeContent();
        const welcomePath = await window.electronAPI.getWelcomePath();
        const newTab: TabData = {
          id: generateTabId(),
          filePath: welcomePath,
          title: getFileName(welcomePath),
          isModified: false,
          content: welcomeContent,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
      } catch (e) {
        console.error('Failed to open welcome file:', e);
      }
    });

    // Handle view mode changes
    const unsubViewMode = window.electronAPI.onViewMode((mode) => {
      setViewMode(mode);
    });

    // Handle menu actions
    const unsubMenuAction = window.electronAPI.onMenuAction((action) => {
      if (action === 'toggle-ai-context') {
        setShowAIContext((prev) => !prev);
      } else if (action === 'find') {
        setSearchMode('find');
        setSearchOpen(true);
      } else if (action === 'replace') {
        setSearchMode('replace');
        setSearchOpen(true);
      } else if (action === 'insert-table') {
        setTableEditorOpen(true);
      } else if (action === 'show-help') {
        setHelpOpen(true);
      }
    });

    // Handle insert actions
    const unsubInsert = window.electronAPI.onInsert((text) => {
      editorRef.current?.insert(text);
    });

    const unsubInsertWrap = window.electronAPI.onInsertWrap((wrapper) => {
      editorRef.current?.insertWrap(wrapper);
    });

    // Handle exports
    const unsubExportHTML = window.electronAPI.onExportHTML(async ({ filePath: exportPath, theme: exportTheme }) => {
      // Use the theme selected by user in the dialog
      const isDark = exportTheme === 'dark';

      // Get custom theme colors from Theme Editor
      const customTheme = getCustomThemeForExport(isDark);

      // MD++ Export CSS - Theme-aware
      const exportCSS = `
/* MD++ Export Styles - ${isDark ? 'Dark' : 'Light'} Theme */
:root {
  --bg-primary: ${customTheme['--bg-primary']};
  --bg-secondary: ${customTheme['--bg-secondary']};
  --bg-card: ${customTheme['--bg-card']};
  --text-primary: ${customTheme['--text-primary']};
  --text-secondary: ${customTheme['--text-secondary']};
  --accent: ${customTheme['--accent']};
  --accent-hover: ${customTheme['--accent-hover']};
  --accent-light: ${customTheme['--accent-light']};
  --success: ${customTheme['--color-success']};
  --warning: ${customTheme['--color-warning']};
  --error: ${customTheme['--color-error']};
  --border: ${customTheme['--border-color']};
  --code-bg: ${customTheme['--bg-code']};
  --code-text: ${customTheme['--text-code']};
  --inline-code-bg: ${customTheme['--bg-card']};
  --inline-code-text: ${customTheme['--accent-light']};
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.7;
}

/* Headings */
h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--accent);
  color: var(--text-primary);
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--accent-light);
}

h4, h5, h6 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

p {
  margin: 0.75rem 0;
}

/* Links */
a {
  color: var(--accent-light);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s;
}

a:hover {
  border-bottom-color: var(--accent-light);
}

strong {
  font-weight: 600;
  color: var(--text-primary);
}

em {
  font-style: italic;
  color: var(--text-secondary);
}

/* Lists */
ul, ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.375rem;
}

li::marker {
  color: var(--accent);
}

/* Code */
code {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  background-color: var(--inline-code-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  color: var(--inline-code-text);
}

pre {
  background-color: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

pre code {
  background: none;
  padding: 0;
  font-size: 0.875rem;
  color: var(--code-text);
}

/* Blockquotes */
blockquote {
  border-left: 4px solid var(--accent);
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  background-color: rgba(124, 58, 237, 0.1);
  border-radius: 0 0.5rem 0.5rem 0;
  color: var(--text-secondary);
}

blockquote p {
  margin: 0;
}

/* Horizontal Rule */
hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  border: 1px solid var(--border);
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: var(--bg-secondary);
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: rgba(51, 65, 85, 0.3);
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* AI Context Blocks */
.mdpp-ai-context {
  background-color: rgba(124, 58, 237, 0.15);
  border: 2px dashed var(--accent);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  position: relative;
}

.mdpp-ai-context::before {
  content: 'AI Context';
  position: absolute;
  top: -0.75rem;
  left: 1rem;
  background-color: var(--bg-primary);
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
}

/* Card & Alert Components */
[class*="card"] {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
}

[class*="alert"] {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-left: 4px solid #3B82F6;
  border-radius: 0 0.5rem 0.5rem 0;
  padding: 1rem;
  margin: 1rem 0;
  color: #93C5FD;
}

[class*="alert-success"], .alert-success {
  border-left-color: var(--success);
  background-color: rgba(16, 185, 129, 0.1);
  color: #6EE7B7;
}

[class*="alert-warning"], .alert-warning {
  border-left-color: var(--warning);
  background-color: rgba(245, 158, 11, 0.1);
  color: #FCD34D;
}

[class*="alert-danger"], .alert-danger, [class*="alert-error"], .alert-error {
  border-left-color: var(--error);
  background-color: rgba(239, 68, 68, 0.1);
  color: #FCA5A5;
}

/* Callout Styles (GitHub/Obsidian) */
.callout, .admonition {
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid;
  border-radius: 0 0.5rem 0.5rem 0;
  background-color: rgba(51, 65, 85, 0.5);
}

.callout-note, .admonition-note {
  border-color: #3B82F6;
  background-color: rgba(59, 130, 246, 0.1);
}

.callout-tip, .admonition-tip, .callout-hint, .admonition-hint {
  border-color: #10B981;
  background-color: rgba(16, 185, 129, 0.1);
}

.callout-warning, .admonition-warning, .callout-caution, .admonition-caution {
  border-color: #F59E0B;
  background-color: rgba(245, 158, 11, 0.1);
}

.callout-danger, .admonition-danger, .callout-error, .admonition-error {
  border-color: #EF4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.callout-important, .admonition-important {
  border-color: #8B5CF6;
  background-color: rgba(139, 92, 246, 0.1);
}

.callout-title, .admonition-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Math Styles */
.math {
  font-family: 'KaTeX_Math', 'Times New Roman', serif;
}

.math-display {
  display: block;
  text-align: center;
  margin: 1rem 0;
  overflow-x: auto;
}

.math-inline {
  display: inline;
}

/* Mermaid Diagrams */
.mermaid {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  text-align: center;
}

/* Task List Checkboxes */
input[type="checkbox"] {
  margin-right: 0.5rem;
  accent-color: var(--accent);
}

/* Strikethrough */
del {
  color: var(--text-secondary);
  text-decoration: line-through;
}

/* Footnotes */
.footnotes {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.footnote-ref {
  color: var(--accent);
  text-decoration: none;
  vertical-align: super;
  font-size: 0.75em;
}

.footnote-backref {
  color: var(--accent-light);
  text-decoration: none;
  margin-left: 0.25rem;
}

/* Selection */
::selection {
  background-color: var(--accent);
  color: white;
}
`;

      // Create full HTML document with Mermaid support
      const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filePathRef.current?.split(/[\\/]/).pop() || 'MD++ Export'}</title>
  <style>${exportCSS}</style>
  <!-- Mermaid for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <!-- KaTeX for math rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <!-- Highlight.js for syntax highlighting -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/${isDark ? 'atom-one-dark' : 'atom-one-light'}.min.css">
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11/lib/common.min.js"></script>
</head>
<body>
${document.querySelector('.preview-content')?.innerHTML || ''}
<script>
  // Initialize Mermaid with ${isDark ? 'dark' : 'default'} theme
  mermaid.initialize({
    startOnLoad: false,
    theme: '${isDark ? 'dark' : 'default'}',
    securityLevel: 'loose'
  });

  // Re-render Mermaid diagrams and KaTeX math
  document.addEventListener('DOMContentLoaded', async () => {
    // Mermaid diagrams
    const mermaidElements = document.querySelectorAll('.mermaid');
    if (mermaidElements.length > 0) {
      mermaidElements.forEach((el, index) => {
        el.removeAttribute('data-processed');
        el.id = 'mermaid-export-' + index;
      });
      await mermaid.run({ nodes: mermaidElements });
    }

    // KaTeX math
    const mathElements = document.querySelectorAll('.math');
    mathElements.forEach((el) => {
      const isDisplay = el.classList.contains('math-display');
      const mathContent = el.textContent || '';
      if (!el.querySelector('.katex')) {
        try {
          katex.render(mathContent, el, {
            displayMode: isDisplay,
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX error:', e);
        }
      }
    });

    // Syntax highlighting
    document.querySelectorAll('pre code').forEach((block) => {
      if (!block.classList.contains('hljs') && !block.closest('.mermaid')) {
        hljs.highlightElement(block);
      }
    });
  });
</script>
</body>
</html>`;
      await window.electronAPI.writeFile(exportPath, htmlContent);
    });

    const unsubExportPDF = window.electronAPI.onExportPDF(async ({ filePath: exportPath, theme: exportTheme }) => {
      // Use the theme selected by user in the dialog
      const isDark = exportTheme === 'dark';

      // Get custom theme colors from Theme Editor
      const customTheme = getCustomThemeForExport(isDark);

      // PDF Export CSS - Theme-aware (similar to HTML but optimized for print)
      const exportCSS = `
/* MD++ PDF Export Styles - ${isDark ? 'Dark' : 'Light'} Theme */
:root {
  --bg-primary: ${customTheme['--bg-primary']};
  --bg-secondary: ${customTheme['--bg-secondary']};
  --bg-card: ${customTheme['--bg-card']};
  --text-primary: ${customTheme['--text-primary']};
  --text-secondary: ${customTheme['--text-secondary']};
  --accent: ${customTheme['--accent']};
  --accent-hover: ${customTheme['--accent-hover']};
  --accent-light: ${customTheme['--accent-light']};
  --success: ${customTheme['--color-success']};
  --warning: ${customTheme['--color-warning']};
  --error: ${customTheme['--color-error']};
  --border: ${customTheme['--border-color']};
  --code-bg: ${customTheme['--bg-code']};
  --code-text: ${customTheme['--text-code']};
  --inline-code-bg: ${customTheme['--bg-card']};
  --inline-code-text: ${customTheme['--accent-light']};
}

@media print {
  @page {
    margin: 1.5cm;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  max-width: 100%;
  padding: 0;
  line-height: 1.7;
  font-size: 11pt;
}

/* Headings */
h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.75rem;
  padding-bottom: 0.375rem;
  border-bottom: 2px solid var(--accent);
  color: var(--text-primary);
  page-break-after: avoid;
}

h2 {
  font-size: 1.375rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  page-break-after: avoid;
}

h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.375rem;
  color: var(--accent-light);
  page-break-after: avoid;
}

h4, h5, h6 {
  margin-top: 0.75rem;
  margin-bottom: 0.375rem;
  color: var(--text-primary);
  page-break-after: avoid;
}

p {
  margin: 0.5rem 0;
}

/* Links */
a {
  color: var(--accent-light);
  text-decoration: none;
}

strong {
  font-weight: 600;
  color: var(--text-primary);
}

em {
  font-style: italic;
  color: var(--text-secondary);
}

/* Lists */
ul, ol {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
}

li {
  margin-bottom: 0.25rem;
}

li::marker {
  color: var(--accent);
}

/* Code */
code {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  background-color: var(--inline-code-bg);
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.85em;
  color: var(--inline-code-text);
}

pre {
  background-color: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 0.75rem;
  overflow-x: auto;
  margin: 0.75rem 0;
  page-break-inside: avoid;
}

pre code {
  background: none;
  padding: 0;
  font-size: 0.8rem;
  color: var(--code-text);
}

/* Blockquotes */
blockquote {
  border-left: 3px solid var(--accent);
  margin: 0.75rem 0;
  padding: 0.5rem 0.75rem;
  background-color: rgba(124, 58, 237, 0.1);
  border-radius: 0 0.375rem 0.375rem 0;
  color: var(--text-secondary);
  page-break-inside: avoid;
}

blockquote p {
  margin: 0;
}

/* Horizontal Rule */
hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.5rem 0;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.9em;
  page-break-inside: avoid;
}

th, td {
  border: 1px solid var(--border);
  padding: 0.5rem;
  text-align: left;
}

th {
  background-color: var(--bg-secondary);
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: rgba(51, 65, 85, 0.2);
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 0.75rem 0;
}

/* AI Context Blocks */
.mdpp-ai-context {
  background-color: rgba(124, 58, 237, 0.15);
  border: 2px dashed var(--accent);
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin: 0.75rem 0;
  position: relative;
  page-break-inside: avoid;
}

.mdpp-ai-context::before {
  content: 'AI Context';
  position: absolute;
  top: -0.625rem;
  left: 0.75rem;
  background-color: var(--bg-primary);
  padding: 0 0.375rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--accent);
}

/* Card & Alert Components */
[class*="card"] {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin: 0.75rem 0;
  page-break-inside: avoid;
}

[class*="alert"] {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-left: 3px solid #3B82F6;
  border-radius: 0 0.375rem 0.375rem 0;
  padding: 0.75rem;
  margin: 0.75rem 0;
  color: #93C5FD;
  page-break-inside: avoid;
}

[class*="alert-success"], .alert-success {
  border-left-color: var(--success);
  background-color: rgba(16, 185, 129, 0.1);
  color: #6EE7B7;
}

[class*="alert-warning"], .alert-warning {
  border-left-color: var(--warning);
  background-color: rgba(245, 158, 11, 0.1);
  color: #FCD34D;
}

[class*="alert-danger"], .alert-danger, [class*="alert-error"], .alert-error {
  border-left-color: var(--error);
  background-color: rgba(239, 68, 68, 0.1);
  color: #FCA5A5;
}

/* Callout Styles */
.callout, .admonition {
  padding: 0.75rem;
  margin: 0.75rem 0;
  border-left: 3px solid;
  border-radius: 0 0.375rem 0.375rem 0;
  background-color: rgba(51, 65, 85, 0.3);
  page-break-inside: avoid;
}

.callout-note, .admonition-note {
  border-color: #3B82F6;
  background-color: rgba(59, 130, 246, 0.1);
}

.callout-tip, .admonition-tip {
  border-color: #10B981;
  background-color: rgba(16, 185, 129, 0.1);
}

.callout-warning, .admonition-warning {
  border-color: #F59E0B;
  background-color: rgba(245, 158, 11, 0.1);
}

.callout-danger, .admonition-danger {
  border-color: #EF4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.callout-title, .admonition-title {
  font-weight: 600;
  margin-bottom: 0.375rem;
}

/* Math Styles */
.math {
  font-family: 'KaTeX_Math', 'Times New Roman', serif;
}

.math-display {
  display: block;
  text-align: center;
  margin: 0.75rem 0;
  overflow-x: auto;
}

/* Mermaid Diagrams - hide in PDF, show placeholder */
.mermaid {
  background-color: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin: 0.75rem 0;
  text-align: center;
  page-break-inside: avoid;
}

/* Task List Checkboxes */
input[type="checkbox"] {
  margin-right: 0.375rem;
  accent-color: var(--accent);
}

/* Strikethrough */
del {
  color: var(--text-secondary);
  text-decoration: line-through;
}

/* Footnotes */
.footnotes {
  margin-top: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--text-secondary);
}
`;

      // Create full HTML document for PDF
      const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${filePathRef.current?.split(/[\\/]/).pop() || 'MD++ Export'}</title>
  <style>${exportCSS}</style>
  <!-- Mermaid for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <!-- KaTeX for math rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <!-- Highlight.js for syntax highlighting -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/${isDark ? 'atom-one-dark' : 'atom-one-light'}.min.css">
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11/lib/common.min.js"></script>
</head>
<body>
${document.querySelector('.preview-content')?.innerHTML || ''}
<script>
  // Signal when all rendering is complete
  window.renderingComplete = false;

  async function renderAll() {
    // Initialize Mermaid with correct theme
    mermaid.initialize({
      startOnLoad: false,
      theme: '${isDark ? 'dark' : 'default'}',
      securityLevel: 'loose'
    });

    // Render Mermaid diagrams
    const mermaidElements = document.querySelectorAll('.mermaid');
    if (mermaidElements.length > 0) {
      // Restore original code from data-original attribute if present
      mermaidElements.forEach((el, index) => {
        const originalCode = el.getAttribute('data-original');
        if (originalCode) {
          el.textContent = originalCode;
        }
        el.removeAttribute('data-processed');
        el.id = 'mermaid-pdf-' + index;
      });

      try {
        await mermaid.run({ nodes: mermaidElements });
      } catch (e) {
        console.warn('Mermaid error:', e);
      }
    }

    // KaTeX math
    document.querySelectorAll('.math').forEach((el) => {
      const isDisplay = el.classList.contains('math-display');
      const mathContent = el.textContent || '';
      if (!el.querySelector('.katex')) {
        try {
          katex.render(mathContent, el, {
            displayMode: isDisplay,
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX error:', e);
        }
      }
    });

    // Syntax highlighting
    document.querySelectorAll('pre code').forEach((block) => {
      if (!block.classList.contains('hljs') && !block.closest('.mermaid')) {
        hljs.highlightElement(block);
      }
    });

    // Mark rendering as complete
    window.renderingComplete = true;
  }

  document.addEventListener('DOMContentLoaded', renderAll);
</script>
</body>
</html>`;

      // Send to main process for PDF generation
      const result = await window.electronAPI.printToPDF(htmlContent, exportPath);
      if (!result.success) {
        console.error('PDF export failed:', result.error);
      }
    });

    return () => {
      unsubGetContent();
      unsubNew();
      unsubOpened();
      unsubSaved();
      unsubSessionRestore?.();
      unsubViewMode();
      unsubMenuAction();
      unsubInsert();
      unsubInsertWrap();
      unsubExportHTML();
      unsubExportPDF();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Using refs to avoid stale closures - handlers registered once on mount

  // Update modified state reference
  useEffect(() => {
    window.electronAPI?.setModified(isModified);
  }, [isModified]);

  // File action handlers - now using tab system
  const handleNewFile = useCallback(() => {
    handleNewTab();
    setSidebarOpen(false);
  }, [handleNewTab]);

  const handleOpenFile = useCallback(async () => {
    setSidebarOpen(false);
    // Use direct invoke pattern - more reliable than IPC events
    const result = await window.electronAPI?.openFileDialog?.();
    if (result?.success && result.content && result.path) {
      openFileInTab(result.path, result.content);
    }
  }, [openFileInTab]);

  const handleSaveFile = useCallback(() => {
    window.electronAPI?.saveFile();
  }, []);

  const handleSaveAs = useCallback(() => {
    window.electronAPI?.saveFileAs();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // === Tab Operations ===
      // New Tab: Ctrl+T
      if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
        return;
      }

      // Close Tab: Ctrl+W
      if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) {
          handleTabClose(activeTabId);
        }
        return;
      }

      // Next Tab: Ctrl+Tab
      if (isCtrl && !isShift && !isAlt && e.key === 'Tab') {
        e.preventDefault();
        if (tabs.length > 1 && activeTabId) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const nextIndex = (currentIndex + 1) % tabs.length;
          setActiveTabId(tabs[nextIndex].id);
        }
        return;
      }

      // Previous Tab: Ctrl+Shift+Tab
      if (isCtrl && isShift && !isAlt && e.key === 'Tab') {
        e.preventDefault();
        if (tabs.length > 1 && activeTabId) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          setActiveTabId(tabs[prevIndex].id);
        }
        return;
      }

      // === File Operations ===
      // New File: Ctrl+N (same as new tab)
      if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewFile();
        return;
      }

      // Open File: Ctrl+O
      if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
        return;
      }

      // Save: Ctrl+S
      if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
        return;
      }

      // Save As: Ctrl+Shift+S
      if (isCtrl && isShift && !isAlt && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAs();
        return;
      }

      // Export HTML: Ctrl+E
      if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        window.electronAPI?.exportHTML();
        return;
      }

      // Export PDF: Ctrl+Shift+E
      if (isCtrl && isShift && !isAlt && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        window.electronAPI?.exportPDF();
        return;
      }

      // === View Modes ===
      // Editor Only: Ctrl+1
      if (isCtrl && !isShift && !isAlt && e.key === '1') {
        e.preventDefault();
        setViewMode('editor');
        return;
      }

      // Preview Only: Ctrl+2
      if (isCtrl && !isShift && !isAlt && e.key === '2') {
        e.preventDefault();
        setViewMode('preview');
        return;
      }

      // Split View: Ctrl+3
      if (isCtrl && !isShift && !isAlt && e.key === '3') {
        e.preventDefault();
        setViewMode('split');
        return;
      }

      // === Formatting (only when editor is visible) ===
      if (viewMode === 'editor' || viewMode === 'split') {
        // Bold: Ctrl+B
        if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'b') {
          e.preventDefault();
          editorRef.current?.insertWrap('**');
          return;
        }

        // Italic: Ctrl+I (but not Ctrl+Shift+I for image)
        if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          editorRef.current?.insertWrap('*');
          return;
        }

        // Inline Code: Ctrl+`
        if (isCtrl && !isShift && !isAlt && (e.key === '`' || e.key === 'Dead')) {
          e.preventDefault();
          editorRef.current?.insertWrap('`');
          return;
        }

        // Link: Ctrl+K
        if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          editorRef.current?.insert('[](url)');
          return;
        }

        // Image: Ctrl+Shift+I
        if (isCtrl && isShift && !isAlt && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          editorRef.current?.insert('![alt](url)');
          return;
        }

        // Heading 1: Ctrl+Alt+1
        if (isCtrl && !isShift && isAlt && e.key === '1') {
          e.preventDefault();
          editorRef.current?.insert('# ');
          return;
        }

        // Heading 2: Ctrl+Alt+2
        if (isCtrl && !isShift && isAlt && e.key === '2') {
          e.preventDefault();
          editorRef.current?.insert('## ');
          return;
        }

        // Heading 3: Ctrl+Alt+3
        if (isCtrl && !isShift && isAlt && e.key === '3') {
          e.preventDefault();
          editorRef.current?.insert('### ');
          return;
        }
      }

      // === UI Controls ===
      // Settings: Ctrl+,
      if (isCtrl && !isShift && !isAlt && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
        return;
      }

      // Toggle AI Context: Ctrl+Shift+A
      if (isCtrl && isShift && !isAlt && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAIContext(prev => !prev);
        return;
      }

      // Help: F1
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // DevTools: F12
      if (e.key === 'F12') {
        e.preventDefault();
        window.electronAPI?.toggleDevTools();
        return;
      }

      // === Search ===
      // Find: Ctrl+F
      if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchMode('find');
        setSearchOpen(true);
        return;
      }

      // Replace: Ctrl+H
      if (isCtrl && !isShift && !isAlt && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setSearchMode('replace');
        setSearchOpen(true);
        return;
      }

      // Close dialogs: Escape
      if (e.key === 'Escape') {
        if (searchOpen) {
          setSearchOpen(false);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
        return;
      }

      // Toggle Sidebar: Ctrl+B is used for Bold, so use Ctrl+\
      // Actually, let's keep sidebar toggle for mouse only or add Ctrl+Shift+B
      if (isCtrl && isShift && !isAlt && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, sidebarOpen, viewMode, handleNewFile, handleOpenFile, handleSaveFile, handleSaveAs, handleNewTab, handleTabClose, tabs, activeTabId]);

  return (
    <div className={`app ${sidebarOpen ? 'app--sidebar-open' : ''}`}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        filePath={filePath}
        isModified={isModified}
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onSaveAs={handleSaveAs}
        onOpenSettings={() => { setSettingsOpen(true); setSidebarOpen(false); }}
        onOpenHelp={() => { setHelpOpen(true); setSidebarOpen(false); }}
        onInsertTable={() => { setTableEditorOpen(true); setSidebarOpen(false); }}
        onInsert={(text) => { editorRef.current?.insert(text); setSidebarOpen(false); }}
      />

      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showAIContext={showAIContext}
        onToggleAIContext={() => setShowAIContext(!showAIContext)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenThemeEditor={() => setThemeEditorOpen(true)}
        onOpenPluginManager={() => setPluginManagerOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      {/* Tab Bar - only show when initialized */}
      {isInitialized && (
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={handleTabSelect}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
        />
      )}
      <div className={`main-content view-${viewMode}`}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="editor-pane">
            <EditorPane
              ref={editorRef}
              content={content}
              onChange={handleContentChange}
              onCursorChange={setCursorPosition}
              theme={theme}
              onScroll={handleEditorScroll}
              onEditorMount={registerEditor}
              enabledPlugins={settings.enabledPlugins}
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            <Preview
              content={content}
              showAIContext={showAIContext}
              settings={settings}
              theme={theme}
              filePath={filePath}
              scrollRef={scrollSyncPreviewRef}
              onScroll={handlePreviewScroll}
            />
          </div>
        )}
      </div>
      <StatusBar
        line={cursorPosition.line}
        column={cursorPosition.column}
        filePath={filePath}
        isModified={isModified}
        viewMode={viewMode}
        content={content}
        autoSaveStatus={autoSaveStatus}
      />
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        onOpenPluginManager={() => setPluginManagerOpen(true)}
      />
      <SearchReplace
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        content={content}
        onReplace={updateActiveTabContent}
        mode={searchMode}
      />
      <HelpDialog
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
      <TableEditor
        isOpen={tableEditorOpen}
        onClose={() => setTableEditorOpen(false)}
        onInsert={(markdown) => {
          editorRef.current?.insert('\n' + markdown + '\n');
        }}
      />
      <PluginManager
        isOpen={pluginManagerOpen}
        onClose={() => setPluginManagerOpen(false)}
        plugins={plugins}
        onPluginToggle={handlePluginToggle}
        onRefreshPlugins={loadPlugins}
      />
      <ThemeEditor
        isOpen={themeEditorOpen}
        onClose={() => setThemeEditorOpen(false)}
      />
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-overlay-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Datei hier ablegen</p>
          </div>
        </div>
      )}
    </div>
  );
}
