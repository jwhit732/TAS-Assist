# Quick Start Guide - ResultsView Component

This guide will help you quickly integrate and test the ResultsView component.

## Installation

All dependencies are already installed in the project. The component uses:
- `@radix-ui/react-tabs`
- `lucide-react`
- `tailwindcss`

## Basic Usage

### 1. Import the Component

```tsx
import { ResultsView } from '@/components/results-view';
import type { GeneratedPlan } from '@/types/schema-types';
```

### 2. Set Up State

```tsx
const [plan, setPlan] = useState<GeneratedPlan | null>(null);
```

### 3. Implement Export Handler

```tsx
const handleExport = (format: 'docx' | 'pdf' | 'markdown') => {
  switch (format) {
    case 'docx':
      // Call your DOCX export function
      exportToDocx(plan);
      break;
    case 'pdf':
      // PDF uses browser print dialog (handled automatically)
      window.print();
      break;
    case 'markdown':
      // Call your Markdown export function
      exportToMarkdown(plan);
      break;
  }
};
```

### 4. Implement Reset Handler

```tsx
const handleReset = () => {
  setPlan(null);
  // Navigate back to intake form or clear state
};
```

### 5. Render Component

```tsx
{plan && (
  <ResultsView
    plan={plan}
    onExport={handleExport}
    onReset={handleReset}
  />
)}
```

## Testing with Mock Data

### Quick Test (Development)

Use the demo component for immediate testing:

```tsx
import { DemoResultsView } from '@/components/demo-results-view';

export default function TestPage() {
  return <DemoResultsView />;
}
```

### Using Mock Data Directly

```tsx
import { mockPlanShortCourse, mockPlanBlended } from '@/components/mock-data';

// Use in your component
const [plan, setPlan] = useState(mockPlanShortCourse);
```

## Integration with API

Typical integration pattern:

```tsx
'use client';

import { useState } from 'react';
import { ResultsView } from '@/components/results-view';
import type { GeneratedPlan } from '@/types/schema-types';

export default function PlanPage() {
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async (intakeData: IntakeFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakeData)
      });

      const result = await response.json();
      if (result.success) {
        setPlan(result.plan);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'docx' | 'pdf' | 'markdown') => {
    // Implement export logic
    console.log(`Exporting as ${format}`);
  };

  const handleReset = () => {
    setPlan(null);
  };

  if (loading) {
    return <div>Generating plan...</div>;
  }

  if (!plan) {
    return <IntakeForm onSubmit={generatePlan} />;
  }

  return (
    <ResultsView
      plan={plan}
      onExport={handleExport}
      onReset={handleReset}
    />
  );
}
```

## Export Implementation Examples

### DOCX Export

```tsx
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

async function exportToDocx(plan: GeneratedPlan) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: plan.meta.qualification.title,
              bold: true,
              size: 32
            })
          ]
        }),
        // Add more content...
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${plan.meta.qualification.title} - Unit Plan.docx`);
}
```

### Markdown Export

```tsx
function exportToMarkdown(plan: GeneratedPlan) {
  let markdown = `# ${plan.meta.qualification.title}\n\n`;
  markdown += `**Duration:** ${plan.meta.duration.weeks} weeks\n`;
  markdown += `**Total Hours:** ${plan.meta.duration.total_hours}\n\n`;

  // Add weekly plan
  markdown += `## Weekly Plan\n\n`;
  plan.weekly_plan.forEach(week => {
    markdown += `### Week ${week.week_number}\n`;
    if (week.week_theme) {
      markdown += `*${week.week_theme}*\n\n`;
    }
    // Add activities...
  });

  // Create blob and download
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${plan.meta.qualification.title} - Unit Plan.md`;
  a.click();
  URL.revokeObjectURL(url);
}
```

## Styling Customization

### Custom Colors

Modify the component's color classes:

```tsx
// In results-view.tsx, change badge variants:
<Badge variant="success">  // Green
<Badge variant="warning">  // Yellow
<Badge variant="danger">   // Red
```

### Print Styles

Customize print CSS in the component:

```tsx
<style jsx global>{`
  @media print {
    .no-print { display: none; }

    /* Add custom print styles */
    .page-break { page-break-before: always; }
    body { font-size: 12pt; }
  }
`}</style>
```

## Troubleshooting

### Issue: Component not rendering

**Solution:** Ensure you have `'use client'` directive at the top of your page file:

```tsx
'use client';

import { ResultsView } from '@/components/results-view';
```

### Issue: Icons not showing

**Solution:** Verify lucide-react is installed:

```bash
npm install lucide-react
```

### Issue: Tabs not styling correctly

**Solution:** Ensure Tailwind CSS is configured and importing styles in your app.

### Issue: TypeScript errors on imports

**Solution:** Check your `tsconfig.json` has the path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Next Steps

1. **Implement Export Handlers**: Create the DOCX and Markdown export functions
2. **Connect to API**: Wire up the `/api/generate` endpoint
3. **Add Loading States**: Implement proper loading UI during generation
4. **Error Handling**: Add error boundaries and user-friendly error messages
5. **Persistence**: Implement localStorage saving of generated plans
6. **Testing**: Add unit tests for the component

## Resources

- Component README: `./README.md`
- Mock Data: `./mock-data.ts`
- Demo Component: `./demo-results-view.tsx`
- Schema Types: `../types/schema-types.ts`
- JSON Schema: `../prompts/schema.json`

## Support

For questions or issues:
1. Check the main README: `/README.md`
2. Review CLAUDE.md: `/CLAUDE.md`
3. Consult schema documentation: `/prompts/schema.md`
