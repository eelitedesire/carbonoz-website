import type { Metadata } from 'next'

/** Per-page metadata with canonical URL and matching Open Graph / X card. */
export function pageMeta(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} — CARBONOZ`, description, url: path, type: 'website', siteName: 'CARBONOZ', images: [{ url: '/og.png', width: 1200, height: 630, alt: 'CARBONOZ live energy flow' }] },
    twitter: { card: 'summary_large_image', title: `${title} — CARBONOZ`, description, images: ['/og.png'] },
  }
}

export const ROUTES = ['/', '/platform/', '/platform/solarautopilot/', '/platform/solarbms/', '/data-hub/', '/solutions/', '/solutions/lixi/', '/solutions/repowering/', '/intelligence/', '/hardware/', '/technology/', '/company/', '/group/', '/group/europe/', '/group/africa/', '/group/caribbean/', '/contact/', '/demo/'] as const
