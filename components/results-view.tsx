'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileDown,
  FileText,
  Printer,
  RotateCcw,
  Calendar,
  Clock,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  MapPin,
  Award,
  Target,
  Shield
} from 'lucide-react';
import type {
  GeneratedPlan,
  ConfidenceIndicator,
  WeeklyPlanItem,
  UnitDetail,
  Risk,
  Assumption
} from '@/types/schema-types';
import {
  getConfidenceIndicator,
  calculateWeekDateRange,
  getTotalUnits,
  getHoursPerWeek
} from '@/types/schema-types';

// ============================================================================
// Props Interface
// ============================================================================

export interface ResultsViewProps {
  plan: GeneratedPlan;
  onExport: (format: 'docx' | 'pdf' | 'markdown') => void;
  onReset: () => void;
}

// ============================================================================
// Helper Components
// ============================================================================

const ConfidenceScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  const indicator: ConfidenceIndicator = getConfidenceIndicator(score);
  const percentage = Math.round(score * 100);

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-slate-700">AI Confidence</span>
          <span className="text-sm font-semibold">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              indicator.color === 'green'
                ? 'bg-green-500'
                : indicator.color === 'yellow'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <Badge variant={indicator.color === 'green' ? 'success' : indicator.color === 'yellow' ? 'warning' : 'danger'}>
        {indicator.label}
      </Badge>
    </div>
  );
};

