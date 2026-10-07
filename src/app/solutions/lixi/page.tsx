import { pageMeta } from '@/content/meta'
import { PageHero } from '@/components/sections/PageHero'
import { Lixi } from '@/components/sections/Lixi'
import { SolarBMS } from '@/components/sections/SolarBMS'
import { Storage } from '@/components/sections/Storage'
import { Cta } from '@/components/sections/Cta'
import { Photo } from '@/components/ui/Photo'

export const metadata = pageMeta('/solutions/lixi/', 'LIXI battery solutions', 'LIXI low- and high-voltage LFP battery storage: the 48 V stackable LIXI with JK BMS and CATL cells, the 20.48 kWh 192 V rack and the 112.5 kWh LIXI Pro Rack with electricity-trading option.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Solutions', href: '/solutions/' }, { label: 'LIXI batteries' }]} title='LIXI solar & electricity storage.' lede='Lithium iron phosphate batteries for homes, businesses and micro-grids — 48 V, 200 V and 400 V — now also available with an electricity-trading option over the CARBONOZ platform.' status='verified'>
        <div className='mt-14 grid gap-3 sm:grid-cols-3'>
          <Photo id='lixi-48v-stack' aspect='1 / 1' fit='contain' className='bg-white' caption='LIXI Stack · 48 V' priority sizes='(min-width: 640px) 33vw, 100vw' />
          <Photo id='lixi-hv-192v-rack' aspect='1 / 1' fit='contain' className='bg-white' caption='LIXI HV Rack · 192 V' sizes='(min-width: 640px) 33vw, 100vw' />
          <Photo id='lixi-pro-rack' aspect='1 / 1' fit='contain' className='bg-white' caption='LIXI Pro Rack · 112.5 kWh' sizes='(min-width: 640px) 33vw, 100vw' />
        </div>
      </PageHero>
      <Lixi index='01' />
      <SolarBMS index='02' />
      <Storage index='03' />
      <Cta />
    </>
  )
}
