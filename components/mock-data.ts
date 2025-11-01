/**
 * Mock data for testing ResultsView component
 *
 * This file provides sample GeneratedPlan objects conforming to the schema
 * for development and testing purposes.
 */

import type { GeneratedPlan } from '@/types/schema-types';

/**
 * Mock Plan 1: Short Course (2 weeks, face-to-face)
 */
export const mockPlanShortCourse: GeneratedPlan = {
  metadata: {
    schema_version: '1.0.0',
    project_type: 'unit_plan',
    generated_at: '2025-11-01T10:30:00Z',
    generator_model: 'claude-3-5-sonnet-20241022'
  },
  meta: {
    qualification: {
      title: 'First Aid Certificate',
      level: 'Short Course',
      packaging_rules: 'All 2 units required'
    },
    duration: {
      weeks: 2,
      total_hours: 16,
      hours_per_week: 8,
      study_mode: 'part_time'
    },
    delivery_mode: 'face_to_face',
    cohort_profile:
      'Adult learners aged 18-65, mixed backgrounds, no prerequisites. Mix of workplace requirement and personal interest. LLN levels 3-5.',
    start_date: '2025-02-03',
    end_date: '2025-02-14',
    venue: 'Melbourne CBD Training Center',
    class_size: {
      min: 8,
      max: 16,
      target: 12
    }
  },
  weekly_plan: [
    {
      week_number: 1,
      week_theme: 'First Aid Fundamentals & CPR',
      units_covered: ['HLTAID009', 'HLTAID010'],
      activities: [
        {
          title: 'Introduction to First Aid',
          description: 'Overview of first aid principles, legal considerations, and incident management',
          duration_hours: 2,
          delivery_method: 'lecture',
          resources: ['PowerPoint slides', 'Learner manual', 'Projector'],
          learning_outcomes: ['Understand duty of care', 'Recognize emergency situations']
        },
        {
          title: 'CPR Training',
          description: 'Hands-on CPR practice using manikins',
          duration_hours: 3,
          delivery_method: 'practical',
          resources: ['CPR manikins (adult, child, infant)', 'AED trainers', 'PPE'],
          learning_outcomes: ['Perform CPR correctly', 'Use AED safely']
        },
        {
          title: 'Basic Life Support Scenarios',
          description: 'Simulated emergency scenarios requiring first aid response',
          duration_hours: 3,
          delivery_method: 'simulation',
          resources: ['First aid kits', 'Manikins', 'Scenario cards']
        }
      ],
      assessments: [
        {
          title: 'CPR Practical Assessment',
          type: 'practical',
          units_assessed: ['HLTAID009'],
          due_date: 'End of Week 1',
          weighting: 'Pass/Fail',
          duration_hours: 0.5,
          description: 'Demonstrate CPR on adult, child, and infant manikins'
        }
      ]
    },
    {
      week_number: 2,
      week_theme: 'Emergency Response & Certification',
      units_covered: ['HLTAID010'],
      activities: [
        {
          title: 'Wound Management',
          description: 'Treatment of bleeding, burns, and wounds',
          duration_hours: 2,
          delivery_method: 'workshop',
          resources: ['Bandages', 'Dressings', 'Training wounds']
        },
        {
          title: 'Medical Emergencies',
          description: 'Responding to asthma, anaphylaxis, cardiac events, stroke',
          duration_hours: 2,
          delivery_method: 'lecture',
          resources: ['EpiPen trainers', 'Asthma spacers', 'Medical emergency cards']
        },
        {
          title: 'Integrated First Aid Scenarios',
          description: 'Complex scenarios combining multiple first aid skills',
          duration_hours: 3,
          delivery_method: 'simulation',
          resources: ['Full first aid kits', 'Manikins', 'Scenario cards', 'Incident report forms']
        }
      ],
      assessments: [
        {
          title: 'First Aid Knowledge Test',
          type: 'written',
          units_assessed: ['HLTAID010'],
          due_date: 'Week 2 Day 1',
          weighting: 'Pass/Fail',
          duration_hours: 1,
          description: 'Multiple choice and short answer questions'
        },
        {
          title: 'First Aid Practical Demonstration',
          type: 'observation',
          units_assessed: ['HLTAID010'],
          due_date: 'End of Week 2',
          weighting: 'Pass/Fail',
          duration_hours: 1,
          description: 'Respond to simulated emergency scenarios'
        }
      ],
      notes: 'Ensure all learners complete both written and practical assessments before issuing certificates'
    }
  ],
  units: [
    {
      unit_code: 'HLTAID009',
      unit_title: 'Provide cardiopulmonary resuscitation',
      nominal_hours: 4,
      unit_type: 'core',
      delivery_methods: ['face_to_face'],
      assessment_methods: ['practical', 'observation'],
      weeks_scheduled: [1],
      learning_resources: ['CPR manual', 'Video demonstrations', 'Manikins']
    },
    {
      unit_code: 'HLTAID010',
      unit_title: 'Provide basic emergency life support',
      nominal_hours: 12,
      unit_type: 'core',
      delivery_methods: ['face_to_face'],
      assessment_methods: ['written', 'practical', 'observation'],
      prerequisites: ['HLTAID009'],
      weeks_scheduled: [1, 2],
      learning_resources: ['First aid manual', 'Emergency response guides', 'First aid kits']
    }
  ],
  resources: {
    facilities: ['Training room (capacity 20)', 'Space for practical exercises'],
    equipment: [
      'CPR manikins (4x adult, 2x child, 2x infant)',
      'AED trainers (2)',
      'Data projector',
      'Whiteboard'
    ],
    materials: [
      'First aid kits (8)',
      'Bandages and dressings',
      'PPE (gloves, face shields)',
      'Learner workbooks (printed)'
    ],
    technology: ['PowerPoint presentations', 'Video clips of techniques']
  },
  risks: [
    {
      risk_description: 'Learners may have physical limitations preventing CPR practice',
      category: 'learner',
      likelihood: 'medium',
      impact: 'medium',
      mitigation:
        'Pre-course health questionnaire; offer alternative demonstration methods; ensure adequate breaks'
    },
    {
      risk_description: 'Manikins may malfunction or become unhygienic',
      category: 'resource',
      likelihood: 'low',
      impact: 'high',
      mitigation: 'Maintain equipment regularly; use manikin wipes between uses; have backup manikins'
    }
  ],
  assumptions: [
    {
      assumption: 'All learners are physically able to perform CPR',
      category: 'learner_capability',
      validation_required: true
    },
    {
      assumption: 'Trainer holds current HLTAID011 and TAE40116',
      category: 'trainer_qualification',
      validation_required: true
    },
    {
      assumption: 'Adequate manikins and equipment available for practical sessions',
      category: 'resource_availability',
      validation_required: true
    }
  ],
  compliance_notes: {
    volume_of_learning:
      'Total 16 nominal hours. Meets requirements for HLTAID009 (4h) and HLTAID010 (12h) as per training.gov.au',
    training_packaging_compliance: 'Both units are from HLT Health Training Package. No packaging rules restrictions.',
    assessment_validation: 'Assessment tools validated by qualified assessor. Aligned to unit requirements.',
    trainer_assessor_requirements:
      'Trainer must hold HLTAID011 (Provide First Aid), TAE40116 or TAE40122, and maintain currency in first aid practice'
  },
  confidence_score: 0.92,
  generation_notes:
    'High confidence plan. Standard first aid delivery model. Recommend confirming manikin quantities and AED availability before delivery.'
};

