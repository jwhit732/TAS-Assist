/**
 * APRV (Analyze→Plan→Reflect→Verify) Loop Implementation
 *
 * This module orchestrates a multi-phase AI generation process to ensure
 * reliable, complete, and schema-compliant unit plan generation.
 *
 * Phases:
 * 1. Analyze: Internal reasoning about requirements (prompt engineering)
 * 2. Plan: Generate the full JSON response
 * 3. Reflect: Self-check completeness and quality
 * 4. Verify: Schema validation with automated repair
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Type definitions
export interface IntakeFormData {
  qualification: {
    title: string;
    code?: string;
    level?: string;
  };
  duration: {
    weeks: number;
    total_hours: number;
  };
  delivery_mode: 'face_to_face' | 'online' | 'blended' | 'workplace' | 'mixed';
  cohort_profile: string;
  resources?: {
    facilities?: string[];
    equipment?: string[];
    materials?: string[];
    technology?: string[];
  };
  assessment_preferences?: string[];
  unit_list?: string;
  trainer_details?: {
    primary_trainer?: string;
    additional_trainers?: string[];
  };
  start_date?: string;
  venue?: string;
  class_size?: {
    min?: number;
    max?: number;
    target?: number;
  };
}

export interface GeneratedPlan {
  success: boolean;
  plan?: any;
  error?: string;
  validation_errors?: z.ZodError;
  attempts?: number;
  phase_logs?: PhaseLog[];
}

interface PhaseLog {
  phase: 'analyze' | 'plan' | 'reflect' | 'verify' | 'repair';
  timestamp: string;
  duration_ms: number;
  status: 'success' | 'failure' | 'warning';
  details: string;
}

interface APRVContext {
  intake: IntakeFormData;
  systemPrompt: string;
  schema: any;
  logs: PhaseLog[];
  attempts: number;
  maxAttempts: number;
}

// Constants
const MAX_REPAIR_ATTEMPTS = 2;
const ANTHROPIC_MODEL = process.env.NEXT_PUBLIC_API_MODEL || 'claude-haiku-4-5';

/**
 * Main APRV orchestration function
 *
 * @param intake - User's intake form data
 * @param claudeClient - Initialized Anthropic client
 * @param schema - JSON schema for validation
 * @returns Generated plan with success/error information
 */
export async function generateWithAPRV(
  intake: IntakeFormData,
  claudeClient: Anthropic,
  schema: any
): Promise<GeneratedPlan> {
  const context: APRVContext = {
    intake,
    systemPrompt: '',
    schema,
    logs: [],
    attempts: 0,
    maxAttempts: MAX_REPAIR_ATTEMPTS,
  };

  try {
    // Load system prompt
    context.systemPrompt = await loadSystemPrompt();
    logPhase(context, 'analyze', 'success', 'System prompt loaded successfully');

    // Execute APRV loop
    const result = await executeAPRVLoop(claudeClient, context);

    return {
      success: true,
      plan: result,
      attempts: context.attempts,
      phase_logs: context.logs,
    };
  } catch (error: any) {
    console.error('[APRV] Fatal error:', error);

    return {
      success: false,
      error: formatUserError(error),
      attempts: context.attempts,
      phase_logs: context.logs,
    };
  }
}

/**
 * Execute the complete APRV loop with retry logic
 */
async function executeAPRVLoop(
  client: Anthropic,
  context: APRVContext
): Promise<any> {
  let lastError: Error | null = null;
  let lastPlan: any = null;

  for (let attempt = 0; attempt <= context.maxAttempts; attempt++) {
    context.attempts = attempt + 1;

    try {
      // Phase 1 & 2: Analyze + Plan (combined in single API call)
      const planResult = await analyzePlanPhase(client, context, lastError);
      lastPlan = planResult;

      // Phase 3: Reflect (self-assessment)
      const reflectResult = await reflectPhase(client, context, planResult);

      // If reflection identified issues and we have attempts left, continue to repair
      if (reflectResult.hasIssues && attempt < context.maxAttempts) {
        logPhase(context, 'reflect', 'warning', `Issues identified: ${reflectResult.issues.join(', ')}`);
        lastError = new Error(`Reflection issues: ${reflectResult.issues.join('; ')}`);
        continue;
      }

      // Phase 4: Verify (schema validation)
      const validationResult = await verifyPhase(context, planResult);

      if (validationResult.valid) {
        logPhase(context, 'verify', 'success', 'Schema validation passed');
        return planResult;
      }

      // Validation failed - prepare for repair attempt
      if (attempt < context.maxAttempts) {
        logPhase(
          context,
          'verify',
          'warning',
          `Schema validation failed: ${validationResult.errors.length} errors. Attempting repair...`
        );
        lastError = new Error(`Schema validation errors: ${formatValidationErrors(validationResult.errors)}`);
      } else {
        // No more attempts - fail with validation errors
        logPhase(context, 'verify', 'failure', 'Schema validation failed after max repair attempts');
        throw new Error(`Schema validation failed: ${formatValidationErrors(validationResult.errors)}`);
      }

    } catch (error: any) {
      lastError = error;

      if (attempt >= context.maxAttempts) {
        throw error;
      }

      logPhase(context, 'repair', 'warning', `Attempt ${attempt + 1} failed: ${error.message}. Retrying...`);
    }
  }

  // Should not reach here, but handle gracefully
  throw lastError || new Error('APRV loop failed after maximum attempts');
}

