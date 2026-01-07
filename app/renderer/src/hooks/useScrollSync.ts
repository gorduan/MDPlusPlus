/**
 * Scroll Sync Hook for MD++ Editor
 * Synchronizes scroll position between Monaco Editor / WYSIWYG Editor and Preview pane
 */

import { useCallback, useRef, useEffect } from 'react';
import type { editor } from 'monaco-editor';

/**
 * Generic scroll info for any scrollable element
 */
export interface ScrollInfo {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

interface ScrollSyncOptions {
  /** Enable scroll sync */
  enabled: boolean;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Sync direction: 'editor-to-preview', 'preview-to-editor', or 'bidirectional' */
  direction?: 'editor-to-preview' | 'preview-to-editor' | 'bidirectional';
}

interface ScrollSyncReturn {
  /** Ref to attach to preview container */
  previewRef: React.RefObject<HTMLDivElement | null>;
  /** Handler for editor scroll events (Monaco) */
  handleEditorScroll: (editor: editor.IStandaloneCodeEditor) => void;
  /** Handler for WYSIWYG editor scroll events */
  handleWysiwygScroll: (scrollInfo: ScrollInfo) => void;
  /** Handler for preview scroll events */
  handlePreviewScroll: () => void;
  /** Register the editor instance (Monaco) */
  registerEditor: (editor: editor.IStandaloneCodeEditor) => void;
  /** Register WYSIWYG scrollable element */
  registerWysiwygElement: (element: HTMLElement | null) => void;
  /** Whether sync is currently active */
  isSyncing: boolean;
}

/**
 * Hook to synchronize scrolling between editor and preview
 */
export function useScrollSync(options: ScrollSyncOptions): ScrollSyncReturn {
  const { enabled, debounceMs = 50, direction = 'bidirectional' } = options;

  const previewRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const wysiwygElementRef = useRef<HTMLElement | null>(null);
  const isSyncingRef = useRef(false);
  const debounceTimeoutRef = useRef<number | null>(null);  // For debouncing scroll events
  const syncResetTimeoutRef = useRef<number | null>(null); // For resetting sync flag
  const lastSyncSourceRef = useRef<'editor' | 'preview' | null>(null);
  const enabledRef = useRef(enabled);

  // Keep enabledRef in sync with enabled prop
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Register the Monaco editor instance
  const registerEditor = useCallback((editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;
  }, []);

  // Register the WYSIWYG scrollable element
  const registerWysiwygElement = useCallback((element: HTMLElement | null) => {
    wysiwygElementRef.current = element;
  }, []);

  // Calculate scroll percentage for editor
  const getEditorScrollPercentage = useCallback((): number => {
    const editor = editorRef.current;
    if (!editor) return 0;

    const scrollTop = editor.getScrollTop();
    const scrollHeight = editor.getScrollHeight();
    const clientHeight = editor.getLayoutInfo().height;

    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return 0;

    return scrollTop / maxScroll;
  }, []);

  // Calculate scroll percentage for preview
  const getPreviewScrollPercentage = useCallback((): number => {
    const preview = previewRef.current;
    if (!preview) return 0;

    const scrollTop = preview.scrollTop;
    const scrollHeight = preview.scrollHeight;
    const clientHeight = preview.clientHeight;

    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return 0;

    return scrollTop / maxScroll;
  }, []);

  // Scroll preview to match editor percentage
  const syncPreviewToEditor = useCallback((percentage: number) => {
    const preview = previewRef.current;
    if (!preview) {
      return;
    }

    const scrollHeight = preview.scrollHeight;
    const clientHeight = preview.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) {
      return;
    }

    isSyncingRef.current = true;
    lastSyncSourceRef.current = 'editor';

    const targetScroll = percentage * maxScroll;
    preview.scrollTo({
      top: targetScroll,
      behavior: 'auto',
    });

    // Reset syncing flag after a short delay - use separate timeout
    if (syncResetTimeoutRef.current) {
      clearTimeout(syncResetTimeoutRef.current);
    }
    syncResetTimeoutRef.current = window.setTimeout(() => {
      isSyncingRef.current = false;
    }, 150);
  }, []);