const RiskIndicator: React.FC<{ level: string }> = ({ level }) => {
  const colors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
  };

  return (
    <span className={`font-semibold uppercase text-xs ${colors[level as keyof typeof colors] || 'text-slate-600'}`}>
      {level}
    </span>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function ResultsView({ plan, onExport, onReset }: ResultsViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalUnits = getTotalUnits(plan);
  const hoursPerWeek = getHoursPerWeek(plan);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Export Controls - Hidden when printing */}
      <div className="flex justify-between items-center gap-4 no-print sticky top-0 bg-white z-10 py-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Unit Plan Generated</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review and export your generated training plan
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={() => onExport('docx')}>
            <FileDown className="w-4 h-4" />
            DOCX
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('markdown')}>
            <FileText className="w-4 h-4" />
            Markdown
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
            Start Over
          </Button>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="risks">Risks & Assumptions</TabsTrigger>
          {plan.compliance_notes && <TabsTrigger value="compliance">Compliance</TabsTrigger>}
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Qualification Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Qualification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{plan.meta.qualification.title}</h3>
                  {plan.meta.qualification.code && (
                    <p className="text-sm text-slate-500 mt-1">Code: {plan.meta.qualification.code}</p>
                  )}
                </div>
                {plan.meta.qualification.level && (
                  <Badge variant="secondary">{plan.meta.qualification.level}</Badge>
                )}
                {plan.meta.qualification.packaging_rules && (
                  <div className="text-sm text-slate-600 pt-2 border-t border-slate-100">
                    <p className="font-medium mb-1">Packaging Rules:</p>
                    <p>{plan.meta.qualification.packaging_rules}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Duration & Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Duration & Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Duration</p>
                    <p className="text-2xl font-bold">{plan.meta.duration.weeks} weeks</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Hours</p>
                    <p className="text-2xl font-bold">{plan.meta.duration.total_hours}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Hours/Week</p>
                    <p className="text-xl font-semibold">{hoursPerWeek}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Study Mode</p>
                    <p className="text-xl font-semibold capitalize">
                      {plan.meta.duration.study_mode?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <Badge variant="outline" className="capitalize">
                    {plan.meta.delivery_mode.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Units Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Units Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{totalUnits}</span>
                  <span className="text-slate-500">units of competency</span>
                </div>
                {plan.units.some(u => u.unit_type) && (
                  <div className="flex gap-2">
                    {plan.units.filter(u => u.unit_type === 'core').length > 0 && (
                      <Badge variant="secondary">
                        {plan.units.filter(u => u.unit_type === 'core').length} Core
                      </Badge>
                    )}
                    {plan.units.filter(u => u.unit_type === 'elective').length > 0 && (
                      <Badge variant="outline">
                        {plan.units.filter(u => u.unit_type === 'elective').length} Elective
                      </Badge>
                    )}
                  </div>
                )}
                <div className="text-sm text-slate-600">
                  <p className="font-medium">Total Nominal Hours:</p>
                  <p className="text-lg font-semibold">
                    {plan.units.reduce((sum, u) => sum + u.nominal_hours, 0)} hours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Generation Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConfidenceScoreDisplay score={plan.confidence_score} />
                {plan.generation_notes && (
                  <div className="text-sm text-slate-600 pt-3 border-t border-slate-100">
                    <p className="flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{plan.generation_notes}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cohort Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Cohort Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{plan.meta.cohort_profile}</p>
              {plan.meta.class_size && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
                  {plan.meta.class_size.min && (
                    <div className="text-sm">
                      <span className="text-slate-500">Min:</span>{' '}
                      <span className="font-semibold">{plan.meta.class_size.min}</span>
                    </div>
                  )}
                  {plan.meta.class_size.max && (
                    <div className="text-sm">
                      <span className="text-slate-500">Max:</span>{' '}
                      <span className="font-semibold">{plan.meta.class_size.max}</span>
                    </div>
                  )}
                  {plan.meta.class_size.target && (
                    <div className="text-sm">
                      <span className="text-slate-500">Target:</span>{' '}
                      <span className="font-semibold">{plan.meta.class_size.target}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates and Venue */}
          {(plan.meta.start_date || plan.meta.end_date || plan.meta.venue) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule & Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {plan.meta.start_date && (
                    <div>
                      <p className="text-sm text-slate-500">Start Date</p>
                      <p className="font-semibold">
                        {new Date(plan.meta.start_date).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {plan.meta.end_date && (
                    <div>
                      <p className="text-sm text-slate-500">End Date</p>
                      <p className="font-semibold">
                        {new Date(plan.meta.end_date).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {plan.meta.venue && (
                    <div>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Venue
                      </p>
                      <p className="font-semibold">{plan.meta.venue}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* WEEKLY PLAN TAB */}
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Delivery Schedule</CardTitle>
              <CardDescription>
                {plan.meta.duration.weeks} weeks of planned delivery activities and assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.weekly_plan.map((week: WeeklyPlanItem) => (
                <div
                  key={week.week_number}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Week {week.week_number}</h3>
                      <p className="text-sm text-slate-500">
                        {calculateWeekDateRange(plan.meta.start_date, week.week_number)}
                      </p>
                    </div>
                    {week.week_theme && (
                      <Badge variant="secondary" className="max-w-xs">
                        {week.week_theme}
                      </Badge>
                    )}
                  </div>

                  {week.units_covered && week.units_covered.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-slate-500 mb-1">Units Covered:</p>
                      <div className="flex flex-wrap gap-1">
                        {week.units_covered.map((code) => (
                          <Badge key={code} variant="outline" className="text-xs">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  {week.activities && week.activities.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Activities
                      </h4>
                      <div className="space-y-2">
                        {week.activities.map((activity, idx) => (
                          <div key={idx} className="bg-slate-50 rounded p-3 text-sm">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium">{activity.title}</p>
                                {activity.description && (
                                  <p className="text-slate-600 text-xs mt-1">{activity.description}</p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-slate-900">{activity.duration_hours}h</p>
                                <p className="text-xs text-slate-500 capitalize">
                                  {activity.delivery_method.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                            {activity.resources && activity.resources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <p className="text-xs text-slate-500">
                                  Resources: {activity.resources.join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assessments */}
                  {week.assessments && week.assessments.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Assessments
                      </h4>
                      <div className="space-y-2">
                        {week.assessments.map((assessment, idx) => (
                          <div key={idx} className="bg-blue-50 rounded p-3 text-sm border border-blue-100">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-blue-900">{assessment.title}</p>
                                {assessment.description && (
                                  <p className="text-blue-700 text-xs mt-1">{assessment.description}</p>
                                )}
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs bg-white">
                                    {assessment.type}
                                  </Badge>
                                  {assessment.weighting && (
                                    <Badge variant="secondary" className="text-xs">
                                      {assessment.weighting}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {assessment.due_date && (
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-blue-600">Due: {assessment.due_date}</p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-blue-200">
                              <p className="text-xs text-blue-700">
                                Units: {assessment.units_assessed.join(', ')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {week.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                      <Info className="w-3 h-3 inline mr-1" />
                      {week.notes}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* UNITS TAB */}
        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Units of Competency</CardTitle>
              <CardDescription>
                Detailed breakdown of all {totalUnits} units in this qualification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.units.map((unit: UnitDetail) => (
                  <div
                    key={unit.unit_code}
                    className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {unit.unit_code}
                          </Badge>
                          {unit.unit_type && (
                            <Badge
                              variant={unit.unit_type === 'core' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {unit.unit_type}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900">{unit.unit_title}</h3>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-slate-900">{unit.nominal_hours}</p>
                        <p className="text-xs text-slate-500">hours</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 mt-3 pt-3 border-t border-slate-100">
                      {unit.delivery_methods && unit.delivery_methods.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Delivery Methods:</p>
                          <div className="flex flex-wrap gap-1">
                            {unit.delivery_methods.map((method) => (
                              <Badge key={method} variant="secondary" className="text-xs capitalize">
                                {method.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {unit.assessment_methods && unit.assessment_methods.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Assessment Methods:</p>
                          <div className="flex flex-wrap gap-1">
                            {unit.assessment_methods.map((method) => (
                              <Badge key={method} variant="outline" className="text-xs capitalize">
                                {method.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {unit.weeks_scheduled && unit.weeks_scheduled.length > 0 && (
                      <div className="mt-3 text-sm text-slate-600">
                        <span className="font-medium">Scheduled:</span> Weeks{' '}
                        {unit.weeks_scheduled.join(', ')}
                      </div>
                    )}

                    {unit.prerequisites && unit.prerequisites.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-slate-700">Prerequisites:</span>{' '}
                        <span className="text-slate-600">{unit.prerequisites.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RISKS & ASSUMPTIONS TAB */}
        <TabsContent value="risks" className="space-y-4">
          {/* Risks */}
          {plan.risks && plan.risks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Identified Risks
                </CardTitle>
                <CardDescription>
                  Potential risks and mitigation strategies for this delivery plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.risks.map((risk: Risk, idx: number) => (
                    <div
                      key={idx}
                      className="border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{risk.risk_description}</p>
                          {risk.category && (
                            <Badge variant="outline" className="mt-2 text-xs capitalize">
                              {risk.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="space-y-1">
                            <div className="text-xs">
                              <span className="text-slate-500">Likelihood: </span>
                              <RiskIndicator level={risk.likelihood} />
                            </div>
                            <div className="text-xs">
                              <span className="text-slate-500">Impact: </span>
                              <RiskIndicator level={risk.impact} />
                            </div>
                          </div>
                        </div>
                      </div>
                      {risk.mitigation && (
                        <div className="mt-3 pt-3 border-t border-yellow-200">
                          <p className="text-sm">
                            <span className="font-semibold text-slate-700">Mitigation: </span>
                            <span className="text-slate-600">{risk.mitigation}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assumptions */}
          {plan.assumptions && plan.assumptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Planning Assumptions
                </CardTitle>
                <CardDescription>
                  Assumptions made during plan generation that may need validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.assumptions.map((assumption: Assumption, idx: number) => (
                    <div
                      key={idx}
                      className="border-l-4 border-blue-400 bg-blue-50 rounded-r-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-slate-900">{assumption.assumption}</p>
                          <div className="flex gap-2 mt-2">
                            {assumption.category && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {assumption.category.replace('_', ' ')}
                              </Badge>
                            )}
                            {assumption.validation_required && (
                              <Badge variant="warning" className="text-xs">
                                Validation Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* COMPLIANCE TAB */}
        {plan.compliance_notes && (
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  ASQA Compliance Notes
                </CardTitle>
                <CardDescription>
                  Compliance considerations and audit documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.compliance_notes.volume_of_learning && (
                  <div className="border-l-4 border-green-400 bg-green-50 rounded-r-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Volume of Learning</h4>
                    <p className="text-sm text-green-800">{plan.compliance_notes.volume_of_learning}</p>
                  </div>
                )}

                {plan.compliance_notes.training_packaging_compliance && (
                  <div className="border-l-4 border-green-400 bg-green-50 rounded-r-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Training Package Compliance</h4>
                    <p className="text-sm text-green-800">
                      {plan.compliance_notes.training_packaging_compliance}
                    </p>
                  </div>
                )}

                {plan.compliance_notes.assessment_validation && (
                  <div className="border-l-4 border-green-400 bg-green-50 rounded-r-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Assessment Validation</h4>
                    <p className="text-sm text-green-800">
                      {plan.compliance_notes.assessment_validation}
                    </p>
                  </div>
                )}

                {plan.compliance_notes.trainer_assessor_requirements && (
                  <div className="border-l-4 border-green-400 bg-green-50 rounded-r-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">
                      Trainer/Assessor Requirements
                    </h4>
                    <p className="text-sm text-green-800">
                      {plan.compliance_notes.trainer_assessor_requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .page-break {
            page-break-before: always;
          }

          * {
            overflow: visible !important;
          }

          button, .sticky {
            position: relative !important;
          }
        }
      `}</style>
    </div>
  );
}
