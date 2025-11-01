/**
 * Schema-aligned TypeScript types for TAS Assistant
 *
 * These types match the JSON schema at /prompts/schema.json exactly.
 * Generated from schema version 1.0.0
 */

// ============================================================================
// Metadata Types
// ============================================================================

export interface SchemaMetadata {
  schema_version: string;
  project_type: 'unit_plan' | 'session_plan' | 'assessment_plan';
  generated_at: string;
  generator_model?: string;
  reserved?: Record<string, unknown>;
}

// ============================================================================
// Qualification Types
// ============================================================================

export interface Qualification {
  code?: string;
  title: string;
  level?: 'Certificate I' | 'Certificate II' | 'Certificate III' | 'Certificate IV' | 'Diploma' | 'Advanced Diploma' | 'Short Course' | 'Skill Set' | '';
  packaging_rules?: string;
}

// ============================================================================
// Duration Types
// ============================================================================

export interface Duration {
  weeks: number;
  total_hours: number;
  hours_per_week?: number;
  study_mode?: 'full_time' | 'part_time' | 'flexible' | '';
}

// ============================================================================
// Trainer Types
// ============================================================================

export interface TrainerDetails {
  primary_trainer?: string;
  additional_trainers?: string[];
  qualifications_required?: string[];
}

// ============================================================================
// Class Size Types
// ============================================================================

export interface ClassSize {
  min?: number;
  max?: number;
  target?: number;
}

// ============================================================================
// Meta Types
// ============================================================================

export interface PlanMeta {
  qualification: Qualification;
  duration: Duration;
  delivery_mode: 'face_to_face' | 'online' | 'blended' | 'workplace' | 'mixed';
  cohort_profile: string;
  trainer_details?: TrainerDetails;
  start_date?: string;
  end_date?: string;
  venue?: string;
  class_size?: ClassSize;
}

// ============================================================================
// Activity Types
// ============================================================================

export type DeliveryMethod =
  | 'lecture'
  | 'workshop'
  | 'tutorial'
  | 'practical'
  | 'online_module'
  | 'simulation'
  | 'workplace_visit'
  | 'guest_speaker'
  | 'group_work'
  | 'self_paced'
  | 'project'
  | 'other';

export interface WeeklyActivityItem {
  title: string;
  description?: string;
  duration_hours: number;
  delivery_method: DeliveryMethod;
  resources?: string[];
  learning_outcomes?: string[];
}

// ============================================================================
// Assessment Types
// ============================================================================

export type AssessmentType =
  | 'written'
  | 'practical'
  | 'project'
  | 'portfolio'
  | 'observation'
  | 'presentation'
  | 'roleplay'
  | 'case_study'
  | 'exam'
  | 'interview'
  | 'recognition'
  | 'other';

export interface WeeklyAssessment {
  title: string;
  type: AssessmentType;
  units_assessed: string[];
  due_date?: string;
  weighting?: string;
  duration_hours?: number;
  description?: string;
}

// ============================================================================
// Weekly Plan Types
// ============================================================================

export interface WeeklyPlanItem {
  week_number: number;
  week_theme?: string;
  units_covered?: string[];
  activities: WeeklyActivityItem[];
  assessments?: WeeklyAssessment[];
  notes?: string;
}

// ============================================================================
// Unit Types
// ============================================================================

export type UnitDeliveryMethod =
  | 'face_to_face'
  | 'online'
  | 'workplace'
  | 'simulation'
  | 'blended'
  | 'self_paced';

export type UnitAssessmentMethod =
  | 'written'
  | 'practical'
  | 'project'
  | 'portfolio'
  | 'observation'
  | 'presentation'
  | 'roleplay'
  | 'case_study'
  | 'exam'
  | 'interview'
  | 'recognition'
  | 'third_party_report'
  | 'logbook';

export interface AssessmentTask {
  task_name: string;
  method: string;
  description?: string;
}

export interface UnitDetail {
  unit_code: string;
  unit_title: string;
  nominal_hours: number;
  unit_type?: 'core' | 'elective' | 'prerequisite' | '';
  delivery_methods?: UnitDeliveryMethod[];
  assessment_methods?: UnitAssessmentMethod[];
  assessment_tasks?: AssessmentTask[];
  prerequisites?: string[];
  weeks_scheduled?: number[];
  learning_resources?: string[];
}

// ============================================================================
// Resources Types
// ============================================================================

export interface Resources {
  facilities?: string[];
  equipment?: string[];
  materials?: string[];
  technology?: string[];
  external?: string[];
}

// ============================================================================
// Risk Types
// ============================================================================

export type RiskCategory =
  | 'learner'
  | 'trainer'
  | 'resource'
  | 'compliance'
  | 'scheduling'
  | 'assessment'
  | 'external'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Risk {
  risk_description: string;
  category?: RiskCategory;
  likelihood: RiskLevel;
  impact: RiskLevel;
  mitigation?: string;
}

// ============================================================================
// Assumption Types
// ============================================================================

export type AssumptionCategory =
  | 'learner_capability'
  | 'resource_availability'
  | 'trainer_qualification'
  | 'scheduling'
  | 'compliance'
  | 'other';

export interface Assumption {
  assumption: string;
  category?: AssumptionCategory;
  validation_required?: boolean;
}

// ============================================================================
// Compliance Types
// ============================================================================

export interface ComplianceNotes {
  volume_of_learning?: string;
  training_packaging_compliance?: string;
  assessment_validation?: string;
  trainer_assessor_requirements?: string;
}

// ============================================================================
// Complete Plan Type
// ============================================================================

export interface GeneratedPlan {
  metadata: SchemaMetadata;
  meta: PlanMeta;
  weekly_plan: WeeklyPlanItem[];
  units: UnitDetail[];
  resources?: Resources;
  risks?: Risk[];
  assumptions?: Assumption[];
  compliance_notes?: ComplianceNotes;
  confidence_score: number;
  generation_notes?: string;
}

// ============================================================================
// Helper Types for UI
// ============================================================================

export interface ConfidenceIndicator {
  score: number;
  color: 'green' | 'yellow' | 'red';
  label: string;
}

export function getConfidenceIndicator(score: number): ConfidenceIndicator {
  if (score >= 0.8) {
    return { score, color: 'green', label: 'High Confidence' };
  } else if (score >= 0.6) {
    return { score, color: 'yellow', label: 'Medium Confidence' };
  } else {
    return { score, color: 'red', label: 'Low Confidence' };
  }
}

export function calculateWeekDateRange(startDate: string | undefined, weekNumber: number): string {
  if (!startDate) {
    return `Week ${weekNumber}`;
  }

  try {
    const start = new Date(startDate);
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (weekNumber - 1) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
    };

    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  } catch {
    return `Week ${weekNumber}`;
  }
}

export function getTotalUnits(plan: GeneratedPlan): number {
  return plan.units.length;
}

export function getHoursPerWeek(plan: GeneratedPlan): number {
  const { total_hours, weeks } = plan.meta.duration;
  return Math.round((total_hours / weeks) * 10) / 10;
}
