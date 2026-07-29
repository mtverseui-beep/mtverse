import productData from '../../data/mtadmin-product.json'
import type { PackageId } from '@/lib/packages'

export type MtadminEditionStatus = 'available' | 'coming-soon'

export type MtadminEdition = {
  id: string
  name: string
  status: MtadminEditionStatus
  packageId?: PackageId
  priceUsd?: number
  downloadFilename?: string
  framework: string
  language: string
  styling: string
}

export type MtadminProduct = Omit<typeof productData, 'editions'> & {
  editions: MtadminEdition[]
}

export const MTADMIN_PRODUCT = productData as MtadminProduct

export function getMtadminProduct() {
  return MTADMIN_PRODUCT
}

export function getAvailableMtadminEditions() {
  return MTADMIN_PRODUCT.editions.filter(
    (edition): edition is MtadminEdition & { packageId: PackageId; priceUsd: number; downloadFilename: string } =>
      edition.status === 'available' &&
      Boolean(edition.packageId && edition.priceUsd && edition.downloadFilename)
  )
}

export function getMtadminEdition(editionId: string) {
  return MTADMIN_PRODUCT.editions.find((edition) => edition.id === editionId) || null
}
