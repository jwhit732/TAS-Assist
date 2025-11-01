import { z } from 'zod';
import { GeneratedPlan } from '@/types/unit-plan';

/**
 * Zod schema for validating generated unit plans
 * Mirrors the JSON schema at prompts/schema.json with runtime validation
 */

// Metadata schema
const MetadataSchema = z.object({
  schema_version: z.string().regex(/^\d+\.\d+\.\d+$/),
  project_type: z.enum(['unit_plan', 'session_plan', 'assessment_plan']).default('unit_plan'),
  generated_at: z.string().datetime(),
  generator_model: z.string().optional(),
  reserved: z.record(z.string(), z.unknown()).optional().default({}),
});

// Qualification schema
const QualificationSchema = z.object({
  code: z.string().optional(),
  title: z.string().min(5),
  level: z.enum(['Certificate I', 'Certificate II', 'Certificate III', 'Certificate IV', 'Diploma', 'Advanced Diploma', 'Short Course', 'Skill Set', '']).optional(),
  packaging_rules: z.string().optional(),
});

// Duration schema
const DurationSchema = z.object({
  weeks: z.number().int().min(1).max(208),
  total_hours: z.number().min(1).max(10000),
  hours_per_week: z.number().min(0).optional(),
  study_mode: z.enum(['full_time', 'part_time', 'flexible', '']).optional(),
});

// Trainer details schema
const TrainerDetailsSchema = z.object({
  primary_trainer: z.string().optional(),
  additional_trainers: z.array(z.string()).optional(),
  qualifications_required: z.array(z.string()).optional(),
}).optional();

// Meta schema
const MetaSchema = z.object({
  qualification: QualificationSchema,
  duration: DurationSchema,
  delivery_mode: z.enum(['face_to_face', 'online', 'blended', 'workplace', 'mixed']),
  cohort_profile: z.string().min(10),
  trainer_details: TrainerDetailsSchema,
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  venue: z.string().optional(),
  class_size: z.object({
    min: z.number().int().min(1).optional(),
    max: z.number().int().min(1).optional(),
    target: z.number().int().min(1).optional(),
  }).optional(),
});

// Activity schema
const ActivitySchema = z.object({
  title: z.string().min(3),
  duration_hours: z.number().min(0.25).max(40),
  delivery_method: z.enum(['lecture', 'workshop', 'tutorial', 'practical', 'online_module', 'simulation', 'workplace_visit', 'guest_speaker', 'group_work', 'self_paced', 'project', 'other']),
  description: z.string().optional(),
  resources: z.array(z.string()).optional(),
  learning_outcomes: z.array(z.string()).optional(),
});

// Assessment schema
const AssessmentSchema = z.object({
  title: z.string().min(3),
  type: z.enum([
    'written',
    'practical',
    'project',
    'portfolio',
    'observation',
    'presentation',
    'roleplay',
    'case_study',
    'exam',
    'interview',
    'recognition',
    'other'
  ]),
  units_assessed: z.array(z.string()).min(1),
  due_date: z.string().optional(),
  duration_hours: z.number().min(0).optional(),
  weighting: z.string().optional(),
  description: z.string().optional(),
});

// Weekly plan schema
const WeeklyPlanSchema = z.object({
  week_number: z.number().int().min(1),
  week_theme: z.string().optional(),
  units_covered: z.array(z.string()).optional(),
  activities: z.array(ActivitySchema).min(0),
  assessments: z.array(AssessmentSchema).optional(),
  notes: z.string().optional(),
});

// Unit schema
const UnitSchema = z.object({
  unit_code: z.string().regex(/^[A-Z]{3}[A-Z0-9]{6,10}$/),
  unit_title: z.string().min(5),
  nominal_hours: z.number().min(1).max(1000),
  unit_type: z.enum(['core', 'elective', 'prerequisite', '']).optional(),
  delivery_methods: z.array(z.enum(['face_to_face', 'online', 'workplace', 'simulation', 'blended', 'self_paced'])).optional(),
  assessment_methods: z.array(z.enum(['written', 'practical', 'project', 'portfolio', 'observation', 'presentation', 'roleplay', 'case_study', 'exam', 'interview', 'recognition', 'third_party_report', 'logbook'])).optional(),
  assessment_tasks: z.array(z.object({
    task_name: z.string(),
    method: z.string(),
    description: z.string().optional(),
  })).optional(),
  prerequisites: z.array(z.string()).optional(),
  weeks_scheduled: z.array(z.number().int().min(1)).optional(),
  learning_resources: z.array(z.string()).optional(),
});

