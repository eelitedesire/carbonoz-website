'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useSim } from '@/sim/hooks'
import { sim, SimEvent } from '@/sim/store'
import { clock } from '@/sim/telemetry'
import { dayName } from '@/sim/format'
import { cn, StatusBadge, Tabs, Tone } from '@/components/homeos/ui'

const TONE: Record<SimEvent['level'], Tone> = { info: 'neutral', warning: 'warning', critical: 'critical', success: 'good' }
const LEVEL: Record<SimEvent['level'], string> = { info: 'info', warning: 'warning', critical: 'critical', success: 'ok' }
const SOURCE: Record<SimEvent['source'], string> = { system: 'System', autopilot: 'SolarAutopilot', bms: 'BMS', inverter: 'Inverter', operator: 'Operator', grid: 'Grid' }

type Filter = 'all' | 'alarms' | 'autopilot'

/** The site's event stream, newest first (app Events table style). */
export function EventList({ limit = 20, filters = true, className }: { limit?: number; filters?: boolean; className?: string }) {
  const [filter, setFilter] = useState<Filter>('all')
  const events = useSim(
    () => sim.events.filter((e) => filter === 'all' || (filter === 'alarms' ? e.level === 'warning' || e.level === 'critical' : e.source === 'autopilot' || e.source === 'operator')).slice(0, limit),
    (a, b) => a.length === b.length && a[0]?.id === b[0]?.id,
  )
  return (
    <div className={cn('homeos', className)}>
      {filters && (
        <div className='px-4 pb-2'>
          <Tabs label='Event filter' value={filter} onChange={setFilter} items={[{ id: 'all', label: 'All events' }, { id: 'alarms', label: 'Alarms' }, { id: 'autopilot', label: 'SolarAutopilot' }]} />
        </div>
      )}
      <ol className='divide-y divide-line border-t border-line' aria-label='Events' aria-live='polite' aria-relevant='additions'>
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.li key={e.id} layout initial={{ opacity: 0, backgroundColor: 'rgba(222,175,11,0.08)' }} animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }} transition={{ duration: 0.9 }} className='flex items-start gap-3 px-4 py-2.5'>
              <StatusBadge tone={e.source === 'autopilot' ? 'info' : TONE[e.level]} dot className='mt-0.5 w-[74px] justify-center'>
                {e.source === 'autopilot' ? 'plan' : LEVEL[e.level]}
              </StatusBadge>
              <div className='min-w-0 flex-1'>
                <p className='text-[13px] leading-snug text-fg'>{e.message}</p>
                <p className='mt-0.5 text-[11px] text-muted'>
                  <span className='tabular'>{e.code}</span> · {SOURCE[e.source]}
                </p>
              </div>
              <time className='tabular shrink-0 text-[11.5px] text-muted'>
                {dayName(Math.floor(e.t / 1440))} {clock(e.t)}
              </time>
            </motion.li>
          ))}
        </AnimatePresence>
        {!events.length && <li className='px-4 py-6 text-center text-[12.5px] text-muted'>No events for this filter.</li>}
      </ol>
    </div>
  )
}
