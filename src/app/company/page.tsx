import { pageMeta } from '@/content/meta'
import { COPY } from '@/content/company'
import { PageHero } from '@/components/sections/PageHero'
import { About } from '@/components/sections/About'
import { DataIsKey, MakingItReal } from '@/components/sections/CompanyStory'
import { GroupStructure } from '@/components/sections/Group'
import { Cta } from '@/components/sections/Cta'
import { GroupMarquee } from '@/components/sections/GroupMarquee'

export const metadata = pageMeta('/company/', 'About CARBONOZ', 'CARBONOZ is a renewable, solar and battery management group for Europe, Africa and the Caribbean. Data is key: CARBONOZ connects energy infrastructure with data-driven performance insights.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Company' }]} title='CARBONOZ.' lede={COPY.tagline + '. Easy to use renewable and battery energy solutions — and the data to run them well.'} status='verified' />
      <About index='01' full />
      <DataIsKey />
      <MakingItReal index='02' />
      <GroupMarquee />
      <GroupStructure index='03' />
      <Cta />
    </>
  )
}
