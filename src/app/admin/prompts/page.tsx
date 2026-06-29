import type { Metadata } from 'next'
import AdminPromptsReal from '@/components/admin/admin-prompts-real'
import { getPromptLibraryData } from '@/lib/prompt-db'

export const metadata: Metadata = {
  title: 'Prompts - Admin',
  description: 'Manage prompt library entries, SEO content, and preview images.',
}

export const dynamic = 'force-dynamic'

export default async function AdminPromptsPage() {
  const library = await getPromptLibraryData()

  return (
    <AdminPromptsReal
      prompts={library.adminPrompts}
      categories={library.categories}
      models={library.models}
    />
  )
}
