import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const iconMap = Icons as unknown as Record<string, LucideIcon>
const iconAliases: Record<string, LucideIcon> = {
  FileInfo: Icons.BadgeInfo,
  FileUser: Icons.FileBadge2,
  VectorPen: Icons.PenTool,
}

export function getLucideIcon(name: string | undefined, fallback: LucideIcon = Icons.Wrench): LucideIcon {
  return (name ? iconMap[name] || iconAliases[name] : undefined) || fallback
}
