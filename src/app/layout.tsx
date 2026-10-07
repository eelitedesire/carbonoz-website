import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import { COMPANY, SEO } from '@/content/site'
import { COPY, LINKS } from '@/content/company'
import { GROUP } from '@/content/group'
import { Nav } from '@/components/site/Nav'
import { Footer } from '@/components/site/Footer'
import { SimClock } from '@/components/site/SimClock'
import { THEME_SCRIPT } from '@/components/ui/theme'
import { Lightbox } from '@/components/ui/Lightbox'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })
// The CARBONOZ app's typeface, used by every product surface (.homeos).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter-face', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.url),
  title: { default: SEO.title, template: '%s — CARBONOZ' },
  description: SEO.description,
  applicationName: 'CARBONOZ',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'CARBONOZ',
    title: SEO.title,
    description: SEO.description,
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'CARBONOZ — live energy flow between solar, battery, home and grid' }],
  },
  twitter: { card: 'summary_large_image', title: SEO.title, description: SEO.description, images: ['/og.png'] },
  icons: {
    icon: [
      { url: '/brand/carbonoz-icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/carbonoz-icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/brand/carbonoz-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/brand/carbonoz-icon-180.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#f5f6f8',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CARBONOZ',
  description: COPY.tagline,
  url: COMPANY.url,
  logo: `${COMPANY.url}/brand/carbonoz-logo.jpg`,
  sameAs: [LINKS.linkedin],
  subOrganization: GROUP.map((e) => ({
    '@type': 'Organization',
    name: e.legalName,
    brand: e.brand,
    url: e.website,
    address: { '@type': 'PostalAddress', streetAddress: e.address.slice(0, -1).join(', '), addressCountry: e.address[e.address.length - 1] },
    ...(e.contact?.email ? { email: e.contact.email } : {}),
    ...(e.contact?.phone ? { telephone: e.contact.phone } : {}),
  })),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme is set before paint by THEME_SCRIPT, so the server markup can't know it.
    <html lang='en' data-theme='light' suppressHydrationWarning className={`${geist.variable} ${mono.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SimClock />
        <Nav />
        <main id='main'>{children}</main>
        <Footer />
        <Lightbox />
      </body>
    </html>
  )
}
