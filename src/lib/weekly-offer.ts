export type WeeklyOfferSettings = {
  masterEnabled: boolean
  weekdayEnabled: boolean
  weekendEnabled: boolean
  popupEnabled: boolean
  individualTemplatesEnabled: boolean
  mtadminEditionsEnabled: boolean
  uiLibraryEnabled: boolean
  allPaidBundleEnabled: boolean
  individualTemplatePriceUsd: number
  uiLibraryPriceUsd: number
  allPaidBundlePriceUsd: number
  weekdayLabel: string
  weekendLabel: string
  popupDescription: string
  popupButtonLabel: string
}

export type WeeklyOfferPhase = 'weekday' | 'weekend'

export type WeeklyOfferRuntime = {
  active: boolean
  phase: WeeklyOfferPhase
  label: string
  endAt: string
  endLabel: string
  timeZone: 'Asia/Kolkata'
}

export const DEFAULT_WEEKLY_OFFER_SETTINGS: WeeklyOfferSettings = {
  masterEnabled: true,
  weekdayEnabled: true,
  weekendEnabled: true,
  popupEnabled: true,
  individualTemplatesEnabled: true,
  mtadminEditionsEnabled: true,
  uiLibraryEnabled: true,
  allPaidBundleEnabled: true,
  individualTemplatePriceUsd: 5,
  uiLibraryPriceUsd: 5,
  allPaidBundlePriceUsd: 50,
  weekdayLabel: 'This Week Offer',
  weekendLabel: 'Weekend Offer',
  popupDescription: 'Pick any individual paid template for one flat offer price. Special pricing is also available for the UI Library and all-template bundle.',
  popupButtonLabel: 'Explore offers',
}

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000

function cleanBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function cleanPrice(value: unknown, fallback: number, allowed: readonly number[]) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && allowed.includes(parsed) ? parsed : fallback
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
  const text = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
  return text ? text.slice(0, maxLength) : fallback
}

export function normalizeWeeklyOfferSettings(input: Partial<WeeklyOfferSettings> | null | undefined): WeeklyOfferSettings {
  return {
    masterEnabled: cleanBoolean(input?.masterEnabled, DEFAULT_WEEKLY_OFFER_SETTINGS.masterEnabled),
    weekdayEnabled: cleanBoolean(input?.weekdayEnabled, DEFAULT_WEEKLY_OFFER_SETTINGS.weekdayEnabled),
    weekendEnabled: cleanBoolean(input?.weekendEnabled, DEFAULT_WEEKLY_OFFER_SETTINGS.weekendEnabled),
    popupEnabled: cleanBoolean(input?.popupEnabled, DEFAULT_WEEKLY_OFFER_SETTINGS.popupEnabled),
    individualTemplatesEnabled: cleanBoolean(input?.individualTemplatesEnabled, DEFAULT_WEEKLY_OFFER_SETTINGS.individualTemplatesEnabled),
    mtadminEditionsEnabled: cleanBoolean(input?.mtadminEditionsEnabled, DEFAULT_WEEKLY_OFFER_SETTINGS.mtadminEditionsEnabled),
    uiLibraryEnabled: cleanBoolean(input?.uiLibraryEnabled, DEFAULT_WEEKLY_OFFER_SETTINGS.uiLibraryEnabled),
    allPaidBundleEnabled: cleanBoolean(input?.allPaidBundleEnabled, DEFAULT_WEEKLY_OFFER_SETTINGS.allPaidBundleEnabled),
    individualTemplatePriceUsd: cleanPrice(input?.individualTemplatePriceUsd, 5, [5]),
    uiLibraryPriceUsd: cleanPrice(input?.uiLibraryPriceUsd, 5, [5]),
    allPaidBundlePriceUsd: cleanPrice(input?.allPaidBundlePriceUsd, 50, [50]),
    weekdayLabel: cleanText(input?.weekdayLabel, DEFAULT_WEEKLY_OFFER_SETTINGS.weekdayLabel, 48),
    weekendLabel: cleanText(input?.weekendLabel, DEFAULT_WEEKLY_OFFER_SETTINGS.weekendLabel, 48),
    popupDescription: cleanText(input?.popupDescription, DEFAULT_WEEKLY_OFFER_SETTINGS.popupDescription, 240),
    popupButtonLabel: cleanText(input?.popupButtonLabel, DEFAULT_WEEKLY_OFFER_SETTINGS.popupButtonLabel, 48),
  }
}

export function getWeeklyOfferRuntime(
  settingsInput: Partial<WeeklyOfferSettings> | null | undefined,
  now: number | Date = Date.now(),
): WeeklyOfferRuntime {
  const settings = normalizeWeeklyOfferSettings(settingsInput)
  const timestamp = now instanceof Date ? now.getTime() : now
  const istDate = new Date(timestamp + IST_OFFSET_MS)
  const day = istDate.getUTCDay()
  const phase: WeeklyOfferPhase = day === 0 || day === 6 ? 'weekend' : 'weekday'
  const daysUntilBoundary = phase === 'weekday' ? 6 - day : day === 6 ? 2 : 1
  const boundaryUtc = Date.UTC(
    istDate.getUTCFullYear(),
    istDate.getUTCMonth(),
    istDate.getUTCDate() + daysUntilBoundary,
  ) - IST_OFFSET_MS
  const phaseEnabled = phase === 'weekday' ? settings.weekdayEnabled : settings.weekendEnabled

  return {
    active: settings.masterEnabled && phaseEnabled,
    phase,
    label: phase === 'weekday' ? settings.weekdayLabel : settings.weekendLabel,
    endAt: new Date(boundaryUtc).toISOString(),
    endLabel: phase === 'weekday' ? 'Friday, 11:59 PM IST' : 'Sunday, 11:59 PM IST',
    timeZone: 'Asia/Kolkata',
  }
}

export function isWeeklyOfferActive(settings: Partial<WeeklyOfferSettings> | null | undefined, now: number | Date = Date.now()) {
  return getWeeklyOfferRuntime(settings, now).active
}

export function getWeeklyOfferRemainingMs(runtime: WeeklyOfferRuntime, now: number | Date = Date.now()) {
  const timestamp = now instanceof Date ? now.getTime() : now
  return Math.max(0, new Date(runtime.endAt).getTime() - timestamp)
}
