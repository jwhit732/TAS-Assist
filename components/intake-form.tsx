'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IntakeFormData } from '@/types/unit-plan';
import { useState } from 'react';
import { Loader2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Zod validation schema for intake form
 * Matches IntakeFormData interface with strict validation rules
 */
const intakeSchema = z.object({
  qualification: z
    .string()
    .min(5, { message: 'Qualification name must be at least 5 characters' })
    .max(200, { message: 'Qualification name is too long' })
    .trim(),

  qualificationCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z]{3}[0-9]{5}$/i.test(val),
      { message: 'Code must match format: ABC12345 (3 letters + 5 digits)' }
    ),

  deliveryMode: z.enum(['face_to_face', 'online', 'blended'], {
    message: 'Please select a delivery mode',
  }),

  durationWeeks: z
    .number({ message: 'Duration must be a number' })
    .int({ message: 'Duration must be a whole number' })
    .min(1, { message: 'Duration must be at least 1 week' })
    .max(208, { message: 'Duration cannot exceed 4 years (208 weeks)' }),

  totalHours: z
    .number({ message: 'Total hours must be a number' })
    .int({ message: 'Total hours must be a whole number' })
    .min(10, { message: 'Total hours must be at least 10' })
    .max(2000, { message: 'Total hours cannot exceed 2000' }),

  cohortProfile: z
    .string()
    .min(20, { message: 'Please provide at least 20 characters describing your cohort' })
    .max(2000, { message: 'Cohort profile is too long' })
    .trim(),

  resources: z.array(z.string()).optional(),

  assessmentPreferences: z.array(z.string()).optional(),

  unitList: z.string().optional(),
});

