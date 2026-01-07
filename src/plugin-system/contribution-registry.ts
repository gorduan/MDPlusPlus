/**
 * MD++ Plugin System - Contribution Registry
 *
 * Central registry for managing plugin contribution points.
 * Inspired by VS Code's contribution point system.
 *
 * See: docs/concepts/plugin-system-refactoring.md (Section 6)
 */

import type {
  ContributionPoint,
  ContributionHandler,
  ContributionPointId,
  PluginContributions,
  ParserContribution,
  ToolbarContribution,
  EditorContribution,
  PreviewContribution,
  ExportContribution,
  SidebarContribution,
  KeybindingContribution,
  HelpContribution,
  JSONSchemaDefinition,
} from './contribution-types';

// ============================================
// Contribution Registry
// ============================================

/**
 * Central registry for all contribution points.
 * Plugins register their contributions here, and consumers query them.
 */
export class ContributionRegistry {
  private points: Map<ContributionPointId, ContributionPoint<unknown>> = new Map();
  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    // Register built-in contribution points
    this.registerBuiltinPoints();
  }

  /**
   * Register the standard contribution points
   */
  private registerBuiltinPoints(): void {
    // Parser contributions
    this.registerPoint<ParserContribution>('parser', {
      id: 'parser',
      schema: parserSchema,
      handler: new ParserContributionHandler(),
    });

    // Toolbar contributions
    this.registerPoint<ToolbarContribution>('toolbar', {
      id: 'toolbar',
      schema: toolbarSchema,
      handler: new ToolbarContributionHandler(),
    });

    // Editor contributions
    this.registerPoint<EditorContribution>('editor', {
      id: 'editor',
      schema: editorSchema,
      handler: new EditorContributionHandler(),
    });

    // Preview contributions
    this.registerPoint<PreviewContribution>('preview', {
      id: 'preview',
      schema: previewSchema,
      handler: new PreviewContributionHandler(),
    });

    // Export contributions
    this.registerPoint<ExportContribution>('export', {
      id: 'export',
      schema: exportSchema,
      handler: new ExportContributionHandler(),
    });

    // Sidebar contributions
    this.registerPoint<SidebarContribution>('sidebar', {
      id: 'sidebar',
      schema: sidebarSchema,
      handler: new SidebarContributionHandler(),
    });

    // Keybinding contributions
    this.registerPoint<KeybindingContribution[]>('keybindings', {
      id: 'keybindings',
      schema: keybindingsSchema,
      handler: new KeybindingsContributionHandler(),
    });

    // Help contributions
    this.registerPoint<HelpContribution>('help', {
      id: 'help',
      schema: helpSchema,
      handler: new HelpContributionHandler(),
    });
  }

  /**
   * Register a contribution point
   */
  registerPoint<T>(id: ContributionPointId, point: ContributionPoint<T>): void {
    this.points.set(id, point as ContributionPoint<unknown>);
  }

  /**
   * Get a contribution point by ID
   */
  getPoint<T>(id: ContributionPointId): ContributionPoint<T> | undefined {
    return this.points.get(id) as ContributionPoint<T> | undefined;
  }

  /**
   * Get the handler for a contribution point
   */
  getHandler<T>(id: ContributionPointId): ContributionHandler<T> | undefined {
    const point = this.points.get(id);
    return point?.handler as ContributionHandler<T> | undefined;
  }

  /**
   * Process all contributions from a plugin's manifest
   */
  processPluginContributions(pluginId: string, contributes: PluginContributions): void {
    for (const [pointId, contribution] of Object.entries(contributes)) {
      const point = this.points.get(pointId as ContributionPointId);
      if (point && contribution !== undefined) {
        point.handler.register(pluginId, contribution);
        this.notifyListeners(pointId);
      }
    }
  }

  /**
   * Remove all contributions from a plugin
   */
  removePluginContributions(pluginId: string): void {
    for (const [pointId, point] of this.points) {
      point.handler.unregister(pluginId);
      this.notifyListeners(pointId);
    }
  }

  /**
   * Subscribe to changes in a contribution point
   */
  subscribe(pointId: string, listener: () => void): () => void {
    if (!this.listeners.has(pointId)) {
      this.listeners.set(pointId, new Set());
    }
    this.listeners.get(pointId)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(pointId)?.delete(listener);
    };
  }

  /**
   * Notify listeners of a contribution point change
   */
  private notifyListeners(pointId: string): void {
    const listeners = this.listeners.get(pointId);
    if (listeners) {
      for (const listener of listeners) {
        listener();
      }
    }
  }
}

