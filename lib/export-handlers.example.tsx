/**
 * Example Usage for Export Handlers
 *
 * This file demonstrates how to use the export handlers in your React components.
 */

import { exportToDOCX, exportToPDF, exportToMarkdown } from './export-handlers';
import type { GeneratedPlan } from '@/types/unit-plan';

// Example: Export to DOCX from a React component
export function ExampleDOCXExport({ plan }: { plan: GeneratedPlan }) {
  const handleExportDOCX = async () => {
    try {
      // Export with auto-generated filename
      await exportToDOCX(plan);
      console.log('DOCX export completed successfully');
    } catch (error) {
      console.error('DOCX export failed:', error);
    }
  };

  const handleExportCustomFilename = async () => {
    try {
      // Export with custom filename
      await exportToDOCX(plan, 'my-custom-plan.docx');
      console.log('DOCX export with custom name completed');
    } catch (error) {
      console.error('DOCX export failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleExportDOCX}>Export to DOCX</button>
      <button onClick={handleExportCustomFilename}>
        Export to DOCX (Custom Name)
      </button>
    </div>
  );
}

// Example: Export to PDF from a React component
export function ExamplePDFExport() {
  const handleExportPDF = async () => {
    try {
      // This will trigger the browser's print dialog
      // Make sure your plan is rendered in the DOM before calling this
      await exportToPDF();
      console.log('PDF export dialog opened');
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleExportPDF}>Export to PDF</button>
    </div>
  );
}

// Example: Export to Markdown from a React component
export function ExampleMarkdownExport({ plan }: { plan: GeneratedPlan }) {
  const handleExportMarkdown = () => {
    try {
      // Export with auto-generated filename
      exportToMarkdown(plan);
      console.log('Markdown export completed successfully');
    } catch (error) {
      console.error('Markdown export failed:', error);
    }
  };

  const handleExportCustomMarkdown = () => {
    try {
      // Export with custom filename
      exportToMarkdown(plan, 'my-plan.md');
      console.log('Markdown export with custom name completed');
    } catch (error) {
      console.error('Markdown export failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleExportMarkdown}>Export to Markdown</button>
      <button onClick={handleExportCustomMarkdown}>
        Export to Markdown (Custom Name)
      </button>
    </div>
  );
}

// Example: Complete export controls component
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

      console.log(`${format.toUpperCase()} export completed`);
    } catch (error) {
      console.error(`${format.toUpperCase()} export failed:`, error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleExport('docx')}
        disabled={exporting !== null}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {exporting === 'docx' ? 'Exporting...' : 'Export DOCX'}
      </button>

      <button
        onClick={() => handleExport('pdf')}
        disabled={exporting !== null}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {exporting === 'pdf' ? 'Opening...' : 'Export PDF'}
      </button>

      <button
        onClick={() => handleExport('markdown')}
        disabled={exporting !== null}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {exporting === 'markdown' ? 'Exporting...' : 'Export Markdown'}
      </button>
    </div>
  );
}

// Import React for the examples above
import { useState } from 'react';

// Example: Mock plan data for testing
export const mockPlan: GeneratedPlan = {
  metadata: {
    schema_version: '1.0.0',
    project_type: 'unit_plan',
    generated_at: new Date().toISOString(),
  },
  meta: {
    qualification: 'Certificate IV in Training and Assessment',
    qualification_code: 'TAE40122',
    duration_weeks: 8,
    total_hours: 240,
    delivery_mode: 'blended',
    cohort_profile:
      'Adult learners with industry experience seeking to become qualified trainers. Mixed LLN levels, primarily intermediate to advanced.',
    resources: [
      'Computer lab with 20 workstations',
      'Projector and whiteboard',
      'LMS access (Moodle)',
      'Assessment templates and exemplars',
    ],
    assessment_preferences: [
      'Practical demonstrations',
      'Written assessments',
      'Portfolio development',
    ],
  },
  weekly_plan: [
    {
      week: 1,
      topics: ['Introduction to TAE', 'Principles of training'],
      activities: [
        'Icebreaker activities (2 hours, face-to-face)',
        'Review TAE framework (4 hours, face-to-face)',
      ],
      hours: 30,
      assessments: [],
    },
    {
      week: 2,
      topics: ['Planning training sessions', 'Session plan development'],
      activities: [
        'Develop session plans (6 hours, online)',
        'Peer review activities (4 hours, face-to-face)',
      ],
      hours: 30,
      assessments: [
        {
          id: 'ASS001',
          title: 'Session Plan Submission',
          type: 'project',
          units: ['TAEDES401'],
          dueWeek: 2,
        },
      ],
    },
  ],
  units: [
    {
      code: 'TAEDES401',
      title: 'Design and develop learning programs',
      hours: 50,
      deliveryMethod: 'blended',
      assessmentMethods: ['Project', 'Portfolio'],
      weekRange: [1, 4],
    },
    {
      code: 'TAEDES402',
      title: 'Use training packages and accredited courses',
      hours: 40,
      deliveryMethod: 'blended',
      assessmentMethods: ['Written assessment', 'Practical demonstration'],
      weekRange: [2, 5],
    },
  ],
  risks: [
    {
      category: 'risk',
      description: 'LLN levels may vary significantly across cohort',
      mitigation: 'Conduct pre-assessment and provide additional support',
      impact: 'medium',
    },
  ],
  assumptions: [
    {
      category: 'assumption',
      description: 'All learners have access to reliable internet',
      mitigation: 'Confirm with pre-course survey',
    },
  ],
  confidence: 0.85,
};
