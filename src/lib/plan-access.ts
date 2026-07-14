export type PlanLevel = 'free' | 'pro' | 'business' | 'extended'

export type AccessLevel = 'free' | 'advanced' | 'extended'

export interface PlanFeatures {
  seats: number
  projects: number | 'unlimited'
  uiElements: 'free' | 'advanced' | 'extended'
  advancedUIAccess: 'preview' | 'full'
  extendedSourceAccess: boolean
  copySource: 'free' | 'advanced' | 'all'
  downloadSource: 'none' | 'advanced' | 'all'
  figmaSource: boolean
  lifetimeUpdates: boolean
  commercialUse: boolean
  saasEndProduct: boolean
  supportDuration: string
  adminFeatures: boolean
}

export const PLAN_FEATURES: Record<PlanLevel, PlanFeatures> = {
  free: {
    seats: 1,
    projects: 3,
    uiElements: 'free',
    advancedUIAccess: 'preview',
    extendedSourceAccess: false,
    copySource: 'free',
    downloadSource: 'none',
    figmaSource: false,
    lifetimeUpdates: true,
    commercialUse: false,
    saasEndProduct: false,
    supportDuration: 'Community',
    adminFeatures: false,
  },
  pro: {
    seats: 1,
    projects: 'unlimited',
    uiElements: 'advanced',
    advancedUIAccess: 'full',
    extendedSourceAccess: false,
    copySource: 'advanced',
    downloadSource: 'advanced',
    figmaSource: false,
    lifetimeUpdates: true,
    commercialUse: false,
    saasEndProduct: false,
    supportDuration: '6 months',
    adminFeatures: false,
  },
  business: {
    seats: 5,
    projects: 'unlimited',
    uiElements: 'advanced',
    advancedUIAccess: 'full',
    extendedSourceAccess: false,
    copySource: 'advanced',
    downloadSource: 'advanced',
    figmaSource: true,
    lifetimeUpdates: true,
    commercialUse: true,
    saasEndProduct: false,
    supportDuration: '12 months',
    adminFeatures: true,
  },
  extended: {
    seats: 999,
    projects: 'unlimited',
    uiElements: 'extended',
    advancedUIAccess: 'full',
    extendedSourceAccess: true,
    copySource: 'all',
    downloadSource: 'all',
    figmaSource: true,
    lifetimeUpdates: true,
    commercialUse: true,
    saasEndProduct: true,
    supportDuration: '24 months',
    adminFeatures: true,
  },
}

/**
 * Plan tier hierarchy for comparison
 */
const PLAN_HIERARCHY: Record<PlanLevel, number> = {
  free: 0,
  pro: 1,
  business: 2,
  extended: 3,
}

/**
 * Map access levels to minimum plan required
 */
const ACCESS_LEVEL_MIN_PLAN: Record<AccessLevel, PlanLevel> = {
  free: 'free',
  advanced: 'pro',
  extended: 'extended',
}

/**
 * Check if a plan can access source code at a given access level
 */
export function canAccessSource(plan: PlanLevel, accessLevel: AccessLevel): boolean {
  const requiredPlan = ACCESS_LEVEL_MIN_PLAN[accessLevel]
  return PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[requiredPlan]
}

/**
 * Check if a plan can copy source code at a given access level
 */
export function canCopySource(plan: PlanLevel, accessLevel: AccessLevel): boolean {
  const features = PLAN_FEATURES[plan]
  const copyLevel = features.copySource

  if (copyLevel === 'all') return true
  if (copyLevel === 'advanced' && (accessLevel === 'free' || accessLevel === 'advanced')) return true
  if (copyLevel === 'free' && accessLevel === 'free') return true

  return false
}

/**
 * Check if a plan can download source code at a given access level
 */
export function canDownloadSource(plan: PlanLevel, accessLevel: AccessLevel): boolean {
  const features = PLAN_FEATURES[plan]
  const downloadLevel = features.downloadSource

  if (downloadLevel === 'all') return true
  if (downloadLevel === 'advanced' && (accessLevel === 'free' || accessLevel === 'advanced')) return true

  return false
}

/**
 * Get the lock state for a source component based on plan and access level
 */
export function getSourceLockState(
  plan: PlanLevel,
  accessLevel: AccessLevel
): 'unlocked' | 'locked-pro' | 'locked-business' | 'locked-extended' {
  if (canAccessSource(plan, accessLevel)) {
    return 'unlocked'
  }

  // Return the minimum plan needed to unlock
  switch (accessLevel) {
    case 'advanced':
      return 'locked-pro'
    case 'extended':
      return 'locked-extended'
    case 'free':
    default:
      return 'unlocked'
  }
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: PlanLevel): string {
  const names: Record<PlanLevel, string> = {
    free: 'Free',
    pro: 'Pro',
    business: 'Business',
    extended: 'Extended',
  }
  return names[plan]
}

/**
 * Get plan price
 */
export function getPlanPrice(plan: PlanLevel): string {
  const prices: Record<PlanLevel, string> = {
    free: '$0',
    pro: '$12',
    business: '$29',
    extended: '$49',
  }
  return prices[plan]
}
