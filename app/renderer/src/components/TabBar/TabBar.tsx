/**
 * TabBar Component
 * Multi-document tab interface for MD++ Editor
 */

import React, { useRef, useEffect } from 'react';
import Tab from './Tab';
import './TabBar.scss';

export interface TabData {
  id: string;
  filePath: string | null;
  title: string;
  isModified: boolean;
  content: string;
}

interface TabBarProps {
  tabs: TabData[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
}: TabBarProps) {
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    if (activeTabId && tabsContainerRef.current) {
      const activeTab = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTabId]);

  // Handle horizontal scroll with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (tabsContainerRef.current) {
      e.preventDefault();
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="tab-bar">
      <div
        className="tab-bar__tabs"
        ref={tabsContainerRef}
        onWheel={handleWheel}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => onTabSelect(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        ))}
      </div>
      <button
        className="tab-bar__new"
        onClick={onNewTab}
        title="New Tab (Ctrl+T)"
        aria-label="New Tab"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
