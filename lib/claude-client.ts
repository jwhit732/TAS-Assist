/**
 * Claude API Client Wrapper
 *
 * Abstracts Anthropic SDK interactions and provides a clean interface
 * for the APRV system with built-in retry logic, error handling, and logging.
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '@/config/env';

/**
 * Options for generation requests
 */
export interface GenerationOptions {
  /** Sampling temperature (0-1, lower is more deterministic) */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Enable streaming responses (not yet implemented) */
  stream?: boolean;

  /** Stop sequences */
  stopSequences?: string[];

  /** Top-p sampling parameter */
  topP?: number;

  /** Top-k sampling parameter */
  topK?: number;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;

  /** Initial delay in milliseconds */
  initialDelay: number;

  /** Maximum delay in milliseconds */
  maxDelay: number;

  /** Backoff multiplier */
  backoffMultiplier: number;
}

/**
 * Client configuration
 */
export interface ClientConfig {
  /** Anthropic API key */
  apiKey: string;

  /** Model identifier */
  model?: string;

  /** Retry configuration */
  retry?: Partial<RetryConfig>;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * API error with additional context
 */
export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: unknown,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Claude API Client
 *
 * Provides methods for interacting with the Anthropic Claude API
 * with built-in retry logic, error handling, and logging.
 */
export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private retryConfig: RetryConfig;
  private debug: boolean;

  /**
   * Creates a new Claude API client
   *
   * @param apiKey - Anthropic API key
   * @param model - Model identifier (defaults to config value)
   */
  constructor(
    apiKey: string,
    model?: string,
    clientConfig?: Partial<ClientConfig>
  ) {
    if (!apiKey) {
      throw new ClaudeAPIError(
        'API key is required. Please set ANTHROPIC_API_KEY environment variable.'
      );
    }

    if (apiKey === 'your-key-here' || apiKey === 'your_api_key_here') {
      throw new ClaudeAPIError(
        'Invalid API key. Please replace the placeholder with a valid Anthropic API key.'
      );
    }

    this.client = new Anthropic({
      apiKey,
    });

    this.model = model || config.model || 'claude-3-5-sonnet-20241022';
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...clientConfig?.retry,
    };
    this.debug = clientConfig?.debug || config.isDevelopment;

