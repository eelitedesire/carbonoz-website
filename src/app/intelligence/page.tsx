import { pageMeta } from '@/content/meta'
import { PageHero } from '@/components/sections/PageHero'
import { Intelligence } from '@/components/sections/Intelligence'
import { Forecast } from '@/components/sections/Forecast'
import { FlowStory } from '@/components/sections/FlowStory'
import { Control } from '@/components/sections/Control'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/intelligence/', 'Energy intelligence', 'Energy intelligence with CARBONOZ: solar and consumption forecasting, battery planning, anomaly detection and system health — shown on a simulated demo site.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Energy Intelligence' }]} title='From measurements to decisions.' lede='Forecasts, measured history and the battery’s own limits, combined into plans you can read and anomalies you can act on. Demonstrated on a simulated site.' status='concept' />
      <Intelligence index='01' />
      <Forecast index='02' />
      <FlowStory />
      <Control index='04' />
      <Cta />
    </>
  )
}
