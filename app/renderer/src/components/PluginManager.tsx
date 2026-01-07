/**
 * MD++ Plugin Manager Component
 *
 * A modern UI for managing MD++ plugins with:
 * - Plugin cards with toggle switches
 * - Plugin details (version, author, components)
 * - Search/filter functionality
 * - Accessibility support
 *
 * @see https://dev.to/madhavkabra/10-react-uiux-practices-every-senior-developer-should-use-in-2025-3hho
 * @see https://beyondco.de/blog/plugin-system-for-electron-apps-part-1
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Package,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Puzzle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

// Plugin definition type (matches src/types.ts)
export interface PluginInfo {
  id: string;
  framework: string;
  version: string;
  author?: string;
  description?: string;
  css?: string[];
  js?: string[];
  components: Record<string, ComponentInfo>;
  enabled: boolean;
}

export interface ComponentInfo {
  tag: string;
  classes: string[];
  variants?: Record<string, string[]>;
  allowNesting?: boolean;
}

interface PluginManagerProps {
  isOpen: boolean;
  onClose: () => void;
  plugins: PluginInfo[];
  onPluginToggle: (pluginId: string) => void;
  onRefreshPlugins?: () => void;
}

/**
 * Plugin Card Component
 * Displays individual plugin with toggle, details, and component list
 */