  // Scroll editor to match preview percentage (works for both Monaco and WYSIWYG)
  const syncEditorToPreview = useCallback((percentage: number) => {
    // Try Monaco editor first
    const editorInstance = editorRef.current;
    if (editorInstance) {
      const scrollHeight = editorInstance.getScrollHeight();
      const clientHeight = editorInstance.getLayoutInfo().height;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll > 0) {
        isSyncingRef.current = true;
        lastSyncSourceRef.current = 'preview';

        const targetScroll = percentage * maxScroll;
        editorInstance.setScrollTop(targetScroll);

        // Reset syncing flag after a short delay
        if (syncResetTimeoutRef.current) {
          clearTimeout(syncResetTimeoutRef.current);
        }
        syncResetTimeoutRef.current = window.setTimeout(() => {
          isSyncingRef.current = false;
        }, 150);
        return;
      }
    }

    // Try WYSIWYG element
    const wysiwygEl = wysiwygElementRef.current;
    if (wysiwygEl) {
      const scrollHeight = wysiwygEl.scrollHeight;
      const clientHeight = wysiwygEl.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll > 0) {
        isSyncingRef.current = true;
        lastSyncSourceRef.current = 'preview';

        const targetScroll = percentage * maxScroll;
        wysiwygEl.scrollTo({
          top: targetScroll,
          behavior: 'auto',
        });

        // Reset syncing flag after a short delay
        if (syncResetTimeoutRef.current) {
          clearTimeout(syncResetTimeoutRef.current);
        }
        syncResetTimeoutRef.current = window.setTimeout(() => {
          isSyncingRef.current = false;
        }, 150);
      }
    }
  }, []);

  // Debounced editor scroll handler (Monaco)
  const handleEditorScroll = useCallback(() => {
    if (!enabledRef.current) return;
    if (direction === 'preview-to-editor') return;
    // Skip if we're currently syncing FROM the preview (to prevent loops)
    if (isSyncingRef.current && lastSyncSourceRef.current === 'preview') return;

    // Debounce the sync - use separate timeout from sync reset
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      const percentage = getEditorScrollPercentage();
      syncPreviewToEditor(percentage);
    }, debounceMs);
  }, [direction, debounceMs, getEditorScrollPercentage, syncPreviewToEditor]);

  // Debounced WYSIWYG scroll handler
  const handleWysiwygScroll = useCallback((scrollInfo: ScrollInfo) => {
    if (!enabledRef.current) return;
    if (direction === 'preview-to-editor') return;
    // Skip if we're currently syncing FROM the preview (to prevent loops)
    if (isSyncingRef.current && lastSyncSourceRef.current === 'preview') return;

    // Debounce the sync
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollInfo;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;

      const percentage = scrollTop / maxScroll;
      syncPreviewToEditor(percentage);
    }, debounceMs);
  }, [direction, debounceMs, syncPreviewToEditor]);

  // Debounced preview scroll handler
  const handlePreviewScroll = useCallback(() => {
    if (!enabledRef.current) return;
    if (direction === 'editor-to-preview') return;
    // Skip if we're currently syncing FROM the editor (to prevent loops)
    if (isSyncingRef.current && lastSyncSourceRef.current === 'editor') return;

    // Debounce the sync - use separate timeout from sync reset
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      const percentage = getPreviewScrollPercentage();
      syncEditorToPreview(percentage);
    }, debounceMs);
  }, [direction, debounceMs, getPreviewScrollPercentage, syncEditorToPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (syncResetTimeoutRef.current) {
        clearTimeout(syncResetTimeoutRef.current);
      }
    };
  }, []);

  return {
    previewRef,
    handleEditorScroll,
    handleWysiwygScroll,
    handlePreviewScroll,
    registerEditor,
    registerWysiwygElement,
    isSyncing: isSyncingRef.current,
  };
}

export default useScrollSync;
