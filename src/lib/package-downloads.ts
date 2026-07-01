import 'server-only'

import type { PackageId } from '@/lib/packages'
import { buildR2PackageKey } from '@/lib/cloudflare-r2'

export const PACKAGE_DOWNLOAD_FILENAMES: Record<PackageId, string> = {
  next: 'mtverse-next-package.zip',
  'free-unlock': '',
}

export function getPackageDownloadFilename(packageId: PackageId) {
  return PACKAGE_DOWNLOAD_FILENAMES[packageId]
}

export function getPackageDownloadKey(packageId: PackageId) {
  return buildR2PackageKey(getPackageDownloadFilename(packageId))
}
