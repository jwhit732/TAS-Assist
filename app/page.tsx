'use client';

import { useState, useEffect } from 'react';
import { IntakeForm } from '@/components/intake-form';
import { ResultsView } from '@/components/results-view';
import { IntakeFormData, GeneratedPlan } from '@/types/unit-plan';
import { savePlan, getCurrentPlan, clearLastIntake } from '@/lib/storage';
import { exportToDOCX, exportToPDF, exportToMarkdown } from '@/lib/export-handlers';

type AppState = 'intake' | 'generating' | 'results' | 'error';

export default function HomePage() {
  const [state, setState] = useState<AppState>('intake');
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationLogs, setGenerationLogs] = useState<any[]>([]);

  // Check for existing plan on mount
  useEffect(() => {
    const existing = getCurrentPlan();
    if (existing && existing.plan) {
      setGeneratedPlan(existing.plan);
      setState('results');
    }
  }, []);

  const handleSubmit = async (data: IntakeFormData) => {
    setState('generating');
    setError(null);
    setGenerationLogs([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Generation failed');
      }

      if (result.success && result.plan) {
        // Save to localStorage
        savePlan(result.plan, data);

        // Update state
        setGeneratedPlan(result.plan);
        setGenerationLogs(result.metadata?.logs || []);
        setState('results');

        // Clear the saved intake form data
        clearLastIntake();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setState('error');
    }
  };

  const handleExport = (format: 'docx' | 'pdf' | 'markdown') => {
    if (!generatedPlan) return;

    try {
      switch (format) {
        case 'docx':
          exportToDOCX(generatedPlan);
          break;
        case 'pdf':
          exportToPDF();
          break;
        case 'markdown':
          exportToMarkdown(generatedPlan);
          break;
      }
    } catch (err) {
      console.error('Export error:', err);
      alert(`Failed to export as ${format.toUpperCase()}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to start over? This will clear the current plan.')) {
      setGeneratedPlan(null);
      setError(null);
      setGenerationLogs([]);
      setState('intake');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                TAS Assistant
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                AI-powered unit plan builder for Australian RTOs
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Stage 0 MVP</div>
              <div className="text-xs text-slate-400">No auth • Local storage</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intake State */}
        {state === 'intake' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <IntakeForm onSubmit={handleSubmit} isLoading={false} />
            </div>
          </div>
        )}

        {/* Generating State */}
        {state === 'generating' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Generating Your Unit Plan
                </h2>
                <p className="mt-2 text-slate-600">
                  This typically takes 1-3 minutes. Claude is analyzing your requirements
                  and creating a comprehensive, audit-ready plan.
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  Using APRV loop: Analyze → Plan → Reflect → Verify
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {state === 'results' && generatedPlan && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <ResultsView
                plan={generatedPlan as any}
                onExport={handleExport}
                onReset={handleReset}
              />
            </div>

            {/* Generation Logs (Developer Info) */}
            {generationLogs.length > 0 && (
              <details className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-700">
                  Generation Logs ({generationLogs.length} phases)
                </summary>
                <div className="mt-4 space-y-2">
                  {generationLogs.map((log, idx) => (
                    <div key={idx} className="text-xs font-mono bg-white p-3 rounded border border-slate-200">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-900">{log.phase}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          log.status === 'success' ? 'bg-green-100 text-green-800' :
                          log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      {log.duration && (
                        <div className="text-slate-500 mt-1">Duration: {log.duration}ms</div>
                      )}
                      {log.details && (
                        <div className="text-slate-600 mt-1">{log.details}</div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Generation Failed
                </h2>
                <p className="mt-2 text-slate-600">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-600">
            <p>
              TAS Assistant - Stage 0 MVP • Powered by Claude AI
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Generated plans should be reviewed and customized before use in compliance with ASQA standards
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
