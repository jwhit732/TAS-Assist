# TAS Unit Plan Schema Documentation

## Overview

This document explains the JSON schema used by TAS Assistant to generate structured, audit-ready unit plans for Australian Registered Training Organizations (RTOs).

**Schema Version**: 1.0.0
**Last Updated**: November 2025
**Compliance Framework**: ASQA Standards for RTOs 2015, Australian Qualifications Framework (AQF)

---

## Schema Purpose

The TAS Unit Plan Schema serves three primary functions:

1. **Validation**: Ensures AI-generated plans contain all necessary data for compliant RTO delivery
2. **Standardization**: Provides consistent structure across different qualifications and delivery modes
3. **Extensibility**: Supports future features without breaking existing plans

---

## Schema Structure

### 1. Metadata Object

**Purpose**: Version control and generation tracking

```json
{
  "metadata": {
    "schema_version": "1.0.0",
    "project_type": "unit_plan",
    "generated_at": "2025-11-01T10:30:00Z",
    "generator_model": "claude-3-5-sonnet-20241022",
    "reserved": {}
  }
}
```

**Key Fields**:
- `schema_version`: Semantic versioning (MAJOR.MINOR.PATCH) for schema evolution tracking
- `project_type`: Discriminator for future plan types (session plans, assessment plans)
- `generated_at`: ISO 8601 timestamp for audit trails
- `reserved`: Namespace for future metadata without schema version bumps

**Validation Rules**:
- `schema_version` must match pattern `\d+\.\d+\.\d+`
- `project_type` limited to enum values (currently: unit_plan, session_plan, assessment_plan)

---

### 2. Meta Object

**Purpose**: High-level plan context and delivery parameters

#### 2.1 Qualification

```json
{
  "qualification": {
    "code": "BSB50120",
    "title": "Diploma of Business",
    "level": "Diploma",
    "packaging_rules": "12 core units + 4 electives"
  }
}
```

**RTO Context**:
- `code`: Must match training.gov.au format (3 letters + 5 digits). Empty string allowed for non-accredited courses.
- `title`: Minimum 5 characters to ensure meaningful qualification names
- `level`: Maps to AQF levels for volume of learning calculations
- `packaging_rules`: Human-readable summary of unit requirements

**Validation Constraints**:
- Code pattern: `^[A-Z]{3}[0-9]{5}$` or empty string
- Title length: 5-200 characters
- Level must be from AQF enumeration

#### 2.2 Duration

```json
{
  "duration": {
    "weeks": 12,
    "total_hours": 360,
    "hours_per_week": 30,
    "study_mode": "full_time"
  }
}
```

**Planning Notes**:
- `weeks`: 1-208 range supports short courses to 4-year qualifications
- `total_hours`: Should align with sum of unit nominal hours
- `hours_per_week`: Useful for timetabling and student workload calculations
- `study_mode`: Impacts compliance for international students and government funding

**ASQA Compliance**:
- Total hours must meet AQF volume of learning guidelines
- Part-time delivery must demonstrate supervised hours for assessment

#### 2.3 Delivery Mode

```json
{
  "delivery_mode": "blended"
}
```

**Valid Options**:
- `face_to_face`: Traditional classroom delivery
- `online`: Fully online/distance (requires online delivery strategy)
- `blended`: Mix of face-to-face and online
- `workplace`: On-the-job training
- `mixed`: Multiple modes across different units

**Compliance Considerations**:
- Online delivery requires documented online delivery strategy
- Workplace delivery needs training plan agreements with employers
- Mode affects AQTF reporting and government funding eligibility

#### 2.4 Cohort Profile

```json
{
  "cohort_profile": "Adult learners aged 25-45, predominantly ESL background, LLN levels 3-4, some with prior industry experience in retail/hospitality"
}
```

**Purpose**: Informs training and assessment adjustments

**Should Include**:
- Age demographics
- Language, Literacy, Numeracy (LLN) levels (1-5 scale)
- Cultural/linguistic background
- Prior learning and experience
- Special needs or support requirements
- Digital literacy levels

**Why This Matters**:
- Affects resource selection and language complexity
- Identifies need for LLN support strategies
- Informs reasonable adjustment planning
- Helps validate assessment appropriateness

#### 2.5 Trainer Details

