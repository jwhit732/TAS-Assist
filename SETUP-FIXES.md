# Setup Fixes Required

## Type Compatibility Issues

There are type mismatches between different parts of the codebase that need to be resolved:

### 1. IntakeFormData Type Mismatch

**Problem**: `lib/aprv.ts` has a different `IntakeFormData` structure than `types/unit-plan.ts`

**Files affected**:
- `lib/aprv.ts` (lines 20-52)
- `types/unit-plan.ts`
- `components/intake-form.tsx`

**Solution**: Use the simpler IntakeFormData from types/unit-plan.ts and adapt it in aprv.ts

### 2. Zod v4 API Changes

**Problem**: Zod v4 has different APIs than v3 (installed version is 4.1.12)

**Files affected**:
- `lib/schema-validator.ts`

**Changes needed**:
- `z.enum()` syntax changed - need to use object notation
- `deepPartial()` may not exist in v4
- Error handling structure changed

### 3. GeneratedPlan Return Type

**Problem**: APRV returns result with logs, but type doesn't include them

**Files affected**:
- `app/api/generate/route.ts` (lines 83, 97, 109)

**Solution**: Fix the return type interface

## Quick Fixes

### Option 1: Downgrade Zod to v3 (Easiest)

```bash
cd tas-assistant
npm install zod@3.23.8
```

### Option 2: Fix Type Compatibility (Manual)

I'll create a comprehensive fix in the next step.

## Status

- Project structure: ✅ Complete
- Core logic: ✅ Implemented
- Type compatibility: ⚠️ Needs fixing
- Zod version: ⚠️ v4 compatibility issues

## Recommendation

Let me create fixed versions of the affected files to resolve all type issues.
