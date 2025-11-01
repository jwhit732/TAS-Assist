# Testing Guide - TAS Assistant

## Overview

This guide covers the three required testing scenarios for the TAS Assistant Stage 0 MVP.

**Success Criteria**: Each scenario should produce valid, usable output on first generation >80% of the time.

---

## Pre-Testing Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: Navigate to `http://localhost:3000`

3. **Verify API key**: Check that `.env.local` has a valid `ANTHROPIC_API_KEY`

---

## Scenario 1: Short Course (2-week F2F delivery, single trainer)

### Objective
Test minimal information input with basic assumptions.

### Test Data

**Qualification Details:**
- Qualification Name: `Certificate III in Customer Engagement`
- Qualification Code: `SIR30216` (optional)
- Delivery Mode: `Face to Face`

**Delivery Details:**
- Duration: `2` weeks
- Total Hours: `80` hours

**Cohort Profile:**
```
Small cohort of 12 adult learners, ages 25-45. Mix of employment backgrounds.
LLN levels: Average (Level 3). Basic digital literacy.
```

**Advanced Options** (optional):
- Resources: Classroom/Training Room, Computer Lab
- Assessments: Written Tests, Practical Demonstrations

### Expected Outcomes

✅ **Should generate:**
- 2-week weekly plan with distributed activities
- Realistic hour allocation (40 hours/week)
- Face-to-face delivery methods throughout
- Basic resource requirements
- Assumptions documented (e.g., "Assumed single trainer delivery")
- Confidence score: 0.6-0.75 (lower due to limited info)

✅ **Should handle gracefully:**
- Missing qualification code
- Minimal cohort details
- Limited resource specification

❌ **Should NOT:**
- Generate online activities
- Require complex multi-trainer coordination
- Include resources not requested

### Testing Steps

1. Fill in the form with test data above
2. Click "Generate Unit Plan"
3. Wait 1-3 minutes for generation
4. Review the results:
   - Check Overview tab for accuracy
   - Verify Weekly Plan has 2 weeks
   - Confirm delivery mode is face-to-face throughout
   - Review Risks & Assumptions tab for documented assumptions
   - Check confidence score is reasonable

5. Test exports:
   - Export as DOCX (should download)
   - Print PDF (browser dialog should open)
   - Export as Markdown (should download)

6. Verify localStorage:
   - Refresh the page
   - Should see the same plan still displayed

---

## Scenario 2: Blended Program (8-week mixed mode, multiple units)

### Objective
Test moderate complexity with blended delivery.

### Test Data

**Qualification Details:**
- Qualification Name: `Certificate IV in Training and Assessment`
- Qualification Code: `TAE40122`
- Delivery Mode: `Blended`

**Delivery Details:**
- Duration: `8` weeks
- Total Hours: `240` hours

**Cohort Profile:**
```
Working professionals, evening and weekend delivery.
Ages 30-55, experienced in their industries but new to formal training.
LLN: Level 3-4. Good digital literacy, comfortable with LMS.
Mix of cultural backgrounds. Some with prior learning recognition.
```

**Advanced Options:**
- Resources:
  - Classroom/Training Room
  - Computer Lab
  - Online Learning Platform (LMS)

- Assessments:
  - Written Tests
  - Practical Demonstrations
  - Projects/Case Studies
  - Portfolio Assessment
  - Workplace Observation

- Unit List (paste this):
  ```
  TAELLN411 - Address adult language, literacy and numeracy skills
  TAEASS412 - Assess competence
  TAEDES401 - Design and develop learning programs
  TAEDEL401 - Plan, organise and deliver group-based learning
  ```

### Expected Outcomes

✅ **Should generate:**
- 8-week detailed plan with progression
- Mix of face-to-face, online, and self-paced activities
- All 4 units incorporated into weekly plan
- Realistic assessment schedule spread across weeks
- Consideration for working professionals (evening/weekend)
- Resources for both online and F2F delivery
- Confidence score: 0.75-0.85 (good info provided)

✅ **Should demonstrate:**
- Unit sequencing logic (e.g., TAELLN before assessment units)
- Balanced F2F vs. online mix
- Workplace observation scheduling
- Portfolio building across multiple weeks
- LMS resource allocation

❌ **Should NOT:**
- Cram all content into first few weeks
- Schedule workplace observation in week 1
- Ignore the working professional context

### Testing Steps

1. Fill in the form (copy-paste unit list)
2. Expand "Advanced Options"
3. Select multiple resources and assessment types
4. Generate plan
5. Review in detail:
   - Overview: Verify all 4 units present
   - Weekly Plan: Check mix of delivery modes
   - Units: Ensure all units from list included
   - Risks: Should mention workplace observation logistics
   - Compliance: Check TAE-specific requirements

6. Export all three formats
7. Reset and verify localStorage cleared

---

## Scenario 3: Multi-trainer Complex Delivery (Various resources, long duration)

### Objective
Test high complexity with multiple trainers and extensive resources.

### Test Data

**Qualification Details:**
- Qualification Name: `Diploma of Leadership and Management`
- Qualification Code: `BSL50420`
- Delivery Mode: `Blended`

**Delivery Details:**
- Duration: `16` weeks
- Total Hours: `480` hours

