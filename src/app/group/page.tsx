import { pageMeta } from '@/content/meta'
import { COPY } from '@/content/company'
import { PageHero } from '@/components/sections/PageHero'
import { GroupRegions, GroupStructure, SolarKits } from '@/components/sections/Group'
import { Cta } from '@/components/sections/Cta'
import { GroupMarquee } from '@/components/sections/GroupMarquee'

export const metadata = pageMeta('/group/', 'CARBONOZ Group', 'CARBONOZ — Renewable Energy Group for Europe, Africa and the Caribbean: Helios Academy GmbH (HELIOS ENERGY), buyAfraction Limited (Solaire Mauritius) and Caytech Limited (CAYTECH Cayman Islands).')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'CARBONOZ Group' }]} title={COPY.tagline + '.'} lede='Three regional businesses — HELIOS ENERGY, Solaire Mauritius and CAYTECH — and one technology group behind them.' status='verified' />
      <GroupMarquee />
      <GroupRegions index='01' />
      <GroupStructure index='02' />
      <SolarKits index='03' />
      <Cta />
    </>
  )
}
