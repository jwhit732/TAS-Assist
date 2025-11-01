/**
 * Core TypeScript types for TAS Assistant Unit Plan Builder
 *
 * These types define the structure of intake forms, generated plans,
 * and related data structures used throughout the application.
 */

/**
 * Delivery mode options for training programs
 */
export type DeliveryMode = 'face_to_face' | 'online' | 'blended';

/**
 * Form data collected from the intake form
 */
export interface IntakeFormData {
  /** Qualification name (e.g., "Certificate IV in Training and Assessment") */
  qualification: string;

  /** Optional qualification code (e.g., "TAE40122") */
  qualificationCode?: string;

  /** Delivery mode for the program */
  deliveryMode: DeliveryMode;

  /** Program duration in weeks */
  durationWeeks: number;

  /** Total contact/delivery hours */
  totalHours: number;

  /** Description of the target cohort/learner profile */
  cohortProfile: string;

  /** Available resources and facilities */
  resources?: string[];

  /** Assessment method preferences */
  assessmentPreferences?: string[];

  /** Optional paste-in unit list (plain text) */
  unitList?: string;
}

/**
 * Weekly activity in the delivery plan
 */
export interface WeeklyActivity {
  /** Week number (1-indexed) */
  week: number;

  /** Focus topics for this week */
  topics: string[];

  /** Planned activities */
  activities: string[];

  /** Assessment items due this week */
  assessments?: Assessment[];

  /** Estimated hours for this week */
  hours: number;
}

/**
 * Assessment item structure
 */
export interface Assessment {
  /** Assessment identifier */
  id: string;

  /** Assessment title/description */
  title: string;

  /** Type of assessment */
  type: 'formative' | 'summative' | 'practical' | 'project' | 'exam' | 'other';

  /** Units this assessment covers */
  units: string[];

  /** Week when assessment is due */
  dueWeek?: number;

  /** Additional notes */
  notes?: string;
}

/**
 * Unit of competency details
 */
export interface Unit {
  /** Unit code (e.g., "TAEDES401") */
  code: string;

  /** Unit title */
  title: string;

  /** Nominal hours for this unit */
  hours: number;

  /** Delivery method for this unit */
  deliveryMethod: DeliveryMode;

  /** Assessment methods for this unit */
  assessmentMethods?: string[];

  /** Prerequisites (if any) */
  prerequisites?: string[];

  /** Week range when this unit is delivered (e.g., [1, 4]) */
  weekRange?: [number, number];
}

/**
 * Risk or assumption item
 */
export interface RiskAssumption {
  /** Category of the item */
  category: 'risk' | 'assumption';

  /** Description of the risk or assumption */
  description: string;

  /** Mitigation strategy (for risks) or validation notes (for assumptions) */
  mitigation?: string;

  /** Impact level (high, medium, low) */
  impact?: 'high' | 'medium' | 'low';
}

/**
 * Metadata about the generated plan
 */
export interface PlanMetadata {
  /** Schema version used */
  schema_version: string;

  /** Project type identifier */
  project_type: string;

  /** Generation timestamp */
  generated_at: string;

  /** Reserved fields for future use */
  reserved?: Record<string, unknown>;
}

/**
 * Meta information about the qualification and delivery
 */
export interface PlanMeta {
  /** Qualification name */
  qualification: string;

  /** Qualification code */
  qualification_code?: string;

  /** Program duration in weeks */
  duration_weeks: number;

  /** Total delivery hours */
  total_hours: number;

  /** Delivery mode */
  delivery_mode: DeliveryMode;

  /** Cohort profile description */
  cohort_profile: string;

  /** Resources available */
  resources?: string[];

  /** Assessment preferences */
  assessment_preferences?: string[];
}

/**
 * Complete generated unit plan structure
 * This matches the JSON schema output from Claude
 */
export interface GeneratedPlan {
  /** Metadata about this plan */
  metadata: PlanMetadata;

  /** Meta information about qualification and delivery */
  meta: PlanMeta;

  /** Week-by-week delivery plan */
  weekly_plan: WeeklyActivity[];

  /** Units of competency included */
  units: Unit[];

  /** Identified risks */
  risks: RiskAssumption[];

  /** Documented assumptions */
  assumptions: RiskAssumption[];

  /** Confidence score (0-1) indicating generation quality */
  confidence: number;
}

/**
 * API response wrapper for plan generation
 */
export interface GenerationResponse {
  /** Whether generation was successful */
  success: boolean;

  /** Generated plan (if successful) */
  plan?: GeneratedPlan;

  /** Error message (if failed) */
  error?: string;

  /** Error details for debugging */
  errorDetails?: unknown;

  /** Generation metadata */
  metadata?: {
    /** Time taken in milliseconds */
    duration_ms: number;

    /** Number of APRV iterations */
    iterations?: number;

    /** Tokens used */
    tokens_used?: number;
  };
}

/**
 * Options for plan generation
 */
export interface GenerationOptions {
  /** Temperature for AI generation (0-1) */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Enable streaming responses */
  stream?: boolean;

  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Export format types
 */
export type ExportFormat = 'docx' | 'pdf' | 'markdown' | 'json';

/**
 * Export options
 */
export interface ExportOptions {
  /** Format to export */
  format: ExportFormat;

  /** Include metadata in export */
  includeMetadata?: boolean;

  /** Custom filename (without extension) */
  filename?: string;

  /** Additional format-specific options */
  formatOptions?: Record<string, unknown>;
}
