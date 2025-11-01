/**
 * LocalStorage persistence utilities for TAS Assistant
 * Stage 0 MVP: Client-side storage only, no server-side persistence
 */

import { GeneratedPlan, IntakeFormData } from '@/types/unit-plan';

const STORAGE_KEYS = {
  PLANS: 'tas_assistant_plans',
  CURRENT_PLAN: 'tas_assistant_current_plan',
  LAST_INTAKE: 'tas_assistant_last_intake',
  SETTINGS: 'tas_assistant_settings',
} as const;

export interface StoredPlan {
  id: string;
  plan: GeneratedPlan;
  intake: IntakeFormData;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  autoSave: boolean;
  keepHistory: boolean;
  maxHistoryItems: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSave: true,
  keepHistory: true,
  maxHistoryItems: 10,
};

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Generate a unique ID for a plan
 */
function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a generated plan to localStorage
 */
export function savePlan(plan: GeneratedPlan, intake: IntakeFormData): string | null {
  if (!isStorageAvailable()) {
    console.warn('localStorage not available');
    return null;
  }

  try {
    const id = generatePlanId();
    const storedPlan: StoredPlan = {
      id,
      plan,
      intake,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save as current plan
    localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(storedPlan));

    // Add to history if enabled
    const settings = getSettings();
    if (settings.keepHistory) {
      const plans = getAllPlans();
      plans.unshift(storedPlan);

      // Limit history size
      const trimmedPlans = plans.slice(0, settings.maxHistoryItems);
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(trimmedPlans));
    }

    return id;
  } catch (error) {
    console.error('Failed to save plan:', error);
    return null;
  }
}

/**
 * Get the current/last generated plan
 */
export function getCurrentPlan(): StoredPlan | null {
  if (!isStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
    if (!stored) return null;

    return JSON.parse(stored) as StoredPlan;
  } catch (error) {
    console.error('Failed to get current plan:', error);
    return null;
  }
}

/**
 * Get all saved plans from history
 */
export function getAllPlans(): StoredPlan[] {
  if (!isStorageAvailable()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (!stored) return [];

    return JSON.parse(stored) as StoredPlan[];
  } catch (error) {
    console.error('Failed to get plans:', error);
    return [];
  }
}

/**
 * Get a specific plan by ID
 */
export function getPlanById(id: string): StoredPlan | null {
  const plans = getAllPlans();
  return plans.find((p) => p.id === id) || null;
}

/**
 * Delete a plan from history
 */
export function deletePlan(id: string): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const plans = getAllPlans();
    const filtered = plans.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(filtered));

    // Clear current plan if it's the one being deleted
    const current = getCurrentPlan();
    if (current && current.id === id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAN);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete plan:', error);
    return false;
  }
}

/**
 * Clear all saved plans
 */
export function clearAllPlans(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.removeItem(STORAGE_KEYS.PLANS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAN);
    return true;
  } catch (error) {
    console.error('Failed to clear plans:', error);
    return false;
  }
}

/**
 * Save the last intake form data (for form persistence)
 */
export function saveLastIntake(intake: IntakeFormData): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.setItem(STORAGE_KEYS.LAST_INTAKE, JSON.stringify(intake));
    return true;
  } catch (error) {
    console.error('Failed to save last intake:', error);
    return false;
  }
}

/**
 * Get the last intake form data
 */
export function getLastIntake(): IntakeFormData | null {
  if (!isStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_INTAKE);
    if (!stored) return null;

    return JSON.parse(stored) as IntakeFormData;
  } catch (error) {
    console.error('Failed to get last intake:', error);
    return null;
  }
}

/**
 * Clear the last intake data
 */
export function clearLastIntake(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_INTAKE);
    return true;
  } catch (error) {
    console.error('Failed to clear last intake:', error);
    return false;
  }
}

/**
 * Get app settings
 */
export function getSettings(): AppSettings {
  if (!isStorageAvailable()) return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) return DEFAULT_SETTINGS;

    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save app settings
 */
export function saveSettings(settings: Partial<AppSettings>): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo() {
  if (!isStorageAvailable()) {
    return { available: false, used: 0, total: 0, planCount: 0 };
  }

  try {
    const plans = getAllPlans();
    let used = 0;

    // Calculate approximate storage used
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('tas_assistant_')) {
        used += (localStorage.getItem(key) || '').length;
      }
    });

    // localStorage typically has 5-10MB limit
    const total = 5 * 1024 * 1024; // 5MB estimate

    return {
      available: true,
      used,
      total,
      usedKB: Math.round(used / 1024),
      totalMB: Math.round(total / 1024 / 1024),
      planCount: plans.length,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { available: false, used: 0, total: 0, planCount: 0 };
  }
}

/**
 * Export all data as JSON (for backup)
 */
export function exportAllData() {
  return {
    plans: getAllPlans(),
    currentPlan: getCurrentPlan(),
    lastIntake: getLastIntake(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Import data from JSON backup
 */
export function importData(data: ReturnType<typeof exportAllData>): boolean {
  if (!isStorageAvailable()) return false;

  try {
    if (data.plans) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans));
    }
    if (data.currentPlan) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(data.currentPlan));
    }
    if (data.lastIntake) {
      localStorage.setItem(STORAGE_KEYS.LAST_INTAKE, JSON.stringify(data.lastIntake));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