```json
{
  "trainer_details": {
    "primary_trainer": "Jane Smith",
    "additional_trainers": ["John Doe"],
    "qualifications_required": ["TAE40116", "Cert IV Business", "5+ years industry experience"]
  }
}
```

**ASQA Requirements**:
- Trainers must hold TAE qualification (or meet transition arrangements)
- Must have vocational competency in area being taught
- Must maintain current industry skills and knowledge
- Must meet specific industry requirements (e.g., working with children checks)

#### 2.6 Dates and Venue

```json
{
  "start_date": "2025-02-03",
  "end_date": "2025-06-30",
  "venue": "Melbourne CBD Campus"
}
```

**Validation**:
- Dates must be ISO 8601 format (YYYY-MM-DD)
- End date should align with duration.weeks calculation
- Venue required for face-to-face delivery

#### 2.7 Class Size

```json
{
  "class_size": {
    "min": 8,
    "max": 20,
    "target": 15
  }
}
```

**Practical Considerations**:
- Min: Viability threshold for running the cohort
- Max: Compliance with trainer-student ratios, room capacity, equipment availability
- Target: Optimal size for delivery model

---

### 3. Weekly Plan Array

**Purpose**: Week-by-week breakdown of learning activities and assessments

```json
{
  "weekly_plan": [
    {
      "week_number": 1,
      "week_theme": "Introduction to Business Operations",
      "units_covered": ["BSBOPS304", "BSBWHS332X"],
      "activities": [...],
      "assessments": [...],
      "notes": "Public holiday Monday - adjust schedule"
    }
  ]
}
```

#### 3.1 Activities Object

```json
{
  "activities": [
    {
      "title": "Risk Assessment Workshop",
      "description": "Learners work in groups to identify hazards...",
      "duration_hours": 3.5,
      "delivery_method": "workshop",
      "resources": ["PPE equipment", "Risk assessment templates"],
      "learning_outcomes": ["Identify workplace hazards", "Complete risk assessment forms"]
    }
  ]
}
```

**Delivery Methods**:
- `lecture`: Trainer-led presentation
- `workshop`: Interactive hands-on session
- `tutorial`: Small group guided learning
- `practical`: Skills demonstration/practice
- `online_module`: Self-paced digital content
- `simulation`: Role-play or scenario-based
- `workplace_visit`: Industry site visit
- `guest_speaker`: Industry expert session
- `group_work`: Collaborative project
- `self_paced`: Independent study
- `project`: Extended practical application
- `other`: Custom delivery method

**Best Practices**:
- Duration should sum to weekly total
- Mix delivery methods for adult learning principles
- Align resources with activity requirements
- Link learning outcomes to unit elements/performance criteria

#### 3.2 Assessments Object

```json
{
  "assessments": [
    {
      "title": "Assessment Task 1: WHS Policy Review",
      "type": "written",
      "units_assessed": ["BSBWHS332X"],
      "due_date": "2025-03-15",
      "weighting": "Major",
      "duration_hours": 4,
      "description": "Learners review workplace WHS policies..."
    }
  ]
}
```

**Assessment Types**:
- `written`: Knowledge questions, reports, essays
- `practical`: Skills demonstration, performance tasks
- `project`: Extended workplace/simulated project
- `portfolio`: Collection of evidence over time
- `observation`: Direct observation of skills
- `presentation`: Oral/visual presentation
- `roleplay`: Simulated interaction scenarios
- `case_study`: Analysis and response to scenarios
- `exam`: Formal written examination
- `interview`: Structured questioning
- `recognition`: RPL/RCC assessment
- `other`: Custom assessment method

**ASQA Compliance**:
- Must assess all elements and performance criteria
- Must include both knowledge and skills assessment
- Must meet principles of assessment (valid, reliable, flexible, fair)
- Must align with unit assessment requirements

**Scheduling Principles**:
- Assessments should follow relevant learning activities
- Allow time for feedback and resubmission
- Consider cumulative cognitive load
- Space major assessments appropriately

#### 3.3 Weekly Notes

Use for:
- Public holidays or schedule adjustments
- Guest speaker confirmations
- Resource booking reminders
- Weather-dependent activity notes
- Cross-cohort coordination needs

---

### 4. Units Array

