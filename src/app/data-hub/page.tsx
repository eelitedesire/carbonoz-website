import { pageMeta } from '@/content/meta'
import { COPY } from '@/content/company'
import { PageHero } from '@/components/sections/PageHero'
import { DataHub } from '@/components/sections/DataHub'
import { ProductStack } from '@/components/sections/ProductStack'
import { Ecosystem } from '@/components/sections/Hardware'
import { Architecture } from '@/components/sections/Architecture'
import { Monitoring } from '@/components/sections/Monitoring'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/data-hub/', 'CARBONOZ Data Hub', 'CARBONOZ Data Hub empowers renewable operators, investors and financial institutions with data-driven project insights: verified real-time data from hybrid inverters and battery storage, predictive maintenance, anti-fraud monitoring and API access.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Platform', href: '/platform/' }, { label: 'Data Hub' }]} title='CARBONOZ Data Hub.' lede={COPY.dataHub} status='verified' />
      <DataHub index='01' full />
      <ProductStack index='02' />
      <Ecosystem index='03' />
      <Architecture index='04' />
      <Monitoring index='05' />
      <Cta />
    </>
  )
}