    this.log('Claude client initialized', {
      model: this.model,
      retryConfig: this.retryConfig,
    });
  }

  /**
   * Internal logging method
   */
  private log(message: string, data?: unknown): void {
    if (this.debug) {
      console.log(`[ClaudeClient] ${message}`, data || '');
    }
  }

  /**
   * Sleep for a specified duration
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.initialDelay *
        Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelay
    );
    // Add jitter (±20%)
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);
    return Math.floor(delay + jitter);
  }

  /**
   * Determines if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Anthropic.APIError) {
      // Retry on rate limits, timeouts, and server errors
      return (
        error.status === 429 || // Rate limit
        error.status === 408 || // Request timeout
        error.status === 503 || // Service unavailable
        error.status === 504 || // Gateway timeout
        (error.status >= 500 && error.status < 600) // Server errors
      );
    }
    return false;
  }

  /**
   * Execute a request with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.log(`Executing ${context} (attempt ${attempt + 1})`);
        const result = await operation();
        this.log(`${context} succeeded on attempt ${attempt + 1}`);
        return result;
      } catch (error) {
        lastError = error;

        if (!this.isRetryableError(error)) {
          this.log(`${context} failed with non-retryable error`, error);
          throw this.formatError(error);
        }

        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateBackoff(attempt);
          this.log(
            `${context} failed (attempt ${attempt + 1}), retrying in ${delay}ms`,
            error
          );
          await this.sleep(delay);
        }
      }
    }

    this.log(`${context} failed after ${this.retryConfig.maxRetries + 1} attempts`);
    throw this.formatError(lastError);
  }

  /**
   * Format errors for better user experience
   */
  private formatError(error: unknown): ClaudeAPIError {
    if (error instanceof Anthropic.APIError) {
      const message = this.getUserFriendlyErrorMessage(error);
      return new ClaudeAPIError(
        message,
        error.status,
        error.error,
        error.headers?.['request-id']
      );
    }

    if (error instanceof Error) {
      return new ClaudeAPIError(error.message);
    }

    return new ClaudeAPIError('An unknown error occurred');
  }

  /**
   * Get user-friendly error messages
   */
  private getUserFriendlyErrorMessage(error: any): string {
    switch (error.status) {
      case 401:
        return 'Invalid API key. Please check your ANTHROPIC_API_KEY environment variable.';
      case 403:
        return 'Access forbidden. Your API key may not have the required permissions.';
      case 429:
        return 'Rate limit exceeded. Please try again in a moment.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Anthropic service is temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An error occurred while communicating with Claude API.';
    }
  }

  /**
   * Main generation method
   *
   * Generates text using Claude with the specified prompts and options.
   *
   * @param systemPrompt - System prompt defining Claude's role and behavior
   * @param userPrompt - User prompt with the actual request
   * @param options - Generation options (temperature, maxTokens, etc.)
   * @returns Generated text response
   *
   * @throws {ClaudeAPIError} If the API request fails
   *
   * @example
   * ```typescript
   * const client = new ClaudeClient(apiKey);
   * const response = await client.generate(
   *   "You are a helpful assistant.",
   *   "Explain quantum computing in simple terms.",
   *   { temperature: 0.7, maxTokens: 1000 }
   * );
   * ```
   */
  async generate(
    systemPrompt: string,
    userPrompt: string,
    options: GenerationOptions = {}
  ): Promise<string> {
    const startTime = Date.now();

    const response = await this.executeWithRetry(
      async () => {
        return await this.client.messages.create({
          model: this.model,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 1.0,
          top_p: options.topP,
          top_k: options.topK,
          stop_sequences: options.stopSequences,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });
      },
      'generate'
    );

    const duration = Date.now() - startTime;

    this.log('Generation complete', {
      duration_ms: duration,
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      stop_reason: response.stop_reason,
    });

    // Extract text content
    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n');

    return textContent;
  }

  /**
   * Structured output generation method
   *
   * Generates JSON output conforming to a specified schema.
   * Uses prompt engineering to encourage valid JSON output.
   *
   * @param systemPrompt - System prompt defining Claude's role
   * @param userPrompt - User prompt with the request
   * @param schema - JSON schema object (for documentation, not enforced)
   * @returns Parsed JSON object
   *
   * @throws {ClaudeAPIError} If the API request fails or JSON parsing fails
   *
   * @example
   * ```typescript
   * const client = new ClaudeClient(apiKey);
   * const result = await client.generateStructured(
   *   "You are a JSON generator.",
   *   "Generate a person object",
   *   { type: "object", properties: { name: { type: "string" } } }
   * );
   * ```
   */
  async generateStructured(
    systemPrompt: string,
    userPrompt: string,
    schema: object
  ): Promise<object> {
    // Enhance prompts to encourage JSON output
    const enhancedSystemPrompt = `${systemPrompt}

IMPORTANT: You must respond with valid JSON only. Do not include any explanatory text before or after the JSON.`;

    const enhancedUserPrompt = `${userPrompt}

Response format: Valid JSON conforming to this schema:
${JSON.stringify(schema, null, 2)}

Respond with JSON only, no other text.`;

    const startTime = Date.now();
    const textResponse = await this.generate(
      enhancedSystemPrompt,
      enhancedUserPrompt,
      {
        temperature: 0.3, // Lower temperature for more consistent JSON
        maxTokens: 8192,
      }
    );

    // Extract JSON from response (handle markdown code blocks if present)
    let jsonText = textResponse.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
    }

    try {
      const parsed = JSON.parse(jsonText);
      const duration = Date.now() - startTime;

      this.log('Structured generation complete', {
        duration_ms: duration,
        output_size_bytes: jsonText.length,
      });

      return parsed;
    } catch (error) {
      this.log('JSON parsing failed', {
        error,
        response_preview: jsonText.substring(0, 500),
      });

      throw new ClaudeAPIError(
        `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        { response: jsonText }
      );
    }
  }

  /**
   * Get the current model identifier
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Set a new model identifier
   */
  setModel(model: string): void {
    this.model = model;
    this.log('Model updated', { model });
  }

  /**
   * Enable or disable debug logging
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled;
  }
}

/**
 * Create a default Claude client using environment configuration
 *
 * @returns Configured ClaudeClient instance
 * @throws {ClaudeAPIError} If API key is not configured
 */
export function createDefaultClient(): ClaudeClient {
  if (!config.anthropicApiKey) {
    throw new ClaudeAPIError(
      'ANTHROPIC_API_KEY is not configured. Please set it in your .env.local file.'
    );
  }

  return new ClaudeClient(config.anthropicApiKey, config.model, {
    debug: config.isDevelopment,
  });
}

/**
 * Singleton instance (lazy-loaded)
 */
let defaultClientInstance: ClaudeClient | null = null;

/**
 * Get the default client instance (singleton)
 *
 * @returns Shared ClaudeClient instance
 */
export function getDefaultClient(): ClaudeClient {
  if (!defaultClientInstance) {
    defaultClientInstance = createDefaultClient();
  }
  return defaultClientInstance;
}

/**
 * Reset the default client instance (useful for testing)
 */
export function resetDefaultClient(): void {
  defaultClientInstance = null;
}