**Cohort Profile:**
```
Cohort of 20 mid-level managers from various industries.
Ages 28-50, diverse educational backgrounds.
LLN: Level 4-5. High digital competence.
Mix of full-time and part-time learners.
Preference for weekend intensives and online modules.
Some participants in regional/remote locations (Zoom access required).
Industry mentors available for guest sessions.
```

**Advanced Options:**
- Resources: ALL checkboxes

- Assessments: ALL checkboxes

- Unit List (paste 6+ units):
  ```
  BSBTWK502 - Manage team effectiveness
  BSBLDR523 - Lead and manage effective workplace relationships
  BSBOPS502 - Manage business operational plans
  BSBFIN501 - Manage budgets and financial plans
  BSBCMM511 - Communicate with influence
  BSBSTR502 - Facilitate continuous improvement
  ```

### Expected Outcomes

✅ **Should generate:**
- 16-week comprehensive plan
- Multi-trainer coordination suggestions
- Weekend intensive scheduling
- Online module incorporation for regional learners
- Guest speaker/mentor integration
- Extensive resource requirements documented
- Complex assessment schedule (spread appropriately)
- Risk mitigation for regional delivery
- Assumptions about trainer qualifications
- Confidence score: 0.85-0.95 (comprehensive info)

✅ **Should demonstrate:**
- Strategic unit sequencing (leadership before budgets)
- Resource variety across delivery
- Assessment clustering where appropriate
- Consideration for part-time learners
- Regional access accommodations

✅ **Should document assumptions about:**
- Trainer availability and qualifications
- LMS capabilities
- Zoom infrastructure
- Industry mentor schedules

❌ **Should NOT:**
- Create unrealistic weekly hour loads
- Schedule all assessments in final weeks
- Ignore regional participant needs

### Testing Steps

1. Fill in all fields with comprehensive data
2. Select ALL resources and assessment types
3. Paste 6-unit list
4. Generate and wait (this may take closer to 3 minutes)
5. Comprehensive review:
   - Overview: High confidence score expected
   - Weekly Plan: Check for strategic pacing
   - Units: Verify all 6 units incorporated
   - Risks: Should identify multi-trainer coordination, regional access
   - Assumptions: Check for trainer quals, resource availability
   - Compliance: BSB packaging rules, VoL justification

6. Test all exports with large complex plan
7. Check localStorage capacity with large plan

---

## Cross-Scenario Validation

### For All Scenarios

**Schema Compliance:**
- All plans must validate against `prompts/schema.json`
- No missing required fields
- Proper data types and formats

**APRV Loop Evidence:**
- Confidence score present (0.0-1.0)
- Generation notes included
- Reflection phase visible in logs (if viewing dev logs)

**User Experience:**
- Generation time < 3 minutes
- Clear loading state
- Error handling (test with invalid API key)
- Reset functionality works
- localStorage persistence across refreshes

**Export Quality:**
- DOCX opens in Word, editable, professional formatting
- PDF via print dialog produces clean document
- Markdown is readable, well-formatted

**Accessibility:**
- Keyboard navigation works
- Form validation messages clear
- Screen reader friendly (test with NVDA/JAWS if available)

---

## Performance Benchmarks

| Scenario | Expected Gen Time | Expected Confidence | Plan Complexity |
|----------|-------------------|---------------------|-----------------|
| 1. Short Course | 30-90 seconds | 0.60-0.75 | Low |
| 2. Blended Program | 60-120 seconds | 0.75-0.85 | Medium |
| 3. Multi-trainer Complex | 90-180 seconds | 0.85-0.95 | High |

---

## Common Issues & Troubleshooting

### Issue: API Key Error
**Solution**: Check `.env.local` file, ensure key starts with `sk-ant-api03-`

### Issue: Generation Times Out
**Solution**: Check API route timeout settings, verify network connection

### Issue: Validation Errors
**Solution**: Check browser console for Zod errors, verify schema compatibility

### Issue: Export Not Working
**Solution**:
- DOCX: Check `docx` and `file-saver` installed
- PDF: Ensure print CSS in `globals.css`
- Markdown: Check browser download permissions

### Issue: localStorage Full
**Solution**: Clear old plans via browser DevTools → Application → Local Storage

---

## Success Criteria Checklist

After running all three scenarios:

- [ ] All three plans generated successfully (>80% success rate)
- [ ] Each plan validated against schema (100%)
- [ ] Generation times under 3 minutes (100%)
- [ ] All exports working (DOCX, PDF, Markdown)
- [ ] localStorage persistence functional
- [ ] No console errors (except expected warnings)
- [ ] Plans are audit-ready and usable
- [ ] Confidence scores reasonable for input quality
- [ ] Assumptions documented where info missing
- [ ] Risks identified appropriately

---

## Regression Testing (Future)

When making changes, re-run all three scenarios to ensure:
- No schema breakage
- APRV loop still functioning
- Export formats still working
- Performance hasn't degraded

---

## Reporting Issues

When reporting bugs, include:
1. Scenario being tested
2. Exact input data used
3. Expected vs. actual outcome
4. Browser console errors
5. Generation logs (if available)
6. Screenshots

---

## Next Steps After Testing

1. Document any patterns in failed generations
2. Refine prompts in `prompts/system.md` if needed
3. Adjust schema validation if too strict
4. Optimize APRV loop based on logs
5. Gather user feedback on plan quality