interface IntakeFormProps {
  onSubmit: (data: IntakeFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Main intake form component for collecting unit plan requirements
 * Implements comprehensive validation and user-friendly UX
 */
export function IntakeForm({ onSubmit, isLoading = false }: IntakeFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hoursPerWeek, setHoursPerWeek] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      deliveryMode: 'face_to_face',
      resources: [],
      assessmentPreferences: [],
    },
  });

  // Watch fields for auto-calculation
  const durationWeeks = watch('durationWeeks');
  const totalHours = watch('totalHours');

  // Auto-calculate hours per week
  useState(() => {
    if (durationWeeks && totalHours && durationWeeks > 0) {
      const calculated = totalHours / durationWeeks;
      setHoursPerWeek(Math.round(calculated * 10) / 10);
    } else {
      setHoursPerWeek(null);
    }
  });

  // Update calculation when values change
  const updateHoursPerWeek = () => {
    if (durationWeeks && totalHours && durationWeeks > 0) {
      const calculated = totalHours / durationWeeks;
      setHoursPerWeek(Math.round(calculated * 10) / 10);
    } else {
      setHoursPerWeek(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md"
    >
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Unit Plan Builder
        </h1>
        <p className="mt-2 text-gray-600">
          Provide details about your training program to generate a comprehensive unit plan
        </p>
      </div>

      {/* Qualification Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          Qualification Details
          <Tooltip text="Basic information about the qualification being delivered" />
        </h2>

        {/* Qualification Name */}
        <div>
          <label
            htmlFor="qualification"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Qualification Name <span className="text-red-500">*</span>
          </label>
          <input
            id="qualification"
            type="text"
            {...register('qualification')}
            placeholder="e.g., Certificate IV in Training and Assessment"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {errors.qualification && (
            <p className="mt-1 text-sm text-red-600">{errors.qualification.message}</p>
          )}
        </div>

        {/* Qualification Code */}
        <div>
          <label
            htmlFor="qualificationCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Qualification Code (Optional)
          </label>
          <input
            id="qualificationCode"
            type="text"
            {...register('qualificationCode')}
            placeholder="e.g., TAE40122"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: 3 letters followed by 5 digits (e.g., TAE40122)
          </p>
          {errors.qualificationCode && (
            <p className="mt-1 text-sm text-red-600">{errors.qualificationCode.message}</p>
          )}
        </div>
      </div>

      {/* Delivery Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Delivery Details</h2>

        {/* Delivery Mode */}
        <div>
          <label
            htmlFor="deliveryMode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Delivery Mode <span className="text-red-500">*</span>
          </label>
          <select
            id="deliveryMode"
            {...register('deliveryMode')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="face_to_face">Face-to-Face</option>
            <option value="online">Online</option>
            <option value="blended">Blended (Mixed Mode)</option>
          </select>
          {errors.deliveryMode && (
            <p className="mt-1 text-sm text-red-600">{errors.deliveryMode.message}</p>
          )}
        </div>

        {/* Duration and Hours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration in Weeks */}
          <div>
            <label
              htmlFor="durationWeeks"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (Weeks) <span className="text-red-500">*</span>
            </label>
            <input
              id="durationWeeks"
              type="number"
              {...register('durationWeeks', {
                valueAsNumber: true,
                onChange: updateHoursPerWeek,
              })}
              placeholder="e.g., 12"
              min="1"
              max="208"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            {errors.durationWeeks && (
              <p className="mt-1 text-sm text-red-600">{errors.durationWeeks.message}</p>
            )}
          </div>

          {/* Total Hours */}
          <div>
            <label
              htmlFor="totalHours"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Total Hours <span className="text-red-500">*</span>
            </label>
            <input
              id="totalHours"
              type="number"
              {...register('totalHours', {
                valueAsNumber: true,
                onChange: updateHoursPerWeek,
              })}
              placeholder="e.g., 120"
              min="10"
              max="2000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            {errors.totalHours && (
              <p className="mt-1 text-sm text-red-600">{errors.totalHours.message}</p>
            )}
          </div>
        </div>

        {/* Hours per Week Calculation */}
        {hoursPerWeek !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Calculated:</strong> Approximately {hoursPerWeek} hours per week
            </p>
          </div>
        )}
      </div>

      {/* Cohort Profile */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          Cohort Profile
          <Tooltip text="Describe your learners' background, skills, and learning needs" />
        </h2>

        <div>
          <label
            htmlFor="cohortProfile"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Learner Profile <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cohortProfile"
            {...register('cohortProfile')}
            rows={5}
            placeholder="Describe your target cohort, including:&#10;- Prior experience and qualifications&#10;- Language, Literacy, and Numeracy (LLN) levels (e.g., ACSF Level 3)&#10;- Employment context&#10;- Any specific learning needs or considerations&#10;&#10;Example: 'Current trainers with 2+ years experience, ACSF Level 3-4 LLN, working in private RTOs. Most have industry qualifications but limited formal teaching training.'"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {errors.cohortProfile && (
            <p className="mt-1 text-sm text-red-600">{errors.cohortProfile.message}</p>
          )}
        </div>
      </div>

      {/* Advanced Options (Collapsible) */}
      <div className="space-y-6 border-t pt-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          Advanced Options (Optional)
        </button>

        {showAdvanced && (
          <div className="space-y-6 pl-6 border-l-2 border-gray-200">
            {/* Resources/Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Resources & Facilities
              </label>
              <div className="space-y-2">
                {[
                  { value: 'classroom', label: 'Classroom/Training Room' },
                  { value: 'computers', label: 'Computer Lab' },
                  { value: 'workshop', label: 'Workshop/Practical Space' },
                  { value: 'online_platform', label: 'Online Learning Platform (LMS)' },
                  { value: 'library', label: 'Library/Resource Centre' },
                  { value: 'other', label: 'Other Specialized Equipment' },
                ].map((resource) => (
                  <label key={resource.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={resource.value}
                      {...register('resources')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">{resource.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assessment Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Assessment Methods
              </label>
              <div className="space-y-2">
                {[
                  { value: 'written_tests', label: 'Written Tests/Exams' },
                  { value: 'practical_demos', label: 'Practical Demonstrations' },
                  { value: 'projects', label: 'Projects/Case Studies' },
                  { value: 'portfolios', label: 'Portfolio Assessment' },
                  { value: 'workplace_obs', label: 'Workplace Observation' },
                  { value: 'presentations', label: 'Presentations/Role Plays' },
                  { value: 'online_quizzes', label: 'Online Quizzes' },
                ].map((assessment) => (
                  <label key={assessment.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={assessment.value}
                      {...register('assessmentPreferences')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">{assessment.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Unit List */}
            <div>
              <label
                htmlFor="unitList"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Unit List (Optional)
              </label>
              <textarea
                id="unitList"
                {...register('unitList')}
                rows={6}
                placeholder="Paste your unit codes and titles here, one per line:&#10;&#10;TAEDES401 Design and develop learning programs&#10;TAEDES402 Use training packages and accredited courses&#10;TAELLN411 Address adult language, literacy and numeracy skills&#10;TAEASS401 Plan assessment activities and processes"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                If provided, the AI will use these specific units. Otherwise, it will suggest appropriate units.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="border-t pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating Unit Plan...
            </>
          ) : (
            'Generate Unit Plan'
          )}
        </button>

        {isLoading && (
          <p className="mt-3 text-sm text-gray-600">
            This may take up to 3 minutes. Please wait...
          </p>
        )}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-700">
        <p>
          <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required.
          The generated plan will be based on Australian RTO standards and best practices.
        </p>
      </div>
    </form>
  );
}

/**
 * Tooltip component for help text
 */
function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block">
      <HelpCircle size={16} className="text-gray-400 hover:text-gray-600 cursor-help" />
      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 text-xs text-white bg-gray-900 rounded-md shadow-lg -left-24">
        {text}
      </div>
    </div>
  );
}
