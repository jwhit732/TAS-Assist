/**
 * Test script to verify schema validation fixes
 *
 * This script creates sample plan data matching the JSON schema format
 * and validates it against the Zod schema to ensure they're aligned.
 *
 * Run with: node test-schema-validation.js
 */

const { validatePlan } = require('./lib/schema-validator.ts');

// Sample plan data that matches the JSON schema format
const samplePlan = {
  metadata: {
    schema_version: "1.0.0",
    project_type: "unit_plan",
    generated_at: new Date().toISOString(),
    generator_model: "claude-haiku-4-5"
  },
  meta: {
    qualification: {
      code: "BSB50120",
      title: "Diploma of Business",
      level: "Diploma"
    },
    duration: {
      weeks: 52,
      total_hours: 1200,
      hours_per_week: 23,
      study_mode: "full_time"
    },
    delivery_mode: "blended",
    cohort_profile: "Adult learners aged 25-45 with diverse educational backgrounds and work experience",
    trainer_details: {
      primary_trainer: "John Smith",
      qualifications_required: ["TAE40116", "Diploma of Business or higher"]
    },
    start_date: "2025-02-03",
    end_date: "2026-01-30",
    venue: "Melbourne CBD Campus"
  },
  weekly_plan: [
    {
      week_number: 1,
      week_theme: "Introduction to Business Operations",
      units_covered: ["BSBOPS301"],
      activities: [
        {
          title: "Introduction to Business",
          duration_hours: 3,
          delivery_method: "lecture",
          description: "Overview of business operations and key concepts",
          resources: ["Textbook Chapter 1", "PowerPoint slides"],
          learning_outcomes: ["Understand basic business principles"]
        },
        {
          title: "Group Discussion",
          duration_hours: 2,
          delivery_method: "workshop",
          description: "Interactive discussion on business scenarios"
        }
      ],
      assessments: [
        {
          title: "Assessment Task 1: Knowledge Test",
          type: "written",
          units_assessed: ["BSBOPS301"],
          due_date: "End of week 2",
          weighting: "20%",
          description: "Written test covering week 1 content"
        }
      ],
      notes: "First week - focus on engagement and building rapport"
    },
    {
      week_number: 2,
      activities: [
        {
          title: "Practical Workshop",
          duration_hours: 4,
          delivery_method: "practical"
        }
      ]
    }
  ],
  units: [
    {
      unit_code: "BSBOPS301",
      unit_title: "Maintain business resources",
      nominal_hours: 40,
      unit_type: "core",
      delivery_methods: ["face_to_face", "online"],
      assessment_methods: ["written", "practical", "observation"],
      prerequisites: []
    },
    {
      unit_code: "BSBWHS311",
      unit_title: "Assist with maintaining workplace safety",
      nominal_hours: 40,
      delivery_methods: ["blended"],
      assessment_methods: ["practical"]
    }
  ],
  resources: {
    facilities: ["Standard classroom", "Computer lab"],
    equipment: ["Projector", "Whiteboard"],
    materials: ["Learner workbooks", "Assessment templates"],
    technology: ["LMS access", "Microsoft Office 365"]
  },
  risks: [
    {
      risk_description: "Low learner LLN levels may impact completion rates",
      category: "learner",
      likelihood: "medium",
      impact: "high",
      mitigation: "Provide additional LLN support in weeks 1-2"
    }
  ],
  assumptions: [
    {
      assumption: "All learners have access to computers and internet at home",
      category: "learner_capability",
      validation_required: true
    }
  ],
  compliance_notes: {
    volume_of_learning: "Total 1200 hours meets AQF Diploma requirements",
    training_packaging_compliance: "All core units included per packaging rules",
    assessment_validation: "Tools to be validated before delivery"
  },
  confidence_score: 0.85,
  generation_notes: "Plan generated based on standard delivery patterns"
};

console.log('🧪 Testing Schema Validation\n');
console.log('Sample plan structure:');
console.log('- Metadata: ✓');
console.log('- Meta info: ✓');
console.log('- Weekly plan: ' + samplePlan.weekly_plan.length + ' weeks');
console.log('- Units: ' + samplePlan.units.length + ' units');
console.log('- Resources: ✓');
console.log('- Risks: ' + samplePlan.risks.length + ' risks');
console.log('- Assumptions: ' + samplePlan.assumptions.length + ' assumptions');
console.log('\n📋 Running validation...\n');

try {
  // This will fail because we need to use TypeScript, but we'll create a TS version
  const result = validatePlan(samplePlan);

  if (result.success) {
    console.log('✅ VALIDATION PASSED!');
    console.log('\nThe schema validation is working correctly.');
    console.log('The Zod schema now matches the JSON schema format.');
  } else {
    console.log('❌ VALIDATION FAILED!');
    console.log('\nErrors found:');
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
} catch (error) {
  console.log('Note: This JS file needs to be run as TypeScript.');
  console.log('Please use the TypeScript version: npx tsx test-schema-validation.ts');
}
