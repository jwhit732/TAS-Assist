# Claude Client Library

This directory contains the core library modules for the TAS Assistant, including the Claude API client wrapper.

## Files

### `claude-client.ts`

Main Claude API client wrapper that abstracts Anthropic SDK interactions.

**Features:**
- Clean interface for text and structured JSON generation
- Built-in retry logic with exponential backoff
- Comprehensive error handling with user-friendly messages
- Request/response logging for debugging
- TypeScript type safety throughout
- Singleton pattern support for shared instances

**Classes:**

#### `ClaudeClient`

Primary client class for interacting with the Claude API.

```typescript
const client = new ClaudeClient(apiKey, model?, config?);
```

**Methods:**

- `generate(systemPrompt, userPrompt, options?)` - Generate text responses
- `generateStructured(systemPrompt, userPrompt, schema)` - Generate JSON responses
- `getModel()` - Get current model identifier
- `setModel(model)` - Change model identifier
- `setDebug(enabled)` - Toggle debug logging

**Factory Functions:**

- `createDefaultClient()` - Create a new client with environment config
- `getDefaultClient()` - Get singleton instance (lazy-loaded)
- `resetDefaultClient()` - Reset singleton (useful for testing)

**Error Handling:**

The client wraps all errors in `ClaudeAPIError` with user-friendly messages:
- Invalid API key → Clear setup instructions
- Rate limits → Retry advice
- Server errors → Service status info
- Malformed JSON → Parsing details

**Retry Logic:**

Automatic retry with exponential backoff for:
- Rate limits (429)
- Timeouts (408)
- Server errors (5xx)

Default configuration:
```typescript
{
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
}
```

### `aprv.ts`

APRV (Act-Plan-Reflect-Verify) loop implementation for reliable AI generation with self-repair capabilities.

See file for detailed documentation.

### `claude-client.example.ts`

Example usage patterns for the Claude client. This file demonstrates:
- Basic text generation
- Structured JSON output
- Error handling
- Custom retry configuration
- Model switching

**Remove this file before deployment.**

## Usage Examples

### Basic Generation

```typescript
import { ClaudeClient } from '@/lib/claude-client';
import { config } from '@/config/env';

const client = new ClaudeClient(config.anthropicApiKey);

const response = await client.generate(
  'You are a helpful assistant.',
  'Explain TypeScript in simple terms.',
  { temperature: 0.7, maxTokens: 500 }
);
```

### Structured Output

```typescript
import { getDefaultClient } from '@/lib/claude-client';

const client = getDefaultClient();

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
};

const result = await client.generateStructured(
  'You generate JSON data.',
  'Create a person object',
  schema
);
```

### With APRV Loop

```typescript
import { generateWithAPRV } from '@/lib/aprv';
import { getDefaultClient } from '@/lib/claude-client';

const client = getDefaultClient();
const schema = await loadSchema();

const result = await generateWithAPRV({
  client,
  systemPrompt: 'Your system prompt',
  userPrompt: 'Your request',
  schema,
  maxIterations: 3,
});
```

### Error Handling

```typescript
import { ClaudeClient, ClaudeAPIError } from '@/lib/claude-client';

try {
  const client = new ClaudeClient(apiKey);
  const response = await client.generate(system, user);
} catch (error) {
  if (error instanceof ClaudeAPIError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Request ID:', error.requestId);
  }
}
```

## Integration with API Routes

```typescript
// app/api/generate/route.ts
import { getDefaultClient } from '@/lib/claude-client';
import { validateEnv } from '@/config/env';

export async function POST(request: Request) {
  try {
    validateEnv();

    const client = getDefaultClient();
    const data = await request.json();

    const response = await client.generate(
      systemPrompt,
      userPrompt,
      { maxTokens: 8192 }
    );

    return Response.json({ success: true, data: response });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## Configuration

The client uses environment variables via `config/env.ts`:

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_API_MODEL=claude-3-5-sonnet-20241022
```

## Testing

```typescript
import { ClaudeClient } from '@/lib/claude-client';

describe('ClaudeClient', () => {
  it('should generate text', async () => {
    const client = new ClaudeClient(testApiKey);
    const response = await client.generate('system', 'user');
    expect(response).toBeTruthy();
  });

  it('should handle invalid API key', () => {
    expect(() => new ClaudeClient('invalid')).toThrow(ClaudeAPIError);
  });
});
```

## Performance Considerations

- **Singleton Pattern**: Use `getDefaultClient()` to reuse connections
- **Retry Logic**: Automatic exponential backoff reduces manual retry code
- **Streaming**: Not yet implemented (future enhancement)
- **Token Limits**: Default 4096 tokens for text, 8192 for structured output

## Future Enhancements

- [ ] Streaming support for long responses
- [ ] Response caching layer
- [ ] Token usage tracking and budgeting
- [ ] Multiple model comparison
- [ ] Prompt template management
- [ ] Response validation middleware

## Troubleshooting

### "API key is required"
- Ensure `ANTHROPIC_API_KEY` is set in `.env.local`
- Run `validateEnv()` to check configuration

### "Failed to parse JSON response"
- Check schema matches expected output
- Enable debug logging: `client.setDebug(true)`
- Inspect `responseBody` in error object

### Rate limit errors
- Increase retry delays in config
- Implement request queuing
- Reduce concurrent requests

### Server errors (5xx)
- Check Anthropic status page
- Retry logic will handle automatically
- Consider implementing circuit breaker pattern

## Related Files

- `config/env.ts` - Environment configuration
- `types/unit-plan.ts` - TypeScript type definitions
- `prompts/` - Prompt templates
- `app/api/generate/route.ts` - API route implementation
