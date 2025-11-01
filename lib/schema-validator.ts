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
  reserved: z.record(z.string(), z.unknown()).optional().default({}),
});

// Qualification schema
const QualificationSchema = z.object({
  code: z.string().regex(/^[A-Z]{3}[A-Z0-9]{6,10}$/).or(z.literal('')),
  title: z.string().min(5),
  level: z.enum(['I', 'II', 'III', 'IV', 'Diploma', 'Advanced Diploma', 'Non-accredited']),
});

// Duration schema
const DurationSchema = z.object({
  weeks: z.number().int().min(1).max(208),
  total_hours: z.number().min(10).max(2000),
  hours_per_week: z.number().min(1).max(40).optional(),
});

// Trainer details schema
const TrainerDetailsSchema = z.object({
  trainers: z.array(z.string().min(2)).min(1),
  qualifications_required: z.array(z.string()),
  industry_experience_required: z.string().optional(),
});

// Meta schema
const MetaSchema = z.object({
  qualification: QualificationSchema,
  duration: DurationSchema,
  delivery_mode: z.enum(['face_to_face', 'online', 'blended']),
  cohort_profile: z.string().min(20),
  trainer_details: TrainerDetailsSchema,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  llnp_levels: z.object({
    language: z.number().int().min(1).max(5).optional(),
    literacy: z.number().int().min(1).max(5).optional(),
    numeracy: z.number().int().min(1).max(5).optional(),
  }).optional(),
});

// Activity schema
const ActivitySchema = z.object({
  title: z.string().min(5),
  duration_hours: z.number().min(0.5).max(40),
  delivery_method: z.enum(['face_to_face', 'online', 'self_paced', 'workplace', 'workshop']),
  description: z.string().min(10).optional(),
  resources: z.array(z.string()).optional(),
  learning_outcomes: z.array(z.string()).optional(),
});

// Assessment schema
const AssessmentSchema = z.object({
  title: z.string().min(5),
  type: z.enum([
    'written_test',
    'practical_demonstration',
    'project',
    'portfolio',
    'role_play',
    'case_study',
    'presentation',
    'workplace_observation',
    'third_party_report',
    'logbook',
    'research_assignment',
    'group_assessment',
    'other'
  ]),
  units_assessed: z.array(z.string()).min(1),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  duration_hours: z.number().min(0.5).optional(),
  weighting: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

// Weekly plan schema
const WeeklyPlanSchema = z.object({
  week_number: z.number().int().min(1),
  activities: z.array(ActivitySchema).min(1),
  assessments: z.array(AssessmentSchema).optional(),
  notes: z.string().optional(),
});

// Unit schema
const UnitSchema = z.object({
  unit_code: z.string().regex(/^[A-Z]{3}[A-Z0-9]{6,10}$/),
  unit_title: z.string().min(5),
  nominal_hours: z.number().int().min(10).max(500),
  delivery_methods: z.array(z.enum(['face_to_face', 'online', 'blended', 'workplace'])),
  assessment_methods: z.array(z.string()).min(1),
  prerequisites: z.array(z.string()).optional(),
});

// Resources schema
const ResourcesSchema = z.object({
  facilities: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  technology: z.array(z.string()).optional(),
  external: z.array(z.string()).optional(),
});

// Risk/Assumption schema
const RiskAssumptionSchema = z.object({
  description: z.string().min(10),
  category: z.enum(['resource', 'scheduling', 'learner', 'compliance', 'delivery', 'other']).optional(),
  mitigation: z.string().optional(),
  likelihood: z.enum(['low', 'medium', 'high']).optional(),
  impact: z.enum(['low', 'medium', 'high']).optional(),
});

// Compliance notes schema
const ComplianceNotesSchema = z.object({
  volume_of_learning_justification: z.string().optional(),
  packaging_rules_compliance: z.string().optional(),
  assessment_validation_strategy: z.string().optional(),
  trainer_assessor_requirements: z.string().optional(),
}).optional();

// Main GeneratedPlan schema
export const GeneratedPlanSchema = z.object({
  metadata: MetadataSchema,
  meta: MetaSchema,
  weekly_plan: z.array(WeeklyPlanSchema).min(1),
  units: z.array(UnitSchema).min(1),
  resources: ResourcesSchema,
  risks: z.array(RiskAssumptionSchema).optional(),
  assumptions: z.array(RiskAssumptionSchema).optional(),
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
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error'],
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
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error'],
    };
  }
}