/**
 * Mock Plan 2: Blended Program (8 weeks)
 */
export const mockPlanBlended: GeneratedPlan = {
  metadata: {
    schema_version: '1.0.0',
    project_type: 'unit_plan',
    generated_at: '2025-11-01T11:15:00Z',
    generator_model: 'claude-3-5-sonnet-20241022'
  },
  meta: {
    qualification: {
      code: 'BSB40120',
      title: 'Certificate IV in Business',
      level: 'Certificate IV',
      packaging_rules: '10 core units + 2 electives required'
    },
    duration: {
      weeks: 8,
      total_hours: 120,
      hours_per_week: 15,
      study_mode: 'part_time'
    },
    delivery_mode: 'blended',
    cohort_profile:
      'Working adults aged 25-50, predominantly employed in administrative or junior management roles seeking career advancement. Mixed LLN levels (3-5). Evening and weekend delivery required.',
    start_date: '2025-03-10',
    end_date: '2025-05-05',
    venue: 'Online via LMS + Melbourne CBD Campus (weekly sessions)',
    class_size: {
      min: 10,
      max: 20,
      target: 15
    },
    trainer_details: {
      primary_trainer: 'TBA',
      qualifications_required: [
        'TAE40116 or TAE40122',
        'Relevant business qualification (Cert IV or higher)',
        'Minimum 2 years industry experience'
      ]
    }
  },
  weekly_plan: [
    {
      week_number: 1,
      week_theme: 'Introduction to Business Operations',
      units_covered: ['BSBOPS402'],
      activities: [
        {
          title: 'Course Orientation & LMS Introduction',
          description: 'Welcome session, platform walkthrough, assessment overview',
          duration_hours: 2,
          delivery_method: 'online_module',
          resources: ['LMS access', 'Course handbook PDF']
        },
        {
          title: 'Business Technology Fundamentals',
          description: 'Overview of technology in business contexts',
          duration_hours: 3,
          delivery_method: 'workshop',
          resources: ['Computer lab', 'Software demos', 'Case studies']
        }
      ]
    },
    {
      week_number: 2,
      week_theme: 'Workplace Health & Safety',
      units_covered: ['BSBWHS411'],
      activities: [
        {
          title: 'WHS Legal Framework',
          description: 'WHS legislation, duty of care, consultation requirements',
          duration_hours: 4,
          delivery_method: 'online_module',
          resources: ['Video lectures', 'Legislation extracts', 'Discussion forum']
        },
        {
          title: 'Risk Assessment Workshop',
          description: 'Practical risk assessment using workplace scenarios',
          duration_hours: 3,
          delivery_method: 'workshop',
          resources: ['Risk assessment templates', 'Case study packs']
        }
      ],
      assessments: [
        {
          title: 'Assessment Task 1: WHS Policy Review',
          type: 'project',
          units_assessed: ['BSBWHS411'],
          due_date: 'End of Week 3',
          weighting: 'Major',
          description: 'Analyze workplace WHS policy and develop improvement plan'
        }
      ]
    }
    // Additional weeks omitted for brevity
  ],
  units: [
    {
      unit_code: 'BSBOPS402',
      unit_title: 'Coordinate business operational plans',
      nominal_hours: 40,
      unit_type: 'core',
      delivery_methods: ['blended', 'online'],
      assessment_methods: ['project', 'written'],
      weeks_scheduled: [1, 2, 3]
    },
    {
      unit_code: 'BSBWHS411',
      unit_title: 'Implement and monitor WHS policies, procedures and programs',
      nominal_hours: 50,
      unit_type: 'core',
      delivery_methods: ['blended', 'workplace'],
      assessment_methods: ['project', 'portfolio'],
      weeks_scheduled: [2, 3, 4]
    }
  ],
  risks: [
    {
      risk_description: 'Low engagement in online components due to work commitments',
      category: 'learner',
      likelihood: 'high',
      impact: 'medium',
      mitigation:
        'Provide flexible deadlines; offer catch-up sessions; use asynchronous discussion forums'
    }
  ],
  assumptions: [
    {
      assumption: 'Learners have access to computer and internet for online study',
      category: 'resource_availability',
      validation_required: true
    }
  ],
  confidence_score: 0.75,
  generation_notes:
    'Plan generated with limited unit details. Weekly plan abbreviated for 8-week delivery. Recommend expanding activity descriptions and adding assessment tasks for remaining weeks.'
};

/**
 * Export all mock plans
 */
export const mockPlans = {
  shortCourse: mockPlanShortCourse,
  blended: mockPlanBlended
};

export default mockPlans;
