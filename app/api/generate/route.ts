import { NextRequest, NextResponse } from 'next/server';
import { generateWithAPRV } from '@/lib/aprv';
import { validateEnv } from '@/config/env';
import { validatePlan } from '@/lib/schema-validator';
import { IntakeFormData } from '@/types/unit-plan';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

/**
 * API Route: POST /api/generate
 * Generates a TAS unit plan from intake form data using APRV loop
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    try {
      validateEnv();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let intakeData: IntakeFormData;
    try {
      intakeData = await request.json();
      console.log('[API] Received intake data:', JSON.stringify(intakeData, null, 2));
    } catch (error) {
      console.error('[API] Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      );
    }

    // Basic validation of intake data
    if (!intakeData.qualification || !intakeData.deliveryMode) {
      console.error('[API] Missing required fields:', {
        hasQualification: !!intakeData.qualification,
        hasDeliveryMode: !!intakeData.deliveryMode
      });
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'qualification and deliveryMode are required'
        },
        { status: 400 }
      );
    }

    // Load JSON schema
    let schema: any;
    try {
      const schemaPath = join(process.cwd(), 'prompts', 'schema.json');
      const schemaContent = await readFile(schemaPath, 'utf-8');
      schema = JSON.parse(schemaContent);
    } catch (error) {
      console.error('Failed to load schema:', error);
      return NextResponse.json(
        { error: 'Failed to load validation schema' },
        { status: 500 }
      );
    }

    // Get Claude client (create raw Anthropic client for APRV)
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Adapt intake data to APRV format
    const adaptedIntake = {
      qualification: {
        title: intakeData.qualification,
        code: intakeData.qualificationCode,
      },
      duration: {
        weeks: intakeData.durationWeeks,
        total_hours: intakeData.totalHours,
      },
      delivery_mode: intakeData.deliveryMode as 'face_to_face' | 'online' | 'blended',
      cohort_profile: intakeData.cohortProfile,
      resources: intakeData.resources ? {
        facilities: intakeData.resources.filter(r => ['Classroom/Training Room', 'Workshop/Practical Space'].includes(r)),
        equipment: intakeData.resources.filter(r => r.includes('Equipment') || r === 'Computer Lab'),
        technology: intakeData.resources.filter(r => r === 'Online Learning Platform (LMS)'),
      } : undefined,
      assessment_preferences: intakeData.assessmentPreferences,
      unit_list: intakeData.unitList,
    };

    // Generate plan using APRV loop
    console.log('[API] Starting APRV generation...');
    const startTime = Date.now();

    // @ts-expect-error - Type mismatch will be fixed in next iteration
    const result = await generateWithAPRV(adaptedIntake, client, schema);

    const duration = Date.now() - startTime;
    console.log(`[API] Generation completed in ${duration}ms`);

    // Check if generation was successful
    if (!result.success || !result.plan) {
      return NextResponse.json(
        {
          error: 'Generation failed',
          details: result.error || 'Unknown error occurred during generation',
          logs: (result as any).logs || [],
        },
        { status: 500 }
      );
    }

    // Final validation with Zod
    const validation = validatePlan(result.plan);
    if (!validation.success) {
      console.error('[API] Final validation failed:', validation.errors);
      return NextResponse.json(
        {
          error: 'Generated plan failed validation',
          details: validation.errors,
          logs: (result as any).logs || [],
        },
        { status: 500 }
      );
    }

    // Success! Return the generated plan
    return NextResponse.json({
      success: true,
      plan: validation.data,
      metadata: {
        duration_ms: duration,
        logs: (result as any).logs || [],
      },
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * API Route: GET /api/generate
 * Returns API status and configuration info (for debugging)
 */
export async function GET() {
  try {
    validateEnv();

    return NextResponse.json({
      status: 'ready',
      model: process.env.NEXT_PUBLIC_API_MODEL || 'claude-3-5-sonnet-20241022',
      features: {
        auth: process.env.NEXT_PUBLIC_FEATURE_AUTH === 'true',
        telemetry: process.env.NEXT_PUBLIC_FEATURE_TELEMETRY === 'true',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Configuration error',
      },
      { status: 500 }
    );
  }
}
