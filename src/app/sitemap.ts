import type { MetadataRoute } from 'next'
import { COMPANY } from '@/content/site'
import { ROUTES } from '@/content/meta'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({ url: `${COMPANY.url}${r}`, changeFrequency: 'monthly', priority: r === '/' ? 1 : r.split('/').length > 3 ? 0.6 : 0.8 }))
}