**Purpose**: Detailed breakdown of each unit in the plan

```json
{
  "units": [
    {
      "unit_code": "BSBWHS332X",
      "unit_title": "Apply infection prevention and control procedures to own work activities",
      "nominal_hours": 40,
      "unit_type": "core",
      "delivery_methods": ["face_to_face", "workplace"],
      "assessment_methods": ["written", "practical", "observation"],
      "assessment_tasks": [...],
      "prerequisites": [],
      "weeks_scheduled": [1, 2, 3, 4],
      "learning_resources": ["Learner Guide v2.1", "WHS Legislation Handbook"]
    }
  ]
}
```

**Key Validations**:
- `unit_code`: Must match training.gov.au pattern (3 letters + 6-10 alphanumeric)
- `nominal_hours`: Should match training.gov.au specification
- Sum of all unit nominal hours should align with `meta.duration.total_hours`

**Unit Types**:
- `core`: Required unit for qualification
- `elective`: Optional unit from allowable electives
- `prerequisite`: Must be completed before other units
- Empty string for non-packaged courses

**Assessment Tasks Structure**:
```json
{
  "assessment_tasks": [
    {
      "task_name": "AT1: Knowledge Questions",
      "method": "written",
      "description": "20 short answer questions covering infection control procedures"
    },
    {
      "task_name": "AT2: Practical Demonstration",
      "method": "practical",
      "description": "Demonstrate hand hygiene and PPE donning/doffing procedures"
    }
  ]
}
```

**Weeks Scheduled**:
- Lists week numbers when unit is actively delivered
- Helps visualize unit clustering and sequencing
- Useful for identifying overloaded weeks

**Learning Resources**:
- Specify version numbers for audit trail
- Include both digital and physical resources
- Note any third-party materials requiring licensing

---

### 5. Resources Object

**Purpose**: Centralized inventory of all plan requirements

```json
{
  "resources": {
    "facilities": ["Standard classroom (20 capacity)", "Computer lab with 20 workstations"],
    "equipment": ["Data projector", "First aid training manikins"],
    "materials": ["Learner workbooks (printed)", "Assessment templates"],
    "technology": ["LMS access (Moodle)", "Microsoft Office 365"],
    "external": ["Industry guest speaker (Week 3)", "Workplace visit to partnered employer"]
  }
}
```

**Categories Explained**:

- **Facilities**: Physical spaces and their specifications
  - Include capacity, accessibility features, safety requirements
  - Note booking/availability constraints

- **Equipment**: Reusable tools and apparatus
  - Specify quantities if relevant
  - Note calibration or maintenance requirements
  - Include safety equipment (PPE, first aid)

- **Materials**: Consumables and learning resources
  - Include printing requirements and quantities
  - Note copyright/licensing for third-party materials
  - Specify digital vs. physical formats

- **Technology**: Software, platforms, and digital tools
  - Include licensing requirements
  - Note accessibility features
  - Specify technical support needs

- **External**: Outside resources and partnerships
  - Confirm bookings/agreements in place
  - Note contingency plans if unavailable
  - Include contact details in operational docs

**Audit Considerations**:
- Resources must be available and suitable for delivery
- Equipment must meet industry standards and safety regulations
- Technology must be accessible to all learners (equity)
- External arrangements should have documented agreements

---

### 6. Risks Array

**Purpose**: Proactive identification of delivery challenges

```json
{
  "risks": [
    {
      "risk_description": "Low learner LLN levels may impact assessment completion rates",
      "category": "learner",
      "likelihood": "medium",
      "impact": "high",
      "mitigation": "Provide additional LLN support sessions in weeks 1-2; use simplified language in assessment tools"
    }
  ]
}
```

**Risk Categories**:
- `learner`: Student capability, engagement, retention
- `trainer`: Availability, qualifications, capability
- `resource`: Facilities, equipment, materials
- `compliance`: Regulatory, audit, quality
- `scheduling`: Timing, public holidays, conflicts
- `assessment`: Validation, moderation, completion rates
- `external`: Industry partners, third-party providers
- `other`: Uncategorized risks

**Risk Matrix**:
- **Likelihood**: low (unlikely), medium (possible), high (probable)
- **Impact**: low (minimal disruption), medium (moderate disruption), high (major disruption/non-compliance)

