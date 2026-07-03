import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getPlan } from '@/lib/plan-store'
import { getPublishedPrompts } from '@/lib/prompt-db'
import { getSavedPromptRecords } from '@/lib/prompt-social-store'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { getFreeDownloadStatus, getSavedTemplateSlugs, hasTemplatePurchase } from '@/lib/template-social-store'

export const dynamic = 'force-dynamic'

function canDownloadTemplate(record: Awaited<ReturnType<typeof getPlan>>) {
  if (!record) return false
  return record.plan === 'pro' || record.plan === 'business' || record.plan === 'extended'
}

export async function GET(request: NextRequest) {
  const email = await getCurrentCustomerEmail(request)

  if (!email) {
    return NextResponse.json({ authenticated: false, templates: [], prompts: [] }, { status: 401 })
  }

  const [templates, prompts, planRecord, savedSlugs, freeStatus, savedPromptRecords] = await Promise.all([
    getAllTemplatesFromStore(),
    getPublishedPrompts(),
    getPlan(email),
    getSavedTemplateSlugs(email),
    getFreeDownloadStatus(email),
    getSavedPromptRecords(email),
  ])
  const purchasedFlags = await Promise.all(templates.map((template) => hasTemplatePurchase(template.slug, email)))

  const paidTemplateAccess = canDownloadTemplate(planRecord)
  const savedSet = new Set(savedSlugs)
  const freeDownloadedSet = new Set(freeStatus.slugs)
  const promptMap = new Map(prompts.map((prompt) => [prompt.slug, prompt]))

  return NextResponse.json({
    authenticated: true,
    prompts: savedPromptRecords
      .map((record) => {
        const prompt = promptMap.get(record.slug)
        if (!prompt) return null
        return {
          slug: prompt.slug,
          title: prompt.title,
          summary: prompt.summary,
          previewImage: prompt.previewImage,
          previewAlt: prompt.previewAlt,
          categoryTitle: prompt.categoryTitle,
          subcategory: prompt.subcategory,
          savedAt: record.savedAt,
        }
      })
      .filter(Boolean),
    templates: templates.map((template, index) => {
      const purchased = !template.isFree && purchasedFlags[index]
      const freeDownloaded = template.isFree && freeDownloadedSet.has(template.slug)
      const canDownloadFreeTemplate = template.isFree && (
        paidTemplateAccess ||
        freeStatus.unlocked ||
        freeDownloaded ||
        !freeStatus.limitReached
      )

      return {
        slug: template.slug,
        title: template.title,
        summary: template.summary,
        screenshotUrl: template.screenshotUrl,
        price: template.price,
        purchased,
        saved: savedSet.has(template.slug),
        freeDownloaded,
        canDownload: (paidTemplateAccess && purchased) || canDownloadFreeTemplate,
      }
    }),
  })
}