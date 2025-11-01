/**
 * Example usage of the Claude Client
 *
 * This file demonstrates how to use the ClaudeClient wrapper
 * in various scenarios. Remove this file before deployment.
 */

import { ClaudeClient, createDefaultClient, getDefaultClient } from './claude-client';
import { config } from '@/config/env';
import type { IntakeFormData, GeneratedPlan } from '@/types/unit-plan';

/**
 * Example 1: Basic text generation
 */
async function exampleBasicGeneration() {
  const client = new ClaudeClient(config.anthropicApiKey);

  const response = await client.generate(
    'You are a helpful assistant that explains technical concepts clearly.',
    'Explain what a REST API is in simple terms.',
    {
      temperature: 0.7,
      maxTokens: 500,
    }
  );

  console.log('Response:', response);
}

/**
 * Example 2: Using the default client (singleton)
 */
async function exampleDefaultClient() {
  const client = getDefaultClient();

  const response = await client.generate(
    'You are a concise assistant.',
    'What is TypeScript?',
    { maxTokens: 200 }
  );

  console.log('Response:', response);
}

/**
 * Example 3: Structured JSON generation
 */
async function exampleStructuredOutput() {
  const client = createDefaultClient();

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
    },
    required: ['title', 'description'],
  };

  const result = await client.generateStructured(
    'You are a JSON generator.',
    'Create a blog post metadata object about web development',
    schema
  );

  console.log('Structured result:', JSON.stringify(result, null, 2));
}

/**
 * Example 4: Unit plan generation (typical use case)
 */
async function exampleUnitPlanGeneration() {
  const client = createDefaultClient();

  const intakeData: IntakeFormData = {
    qualification: 'Certificate IV in Training and Assessment',
    qualificationCode: 'TAE40122',
    deliveryMode: 'blended',
    durationWeeks: 12,
    totalHours: 120,
    cohortProfile: 'Adult learners with industry experience',
    resources: ['Learning management system', 'Video conferencing', 'Physical classroom'],
    assessmentPreferences: ['Portfolio', 'Practical observation', 'Written assessment'],
  };

  const systemPrompt = `You are an expert in Australian VET sector curriculum design.
You create comprehensive, audit-ready unit plans for RTOs.`;

  const userPrompt = `Create a detailed unit plan for:
Qualification: ${intakeData.qualification} (${intakeData.qualificationCode})
Delivery Mode: ${intakeData.deliveryMode}
Duration: ${intakeData.durationWeeks} weeks, ${intakeData.totalHours} hours total
Cohort: ${intakeData.cohortProfile}

Generate a complete JSON response with weekly plan, units, assessments, and risks.`;

  // In real usage, this would use the APRV system and schema validation
  const planSchema = {
    type: 'object',
    properties: {
      metadata: { type: 'object' },
      meta: { type: 'object' },
      weekly_plan: { type: 'array' },
      units: { type: 'array' },
      risks: { type: 'array' },
      assumptions: { type: 'array' },
      confidence: { type: 'number' },
    },
  };

  const plan = (await client.generateStructured(
    systemPrompt,
    userPrompt,
    planSchema
  )) as GeneratedPlan;

  console.log('Generated plan:', JSON.stringify(plan, null, 2));
}

/**
 * Example 5: Error handling
 */
async function exampleErrorHandling() {
  try {
    const client = new ClaudeClient('invalid-key');
    await client.generate('System prompt', 'User prompt');
  } catch (error) {
    console.error('Error caught:', error);
    // ClaudeAPIError will have user-friendly messages
  }
}

/**
 * Example 6: Custom retry configuration
 */
async function exampleCustomRetry() {
  const client = new ClaudeClient(
    config.anthropicApiKey,
    'claude-3-5-sonnet-20241022',
    {
      retry: {
        maxRetries: 5,
        initialDelay: 2000,
        maxDelay: 20000,
        backoffMultiplier: 2.5,
      },
      debug: true,
    }
  );

  const response = await client.generate('You are helpful.', 'Say hello!');
  console.log(response);
}

/**
 * Example 7: Model switching
 */
async function exampleModelSwitch() {
  const client = createDefaultClient();

  console.log('Current model:', client.getModel());

  // Switch to a different model if needed
  client.setModel('claude-3-opus-20240229');
  console.log('New model:', client.getModel());

  const response = await client.generate(
    'You are a creative writer.',
    'Write a haiku about coding.'
  );

  console.log(response);
}

// Export examples for testing
export {
  exampleBasicGeneration,
  exampleDefaultClient,
  exampleStructuredOutput,
  exampleUnitPlanGeneration,
  exampleErrorHandling,
  exampleCustomRetry,
  exampleModelSwitch,
};
