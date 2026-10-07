import { pageMeta } from '@/content/meta'
import { PageHero } from '@/components/sections/PageHero'
import { Repowering } from '@/components/sections/Repowering'
import { Lixi } from '@/components/sections/Lixi'
import { Monitoring } from '@/components/sections/Monitoring'
import { Cta } from '@/components/sections/Cta'
import { Photo } from '@/components/ui/Photo'

export const metadata = pageMeta('/solutions/repowering/', 'Solar repowering & BESS', 'Turn-key repowering of existing PV systems — finance, inverter upgrades, optimised design and modern monitoring — and battery energy storage for energy trading, peak shaving, self-consumption and backup.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Solutions', href: '/solutions/' }, { label: 'Solar repowering' }]} title='Solar repowering and energy storage.' lede='Solar plants lose efficiency and revenue potential over time. CARBONOZ and HELIOS ENERGY bring them back to state-of-the-art — and turn them into flexible energy systems with BESS.' status='verified'>
        <div className='mt-14'>
          <Photo id='carbonoz-pv-plant' aspect='21 / 8' priority caption='Existing PV plant' sizes='100vw' />
        </div>
      </PageHero>
      <Repowering index='01' />
      <Lixi index='02' compact />
      <Monitoring index='03' />
      <Cta />
    </>
  )
}
