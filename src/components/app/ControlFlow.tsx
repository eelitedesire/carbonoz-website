'use client'

import { EnergyFlowCard } from '@/components/homeos/EnergyFlow'
import { useFlowView } from './tabs'

/** Compact Energy Flow next to the control panel, so every setting's effect is visible. */
export function ControlFlow() {
  const s = useFlowView()
  return (
    <div className='homeos'>
      <EnergyFlowCard s={s} detail='Site response' />
    </div>
  )
}
