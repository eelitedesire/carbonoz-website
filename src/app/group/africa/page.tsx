import { pageMeta } from '@/content/meta'
import { RegionPage } from '@/components/sections/RegionPage'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/group/africa/', 'Africa · Solaire Mauritius', 'Solaire Mauritius (buyAfraction Limited, Grand Baie): affordable hybrid solar systems with CATL lithium storage, EV charging and Solar Assistant monitoring — Solaire 1 and Solaire 2 solar kits.')

export default function Page() {
  return (
    <>
      <RegionPage id='africa' />
      <Cta />
    </>
  )
}
