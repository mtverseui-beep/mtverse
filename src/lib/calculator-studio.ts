export const CALCULATOR_STUDIO_SLUGS = [
  'age-calculator',
  'bmi-calculator',
  'emi-calculator',
  'currency-converter',
  'unit-converter',
  'percentage-calculator',
  'compound-interest-calculator',
  'gst-calculator',
  'tip-calculator',
  'date-difference-calculator',
  'timezone-converter',
  'calorie-calculator',
  'discount-calculator',
  'aspect-ratio-calculator',
  'gpa-calculator',
  'loan-calculator',
  'online-stopwatch',
] as const

export type CalculatorStudioSlug = (typeof CALCULATOR_STUDIO_SLUGS)[number]

