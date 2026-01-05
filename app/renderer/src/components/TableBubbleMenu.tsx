/**
 * TableBubbleMenu - Context menu for table operations
 * Shows when cursor is inside a table
 */

import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Combine,
  SplitSquareVertical,
  ToggleLeft,
} from 'lucide-react';

interface TableBubbleMenuProps {
  editor: Editor;
}

export default function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  // Only show when inside a table
  const shouldShow = () => {
    return editor.isActive('table');
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      options={{
        placement: 'top',
      }}
      className="table-bubble-menu"
    >
      {/* Row Operations */}
      <div className="table-menu-group">
        <span className="table-menu-label">Row</span>
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.can().addRowBefore()}
          title="Add row above"
          className="table-menu-btn"
        >
          <ArrowUp size={14} />
          <Plus size={10} className="table-menu-plus" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
          title="Add row below"
          className="table-menu-btn"
        >
          <ArrowDown size={14} />
          <Plus size={10} className="table-menu-plus" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          title="Delete row"
          className="table-menu-btn danger"
        >
          <Minus size={14} />
        </button>
      </div>

      <div className="table-menu-separator" />

      {/* Column Operations */}
      <div className="table-menu-group">
        <span className="table-menu-label">Col</span>
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.can().addColumnBefore()}
          title="Add column left"
          className="table-menu-btn"
        >
          <ArrowLeft size={14} />
          <Plus size={10} className="table-menu-plus" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
          title="Add column right"
          className="table-menu-btn"
        >
          <ArrowRight size={14} />
          <Plus size={10} className="table-menu-plus" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
          title="Delete column"
          className="table-menu-btn danger"
        >
          <Minus size={14} />
        </button>
      </div>

      <div className="table-menu-separator" />

      {/* Cell Operations */}
      <div className="table-menu-group">
        <span className="table-menu-label">Cell</span>
        <button
          type="button"
          onClick={() => editor.chain().focus().mergeCells().run()}
          disabled={!editor.can().mergeCells()}
          title="Merge cells"
          className="table-menu-btn"
        >
          <Combine size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().splitCell().run()}
          disabled={!editor.can().splitCell()}
          title="Split cell"
          className="table-menu-btn"
        >
          <SplitSquareVertical size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeaderCell().run()}
          disabled={!editor.can().toggleHeaderCell()}
          title="Toggle header cell"
          className="table-menu-btn"
        >
          <ToggleLeft size={14} />
        </button>
      </div>

      <div className="table-menu-separator" />

      {/* Delete Table */}
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!editor.can().deleteTable()}
        title="Delete table"
        className="table-menu-btn danger"
      >
        <Trash2 size={14} />
      </button>
    </BubbleMenu>
  );
}