function PluginCard({
  plugin,
  onToggle,
  isExpanded,
  onToggleExpand,
}: {
  plugin: PluginInfo;
  onToggle: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const componentCount = Object.keys(plugin.components).length;
  const variantCount = Object.values(plugin.components).reduce(
    (acc, comp) => acc + Object.keys(comp.variants || {}).length,
    0
  );

  return (
    <div className={`plugin-card ${plugin.enabled ? 'plugin-card--enabled' : ''}`}>
      <div className="plugin-card__header">
        <div className="plugin-card__icon">
          <Package size={24} />
        </div>
        <div className="plugin-card__info">
          <h4 className="plugin-card__name">{plugin.framework}</h4>
          <div className="plugin-card__meta">
            <span className="plugin-card__version">v{plugin.version}</span>
            {plugin.author && (
              <span className="plugin-card__author">by {plugin.author}</span>
            )}
          </div>
        </div>
        <div className="plugin-card__actions">
          {/* CSS Toggle Switch - Accessible */}
          <label className="toggle-switch" aria-label={`Toggle ${plugin.framework}`}>
            <input
              type="checkbox"
              checked={plugin.enabled}
              onChange={onToggle}
              aria-describedby={`plugin-desc-${plugin.id}`}
            />
            <span className="toggle-switch__slider">
              <span className="toggle-switch__thumb">
                {plugin.enabled ? <Check size={12} /> : <X size={12} />}
              </span>
            </span>
          </label>
        </div>
      </div>

      {plugin.description && (
        <p className="plugin-card__description" id={`plugin-desc-${plugin.id}`}>
          {plugin.description}
        </p>
      )}

      <div className="plugin-card__stats">
        <span className="plugin-card__stat">
          <Puzzle size={14} />
          {componentCount} Component{componentCount !== 1 ? 's' : ''}
        </span>
        {variantCount > 0 && (
          <span className="plugin-card__stat">
            <ToggleLeft size={14} />
            {variantCount} Variant{variantCount !== 1 ? 's' : ''}
          </span>
        )}
        {plugin.css && plugin.css.length > 0 && (
          <span className="plugin-card__stat plugin-card__stat--badge">
            CSS
          </span>
        )}
        {plugin.js && plugin.js.length > 0 && (
          <span className="plugin-card__stat plugin-card__stat--badge">
            JS
          </span>
        )}
      </div>

      {/* Expandable Component List */}
      <button
        className="plugin-card__expand"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        aria-controls={`plugin-components-${plugin.id}`}
      >
        <span>Show Components</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div
          className="plugin-card__components"
          id={`plugin-components-${plugin.id}`}
        >
          <h5>Available Components</h5>
          <div className="plugin-card__component-list">
            {Object.entries(plugin.components).map(([name, comp]) => (
              <div key={name} className="plugin-component">
                <code className="plugin-component__syntax">
                  :::{plugin.framework}:{name}
                </code>
                {comp.variants && Object.keys(comp.variants).length > 0 && (
                  <div className="plugin-component__variants">
                    Variants: {Object.keys(comp.variants).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Plugin Manager Dialog
 * Full-featured plugin management interface
 */
export default function PluginManager({
  isOpen,
  onClose,
  plugins,
  onPluginToggle,
  onRefreshPlugins,
}: PluginManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPlugins, setExpandedPlugins] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Filter and search plugins
  const filteredPlugins = useMemo(() => {
    return plugins.filter((plugin) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === '' ||
        plugin.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.keys(plugin.components).some((comp) =>
          comp.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Apply enabled/disabled filter
      const matchesFilter =
        filter === 'all' ||
        (filter === 'enabled' && plugin.enabled) ||
        (filter === 'disabled' && !plugin.enabled);

      return matchesSearch && matchesFilter;
    });
  }, [plugins, searchQuery, filter]);

  // Toggle expanded state for a plugin
  const handleToggleExpand = useCallback((pluginId: string) => {
    setExpandedPlugins((prev) => {
      const next = new Set(prev);
      if (next.has(pluginId)) {
        next.delete(pluginId);
      } else {
        next.add(pluginId);
      }
      return next;
    });
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const enabled = plugins.filter((p) => p.enabled).length;
    const totalComponents = plugins.reduce(
      (acc, p) => acc + Object.keys(p.components).length,
      0
    );
    return { total: plugins.length, enabled, totalComponents };
  }, [plugins]);

  if (!isOpen) return null;

  return (
    <div className="plugin-manager-overlay" onClick={onClose}>
      <div
        className="plugin-manager"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plugin-manager-title"
      >
        {/* Header */}
        <div className="plugin-manager__header">
          <div className="plugin-manager__title-row">
            <h2 id="plugin-manager-title">
              <Package size={24} />
              Plugin Manager
            </h2>
            <button
              className="plugin-manager__close"
              onClick={onClose}
              aria-label="Close plugin manager"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="plugin-manager__stats">
            <span className="plugin-manager__stat">
              <strong>{stats.total}</strong> Plugins
            </span>
            <span className="plugin-manager__stat plugin-manager__stat--enabled">
              <Check size={14} />
              <strong>{stats.enabled}</strong> Active
            </span>
            <span className="plugin-manager__stat">
              <Puzzle size={14} />
              <strong>{stats.totalComponents}</strong> Components
            </span>
          </div>

          {/* Search and Filter */}
          <div className="plugin-manager__controls">
            <div className="plugin-manager__search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search plugins or components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search plugins"
              />
              {searchQuery && (
                <button
                  className="plugin-manager__search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="plugin-manager__filters">
              <button
                className={`plugin-manager__filter ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`plugin-manager__filter ${filter === 'enabled' ? 'active' : ''}`}
                onClick={() => setFilter('enabled')}
              >
                <ToggleRight size={14} />
                Enabled
              </button>
              <button
                className={`plugin-manager__filter ${filter === 'disabled' ? 'active' : ''}`}
                onClick={() => setFilter('disabled')}
              >
                <ToggleLeft size={14} />
                Disabled
              </button>
            </div>

            {onRefreshPlugins && (
              <button
                className="plugin-manager__refresh"
                onClick={onRefreshPlugins}
                aria-label="Refresh plugins"
                title="Reload plugins from disk"
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Plugin List */}
        <div className="plugin-manager__content">
          {filteredPlugins.length === 0 ? (
            <div className="plugin-manager__empty">
              <Info size={48} />
              <p>
                {searchQuery
                  ? `No plugins matching "${searchQuery}"`
                  : 'No plugins available'}
              </p>
            </div>
          ) : (
            <div className="plugin-manager__list">
              {filteredPlugins.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onToggle={() => onPluginToggle(plugin.id)}
                  isExpanded={expandedPlugins.has(plugin.id)}
                  onToggleExpand={() => handleToggleExpand(plugin.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="plugin-manager__footer">
          <div className="plugin-manager__footer-info">
            <Info size={14} />
            <span>
              Plugins are loaded from the <code>plugins/</code> directory
            </span>
          </div>
          <a
            href="https://github.com/gorduan/MDPlusPlus#plugins"
            target="_blank"
            rel="noopener noreferrer"
            className="plugin-manager__docs-link"
          >
            <ExternalLink size={14} />
            Plugin Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
