# Export Handlers Documentation

This module provides export functionality for TAS Assistant unit plans in three formats: DOCX, PDF, and Markdown.

## Overview

The export handlers convert `GeneratedPlan` objects into professionally formatted documents suitable for different use cases:

- **DOCX**: Editable Word documents for customization by trainers
- **PDF**: Print-ready documents via browser print dialog
- **Markdown**: Git-friendly plain text format

## Installation

Required dependencies (already included in package.json):

```bash
npm install docx file-saver
npm install --save-dev @types/file-saver
```

## API Reference

### `exportToDOCX(plan: GeneratedPlan, filename?: string): Promise<void>`

Exports the plan as a Microsoft Word document (.docx).

**Parameters:**
- `plan`: The generated unit plan object
- `filename` (optional): Custom filename. If not provided, auto-generates as `TAS-Plan-{QualCode}-{Date}.docx`

**Features:**
- Professional template with title page
- Automatic table of contents
- Formatted tables for units and weekly plans
- Page numbers and headers/footers
- Compliance notes and disclaimer

**Example:**
```typescript
import { exportToDOCX } from '@/lib/export-handlers';

// Auto-generated filename
await exportToDOCX(plan);

// Custom filename
await exportToDOCX(plan, 'my-custom-plan.docx');
```

### `exportToPDF(): Promise<void>`

Triggers the browser's print dialog for PDF export.

**Important:** This function should be called when the plan is already rendered in the DOM. It applies print-friendly styles and opens the print dialog.

**Example:**
```typescript
import { exportToPDF } from '@/lib/export-handlers';

// Make sure plan is visible in DOM first
await exportToPDF();
```

**Print CSS Requirements:**
To optimize PDF output, add print styles to your global CSS:

```css
@media print {
  /* Hide UI controls */
  .no-print {
    display: none !important;
  }

  /* Optimize page breaks */
  h1, h2 {
    page-break-after: avoid;
  }

  /* Ensure tables don't break poorly */
  table {
    page-break-inside: avoid;
  }
}
```

### `exportToMarkdown(plan: GeneratedPlan, filename?: string): void`

Exports the plan as a Markdown file (.md).

**Parameters:**
- `plan`: The generated unit plan object
- `filename` (optional): Custom filename. If not provided, auto-generates as `TAS-Plan-{QualCode}-{Date}.md`

**Features:**
- YAML frontmatter with metadata
- Clean heading hierarchy
- Markdown tables for units
- Bullet lists for activities and resources
- Human-readable and git-friendly

**Example:**
```typescript
import { exportToMarkdown } from '@/lib/export-handlers';

// Auto-generated filename
exportToMarkdown(plan);

// Custom filename
exportToMarkdown(plan, 'my-plan.md');
```

## DOCX Document Structure

The generated Word document includes:

1. **Title Page**
   - Qualification name and code
   - Generation date
   - Delivery mode and duration
   - Confidence score

2. **Table of Contents**
   - Auto-generated with hyperlinks
   - Covers levels 1-3 headings

3. **Overview Section**
   - Plan metadata (schema version, project type)
   - Qualification details
   - Duration and delivery information

4. **Cohort Profile**
   - Target learner description
   - Assessment preferences

5. **Weekly Delivery Plan**
   - Week-by-week breakdown
   - Topics, activities, and assessments
   - Hour allocations

6. **Units of Competency**
   - Summary table
   - Detailed unit information
   - Assessment methods and prerequisites

7. **Resources & Facilities**
   - Available resources list

8. **Risks & Assumptions**
   - Identified risks with mitigation strategies
   - Documented assumptions with validation notes

9. **Compliance Notes**
   - Australian RTO requirements checklist
   - Important usage notes
   - Confidence score explanation

## Markdown Document Structure

The Markdown export includes:

```markdown
---
title: "TAS Unit Plan - {Qualification}"
qualification_code: "{Code}"
generated: "{ISO Date}"
delivery_mode: "{Mode}"
duration_weeks: {Weeks}
total_hours: {Hours}
confidence: {Score}
---

# TAS Unit Plan: {Qualification}

## Overview
[Metadata and summary]

## Cohort Profile
[Description and preferences]

## Weekly Delivery Plan
### Week 1
...

## Units of Competency
[Markdown table + details]

## Resources & Facilities
[Bullet list]

## Risks
[Categorized list]

## Assumptions
[Categorized list]

## Compliance Notes
[Requirements and notes]
```

## Integration Example

Complete export controls component:

