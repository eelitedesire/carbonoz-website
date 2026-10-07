'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Activity, AlertTriangle, CheckCircle2, Cpu } from 'lucide-react'
import { useState } from 'react'
import { Live } from '@/components/ui/Live'
import { SectionHeader, SimTag, StatusTag } from '@/components/ui/primitives'
import { BatteryCard, CellTiles } from '@/components/homeos/cards'
import { AppSwitch, Card, CardHeader, cn, StatusBadge, Tabs } from '@/components/homeos/ui'
import { useSim } from '@/sim/hooks'
import { sim } from '@/sim/store'
import { Pack } from '@/sim/telemetry'

const samePacks = (a: Pack[], b: Pack[]) =>
  a.every((p, i) => Math.abs(p.voltage - b[i].voltage) < 0.003 && Math.abs(p.current - b[i].current) < 0.2 && p.state === b[i].state && p.alarms.length === b[i].alarms.length && p.cells.every((c, k) => c.balancing === b[i].cells[k].balancing))

/**
 * SolarBMS: the app's battery card and BMS cell view, live. A weak-cell
 * scenario shows how a drifting cell raises (and clears) an alarm.
 */
export function SolarBMS({ index = '05' }: { index?: string }) {
  const [sel, setSel] = useState('B')
  const [cell, setCell] = useState<number | null>(null)
  const packs = useSim((_, d) => d().packs, samePacks)
  const imbalance = useSim((x) => x.faults.cellImbalance)
  const p = packs.find((x) => x.id === sel) ?? packs[0]
  const alarms = packs.flatMap((x) => x.alarms.map((a) => ({ ...a, pack: x.name })))

  return (
    <section id='solarbms' aria-labelledby='bms-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='SolarBMS'
          id='bms-title'
          title={<>Inside the battery, cell by cell.</>}
          lede='A SolarBMS gateway reads every BMS at the site and sends pack and cell data to CARBONOZ. Minimum, maximum, spread and average are calculated for each BMS; alarms are recorded when they appear and when they clear.'
          aside={<div className='mt-5'><StatusTag status='verified' /></div>}
        />

        <Live className='homeos mt-16 grid gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <Tabs items={packs.map((x) => ({ id: x.id, label: x.name }))} value={sel} onChange={(v) => (setSel(v), setCell(null))} label='Battery' />
            <div className='flex items-center gap-3'>
              <span className='text-[12.5px] text-fg-2'>Simulate a weak cell</span>
              <AppSwitch checked={imbalance} onChange={(v) => (sim.setFaults({ cellImbalance: v }), setSel('B'), setCell(v ? 7 : null))} label='Simulate a weak cell in Battery B' tone='warning' />
              <SimTag />
            </div>
          </div>

          <div className='grid gap-3 lg:grid-cols-12'>
            <BatteryCard p={p} className='lg:col-span-5' />
            <Card className='@container p-4 lg:col-span-7'>
              <CardHeader title={`BMS ${p.id}`} subtitle={`${p.bmsId} · pack ${p.name}`} icon={<Activity size={16} />} action={<StatusBadge tone={p.alarms.length ? 'warning' : 'good'} dot pulse={!p.alarms.length}>{p.alarms.length ? 'Alarm' : p.state}</StatusBadge>} />
              <div className='mt-4 grid grid-cols-2 gap-2.5 @md:grid-cols-4'>
                {[
                  ['Min cell', `Cell ${p.minCell.id} · ${p.minCell.voltage.toFixed(3)}`, 'V'],
                  ['Max cell', `Cell ${p.maxCell.id} · ${p.maxCell.voltage.toFixed(3)}`, 'V'],
                  ['Average', p.avgCell.toFixed(3), 'V'],
                  ['Spread', p.spreadMv.toFixed(0), 'mV'],
                ].map(([k, v, u]) => (
                  <div key={k} className={cn('rounded-lg border bg-panel-2 px-3 py-2', k === 'Spread' && p.spreadMv > 30 ? 'border-gridp/40' : 'border-line')}>
                    <p className='truncate text-[11px] text-muted'>{k}</p>
                    <p className='tabular mt-0.5 truncate text-[15px] font-semibold text-fg'>
                      {v}
                      <span className='ml-1 text-[11.5px] font-normal text-fg-2'>{u}</span>
                    </p>
                  </div>
                ))}
              </div>
              <div className='mt-4'>
                <CellTiles p={p} selected={cell} onSelect={setCell} cols='grid-cols-2 @md:grid-cols-4' />
              </div>
              <div className='mt-4 rounded-lg border border-line'>
                <div className='flex items-center justify-between border-b border-line px-3.5 py-2'>
                  <span className='text-[12.5px] font-medium text-fg-2'>Active alarms</span>
                  <span className='tabular text-[11.5px] text-muted'>{alarms.length}</span>
                </div>
                <ul aria-live='polite'>
                  <AnimatePresence initial={false}>
                    {alarms.length ? (
                      alarms.map((a) => (
                        <motion.li key={`${a.device}${a.code}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='flex items-center gap-3 px-3.5 py-2.5 text-[12.5px]'>
                          <AlertTriangle size={14} className={a.severity === 'critical' ? 'text-danger' : 'text-gridp'} />
                          <span className='text-fg'>{a.message}</span>
                          <span className='tabular ml-auto text-[11px] text-muted'>
                            {a.code} · {a.device}
                          </span>
                        </motion.li>
                      ))
                    ) : (
                      <motion.li key='ok' initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex items-center gap-2 px-3.5 py-2.5 text-[12.5px] text-muted'>
                        <CheckCircle2 size={14} className='text-batt' /> No active alarms on any BMS.
                      </motion.li>
                    )}
                  </AnimatePresence>
                </ul>
              </div>
            </Card>
          </div>

          <Card className='overflow-hidden p-0'>
            <div className='px-4 pt-4'>
              <CardHeader title='Connected BMS units' subtitle='Reported through the SolarBMS gateway' icon={<Cpu size={16} />} />
            </div>
            <div className='scroll-x mt-3'>
              <table className='w-full min-w-[680px] whitespace-nowrap text-[12.5px]'>
                <thead>
                  <tr className='bg-panel-2 text-left text-[11.5px] text-muted'>
                    {['BMS', 'Battery', 'Cells', 'State', 'Min / max cell', 'Spread', 'Max temp', 'Alarms'].map((h) => (
                      <th key={h} scope='col' className='px-4 py-2.5 font-semibold'>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='tabular'>
                  {packs.map((x) => (
                    <tr key={x.id} onClick={() => setSel(x.id)} className={cn('cursor-pointer border-t border-line transition-colors hover:bg-panel-2', sel === x.id && 'bg-panel-2')}>
                      <td className='px-4 py-2.5 font-medium text-fg'>{x.bmsId}</td>
                      <td className='px-4 py-2.5 text-fg-2'>{x.name}</td>
                      <td className='px-4 py-2.5'>{x.cells.length}</td>
                      <td className='px-4 py-2.5'>
                        <StatusBadge tone={x.state === 'Charging' ? 'good' : x.state === 'Discharging' ? 'solar' : 'neutral'} dot={x.state !== 'Idle'}>
                          {x.state}
                        </StatusBadge>
                      </td>
                      <td className='px-4 py-2.5'>
                        {x.minCell.voltage.toFixed(3)} / {x.maxCell.voltage.toFixed(3)} V
                      </td>
                      <td className={cn('px-4 py-2.5', x.spreadMv > 30 && 'text-gridp')}>{x.spreadMv.toFixed(0)} mV</td>
                      <td className='px-4 py-2.5'>{Math.max(...x.temperatures).toFixed(1)} °C</td>
                      <td className={cn('px-4 py-2.5', x.alarms.length > 0 && 'text-gridp')}>{x.alarms.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Live>
      </div>
    </section>
  )
}
