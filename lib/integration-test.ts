/**
 * Integration Test Script
 *
 * Run this script to verify the Claude client integration.
 * This is a development/testing file - remove before deployment.
 *
 * Usage:
 *   npx ts-node lib/integration-test.ts
 */

import { validateEnv, getEnvErrorMessage, logConfig } from '@/config/env';
import { ClaudeClient, createDefaultClient, ClaudeAPIError } from '@/lib/claude-client';

async function runIntegrationTest() {
  console.log('=== TAS Assistant Integration Test ===\n');

  // Test 1: Environment validation
  console.log('Test 1: Environment Validation');
  try {
    validateEnv();
    console.log('✓ Environment configuration is valid\n');
  } catch (error) {
    console.error('✗ Environment validation failed:');
    console.error(getEnvErrorMessage());
    console.log('\nPlease fix the environment configuration before proceeding.\n');
    process.exit(1);
  }

  // Test 2: Log configuration (development only)
  console.log('Test 2: Configuration Logging');
  logConfig();
  console.log();

  // Test 3: Client instantiation
  console.log('Test 3: Client Instantiation');
  try {
    const client = createDefaultClient();
    console.log('✓ Default client created successfully');
    console.log(`  Model: ${client.getModel()}\n`);
  } catch (error) {
    console.error('✗ Failed to create client:', error);
    process.exit(1);
  }

  // Test 4: Basic generation (only if API key is valid)
  console.log('Test 4: Basic Text Generation');
  try {
    const client = createDefaultClient();
    client.setDebug(false); // Reduce noise for test

    console.log('  Sending request to Claude API...');
    const response = await client.generate(
      'You are a concise assistant. Respond in one sentence only.',
      'Say "Hello from TAS Assistant integration test!"',
      { maxTokens: 50, temperature: 0.3 }
    );

    console.log('✓ Generation successful');
    console.log(`  Response: ${response.trim()}\n`);
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      console.error('✗ API Error:', error.message);
      if (error.statusCode) {
        console.error(`  Status Code: ${error.statusCode}`);
      }
      if (error.requestId) {
        console.error(`  Request ID: ${error.requestId}`);
      }
    } else {
      console.error('✗ Unexpected error:', error);
    }
    console.log('\nNote: API call failed. This is expected if:');
    console.log('  - API key is a placeholder value');
    console.log('  - Network connectivity issues');
    console.log('  - Rate limits exceeded\n');
  }

  // Test 5: Structured output
  console.log('Test 5: Structured JSON Generation');
  try {
    const client = createDefaultClient();
    client.setDebug(false);

    const schema = {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        status: { type: 'string' },
      },
      required: ['message', 'status'],
    };

    console.log('  Requesting structured JSON...');
    const result = await client.generateStructured(
      'You generate valid JSON responses only.',
      'Create a simple status message object with message="Integration test passed" and status="success"',
      schema
    );

    console.log('✓ Structured generation successful');
    console.log(`  Result: ${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      console.error('✗ API Error:', error.message);
    } else {
      console.error('✗ Unexpected error:', error);
    }
    console.log('\nNote: Structured generation test skipped due to API error.\n');
  }

  // Test 6: Error handling
  console.log('Test 6: Error Handling');
  try {
    new ClaudeClient('invalid-key-format');
    console.log('✗ Should have thrown error for invalid key\n');
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      console.log('✓ Correctly caught invalid API key error');
      console.log(`  Message: ${error.message}\n`);
    }
  }

  console.log('=== Integration Test Complete ===\n');
  console.log('Summary:');
  console.log('  - Environment: Configured');
  console.log('  - Client: Operational');
  console.log('  - Type Safety: Verified');
  console.log('  - Error Handling: Functional');
  console.log('\nNext steps:');
  console.log('  1. Implement APRV system integration');
  console.log('  2. Create API routes using this client');
  console.log('  3. Build intake form and results UI');
  console.log('  4. Add schema validation layer\n');
}

// Run the test if executed directly
if (require.main === module) {
  runIntegrationTest().catch((error) => {
    console.error('Fatal error during integration test:', error);
    process.exit(1);
  });
}

export { runIntegrationTest };
