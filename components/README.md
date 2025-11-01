# TAS Assistant Components

This directory contains the UI components for the TAS Assistant unit plan builder.

## Components Overview

### `results-view.tsx`

The main results display component that renders generated unit plans in a professional, tabbed interface.

**Features:**
- 5 tabbed sections: Overview, Weekly Plan, Units, Risks & Assumptions, Compliance
- Export controls (DOCX, PDF, Markdown)
- Print-optimized CSS for PDF generation
- Responsive design
- Accessibility features (keyboard navigation, ARIA labels)
- Professional styling suitable for audit documentation

**Props:**
```typescript
interface ResultsViewProps {
  plan: GeneratedPlan;           // The generated unit plan from the API
  onExport: (format: 'docx' | 'pdf' | 'markdown') => void;  // Export handler
  onReset: () => void;            // Reset/start over handler
}
```

**Usage Example:**
```tsx
import { ResultsView } from '@/components/results-view';
import type { GeneratedPlan } from '@/types/schema-types';

function MyPage() {
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);

  const handleExport = (format: 'docx' | 'pdf' | 'markdown') => {
    // Export logic here
    console.log(`Exporting as ${format}`);
  };

  const handleReset = () => {
    setPlan(null);
  };

  if (!plan) return <div>Loading...</div>;

  return (
    <ResultsView
      plan={plan}
      onExport={handleExport}
      onReset={handleReset}
    />
  );
}
```

### Tab Sections

#### 1. Overview Tab
Displays high-level summary information:
- Qualification details (title, code, level, packaging rules)
- Duration and delivery mode
- Units summary (count, core/elective breakdown)
- Confidence score with visual indicator
- Cohort profile
- Schedule and venue information

#### 2. Weekly Plan Tab
Shows the week-by-week delivery schedule:
- Week number and date range (calculated from start date)
- Weekly theme
- Units covered that week
- Learning activities (title, duration, delivery method, resources)
- Assessments (title, type, units assessed, due date)
- Notes and reminders

#### 3. Units Tab
Detailed unit of competency information:
- Unit code and title
- Nominal hours
- Unit type (core/elective/prerequisite)
- Delivery methods
- Assessment methods
- Prerequisites
- Week scheduling
- Learning resources

#### 4. Risks & Assumptions Tab
Risk management and planning assumptions:
- **Risks**: Description, category, likelihood, impact, mitigation
- **Assumptions**: Description, category, validation requirements
- Color-coded by severity

#### 5. Compliance Tab (conditional)
ASQA compliance notes (only shown if present):
- Volume of learning justification
- Training package compliance
- Assessment validation strategy
- Trainer/assessor requirements

### UI Components (`/ui` directory)

#### `tabs.tsx`
Radix UI tabs wrapper with Tailwind styling. Provides accessible, keyboard-navigable tab interface.

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="weekly">Weekly</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Content here</TabsContent>
</Tabs>
```

#### `badge.tsx`
Badge component for labels and status indicators.

**Variants:** `default`, `secondary`, `success`, `warning`, `danger`, `outline`

```tsx
<Badge variant="success">High Confidence</Badge>
<Badge variant="outline">Core Unit</Badge>
```

#### `button.tsx`
Button component with multiple variants and sizes.

**Variants:** `default`, `outline`, `ghost`, `secondary`
**Sizes:** `default`, `sm`, `lg`, `icon`

```tsx
<Button variant="outline" size="sm" onClick={handleClick}>
  <Icon className="w-4 h-4" />
  Click Me
</Button>
```

#### `card.tsx`
Card container components for content sections.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## Print Optimization

The results view includes print-specific CSS for PDF export via browser print:

- Export controls hidden when printing
- Optimized spacing and page breaks
- Preserved colors (using `print-color-adjust`)
- Sticky elements repositioned
- Overflow handling

**To print/export as PDF:**
1. Click the "PDF" button in export controls
2. Browser print dialog opens
3. Select "Save as PDF" as destination
4. Configure paper size (A4 recommended)
5. Enable background graphics
6. Save

## Styling

All components use:
- **Tailwind CSS** for utility-first styling
- **Responsive design** (mobile-first approach)
- **Professional color palette** (slate grays, semantic colors)
- **Consistent spacing** (Tailwind spacing scale)
- **Typography hierarchy** (clear headings, readable body text)

## Accessibility

Components follow accessibility best practices:
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Color contrast ratios (WCAG AA minimum)
- Screen reader friendly

## Dependencies

- `@radix-ui/react-tabs` - Accessible tabs primitive
- `lucide-react` - Icon library
- `tailwindcss` - Utility CSS framework
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

## File Structure

```
components/
├── results-view.tsx          # Main results display component
├── ui/
│   ├── tabs.tsx              # Tabs wrapper
│   ├── badge.tsx             # Badge component
│   ├── button.tsx            # Button component
│   └── card.tsx              # Card components
└── README.md                 # This file
```

## Type Definitions

All type definitions are in:
- `/types/schema-types.ts` - Schema-aligned types matching the JSON schema
- `/types/unit-plan.ts` - Legacy types (may be deprecated)

Use `schema-types.ts` for new development as it matches the actual schema structure.

## Helper Functions

Located in `/types/schema-types.ts`:

- `getConfidenceIndicator(score: number)` - Returns color-coded confidence level
- `calculateWeekDateRange(startDate: string, weekNumber: number)` - Calculates week date range
- `getTotalUnits(plan: GeneratedPlan)` - Counts total units
- `getHoursPerWeek(plan: GeneratedPlan)` - Calculates average hours per week

## Future Enhancements

Potential improvements for future iterations:

1. **Search/Filter**: Add search box for filtering units and activities
2. **Collapsible Sections**: Accordion-style week display for compact view
3. **Timeline View**: Visual Gantt chart for weekly schedule
4. **Comparison Mode**: Side-by-side comparison of multiple plans
5. **Notes/Comments**: In-app annotation capability
6. **Custom Themes**: Color theme switcher
7. **Advanced Export**: Custom export templates, selective export
8. **Sharing**: Generate shareable links (requires backend)

## Testing

To test the component:

1. **Mock Data**: Use the schema to create mock `GeneratedPlan` objects
2. **Visual Testing**: Verify all tabs render correctly
3. **Print Testing**: Test PDF export with different content lengths
4. **Responsive Testing**: Check mobile, tablet, desktop viewports
5. **Accessibility Testing**: Use screen reader, keyboard-only navigation

## Notes

- The component is client-side only (`'use client'` directive)
- Expects valid schema-compliant `GeneratedPlan` objects
- Export handlers (`onExport`) must be implemented by parent component
- Print functionality uses native browser print dialog
- Date formatting uses Australian locale (`en-AU`)

## Support

For issues or questions about these components, refer to:
- Main project README: `/README.md`
- CLAUDE.md for project context: `/CLAUDE.md`
- Schema documentation: `/prompts/schema.md`
