# Testing the Schema Validation Fixes

This guide explains how to test the validation schema fixes that align the Zod schema with the JSON schema.

## Quick Test (Recommended)

Run the automated validation test:

```bash
npx tsx test-schema-validation.ts
```

This test validates a sample plan that uses all the fixed schema fields:
- ✅ Assessment types: `written`, `practical`, `observation`
- ✅ Activity delivery methods: `lecture`, `workshop`, `practical`
- ✅ Field names: `risk_description`, `assumption`
- ✅ Optional fields and flexible validation

If you see "✅ VALIDATION PASSED!" - the fixes are working!

---

## Full Application Test

Test the complete generation flow through the web interface:

### 1. Start the Development Server

```bash
# Make sure you have your API key set
export ANTHROPIC_API_KEY="your-api-key-here"

# Start the dev server
npm run dev
```

The server will start at http://localhost:3000

### 2. Fill Out the Intake Form

Navigate to the home page and fill in the form:

**Required Fields:**
- Qualification Title: e.g., "Certificate IV in Business"
- Qualification Code: e.g., "BSB40120"
- Duration (weeks): e.g., 12
- Total Hours: e.g., 360
- Delivery Mode: Select "Blended" or any option
- Cohort Profile: Enter at least 20 characters describing your learners

**Optional Fields:**
- Start Date
- Resources
- Assessment Preferences
- Unit List

### 3. Generate the Plan

Click "Generate Plan" and wait for the AI to create the unit plan.

### 4. Check for Validation Success

**What to look for:**

✅ **Success Indicators:**
- Plan generates successfully
- No validation errors in the response
- Plan displays correctly in the UI
- All sections are populated (metadata, meta, weekly_plan, units, etc.)

❌ **Previous Errors (Now Fixed):**
- "Invalid option: expected one of..." - Assessment type mismatches
- "Invalid input: expected array, received string" - Prerequisites format
- "Invalid string: must match pattern" - Date format issues
- "Invalid input: expected string, received undefined" - Missing field names

### 5. Check Server Logs

Look at the terminal running `npm run dev`:

```bash
# You should see logs like:
[API] Received intake data: ...
[APRV] Starting generation...
[APRV] Response length: XXXX characters
[VALIDATOR] Validation error: ... (only if there are issues)
[API] Final validation passed  # ← This means success!
```

---

## API Test (Advanced)

Test the API directly with curl:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "qualification": "Certificate IV in Business",
    "qualificationCode": "BSB40120",
    "durationWeeks": 12,
    "totalHours": 360,
    "deliveryMode": "blended",
    "cohortProfile": "Adult learners with diverse backgrounds and some work experience in business settings"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "plan": {
    "metadata": { ... },
    "meta": { ... },
    "weekly_plan": [ ... ],
    "units": [ ... ],
    ...
  },
  "metadata": {
    "duration_ms": 15000,
    "logs": [ ... ]
  }
}
```

---

## What Was Fixed?

### Schema Alignments

1. **Assessment Types**
   - Before: `written_test`, `practical_demonstration`, `role_play`
   - After: `written`, `practical`, `observation`, `roleplay`

2. **Activity Delivery Methods**
   - Before: Limited to `face_to_face`, `online`, `workshop`
   - After: Full range including `lecture`, `tutorial`, `practical`, `simulation`, etc.

3. **Field Names**
   - Risks: `description` → `risk_description`
   - Assumptions: `description` → `assumption`
   - Compliance notes: Field names updated

4. **Data Types**
   - Assessment `weighting`: number → string (allows "20%", "Major", etc.)
   - Assessment `due_date`: Relaxed validation (allows "End of week 4")

5. **Optional Fields**
   - Made many fields optional to match JSON schema flexibility
   - Added missing fields: `unit_type`, `assessment_tasks`, `week_theme`, etc.

6. **Dependencies**
   - Zod: Fixed version from ^4.1.12 to ^3.23.8

---

## Troubleshooting

### Test Fails with "VALIDATION FAILED"

Check the error messages:
```bash
npx tsx test-schema-validation.ts
```

The errors will show which fields are still mismatched.

### API Returns 500 Error

Check the server logs for validation errors:
```bash
[API] Final validation failed: [
  "field.path: Error message"
]
```

This indicates a field that's still mismatched between JSON and Zod schemas.

### Build Fails

If you see network errors about Google Fonts, ignore them - these are unrelated to the validation fixes.

To check only TypeScript errors:
```bash
npx tsc --noEmit --skipLibCheck
```

---

## Next Steps

After confirming the fixes work:

1. ✅ Tests pass
2. ✅ API generates plans successfully
3. ✅ No validation errors
4. Create a pull request to merge the changes
5. Deploy to production

---

## Support

If you encounter issues:
1. Check that all dependencies are installed: `npm install`
2. Verify your API key is set: `echo $ANTHROPIC_API_KEY`
3. Review the error logs in detail
4. Compare actual vs expected schema fields in `lib/schema-validator.ts` and `prompts/schema.json`
