import { pageMeta } from '@/content/meta'
import { DemoView } from '@/components/sections/DemoView'

export const metadata = pageMeta('/demo/', 'Live demo', 'The CARBONOZ product interface running on a simulated solar and storage site: energy flow, SolarBMS cells, inverters, history, forecast, events and SolarAutopilot controls.')

export default function Page() {
  return <DemoView />
}
