import { pageMeta } from '@/content/meta'
import { RegionPage } from '@/components/sections/RegionPage'
import { Repowering } from '@/components/sections/Repowering'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/group/europe/', 'Europe · HELIOS ENERGY', 'HELIOS ENERGY (Helios Academy GmbH, Mönchengladbach, Germany): solar repowering, inverter upgrades, modern monitoring and battery energy storage for energy trading, peak shaving, self-consumption and backup.')

export default function Page() {
  return (
    <>
      <RegionPage id='europe' />
      <Repowering index='01' />
      <Cta />
    </>
  )
}