**Mitigation Strategies Should**:
- Be specific and actionable
- Identify responsible parties (in implementation docs)
- Include preventive and reactive measures
- Consider resource implications

**Common RTO Risks**:
- Trainer unavailability → backup trainer arrangements
- Low enrollment → combined cohorts or postponement
- Equipment failure → backup equipment or alternative activities
- Assessment validation delays → early scheduling and validation
- Student LLN barriers → support services and adjusted tools
- Compliance changes → monitoring and rapid response protocols

---

### 7. Assumptions Array

**Purpose**: Document planning decisions requiring validation

```json
{
  "assumptions": [
    {
      "assumption": "Learners have access to computer and internet for online components",
      "category": "resource_availability",
      "validation_required": true
    }
  ]
}
```

**Categories**:
- `learner_capability`: Skills, knowledge, LLN levels
- `resource_availability`: Facilities, equipment, materials
- `trainer_qualification`: TAE, vocational competency, industry currency
- `scheduling`: Dates, duration, cohort size
- `compliance`: Standards interpretation, packaging rules
- `other`: Uncategorized assumptions

**Validation Required Flag**:
- `true`: Must verify before delivery (e.g., student technology access)
- `false`: General assumption documented for reference (e.g., standard business hours)

**Best Practices**:
- Make assumptions explicit rather than implicit
- Separate assumptions from risks (assumptions = what we believe; risks = what could go wrong)
- Review assumptions during pre-delivery planning
- Update assumptions based on actual cohort information

**Common RTO Assumptions**:
- Learners meet entry requirements
- Trainers available for scheduled weeks
- Facilities operational and accessible
- Third-party agreements in place
- Assessment tools validated
- LMS functional and accessible
- Standard business hours apply
- No major regulatory changes during delivery

---

### 8. Compliance Notes Object

**Purpose**: ASQA-specific compliance documentation

```json
{
  "compliance_notes": {
    "volume_of_learning": "Total nominal hours: 720. Meets AQF Certificate IV volume of learning requirements...",
    "training_packaging_compliance": "All 12 core units included. 4 electives selected from Group A...",
    "assessment_validation": "Assessment tools to be validated pre-delivery...",
    "trainer_assessor_requirements": "Trainers must hold TAE40116, relevant industry qualification..."
  }
}
```

**Volume of Learning (VoL)**:
- AQF specifies VoL ranges for each qualification level
- Must include supervised learning, self-directed study, assessment
- Document how total hours meet AQF requirements
- Consider Recognition of Prior Learning (RPL) impact on VoL

**AQF Volume of Learning Guidelines**:
- Certificate I: 0.5-1 year (150-400 hours)
- Certificate II: 0.5-1 year (150-400 hours)
- Certificate III: 1-2 years (400-1200 hours)
- Certificate IV: 1-2 years (400-1200 hours)
- Diploma: 1-2 years (800-2400 hours)
- Advanced Diploma: 1.5-2 years (1200-2400 hours)

**Training Package Compliance**:
- Document adherence to packaging rules
- Note core/elective selections
- Reference training package version
- Justify any imported units

**Assessment Validation**:
- Pre-delivery validation requirements
- Post-delivery moderation plans
- Industry engagement in validation
- Continuous improvement process

**Trainer/Assessor Requirements**:
- TAE qualification (or transition arrangements)
- Vocational competency specifications
- Industry currency requirements
- Professional development obligations

---

### 9. Confidence Score

**Purpose**: AI self-assessment of plan quality

```json
{
  "confidence_score": 0.85
}
```

**Score Interpretation**:
- **0.9-1.0**: High confidence - comprehensive input, standard delivery, well-defined units
- **0.7-0.89**: Good confidence - adequate input, some assumptions, minor gaps
- **0.5-0.69**: Moderate confidence - limited input, multiple assumptions, needs review
- **0.3-0.49**: Low confidence - sparse input, significant gaps, requires substantial editing
- **0.0-0.29**: Very low confidence - insufficient information, placeholder output

**Factors Affecting Confidence**:
- Completeness of intake form data
- Availability of qualification/unit information
- Complexity of delivery model
- Specificity of cohort profile
- Number of assumptions made