// ============================================
// Base Handler Implementation
// ============================================

/**
 * Base class for contribution handlers
 */
abstract class BaseContributionHandler<T> implements ContributionHandler<T> {
  protected contributions: Map<string, T[]> = new Map();

  register(pluginId: string, contribution: T): void {
    const existing = this.contributions.get(pluginId) || [];
    existing.push(contribution);
    this.contributions.set(pluginId, existing);
    this.onRegister(pluginId, contribution);
  }

  unregister(pluginId: string): void {
    const contributions = this.contributions.get(pluginId);
    if (contributions) {
      this.onUnregister(pluginId, contributions);
      this.contributions.delete(pluginId);
    }
  }

  getAll(): Map<string, T[]> {
    return new Map(this.contributions);
  }

  /**
   * Called after a contribution is registered
   * Override in subclasses for custom behavior
   */
  protected onRegister(_pluginId: string, _contribution: T): void {
    // Override in subclasses
  }

  /**
   * Called before contributions are unregistered
   * Override in subclasses for cleanup
   */
  protected onUnregister(_pluginId: string, _contributions: T[]): void {
    // Override in subclasses
  }
}

// ============================================
// Specific Handlers
// ============================================

class ParserContributionHandler extends BaseContributionHandler<ParserContribution> {
  private codeBlockLanguages: Map<string, string> = new Map(); // language -> pluginId

  protected override onRegister(pluginId: string, contribution: ParserContribution): void {
    // Register code block languages
    if (contribution.codeBlockLanguages) {
      for (const lang of contribution.codeBlockLanguages) {
        this.codeBlockLanguages.set(lang, pluginId);
      }
    }
  }

  protected override onUnregister(pluginId: string, contributions: ParserContribution[]): void {
    // Unregister code block languages
    for (const contribution of contributions) {
      if (contribution.codeBlockLanguages) {
        for (const lang of contribution.codeBlockLanguages) {
          if (this.codeBlockLanguages.get(lang) === pluginId) {
            this.codeBlockLanguages.delete(lang);
          }
        }
      }
    }
  }

  /**
   * Get the plugin ID that handles a given code block language
   */
  getCodeBlockPlugin(language: string): string | undefined {
    return this.codeBlockLanguages.get(language);
  }

  /**
   * Get all registered code block languages
   */
  getCodeBlockLanguages(): Map<string, string> {
    return new Map(this.codeBlockLanguages);
  }

  /**
   * Get parser contributions sorted by priority
   */
  getSortedContributions(): Array<{ pluginId: string; contribution: ParserContribution }> {
    const result: Array<{ pluginId: string; contribution: ParserContribution }> = [];

    for (const [pluginId, contributions] of this.contributions) {
      for (const contribution of contributions) {
        result.push({ pluginId, contribution });
      }
    }

    return result.sort((a, b) => (b.contribution.priority ?? 100) - (a.contribution.priority ?? 100));
  }
}

class ToolbarContributionHandler extends BaseContributionHandler<ToolbarContribution> {
  // Will integrate with existing ToolbarRegistry
}

class EditorContributionHandler extends BaseContributionHandler<EditorContribution> {
  // Will integrate with TipTap and Monaco
}

class PreviewContributionHandler extends BaseContributionHandler<PreviewContribution> {
  // Will handle dynamic renderer loading
}