// Resources schema
const ResourcesSchema = z.object({
  facilities: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  technology: z.array(z.string()).optional(),
  external: z.array(z.string()).optional(),
});

// Risk schema
const RiskSchema = z.object({
  risk_description: z.string().min(10),
  category: z.enum(['learner', 'trainer', 'resource', 'compliance', 'scheduling', 'assessment', 'external', 'other']).optional(),
  likelihood: z.enum(['low', 'medium', 'high']),
  impact: z.enum(['low', 'medium', 'high']),
  mitigation: z.string().optional(),
});

// Assumption schema
const AssumptionSchema = z.object({
  assumption: z.string().min(10),
  category: z.enum(['learner_capability', 'resource_availability', 'trainer_qualification', 'scheduling', 'compliance', 'other']).optional(),
  validation_required: z.boolean().optional(),
});

// Compliance notes schema
const ComplianceNotesSchema = z.object({
  volume_of_learning: z.string().optional(),
  training_packaging_compliance: z.string().optional(),
  assessment_validation: z.string().optional(),
  trainer_assessor_requirements: z.string().optional(),
}).optional();

// Main GeneratedPlan schema
export const GeneratedPlanSchema = z.object({
  metadata: MetadataSchema,
  meta: MetaSchema,
  weekly_plan: z.array(WeeklyPlanSchema).min(1),
  units: z.array(UnitSchema).min(1),
  resources: ResourcesSchema.optional(),
  risks: z.array(RiskSchema).optional(),
  assumptions: z.array(AssumptionSchema).optional(),
  confidence_score: z.number().min(0).max(1),
  generation_notes: z.string().optional(),
  compliance_notes: ComplianceNotesSchema,
});

/**
 * Validation result type
 */
export interface ValidationResult {
  success: boolean;
  data?: GeneratedPlan;
  errors?: string[];
}

/**
 * Validates a generated plan against the Zod schema
 * @param plan - The plan object to validate
 * @returns Validation result with success status and errors if any
 */
export function validatePlan(plan: unknown): ValidationResult {
  try {
    const validated = GeneratedPlanSchema.parse(plan);
    return {
      success: true,
      data: validated as GeneratedPlan,
    };
  } catch (error) {
    console.error('[VALIDATOR] Validation error:', error);
    if (error instanceof z.ZodError) {
      try {
        const errors = error.errors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        return {
          success: false,
          errors,
        };
      } catch (mapError) {
        console.error('[VALIDATOR] Error processing ZodError:', mapError);
        return {
          success: false,
          errors: ['Error processing validation errors: ' + (mapError instanceof Error ? mapError.message : 'Unknown error')],
        };
      }
    }
    return {
      success: false,
      errors: ['Unknown validation error: ' + (error instanceof Error ? error.message : String(error))],
    };
  }
}

/**
 * Validates a plan and returns detailed error information for repair
 * @param plan - The plan object to validate
 * @returns Detailed validation result
 */
export function validateWithDetails(plan: unknown) {
  const result = GeneratedPlanSchema.safeParse(plan);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: [],
    };
  }

  return {
    success: false,
    data: null,
    errors: result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
      expected: 'expected' in err ? err.expected : undefined,
      received: 'received' in err ? err.received : undefined,
    })),
  };
}

/**
 * Partial validation for draft plans (allows missing required fields)
 * Useful for progressive validation during generation
 */
export const PartialPlanSchema = GeneratedPlanSchema.partial();

export function validatePartialPlan(plan: unknown): ValidationResult {
  try {
    const validated = PartialPlanSchema.parse(plan);
    return {
      success: true,
      data: validated as GeneratedPlan,
    };
  } catch (error) {
    console.error('[VALIDATOR] Partial validation error:', error);
    if (error instanceof z.ZodError) {
      try {
        const errors = error.errors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        return {
          success: false,
          errors,
        };
      } catch (mapError) {
        console.error('[VALIDATOR] Error processing ZodError:', mapError);
        return {
          success: false,
          errors: ['Error processing validation errors: ' + (mapError instanceof Error ? mapError.message : 'Unknown error')],
        };
      }
    }
    return {
      success: false,
      errors: ['Unknown validation error: ' + (error instanceof Error ? error.message : String(error))],
    };
  }
}