**Usage**:
- Scores < 0.7 should trigger human review before use
- Highlight low-confidence areas in generation notes
- Use for quality metrics and continuous improvement

---

### 10. Generation Notes

**Purpose**: AI commentary on plan creation and limitations

```json
{
  "generation_notes": "Generated based on limited cohort information. Recommend reviewing LLN support strategies with actual learner profiles. Assessment scheduling assumes standard completion rates - adjust based on cohort progress."
}
```

**Should Include**:
- Data gaps or limitations in input
- Areas requiring human expertise
- Assumptions made during generation
- Suggestions for improvement
- Warnings about non-standard configurations
- References to source documents consulted

**Example Notes**:
- "Unit BSBXXX123 not found in training.gov.au - used generic nominal hours"
- "Blended delivery ratio estimated at 60% online, 40% F2F - adjust based on actual requirements"
- "Assessment validation timeline tight - consider extending by 2 weeks"
- "Cohort profile indicates high support needs - budget additional trainer time"

---

## Field Validation Summary

### Required Fields

**Top-level**:
- metadata, meta, units, weekly_plan, confidence_score

**metadata**:
- schema_version, project_type, generated_at

**meta**:
- qualification, duration, delivery_mode, cohort_profile

**meta.qualification**:
- title

**meta.duration**:
- weeks, total_hours

**weekly_plan items**:
- week_number, activities

**weekly_plan.activities items**:
- title, duration_hours, delivery_method

**weekly_plan.assessments items**:
- title, type, units_assessed

**units items**:
- unit_code, unit_title, nominal_hours

**risks items**:
- risk_description, likelihood, impact

**assumptions items**:
- assumption

### Optional But Recommended

- meta.qualification.code (required for accredited training)
- meta.start_date, meta.end_date (for scheduling)
- meta.trainer_details (for compliance)
- weekly_plan.assessments (at least some assessment tasks)
- units.assessment_tasks (specificity improves quality)
- resources (all categories for operational readiness)
- risks (proactive risk management)
- assumptions (clarity and validation)
- compliance_notes (audit readiness)
- generation_notes (transparency and improvement)

---

## Extensibility Strategy

### Adding New Fields (Without Breaking Changes)

**Option 1: Use Reserved Namespaces**
```json
{
  "metadata": {
    "reserved": {
      "custom_field": "value",
      "future_feature": {}
    }
  }
}
```

**Option 2: Add Optional Fields**
- New fields added as optional (not required)
- Old versions ignore unknown fields via `additionalProperties: false` boundaries
- Parsers use defensive programming (check field existence)

**Option 3: Schema Versioning**
- MAJOR version: Breaking changes (removed/renamed required fields)
- MINOR version: New optional fields, new enum values
- PATCH version: Documentation, validation refinements

### Future Considerations

**Potential Extensions**:
- Session plans (detailed lesson plans for each week)
- Assessment plans (comprehensive assessment strategy documents)
- Resource booking integration
- Staff allocation and timetabling
- Student progress tracking
- Competency mapping visualizations
- Export templates for different RTO systems
- Multi-language support
- Integration with training.gov.au API

**Backwards Compatibility**:
- Old plans validated against new schema versions (within MINOR)
- Migration utilities for MAJOR version changes
- Schema version negotiation in API
- Deprecation warnings for fields scheduled for removal

---

## Examples of Valid Values

### Complete Minimal Example

```json
{
  "metadata": {
    "schema_version": "1.0.0",
    "project_type": "unit_plan",
    "generated_at": "2025-11-01T10:30:00Z"
  },
  "meta": {
    "qualification": {
      "title": "Certificate III in Individual Support"
    },
    "duration": {
      "weeks": 8,
      "total_hours": 240
    },
    "delivery_mode": "face_to_face",
    "cohort_profile": "Adult learners entering aged care sector, LLN levels 3-4"
  },
  "units": [
    {
      "unit_code": "CHCCOM005",
      "unit_title": "Communicate and work in health or community services",
      "nominal_hours": 40
    }
  ],
  "weekly_plan": [
    {
      "week_number": 1,
      "activities": [
        {
          "title": "Introduction to Communication",
          "duration_hours": 8,
          "delivery_method": "lecture"
        }
      ]
    }
  ],
  "confidence_score": 0.75
}
```

### Complete Comprehensive Example

