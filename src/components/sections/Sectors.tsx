'use client'

import { useMemo, useState } from 'react'
import { SECTORS } from '@/content/site'
import { cx, SectionHeader, SimTag } from '@/components/ui/primitives'
import { scenarioDay, ScenarioId } from '@/sim/scenarios'
import { CAPACITY_KWH, SITE } from '@/sim/model'

const W = 400
const H = 120

function Profile({ id, big }: { id: ScenarioId; big?: boolean }) {
  const d = useMemo(() => scenarioDay(id), [id])
  const max = Math.max(4, ...d.samples.map((s) => Math.max(s.pv, s.load)))
  const x = (i: number) => (i / (d.samples.length - 1)) * W
  const y = (v: number) => H - 4 - (v / max) * (H - 10)
  const ys = (v: number) => H - 4 - (v / 100) * (H - 10)
  const pv = d.samples.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.pv).toFixed(1)}`).join('')
  const load = d.samples.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.load).toFixed(1)}`).join('')
  const soc = d.samples.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${ys(s.soc).toFixed(1)}`).join('')
  const n = d.samples.length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='none' className={cx('w-full text-fg', big ? 'h-40' : 'h-24')} role='img' aria-label={`Simulated day: self-sufficiency ${d.selfSufficiency.toFixed(0)} percent`}>
      {d.outage && <rect x={(d.outage[0] / 1440) * W} width={((d.outage[1] - d.outage[0]) / 1440) * W} y={0} height={H} fill='var(--color-danger)' fillOpacity='0.08' />}
      <path d={`${pv}L${x(n - 1)},${H}L0,${H}Z`} fill='#3fcf5e' fillOpacity='0.16' />
      <path d={pv} fill='none' stroke='#3fcf5e' strokeWidth='1.2' vectorEffect='non-scaling-stroke' />
      <path d={load} fill='none' stroke='#8b5cf6' strokeWidth='1.2' vectorEffect='non-scaling-stroke' />
      <path d={soc} fill='none' stroke='#14b8a6' strokeWidth='1.2' strokeDasharray='3 3' vectorEffect='non-scaling-stroke' />
    </svg>
  )
}

export function Sectors({ index = '14' }: { index?: string }) {
  const [sel, setSel] = useState<ScenarioId>('residential')
  const s = SECTORS.find((x) => x.id === sel)!
  const d = useMemo(() => scenarioDay(sel), [sel])
  return (
    <section id='applications' aria-labelledby='sec-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='Applications'
          id='sec-title'
          title={<>One platform, very different days.</>}
          lede='The same site model under different demand and grid conditions. Each profile below is a simulated day — a way to see the behaviour, not a customer reference.'
        />
        <div className='homeos mt-14 grid gap-4 lg:grid-cols-12'>
          <div className='grid gap-2 lg:col-span-5' role='radiogroup' aria-label='Application'>
            {SECTORS.map((x) => (
              <button
                key={x.id}
                type='button'
                role='radio'
                aria-checked={sel === x.id}
                onClick={() => setSel(x.id)}
                className={cx('grid grid-cols-[1fr_120px] items-center gap-4 rounded-[9px] border p-4 text-left transition-colors', sel === x.id ? 'border-line-strong bg-fg/[0.035]' : 'border-line hover:border-line-strong')}
              >
                <span>
                  <span className='block text-[15px] font-medium text-fg'>{x.name}</span>
                  <span className='mt-0.5 block text-[12.5px] leading-snug text-muted'>{x.line}</span>
                </span>
                <Profile id={x.id} />
              </button>
            ))}
          </div>
          <div className='panel p-6 lg:col-span-7'>
            <div className='flex items-center justify-between'>
              <h3 className='h3 text-fg'>{s.name}</h3>
              <SimTag>Simulated day</SimTag>
            </div>
            <p className='mt-2 max-w-[56ch] text-[14.5px] text-fg-2'>{s.line}</p>
            <div className='mt-6'>
              <Profile id={sel} big />
              <div className='mt-2 flex justify-between text-[10.5px] text-subtle'>
                <span className='num'>00:00</span>
                <span className='flex gap-4'>
                  <span className='text-[#3fcf5e]'>Solar</span>
                  <span className='text-[#8b5cf6]'>Demand</span>
                  <span className='text-[#14b8a6]'>Battery SOC</span>
                  {d.outage && <span className='text-danger'>Grid outage</span>}
                </span>
                <span className='num'>24:00</span>
              </div>
            </div>
            <dl className='mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-[8px] border border-line bg-line'>
              {[
                ['Self-sufficiency', `${d.selfSufficiency.toFixed(0)}%`],
                ['Grid import', sel === 'remote' ? 'No grid' : `${d.imported.toFixed(1)} kWh`],
                ['Unserved demand', `${d.unserved.toFixed(1)} kWh`],
              ].map(([k, v]) => (
                <div key={k} className='bg-ink-900 p-4'>
                  <dt className='text-[11.5px] text-muted'>{k}</dt>
                  <dd className='num mt-1 text-[20px] text-fg'>{v}</dd>
                </div>
              ))}
            </dl>
            <p className='mt-4 text-[11.5px] text-subtle'>Same demo hardware in every scenario ({SITE.pvKwp} kWp · {CAPACITY_KWH.toFixed(1)} kWh); only demand and grid availability change. Which sectors CARBONOZ serves is to be confirmed.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
