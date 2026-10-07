'use client'

import { useEffect, useState } from 'react'
import { Live } from '@/components/ui/Live'
import { Badge, Dot, SectionHeader, SimTag } from '@/components/ui/primitives'
import { EventList } from '@/components/app/EventList'
import { useSim } from '@/sim/hooks'
import { minuteOf, SITE } from '@/sim/model'

const STATUS = [
  { tone: 'ok' as const, k: 'Online', v: 'Reported within the last 5 minutes' },
  { tone: 'warn' as const, k: 'Offline', v: 'No report for more than 5 minutes' },
  { tone: 'idle' as const, k: 'No data yet', v: 'Provisioned, never reported' },
  { tone: 'danger' as const, k: 'Deactivated', v: 'Switched off; its credential is rejected' },
]

/** Metrics the demo installation reports: system totals, inverter, pack and per-cell values. */
const METRICS = 5 + SITE.inverters * 7 + SITE.packs * (8 + SITE.cellsPerPack + 4)

function useSecondsSinceReading(every = 15) {
  const [s, setS] = useState(3)
  useEffect(() => {
    const id = setInterval(() => setS((x) => (x + 1) % every), 1000)
    return () => clearInterval(id)
  }, [every])
  return s
}

export function Monitoring({ index = '11' }: { index?: string }) {
  const ago = useSecondsSinceReading()
  const m = useSim((x, d) => ({ minutes: Math.floor(minuteOf(x.core.t)), alarms: d().alarms.filter((a) => a.severity !== 'info').length }), (a, b) => a.minutes === b.minutes && a.alarms === b.alarms)
  const accepted = m.minutes * 4

  return (
    <section id='monitoring' aria-labelledby='mon-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='Monitoring'
          id='mon-title'
          title={<>Monitor every system. Understand every signal.</>}
          lede='Every reading is accounted for: when it arrived, whether it was new or a retry, and what changed. Alarms open and close on their own; events tell the story of the day.'
        />
        <Live className='homeos mt-14 grid gap-4 lg:grid-cols-12'>
          <div className='grid content-start gap-4 lg:col-span-4'>
            <div className='panel p-5'>
              <div className='flex items-center justify-between'>
                <p className='text-[14px] font-medium text-fg'>Installation status</p>
                <SimTag />
              </div>
              <div className='mt-4 rounded-[8px] border border-line bg-ink-950 p-3.5'>
                <div className='flex items-center justify-between'>
                  <span className='text-[13.5px] text-fg'>sbms-demo-01</span>
                  <Badge tone='ok'>
                    <Dot pulse /> Online
                  </Badge>
                </div>
                <p className='num mt-1 text-[11.5px] text-muted' aria-live='off'>
                  Last reading {ago} s ago · every 15 s
                </p>
              </div>
              <ul className='mt-4 grid gap-2'>
                {STATUS.map((s) => (
                  <li key={s.k} className='flex items-start gap-2.5 text-[12.5px]'>
                    <Dot tone={s.tone} className='mt-1.5' />
                    <span>
                      <span className='text-fg'>{s.k}</span> <span className='text-muted'>— {s.v}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className='mt-3 text-[11.5px] text-subtle'>Status rules as applied by the CARBONOZ platform.</p>
            </div>
            <div className='panel p-5'>
              <p className='text-[14px] font-medium text-fg'>Ingestion today</p>
              <dl className='mt-3 grid grid-cols-2 gap-4'>
                {[
                  ['Accepted', accepted.toLocaleString('en-US')],
                  ['Duplicates', '0'],
                  ['Failed', '0'],
                  ['Metrics tracked', String(METRICS)],
                  ['Active alarms', String(m.alarms)],
                  ['Devices', String(1 + SITE.inverters + SITE.packs * 2)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className='text-[11.5px] text-muted'>{k}</dt>
                    <dd className='num text-[18px] text-fg'>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className='panel overflow-hidden lg:col-span-8'>
            <div className='flex items-center justify-between border-b border-line px-4 py-3'>
              <p className='text-[14px] font-medium text-fg'>Event stream</p>
              <span className='label text-[9.5px] text-muted'>Demo site · live</span>
            </div>
            <div className='max-h-[560px] overflow-y-auto'>
              <EventList limit={30} />
            </div>
          </div>
        </Live>
      </div>
    </section>
  )
}