/**
 * Phase 1 & 2: Analyze and Plan
 *
 * Claude internally analyzes the requirements and generates the JSON plan.
 * This is done in a single API call using the system prompt.
 */
async function analyzePlanPhase(
  client: Anthropic,
  context: APRVContext,
  previousError: Error | null
): Promise<any> {
  const startTime = Date.now();

  try {
    // Build user prompt from intake data
    const userPrompt = buildUserPrompt(context.intake, previousError);

    logPhase(context, 'analyze', 'success', 'Starting generation with Claude API');

    // Call Claude API with streaming enabled for long responses
    const stream = await client.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: 32000,  // Increased for Haiku 4.5 to avoid truncation
      temperature: 0.7,
      system: context.systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Collect the complete response from the stream
    let responseText = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        responseText += chunk.delta.text;
      }
    }

    const duration = Date.now() - startTime;

    console.log('[APRV] Response length:', responseText.length, 'characters');
    console.log('[APRV] Response preview:', responseText.substring(0, 200));
    console.log('[APRV] Response end:', responseText.substring(responseText.length - 200));

    const jsonPlan = extractJSON(responseText);

    if (!jsonPlan) {
      console.error('[APRV] Failed to extract JSON from response');
      throw new Error('Failed to extract valid JSON from Claude response');
    }

    console.log('[APRV] Extracted JSON successfully, keys:', Object.keys(jsonPlan));
    logPhase(context, 'plan', 'success', `Generated plan in ${duration}ms`);

    return jsonPlan;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logPhase(context, 'plan', 'failure', `Generation failed after ${duration}ms: ${error.message}`);
    throw error;
  }
}

/**
 * Phase 3: Reflect
 *
 * Ask Claude to self-assess the generated plan for completeness and quality.
 */
async function reflectPhase(
  client: Anthropic,
  context: APRVContext,
  plan: any
): Promise<{ hasIssues: boolean; issues: string[] }> {
  const startTime = Date.now();

  try {
    const reflectionPrompt = buildReflectionPrompt(context.intake, plan);

    const message = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2000,
      temperature: 0.3,
      system: 'You are a quality assurance expert for Australian RTO training plans. Your job is to review generated plans and identify any gaps, inconsistencies, or areas that need improvement.',
      messages: [
        {
          role: 'user',
          content: reflectionPrompt,
        },
      ],
    });

    const duration = Date.now() - startTime;
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse reflection response
    const hasIssues = responseText.toLowerCase().includes('issue') ||
                      responseText.toLowerCase().includes('gap') ||
                      responseText.toLowerCase().includes('missing') ||
                      responseText.toLowerCase().includes('incomplete');

    const issues = hasIssues ? [responseText.slice(0, 200)] : [];

    logPhase(
      context,
      'reflect',
      hasIssues ? 'warning' : 'success',
      hasIssues ? `Issues found in ${duration}ms` : `No issues found in ${duration}ms`
    );

    return { hasIssues, issues };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logPhase(context, 'reflect', 'warning', `Reflection failed after ${duration}ms: ${error.message}. Continuing...`);

    // Non-critical failure - continue without reflection
    return { hasIssues: false, issues: [] };
  }
}

/**
 * Phase 4: Verify
 *
 * Validate the generated plan against the JSON schema using Zod.
 */
