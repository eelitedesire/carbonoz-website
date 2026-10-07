import type { MetadataRoute } from 'next'
import { COMPANY } from '@/content/site'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${COMPANY.url}/sitemap.xml`, host: COMPANY.url }
}
