import { pageMeta } from '@/content/meta'
import { VERIFIED } from '@/content/site'
import { PageHero } from '@/components/sections/PageHero'
import { Architecture } from '@/components/sections/Architecture'
import { IngestionContract } from '@/components/sections/IngestionContract'
import { Ecosystem } from '@/components/sections/Hardware'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/technology/', 'Technology', 'CARBONOZ technology architecture: SolarBMS edge gateway, authenticated idempotent HTTPS ingestion, Redis stream and worker, raw and normalised storage, live snapshot, energy history and the customer dashboard.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Technology' }]} title='Engineered for data that has to arrive.' lede='Per-installation machine credentials, idempotent messages, nothing silently dropped. How CARBONOZ moves a reading from a battery cell to a dashboard.' status='verified'>
        <ul className='mt-14 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3'>
          {VERIFIED.ingestion.map((f) => (
            <li key={f} className='bg-ink-950 p-5 text-[14px] leading-relaxed text-fg-2'>
              {f}
            </li>
          ))}
        </ul>
      </PageHero>
      <Architecture index='01' />
      <IngestionContract />
      <Ecosystem index='03' />
      <Cta />
    </>
  )
}
