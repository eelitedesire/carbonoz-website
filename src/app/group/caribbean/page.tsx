import { pageMeta } from '@/content/meta'
import { RegionPage } from '@/components/sections/RegionPage'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/group/caribbean/', 'Caribbean · CAYTECH', 'CAYTECH Cayman Islands (Caytech Limited, Cayman Brac): on- and off-grid solar hybrid systems with battery storage — SUN LIZZARD and SUN IGUANA solar kits.')

export default function Page() {
  return (
    <>
      <RegionPage id='caribbean' />
      <Cta />
    </>
  )
}