class ExportContributionHandler extends BaseContributionHandler<ExportContribution> {
  // Will build export asset bundles
}

class SidebarContributionHandler extends BaseContributionHandler<SidebarContribution> {
  // Will provide insert templates
}

class KeybindingsContributionHandler extends BaseContributionHandler<KeybindingContribution[]> {
  // Will integrate with keyboard handling
}

class HelpContributionHandler extends BaseContributionHandler<HelpContribution> {
  // Will provide help entries
}

// ============================================
// JSON Schemas for Validation
// ============================================

const parserSchema: JSONSchemaDefinition = {
  type: 'object',
  properties: {
    entry: { type: 'string' },
    phase: { type: 'string', enum: ['remark', 'rehype', 'both'] },
    priority: { type: 'number' },
    codeBlockLanguages: { type: 'array', items: { type: 'string' } },
    codeBlockHandler: { type: 'string' },
  },
  required: ['phase'],
};

const toolbarSchema: JSONSchemaDefinition = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          command: { type: 'string' },
          group: { type: 'string' },
          priority: { type: 'number' },
          icon: { type: 'string' },
          label: { type: 'string' },
          tooltip: { type: 'string' },
          shortcut: { type: 'string' },
          when: { type: 'string' },
        },
        required: ['id', 'command', 'group', 'label'],
      },
    },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          priority: { type: 'number' },
        },
        required: ['id', 'label'],
      },
    },
  },
};

const editorSchema: JSONSchemaDefinition = {
  type: 'object',
  properties: {
    extension: { type: 'string' },
    nodeView: { type: 'string' },
    commands: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          category: { type: 'string' },
        },
        required: ['id', 'title'],
      },
    },
    languages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          extensions: { type: 'array', items: { type: 'string' } },
          aliases: { type: 'array', items: { type: 'string' } },
          configuration: { type: 'string' },
        },
        required: ['id'],
      },
    },
  },
};

const previewSchema: JSONSchemaDefinition = {
  type: 'object',
  properties: {
    renderer: { type: 'string' },
    styles: { type: 'array', items: { type: 'string' } },
    selectors: { type: 'array', items: { type: 'string' } },
  },
};

const exportSchema: JSONSchemaDefinition = {
  type: 'object',
  properties: {
    assets: { type: 'string' },
    styles: { type: 'array', items: { type: 'string' } },
  },
};

const sidebarSchema: JSONSchemaDefinition = {
  type: 'object',
  properties: {
    insertTemplates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          category: { type: 'string' },
          template: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
        },
        required: ['id', 'label', 'category', 'template'],
      },
    },
  },
};

const keybindingsSchema: JSONSchemaDefinition = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      command: { type: 'string' },
      key: { type: 'string' },
      mac: { type: 'string' },
      linux: { type: 'string' },
      win: { type: 'string' },
      when: { type: 'string' },
      args: {},
    },
    required: ['command', 'key'],
  },
};

const helpSchema: JSONSchemaDefinition = {
  type: 'object',
  properties: {
    entries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          syntax: { type: 'string' },
          link: { type: 'string' },
          category: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
        },
        required: ['title'],
      },
    },
  },
};

// ============================================
// Singleton Instance
// ============================================

let _instance: ContributionRegistry | null = null;

/**
 * Get the global contribution registry instance
 */
export function getContributionRegistry(): ContributionRegistry {
  if (!_instance) {
    _instance = new ContributionRegistry();
  }
  return _instance;
}

/**
 * Create a new contribution registry (for testing)
 */
export function createContributionRegistry(): ContributionRegistry {
  return new ContributionRegistry();
}

// Export handler classes for extension
export {
  BaseContributionHandler,
  ParserContributionHandler,
  ToolbarContributionHandler,
  EditorContributionHandler,
  PreviewContributionHandler,
  ExportContributionHandler,
  SidebarContributionHandler,
  KeybindingsContributionHandler,
  HelpContributionHandler,
};