async function verifyPhase(
  context: APRVContext,
  plan: any
): Promise<{ valid: boolean; errors: any[] }> {
  const startTime = Date.now();

  try {
    // Convert JSON Schema to Zod schema (simplified validation)
    // For production, you'd use a full JSON Schema validator
    const validationResult = validateAgainstSchema(plan, context.schema);

    const duration = Date.now() - startTime;

    if (validationResult.valid) {
      logPhase(context, 'verify', 'success', `Schema validation passed in ${duration}ms`);
    } else {
      logPhase(
        context,
        'verify',
        'failure',
        `Schema validation failed in ${duration}ms: ${validationResult.errors.length} errors`
      );
    }

    return validationResult;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logPhase(context, 'verify', 'failure', `Verification error after ${duration}ms: ${error.message}`);

    return {
      valid: false,
      errors: [{ path: 'root', message: error.message }],
    };
  }
}

/**
 * Build user prompt from intake data
 */
function buildUserPrompt(intake: IntakeFormData, previousError: Error | null): string {
  let prompt = `Generate a comprehensive unit plan for the following Australian RTO training program:

QUALIFICATION
Title: ${intake.qualification.title}
${intake.qualification.code ? `Code: ${intake.qualification.code}` : ''}
${intake.qualification.level ? `Level: ${intake.qualification.level}` : ''}

DURATION
Weeks: ${intake.duration.weeks}
Total Hours: ${intake.duration.total_hours}
Hours per Week: ${(intake.duration.total_hours / intake.duration.weeks).toFixed(1)}

DELIVERY MODE
${intake.delivery_mode.replace(/_/g, ' ').toUpperCase()}

COHORT PROFILE
${intake.cohort_profile}
`;

  // Add optional fields if provided
  if (intake.start_date) {
    prompt += `\nSTART DATE: ${intake.start_date}`;
  }

  if (intake.venue) {
    prompt += `\nVENUE: ${intake.venue}`;
  }

  if (intake.class_size) {
    prompt += `\nCLASS SIZE: Min ${intake.class_size.min || 'TBD'}, Max ${intake.class_size.max || 'TBD'}, Target ${intake.class_size.target || 'TBD'}`;
  }

  if (intake.trainer_details?.primary_trainer) {
    prompt += `\nPRIMARY TRAINER: ${intake.trainer_details.primary_trainer}`;
  }

  if (intake.resources) {
    prompt += '\n\nAVAILABLE RESOURCES:';
    if (intake.resources.facilities?.length) {
      prompt += `\nFacilities: ${intake.resources.facilities.join(', ')}`;
    }
    if (intake.resources.equipment?.length) {
      prompt += `\nEquipment: ${intake.resources.equipment.join(', ')}`;
    }
    if (intake.resources.technology?.length) {
      prompt += `\nTechnology: ${intake.resources.technology.join(', ')}`;
    }
  }

  if (intake.assessment_preferences?.length) {
    prompt += `\n\nASSESSMENT PREFERENCES: ${intake.assessment_preferences.join(', ')}`;
  }

  if (intake.unit_list) {
    prompt += `\n\nUNIT LIST (if provided):\n${intake.unit_list}`;
  }

  // Add repair context if this is a retry
  if (previousError) {
    prompt += `\n\n⚠️ PREVIOUS GENERATION FAILED - PLEASE FIX:
${previousError.message}

Please address the above issues and generate a corrected plan.`;
  }

  prompt += `\n\nPlease generate a complete, audit-ready unit plan following the APRV process:
1. Analyze the requirements carefully
2. Plan a comprehensive delivery schedule
3. Ensure all elements are realistic and practical
4. Output valid JSON matching the required schema

Return ONLY the JSON response, no additional text or markdown.`;

  return prompt;
}

/**
 * Build reflection prompt for self-assessment
 */
function buildReflectionPrompt(intake: IntakeFormData, plan: any): string {
  return `Review this generated unit plan and identify any issues, gaps, or improvements needed:

ORIGINAL REQUEST:
- Qualification: ${intake.qualification.title}
- Duration: ${intake.duration.weeks} weeks, ${intake.duration.total_hours} hours
- Delivery Mode: ${intake.delivery_mode}

GENERATED PLAN:
${JSON.stringify(plan, null, 2).slice(0, 5000)}

Check for:
1. Completeness: Are all required fields populated with realistic values?
2. Consistency: Do hours add up correctly? Are dates logical?
3. Practicality: Is this plan actually deliverable by a real RTO?
4. Compliance: Does it align with Australian VET sector requirements?

If you find any issues, list them clearly. If the plan looks good, say "No issues found."`;
}

/**
 * Extract JSON from Claude's response
 */
