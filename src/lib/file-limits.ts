/** Per-category file size limits (bytes) */
export const FILE_SIZE_LIMITS: Record<string, number> = {
  video: 100 * 1024 * 1024,   // 100 MB
  audio: 50 * 1024 * 1024,    // 50 MB
  image: 20 * 1024 * 1024,    // 20 MB
  pdf: 25 * 1024 * 1024,      // 25 MB
  file: 100 * 1024 * 1024,    // 100 MB (zip, csv, json, etc.)
  default: 25 * 1024 * 1024,  // 25 MB fallback
}

export function getMaxFileSize(categorySlug: string): number {
  return FILE_SIZE_LIMITS[categorySlug] || FILE_SIZE_LIMITS.default
}

export function formatLimit(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`
}
