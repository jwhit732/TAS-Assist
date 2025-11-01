'use client';

/**
 * Demo page for ResultsView component
 *
 * This component demonstrates the ResultsView with mock data.
 * Use this for development and testing.
 *
 * To use: Import this in a page component
 */

import React, { useState } from 'react';
import { ResultsView } from './results-view';
import { mockPlans } from './mock-data';
import type { GeneratedPlan } from '@/types/schema-types';
import { Button } from './ui/button';

export function DemoResultsView() {
  const [selectedPlan, setSelectedPlan] = useState<GeneratedPlan | null>(mockPlans.shortCourse);

  const handleExport = (format: 'docx' | 'pdf' | 'markdown') => {
    console.log(`Export requested: ${format}`);
    alert(`Export as ${format.toUpperCase()} - This is a demo. Implement export handler in production.`);
  };

  const handleReset = () => {
    const confirm = window.confirm('Reset and select a different plan?');
    if (confirm) {
      setSelectedPlan(null);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Results View Demo</h1>
            <p className="text-slate-600">
              Select a mock plan to preview the ResultsView component
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setSelectedPlan(mockPlans.shortCourse)}
            >
              <div className="text-left">
                <div className="font-semibold">Short Course - First Aid</div>
                <div className="text-xs text-slate-500">2 weeks, Face-to-face, 16 hours</div>
              </div>
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setSelectedPlan(mockPlans.blended)}
            >
              <div className="text-left">
                <div className="font-semibold">Certificate IV in Business</div>
                <div className="text-xs text-slate-500">8 weeks, Blended, 120 hours</div>
              </div>
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              This is a demonstration page. In production, plans are generated via the intake form
              and Claude API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <ResultsView plan={selectedPlan} onExport={handleExport} onReset={handleReset} />

      {/* Developer Info - Remove in production */}
      <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-xs no-print">
        <div className="font-semibold mb-1">Developer Mode</div>
        <div>
          Plan: {selectedPlan.meta.qualification.title}
        </div>
        <div>
          Confidence: {Math.round(selectedPlan.confidence_score * 100)}%
        </div>
      </div>
    </div>
  );
}

export default DemoResultsView;
