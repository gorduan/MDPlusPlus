/**
 * Security Configuration System for MD++
 *
 * Handles loading and parsing security.yaml files
 * Security profiles control what features are allowed
 */

import type { SecurityConfig, SecurityProfile } from './types';

/**
 * Default security configurations for each profile
 */
export const SECURITY_PROFILES: Record<SecurityProfile, Omit<SecurityConfig, 'profile'>> = {
  /**
   * Strict: Maximum security, no code execution
   * For untrusted content or public-facing applications
   */
  strict: {
    allowParserCode: false,
    allowHTMLCode: false,
    warnOnCode: true,
    trustedSources: [],
    blockedSources: ['*'], // Block all external sources by default
  },

  /**
   * Warn: Default mode, warns about potentially dangerous content
   * For most use cases
   */
  warn: {
    allowParserCode: false,
    allowHTMLCode: false,
    warnOnCode: true,
    trustedSources: [
      'cdn.jsdelivr.net',
      'unpkg.com',
      'cdnjs.cloudflare.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
    ],
    blockedSources: [],
  },

  /**
   * Expert: All features enabled, minimal restrictions
   * For trusted content and development
   */
  expert: {
    allowParserCode: true,
    allowHTMLCode: true,
    warnOnCode: false,
    trustedSources: ['*'],
    blockedSources: [],
  },

  /**
   * Custom: User-defined configuration
   * Uses whatever values are provided
   */
  custom: {
    allowParserCode: false,
    allowHTMLCode: false,
    warnOnCode: true,
    trustedSources: [],
    blockedSources: [],
  },
};

/**
 * Security YAML structure
 */
export interface SecurityYAML {
  profile?: SecurityProfile;
  settings?: {
    allowParserCode?: boolean;
    allowHTMLCode?: boolean;
    warnOnCode?: boolean;
  };
  trustedSources?: string[];
  blockedSources?: string[];
  allowedDomains?: string[];  // Alias for trustedSources
  blockedDomains?: string[];  // Alias for blockedSources
}

/**
 * Parse security configuration from YAML object
 * This expects the YAML to already be parsed (e.g., by js-yaml)
 */
export function parseSecurityConfig(yaml: SecurityYAML): SecurityConfig {
  const profile: SecurityProfile = yaml.profile || 'warn';
  const defaults = SECURITY_PROFILES[profile];

  // Merge trusted sources (support both names)
  const trustedSources = [
    ...(yaml.trustedSources || []),
    ...(yaml.allowedDomains || []),
    ...(defaults.trustedSources || []),
  ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

  // Merge blocked sources (support both names)
  const blockedSources = [
    ...(yaml.blockedSources || []),
    ...(yaml.blockedDomains || []),
    ...(defaults.blockedSources || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  return {
    profile,
    allowParserCode: yaml.settings?.allowParserCode ?? defaults.allowParserCode,
    allowHTMLCode: yaml.settings?.allowHTMLCode ?? defaults.allowHTMLCode,
    warnOnCode: yaml.settings?.warnOnCode ?? defaults.warnOnCode,
    trustedSources,
    blockedSources,
  };
}

/**
 * Generate a sample security.yaml content
 */
export function generateSampleSecurityYAML(profile: SecurityProfile = 'warn'): string {
  const config = SECURITY_PROFILES[profile];

  return `# MD++ Security Configuration
# Profile: ${profile}
# Options: strict, warn, expert, custom

profile: ${profile}

# Settings for code execution
settings:
  allowParserCode: ${config.allowParserCode}
  allowHTMLCode: ${config.allowHTMLCode}
  warnOnCode: ${config.warnOnCode}

# Trusted sources for external content (CSS, JS, images)
# Use '*' to allow all, or list specific domains
trustedSources:
${config.trustedSources?.map(s => `  - ${s}`).join('\n') || '  # No trusted sources'}

# Blocked sources (takes precedence over trusted)
blockedSources:
${config.blockedSources?.map(s => `  - ${s}`).join('\n') || '  # No blocked sources'}
`;
}

/**
 * Check if a URL is trusted based on security config
 */
export function isSourceTrusted(url: string, config: SecurityConfig): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check blocked first (takes precedence)
    if (config.blockedSources) {
      for (const blocked of config.blockedSources) {
        if (blocked === '*' || matchDomain(hostname, blocked)) {
          return false;
        }
      }
    }

    // Check trusted
    if (config.trustedSources) {
      for (const trusted of config.trustedSources) {
        if (trusted === '*' || matchDomain(hostname, trusted)) {
          return true;
        }
      }
    }

    // Not in any list - default to false for strict, true for expert
    return config.profile === 'expert';
  } catch {
    // Invalid URL - not trusted
    return false;
  }
}

/**
 * Match a hostname against a domain pattern
 * Supports wildcards: *.example.com matches sub.example.com
 */
function matchDomain(hostname: string, pattern: string): boolean {
  if (pattern.startsWith('*.')) {
    const baseDomain = pattern.slice(2);
    return hostname === baseDomain || hostname.endsWith('.' + baseDomain);
  }
  return hostname === pattern;
}

/**
 * Validate a security configuration
 * Returns an array of warning/error messages
 */
export function validateSecurityConfig(config: SecurityConfig): string[] {
  const warnings: string[] = [];

  // Check for overly permissive settings
  if (config.allowParserCode && config.profile !== 'expert') {
    warnings.push('Warning: allowParserCode is enabled but profile is not "expert". This may be risky.');
  }

  if (config.allowHTMLCode && config.profile !== 'expert') {
    warnings.push('Warning: allowHTMLCode is enabled but profile is not "expert". This may be risky.');
  }

  // Check for wildcard trust
  if (config.trustedSources?.includes('*') && config.profile !== 'expert') {
    warnings.push('Warning: Trusting all sources (*) with non-expert profile. Consider being more specific.');
  }

  // Check for conflicting settings
  if (config.trustedSources?.includes('*') && config.blockedSources?.length) {
    warnings.push('Note: Blocked sources will take precedence over trusted wildcard.');
  }

  return warnings;
}

/**
 * Get security recommendation based on use case
 */
export function getSecurityRecommendation(useCase: 'public' | 'internal' | 'development'): SecurityProfile {
  switch (useCase) {
    case 'public':
      return 'strict';
    case 'internal':
      return 'warn';
    case 'development':
      return 'expert';
  }
}

export default {
  SECURITY_PROFILES,
  parseSecurityConfig,
  generateSampleSecurityYAML,
  isSourceTrusted,
  validateSecurityConfig,
  getSecurityRecommendation,
};
