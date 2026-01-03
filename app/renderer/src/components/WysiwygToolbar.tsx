/**
 * WysiwygToolbar - Dynamic toolbar component for the WYSIWYG editor
 * Uses ToolbarRegistry to render toolbar items from plugins
 */

import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { toolbarRegistry, ToolbarGroup, ToolbarItem } from '../wysiwyg';

interface WysiwygToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  item: ToolbarItem;
  editor: Editor;
}

function ToolbarButton({ item, editor }: ToolbarButtonProps) {
  const Icon = item.icon;
  const isActive = item.isActive?.(editor) ?? false;
  const isDisabled = item.isDisabled?.(editor) ?? false;

  const handleClick = () => {
    if (item.action && !isDisabled) {
      item.action(editor);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      title={item.tooltip || item.label}
      className={`wysiwyg-toolbar-btn ${isActive ? 'active' : ''}`}
    >
      {Icon ? <Icon size={16} /> : item.label}
    </button>
  );
}

export default function WysiwygToolbar({ editor }: WysiwygToolbarProps) {
  const [groups, setGroups] = useState<ToolbarGroup[]>([]);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Get initial groups
    setGroups(toolbarRegistry.getGroupedItems());

    // Subscribe to registry changes
    const unsubscribe = toolbarRegistry.subscribe(() => {
      setGroups(toolbarRegistry.getGroupedItems());
    });

    return unsubscribe;
  }, []);

  // Force re-render on editor updates to reflect active states
  useEffect(() => {
    const updateHandler = () => forceUpdate({});
    editor.on('selectionUpdate', updateHandler);
    editor.on('transaction', updateHandler);

    return () => {
      editor.off('selectionUpdate', updateHandler);
      editor.off('transaction', updateHandler);
    };
  }, [editor]);

  return (
    <div className="wysiwyg-toolbar">
      {groups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          {groupIndex > 0 && <div className="wysiwyg-toolbar-separator" />}
          <div className="wysiwyg-toolbar-group">
            {group.items.map((item) => {
              if (item.type === 'separator' || item.type === 'divider') {
                return <div key={item.id} className="wysiwyg-toolbar-separator" />;
              }
              return (
                <ToolbarButton
                  key={item.id}
                  item={item}
                  editor={editor}
                />
              );
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
