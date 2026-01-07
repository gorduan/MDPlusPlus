/**
 * MD++ Plugin Dependency Resolver
 *
 * Resolves plugin dependencies and determines activation order.
 * Uses topological sorting to ensure dependencies are activated first.
 *
 * Features:
 * - Dependency resolution
 * - Circular dependency detection
 * - Conflict detection
 * - Activation order calculation
 */

import type { DependencyResolutionResult, PluginManifest } from './types';
import type { PluginRegistry } from './plugin-registry';

/**
 * Plugin Dependency Resolver
 */
export class PluginResolver {
  constructor(private registry: PluginRegistry) {}

  /**
   * Resolve dependencies for the given plugins
   * Returns activation order and any issues
   */
  resolve(pluginIds: string[]): DependencyResolutionResult {
    const result: DependencyResolutionResult = {
      resolved: true,
      order: [],
      missing: [],
      conflicts: [],
      circular: [],
    };

    // Build dependency graph
    const graph = this.buildGraph(pluginIds, result);

    // Detect circular dependencies
    const circular = this.detectCircular(graph);
    if (circular.length > 0) {
      result.circular = circular;
      result.resolved = false;
    }

    // Detect conflicts
    this.detectConflicts(pluginIds, result);

    // Topological sort for activation order
    if (result.resolved) {
      result.order = this.topologicalSort(graph, pluginIds);
    }

    // Check if we have missing required dependencies
    if (result.missing.some((m) => m.type === 'required')) {
      result.resolved = false;
    }

    return result;
  }

  /**
   * Build dependency graph
   */
  private buildGraph(
    pluginIds: string[],
    result: DependencyResolutionResult
  ): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    const visited = new Set<string>();
    const toProcess = [...pluginIds];

    while (toProcess.length > 0) {
      const pluginId = toProcess.pop()!;
      if (visited.has(pluginId)) continue;
      visited.add(pluginId);

      const plugin = this.registry.get(pluginId);
      if (!plugin) {
        // Plugin not registered - skip (will be caught as missing dependency)
        graph.set(pluginId, new Set());
        continue;
      }

      const deps = new Set<string>();

      // Required dependencies
      for (const dep of plugin.manifest.dependencies?.plugins || []) {
        if (!this.registry.has(dep)) {
          result.missing.push({
            plugin: pluginId,
            dependency: dep,
            type: 'required',
          });
        } else {
          deps.add(dep);
          if (!visited.has(dep)) {
            toProcess.push(dep);
          }
        }
      }

      // Optional dependencies
      for (const dep of plugin.manifest.optionalDependencies?.plugins || []) {
        if (!this.registry.has(dep)) {
          result.missing.push({
            plugin: pluginId,
            dependency: dep,
            type: 'optional',
          });
        } else {
          deps.add(dep);
          if (!visited.has(dep)) {
            toProcess.push(dep);
          }
        }
      }

      graph.set(pluginId, deps);
    }