function extractJSON(text: string): any | null {
  try {
    // Try to parse the entire response as JSON
    return JSON.parse(text);
  } catch {
    // Look for JSON in code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }

    // Look for JSON object in the text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        return null;
      }
    }

    return null;
  }
}

/**
 * Validate plan against JSON schema
 * This is a simplified validation - for production, use a full JSON Schema validator
 */
function validateAgainstSchema(plan: any, schema: any): { valid: boolean; errors: any[] } {
  const errors: any[] = [];

  try {
    // Check required top-level fields
    const required = schema.required || [];
    for (const field of required) {
      if (!(field in plan)) {
        errors.push({
          path: field,
          message: `Required field '${field}' is missing`,
        });
      }
    }

    // Check metadata
    if (plan.metadata) {
      if (!plan.metadata.schema_version) {
        errors.push({ path: 'metadata.schema_version', message: 'Missing schema version' });
      }
      if (!plan.metadata.project_type) {
        errors.push({ path: 'metadata.project_type', message: 'Missing project type' });
      }
      if (!plan.metadata.generated_at) {
        errors.push({ path: 'metadata.generated_at', message: 'Missing generated_at timestamp' });
      }
    }

    // Check meta
    if (plan.meta) {
      if (!plan.meta.qualification?.title) {
        errors.push({ path: 'meta.qualification.title', message: 'Missing qualification title' });
      }
      if (!plan.meta.duration?.weeks) {
        errors.push({ path: 'meta.duration.weeks', message: 'Missing duration weeks' });
      }
      if (!plan.meta.duration?.total_hours) {
        errors.push({ path: 'meta.duration.total_hours', message: 'Missing total hours' });
      }
      if (!plan.meta.delivery_mode) {
        errors.push({ path: 'meta.delivery_mode', message: 'Missing delivery mode' });
      }
      if (!plan.meta.cohort_profile) {
        errors.push({ path: 'meta.cohort_profile', message: 'Missing cohort profile' });
      }
    }

    // Check weekly_plan
    if (!Array.isArray(plan.weekly_plan) || plan.weekly_plan.length === 0) {
      errors.push({ path: 'weekly_plan', message: 'Weekly plan must be a non-empty array' });
    }

    // Check units
    if (!Array.isArray(plan.units) || plan.units.length === 0) {
      errors.push({ path: 'units', message: 'Units must be a non-empty array' });
    }

    // Check confidence_score
    if (typeof plan.confidence_score !== 'number' || plan.confidence_score < 0 || plan.confidence_score > 1) {
      errors.push({ path: 'confidence_score', message: 'Confidence score must be a number between 0 and 1' });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error: any) {
    return {
      valid: false,
      errors: [{ path: 'root', message: `Validation error: ${error.message}` }],
    };
  }
}

/**
 * Load system prompt from file
 */
async function loadSystemPrompt(): Promise<string> {
  try {
    const promptPath = join(process.cwd(), 'prompts', 'system.md');
    const content = await readFile(promptPath, 'utf-8');
    return content;
  } catch (error) {
    console.error('[APRV] Failed to load system prompt:', error);
    throw new Error('Failed to load system prompt file. Ensure prompts/system.md exists.');
  }
}

/**
 * Log a phase execution
 */
function logPhase(
  context: APRVContext,
  phase: PhaseLog['phase'],
  status: PhaseLog['status'],
  details: string
): void {
  const log: PhaseLog = {
    phase,
    timestamp: new Date().toISOString(),
    duration_ms: 0,
    status,
    details,
  };

  context.logs.push(log);
  console.log(`[APRV:${phase.toUpperCase()}] ${status.toUpperCase()}: ${details}`);
}

/**
 * Format validation errors for display
 */
function formatValidationErrors(errors: any[]): string {
  if (errors.length === 0) return 'No errors';

  return errors
    .slice(0, 5)
    .map((err) => `${err.path}: ${err.message}`)
    .join('; ');
}

/**
 * Format error for user-friendly display
 */
function formatUserError(error: any): string {
  if (error.message) {
    // Clean up technical error messages
    if (error.message.includes('API')) {
      return 'Failed to communicate with AI service. Please check your API key and try again.';
    }
    if (error.message.includes('JSON')) {
      return 'The AI generated an invalid response format. Please try again.';
    }
    if (error.message.includes('Schema')) {
      return 'The generated plan did not meet quality standards. Please try again with more specific requirements.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Export helper function to create Anthropic client
 */
export function createClaudeClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
  });
}