See separate file: `examples/comprehensive-unit-plan.json` (to be created if needed)

---

## Australian RTO-Specific Guidance

### Training.gov.au Integration

**Unit Codes**:
- Always validate against current training.gov.au data
- Check for superseded/deleted units
- Verify nominal hours match published data
- Note equivalent or prerequisite units

**Training Packages**:
- Reference specific version (e.g., "BSB v5.2")
- Check currency and transition arrangements
- Validate packaging rules compliance
- Note implementation dates

### ASQA Standards Alignment

**Standard 1: Training and Assessment**
- Strategies and practices align with units
- Assessment validated and moderated
- Trainers hold required qualifications
- Resources meet industry standards

**Standard 2: Learner Engagement**
- Entry requirements clearly defined
- LLN support available
- Reasonable adjustments documented
- Learner support services identified

**Standard 3: Learner Engagement**
- Accurate course information
- Transparent assessment processes
- Fair and ethical conduct
- Complaints and appeals process

**Standard 4: Governance**
- Compliance systems in place
- Risk management documented
- Quality improvement processes
- Record-keeping requirements

### Industry Engagement

Plans should reference:
- Industry advisory input
- Current workplace practices
- Equipment/technology standards
- Employability skills integration
- WHS requirements specific to industry

### LLN Considerations

Cohort profiles should inform:
- Language complexity in resources
- Assessment tool readability
- Support services provision
- Reasonable adjustment strategies
- Foundation skills embedding

---

## Common Pitfalls and Solutions

### Pitfall 1: Insufficient Volume of Learning
**Problem**: Total hours don't meet AQF requirements
**Solution**: Document self-directed study, research, and assessment time in compliance notes

### Pitfall 2: Assessment Overload
**Problem**: Too many major assessments in one week
**Solution**: Spread assessments across weeks; use integrated assessment where possible

### Pitfall 3: Generic Cohort Profiles
**Problem**: "Mixed ability adults" provides no actionable information
**Solution**: Include specific LLN levels, age ranges, industry background, special needs

### Pitfall 4: Unvalidated Assumptions
**Problem**: Plan assumes resources without verification
**Solution**: Flag validation_required: true for critical assumptions

### Pitfall 5: Missing Prerequisites
**Problem**: Units scheduled before prerequisites completed
**Solution**: Validate unit sequencing against prerequisites array

### Pitfall 6: Trainer Qualification Gaps
**Problem**: Required vocational competency not specified
**Solution**: Document specific qualifications and industry currency in trainer_details

### Pitfall 7: Non-compliant Assessment
**Problem**: Assessment methods don't cover all performance criteria
**Solution**: Map assessment tasks to unit elements; include both knowledge and skills

### Pitfall 8: Resource Unavailability
**Problem**: Plan requires specialized equipment not owned by RTO
**Solution**: Identify in resources.external with contingency in risks

---

## Validation Checklist

Before finalizing a plan, verify:

- [ ] All required fields present and valid
- [ ] Unit codes match training.gov.au format
- [ ] Qualification code (if provided) is current and not superseded
- [ ] Total nominal hours = sum of unit hours
- [ ] Duration.weeks aligns with start_date and end_date
- [ ] Assessment methods cover knowledge AND skills
- [ ] All units have at least one assessment task
- [ ] Risks identified with mitigation strategies
- [ ] Critical assumptions flagged for validation
- [ ] Trainer requirements documented
- [ ] Volume of learning meets AQF guidelines
- [ ] Packaging rules compliance noted
- [ ] Resources sufficient for delivery
- [ ] Confidence score justified by data quality
- [ ] Generation notes highlight review areas

---

## Support and Updates

**Schema Repository**: (To be added - GitHub/internal repo)
**Change Log**: Track schema version changes and migration notes
**Feedback**: Report issues or suggest improvements via (internal process)

**Related Documents**:
- APRV Pattern Documentation (`/docs/aprv-pattern.md`)
- Prompt Engineering Guide (`/prompts/user-template.md`)
- Export Templates (`/lib/export-handlers.ts`)
- TypeScript Type Definitions (`/types/unit-plan.ts`)

---

**Document Version**: 1.0.0
**Last Reviewed**: November 2025
**Next Review**: (Quarterly or upon schema MINOR version change)