```typescript
'use client';

import { useState } from 'react';
import { exportToDOCX, exportToPDF, exportToMarkdown } from '@/lib/export-handlers';
import type { GeneratedPlan } from '@/types/unit-plan';

export function ExportControls({ plan }: { plan: GeneratedPlan }) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: 'docx' | 'pdf' | 'markdown') => {
    setExporting(format);

    try {
      switch (format) {
        case 'docx':
          await exportToDOCX(plan);
          break;
        case 'pdf':
          await exportToPDF();
          break;
        case 'markdown':
          exportToMarkdown(plan);
          break;
      }
    } catch (error) {
      console.error(`Export failed:`, error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleExport('docx')}
        disabled={exporting !== null}
      >
        {exporting === 'docx' ? 'Exporting...' : 'Export DOCX'}
      </button>

      <button
        onClick={() => handleExport('pdf')}
        disabled={exporting !== null}
      >
        {exporting === 'pdf' ? 'Opening...' : 'Print PDF'}
      </button>

      <button
        onClick={() => handleExport('markdown')}
        disabled={exporting !== null}
      >
        {exporting === 'markdown' ? 'Exporting...' : 'Export Markdown'}
      </button>
    </div>
  );
}
```

## Styling Recommendations

### For PDF Export

Add these classes to elements you want to hide during print:

```tsx
<button className="no-print">Export</button>
<nav className="no-print">Navigation</nav>
```

Add print styles in your global CSS:

```css
@media print {
  .no-print {
    display: none !important;
  }

  @page {
    margin: 2cm;
    size: A4;
  }

  body {
    font-size: 11pt;
    line-height: 1.5;
  }

  h1 {
    font-size: 18pt;
    page-break-before: always;
  }

  h1:first-of-type {
    page-break-before: avoid;
  }

  h2 {
    font-size: 14pt;
    margin-top: 1em;
  }

  table {
    page-break-inside: avoid;
    border-collapse: collapse;
    width: 100%;
  }

  thead {
    display: table-header-group;
  }
}
```

## Error Handling

All export functions should be wrapped in try-catch blocks:

```typescript
try {
  await exportToDOCX(plan);
  // Show success message
} catch (error) {
  console.error('Export failed:', error);
  // Show user-friendly error message
}
```

## Browser Compatibility

- **DOCX**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **PDF**: Requires browser with print functionality (all modern browsers)
- **Markdown**: Works in all modern browsers

## File Naming Convention

Auto-generated filenames follow this pattern:

```
TAS-Plan-{QualificationCode}-{YYYY-MM-DD}.{extension}

Examples:
- TAS-Plan-TAE40122-2024-01-15.docx
- TAS-Plan-TAE40122-2024-01-15.md
- TAS-Plan-PLAN-2024-01-15.docx (when no code provided)
```

## Testing

See `lib/export-handlers.example.ts` for:
- Mock plan data for testing
- Example component implementations
- Integration patterns

## Troubleshooting

### DOCX Export Issues

**Problem:** File downloads but won't open
- **Solution:** Check that all required fields in the plan are present
- **Solution:** Ensure plan.metadata.generated_at is a valid ISO date string

**Problem:** Tables look incorrect
- **Solution:** Verify that units array has valid data
- **Solution:** Check that weekly_plan activities are properly formatted

### PDF Export Issues

**Problem:** Print dialog doesn't open
- **Solution:** Check browser permissions for printing
- **Solution:** Ensure the plan is visible in the DOM before calling exportToPDF()

**Problem:** Layout issues in PDF
- **Solution:** Add proper print CSS (see Styling Recommendations)
- **Solution:** Test in different browsers

### Markdown Export Issues

**Problem:** Special characters break formatting
- **Solution:** The exporter handles most special characters, but check for unescaped pipes (|) in table cells

## Performance Considerations

- **DOCX**: Generation is async and may take 1-2 seconds for large plans
- **PDF**: Instant (opens browser dialog)
- **Markdown**: Instant (plain text generation)

## Future Enhancements

Potential improvements for future versions:

- [ ] Custom branding/logo support in DOCX
- [ ] Additional export formats (Excel, JSON)
- [ ] Email delivery integration
- [ ] Cloud storage integration (Google Drive, OneDrive)
- [ ] Batch export functionality
- [ ] Export templates customization

## Support

For issues or questions:
1. Check the example implementations in `lib/export-handlers.example.ts`
2. Review the type definitions in `types/unit-plan.ts`
3. Consult the main project documentation in `CLAUDE.md`
