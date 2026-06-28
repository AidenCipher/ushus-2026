export const FEATURES = {
  REAL_TIME_NOTIFICATIONS: true,
  EMAIL_NOTIFICATIONS: true,
  PDF_CONFIRMATION: true,
  GANTT_DRAG_DROP: true,
  CALENDAR_VIEW: true,
  TASK_APPROVAL_WORKFLOW: true,
  AUDIT_LOGS: true,
  ANALYTICS_DASHBOARD: false, // Future feature — scaffold route but hide in UI
  MULTI_LANG_SUPPORT: false, // Future feature
  MOBILE_APP_API: false, // Future feature
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag];
}
