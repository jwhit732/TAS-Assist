/**
 * Environment Configuration
 *
 * Centralized configuration management for environment variables
 * with validation and type safety.
 */

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  /** Enable authentication features */
  auth: boolean;

  /** Enable telemetry and analytics */
  telemetry: boolean;
}

/**
 * Application configuration object
 */
export interface AppConfig {
  /** Anthropic API key for Claude */
  anthropicApiKey: string;

  /** Claude model identifier */
  model: string;

  /** Feature flags */
  features: FeatureFlags;

  /** Environment name (development, production, etc.) */
  environment: string;

  /** Whether running in production */
  isProduction: boolean;

  /** Whether running in development */
  isDevelopment: boolean;
}

/**
 * Validation error for environment configuration
 */
export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  // Try process.env first (Node.js/Next.js server-side)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key, String(defaultValue));
  return value === 'true' || value === '1';
}

/**
 * Application configuration singleton
 */
export const config: AppConfig = {
  anthropicApiKey: getEnvVar('ANTHROPIC_API_KEY', ''),
  model: getEnvVar('NEXT_PUBLIC_API_MODEL', 'claude-3-5-sonnet-20241022'),
  features: {
    auth: getBooleanEnvVar('NEXT_PUBLIC_FEATURE_AUTH', false),
    telemetry: getBooleanEnvVar('NEXT_PUBLIC_FEATURE_TELEMETRY', true),
  },
  environment: getEnvVar('NODE_ENV', 'development'),
  isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
  isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
};

/**
 * Validates the environment configuration
 *
 * @throws {EnvValidationError} If required environment variables are missing
 */
export function validateEnv(): void {
  const errors: string[] = [];

  // Check required variables
  if (!config.anthropicApiKey) {
    errors.push(
      'ANTHROPIC_API_KEY is required. Please set it in your .env.local file.'
    );
  }

  if (!config.model) {
    errors.push(
      'NEXT_PUBLIC_API_MODEL is missing. Using default: claude-3-5-sonnet-20241022'
    );
  }

  // Validate API key format (basic check)
  if (config.anthropicApiKey && !config.anthropicApiKey.startsWith('sk-')) {
    errors.push(
      'ANTHROPIC_API_KEY appears to be invalid. It should start with "sk-"'
    );
  }

  // Check for placeholder values
  if (
    config.anthropicApiKey === 'your-key-here' ||
    config.anthropicApiKey === 'your_api_key_here'
  ) {
    errors.push(
      'ANTHROPIC_API_KEY is set to a placeholder value. Please provide a valid API key.'
    );
  }

  if (errors.length > 0) {
    throw new EnvValidationError(
      `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Validates environment and returns configuration
 *
 * @throws {EnvValidationError} If validation fails
 * @returns {AppConfig} Validated configuration object
 */
export function getValidatedConfig(): AppConfig {
  validateEnv();
  return config;
}

/**
 * Checks if the environment is properly configured
 * without throwing errors
 *
 * @returns {boolean} True if configuration is valid
 */
export function isEnvValid(): boolean {
  try {
    validateEnv();
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets a user-friendly error message for missing/invalid configuration
 *
 * @returns {string | null} Error message or null if valid
 */
export function getEnvErrorMessage(): string | null {
  try {
    validateEnv();
    return null;
  } catch (error) {
    if (error instanceof EnvValidationError) {
      return error.message;
    }
    return 'Unknown environment configuration error';
  }
}

/**
 * Log configuration (sanitized for security)
 * Only use in development mode
 */
export function logConfig(): void {
  if (!config.isDevelopment) {
    return;
  }

  console.log('=== TAS Assistant Configuration ===');
  console.log(`Environment: ${config.environment}`);
  console.log(`Model: ${config.model}`);
  console.log(
    `API Key: ${config.anthropicApiKey ? '***' + config.anthropicApiKey.slice(-4) : 'NOT SET'}`
  );
  console.log(`Features:`);
  console.log(`  - Auth: ${config.features.auth}`);
  console.log(`  - Telemetry: ${config.features.telemetry}`);
  console.log('===================================');
}
