import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { RealSystem } from '@/components/sections/RealSystem'
import { SystemAlive } from '@/components/sections/SystemAlive'
import { FlowStory } from '@/components/sections/FlowStory'
import { DataIsKey } from '@/components/sections/CompanyStory'
import { Architecture } from '@/components/sections/Architecture'
import { About } from '@/components/sections/About'
import { Cta } from '@/components/sections/Cta'
import { GroupMarquee } from '@/components/sections/GroupMarquee'

// Below the fold: split into their own chunks (still prerendered).
const ProductStack = dynamic(() => import('@/components/sections/ProductStack').then((m) => m.ProductStack))
const DataHub = dynamic(() => import('@/components/sections/DataHub').then((m) => m.DataHub))
const Autopilot = dynamic(() => import('@/components/sections/Autopilot').then((m) => m.Autopilot))
const SolarBMS = dynamic(() => import('@/components/sections/SolarBMS').then((m) => m.SolarBMS))
const Lixi = dynamic(() => import('@/components/sections/Lixi').then((m) => m.Lixi))
const Intelligence = dynamic(() => import('@/components/sections/Intelligence').then((m) => m.Intelligence))
const Forecast = dynamic(() => import('@/components/sections/Forecast').then((m) => m.Forecast))
const Control = dynamic(() => import('@/components/sections/Control').then((m) => m.Control))
const GroupRegions = dynamic(() => import('@/components/sections/Group').then((m) => m.GroupRegions))
const Sectors = dynamic(() => import('@/components/sections/Sectors').then((m) => m.Sectors))

/**
 * Story: energy infrastructure → real hardware → connected infrastructure →
 * Data Hub → software → intelligence → regional businesses → the group.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <RealSystem index='01' />
      <SystemAlive index='02' />
      <FlowStory index='03' />
      <ProductStack index='04' />
      <DataIsKey compact />
      <DataHub index='05' />
      <Architecture index='06' />
      <Autopilot index='07' />
      <SolarBMS index='08' />
      <Lixi index='09' compact />
      <Intelligence index='10' />
      <Forecast index='11' />
      <Control index='12' />
      <GroupMarquee />
      <GroupRegions index='13' />
      <Sectors index='14' />
      <About index='15' />
      <Cta />
    </>
  )
}
