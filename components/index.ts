/**
 * Component exports for TAS Assistant
 *
 * Central export point for all components
 */

// Main components
export { ResultsView } from './results-view';
export type { ResultsViewProps } from './results-view';

// UI components
export { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
export { Badge } from './ui/badge';
export type { BadgeProps } from './ui/badge';
export { Button } from './ui/button';
export type { ButtonProps } from './ui/button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';

// Demo component (development only)
export { DemoResultsView } from './demo-results-view';

// Mock data (development only)
export { mockPlans, mockPlanShortCourse, mockPlanBlended } from './mock-data';