    return graph;
  }

  /**
   * Detect circular dependencies using DFS
   */
  private detectCircular(graph: Map<string, Set<string>>): string[][] {
    const circular: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const deps = graph.get(node) || new Set();
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (dfs(dep)) return true;
        } else if (recursionStack.has(dep)) {
          // Found cycle
          const cycleStart = path.indexOf(dep);
          circular.push([...path.slice(cycleStart), dep]);
          return true;
        }
      }

      path.pop();
      recursionStack.delete(node);
      return false;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return circular;
  }

  /**
   * Detect conflicts between plugins
   */
  private detectConflicts(
    pluginIds: string[],
    result: DependencyResolutionResult
  ): void {
    const allPlugins = new Set<string>();

    // Collect all plugins including dependencies
    const toProcess = [...pluginIds];
    while (toProcess.length > 0) {
      const pluginId = toProcess.pop()!;
      if (allPlugins.has(pluginId)) continue;
      allPlugins.add(pluginId);

      const plugin = this.registry.get(pluginId);
      if (plugin?.manifest.dependencies?.plugins) {
        toProcess.push(...plugin.manifest.dependencies.plugins);
      }
    }

    // Check for conflicts
    for (const pluginId of allPlugins) {
      const plugin = this.registry.get(pluginId);
      if (!plugin?.manifest.conflicts) continue;

      for (const conflictId of plugin.manifest.conflicts) {
        if (allPlugins.has(conflictId)) {
          result.conflicts.push({
            plugin1: pluginId,
            plugin2: conflictId,
            reason: `Plugin "${pluginId}" declares conflict with "${conflictId}"`,
          });
          result.resolved = false;
        }
      }
    }
  }

  /**
   * Topological sort to get activation order
   * Uses Kahn's algorithm
   */
  private topologicalSort(
    graph: Map<string, Set<string>>,
    requested: string[]
  ): string[] {
    // Calculate in-degree for each node
    const inDegree = new Map<string, number>();
    for (const node of graph.keys()) {
      if (!inDegree.has(node)) {
        inDegree.set(node, 0);
      }
    }

    for (const deps of graph.values()) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Queue nodes with no incoming edges (no dependencies)
    const queue: string[] = [];
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    const result: string[] = [];
    const processed = new Set<string>();

    while (queue.length > 0) {
      // Sort queue to ensure deterministic order (alphabetically)
      queue.sort();
      const node = queue.shift()!;

      if (processed.has(node)) continue;
      processed.add(node);
      result.push(node);

      // Reduce in-degree of nodes that depend on this one
      for (const [dependent, deps] of graph) {
        if (deps.has(node)) {
          const newDegree = (inDegree.get(dependent) || 1) - 1;
          inDegree.set(dependent, newDegree);
          if (newDegree === 0 && !processed.has(dependent)) {
            queue.push(dependent);
          }
        }
      }
    }

    // Reverse to get dependencies first
    // (we want to activate dependencies before dependents)
    return result.reverse();
  }

  /**
   * Get all dependencies of a plugin (transitive)
   */
  getAllDependencies(pluginId: string): string[] {
    const deps = new Set<string>();
    const toProcess = [pluginId];

    while (toProcess.length > 0) {
      const current = toProcess.pop()!;
      const plugin = this.registry.get(current);
      if (!plugin) continue;

      for (const dep of plugin.manifest.dependencies?.plugins || []) {
        if (!deps.has(dep)) {
          deps.add(dep);
          toProcess.push(dep);
        }
      }
    }

    return Array.from(deps);
  }

  /**
   * Check if activating a plugin would cause conflicts
   */
  wouldConflict(pluginId: string): string[] {
    const plugin = this.registry.get(pluginId);
    if (!plugin) return [];

    const conflicts: string[] = [];
    const activePlugins = this.registry.getActive().map((p) => p.manifest.id);

    // Check if this plugin conflicts with any active plugin
    for (const conflictId of plugin.manifest.conflicts || []) {
      if (activePlugins.includes(conflictId)) {
        conflicts.push(conflictId);
      }
    }

    // Check if any active plugin conflicts with this one
    for (const activePlugin of this.registry.getActive()) {
      if (activePlugin.manifest.conflicts?.includes(pluginId)) {
        conflicts.push(activePlugin.manifest.id);
      }
    }

    return conflicts;
  }

  /**
   * Get missing dependencies for a plugin
   */
  getMissingDependencies(pluginId: string): { required: string[]; optional: string[] } {
    const plugin = this.registry.get(pluginId);
    if (!plugin) {
      return { required: [], optional: [] };
    }

    const required: string[] = [];
    const optional: string[] = [];

    for (const dep of plugin.manifest.dependencies?.plugins || []) {
      if (!this.registry.has(dep)) {
        required.push(dep);
      }
    }

    for (const dep of plugin.manifest.optionalDependencies?.plugins || []) {
      if (!this.registry.has(dep)) {
        optional.push(dep);
      }
    }

    return { required, optional };
  }
}
