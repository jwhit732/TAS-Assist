import { exportToDOCX, exportToPDF, exportToMarkdown } from './lib/export-handlers';
import type { GeneratedPlan } from './types/unit-plan';

// This file tests that imports resolve correctly
const test = async (plan: GeneratedPlan) => {
  await exportToDOCX(plan);
  await exportToPDF();
  exportToMarkdown(plan);
};
