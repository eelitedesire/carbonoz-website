'use client'

import { useReducedMotion } from '@/components/ui/useReducedMotion'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cx, SectionHeader, StatusTag } from '@/components/ui/primitives'
import { Status } from '@/content/site'

interface Layer {
  id: string
  name: string
  short: string
  status: Status
  points: string[]
  code?: string
}

/** Every "platform" statement below is taken from login.carbonoz.com/docs. */
export const LAYERS: Layer[] = [
  {
    id: 'physical',
    name: 'Physical energy system',
    short: 'Solar, storage, loads, grid connection',
    status: 'verified',
    points: ['Solar arrays, battery banks, site loads and the grid connection.', 'The source of every number CARBONOZ shows.'],
  },
  {
    id: 'devices',
    name: 'Inverters · BMS · sensors',
    short: 'Power, voltages, cells, alarms',
    status: 'verified',
    points: ['Inverters report power, frequency, status and yield.', 'Each BMS reports pack values, temperatures, alarms and individual cell voltages — 16, 24 or 32 cells.', 'Alarms can be strings, objects or flags; CARBONOZ records when they appear and when they clear.'],
  },
  {
    id: 'edge',
    name: 'Edge gateway',
    short: 'SolarBMS on a Raspberry Pi',
    status: 'verified',
    points: ['Sends one message every 10–60 seconds over HTTPS.', 'Uses its own machine credential: a CARBONOZ API key or a Keycloak client in the machine realm.', 'Buffers during outages and sends up to 100 messages per request afterwards; retries reuse the same messageId.'],
    code: `POST /api/v1/ingest/solarbms
Authorization: Bearer czk.<id>.<secret>

{ "schemaVersion": "1",
  "messageId": "4f7c7c1e-…",
  "systemId": "sbms-…",
  "measurements": { "pvPower": 4200, "loadPower": 1300,
                    "gridPower": -800, "batteryPower": 2100, "soc": 67 },
  "batteries": [{ "bms": { "cells": [{ "id": 1, "voltage": 3.311 }, …] } }] }`,
  },
  {
    id: 'ingest',
    name: 'CARBONOZ ingestion',
    short: 'Authenticated, idempotent, open',
    status: 'verified',
    points: ['202 queued — or 202 duplicate when a messageId was already received.', 'The original message is kept exactly as sent; unknown fields are accepted and stored.', '401 for a bad credential, 409 for a foreign systemId, 413 above 100 kB, 503 to back off and retry.'],
    code: `202 Accepted
{ "data": [{ "messageId": "4f7c7c1e-…", "status": "queued" }] }`,
  },
  {
    id: 'realtime',
    name: 'Realtime data',
    short: 'Stream → worker → store',
    status: 'verified',
    points: ['Messages enter a Redis stream; a worker in a consumer group normalises them.', 'Raw and normalised data are stored in MongoDB; a live snapshot is kept in Redis.', 'Nothing is silently dropped: a message that fails after retries is kept for inspection and can be re-run.'],
  },
  {
    id: 'intel',
    name: 'Data Hub & intelligence',
    short: 'History, analytics, prediction',
    status: 'verified',
    points: ['Platform today: energy history integrated from power — hourly, daily, monthly, yearly — in the site’s time zone; min / max / spread per BMS; forecast points accepted from the system.', 'CARBONOZ Data Hub: verified real-time project data, tested automation algorithms, predictive analyses, anti-fraud and predictive maintenance monitoring, API access (carbonoz.com).', 'The forecast-aware planning on this site is a simulation of the idea.'],
  },
  {
    id: 'autopilot',
    name: 'SolarAutopilot',
    short: 'Inverter automation and alerts',
    status: 'verified',
    points: ['Inverter automation and energy performance monitoring for homeowners and commercial operators, with customised alerts sent to any device (solarautopilot.com).', 'Home Assistant / Solar Assistant integrations and many supported hybrid inverter models and batteries.', 'The battery strategy controls in this site’s demo are a simulation.'],
  },
  {
    id: 'dashboard',
    name: 'Customer dashboard',
    short: 'Sites, installations, live and history',
    status: 'verified',
    points: ['Customers sign in with Keycloak and see every site they belong to; a site can hold several installations.', 'Live values, batteries, cells, inverters, history, forecast and events — in English, French, Spanish and German.', 'An installation is online when it reported within five minutes.'],
  },
]

export function Architecture({ index = '03' }: { index?: string }) {
  const [sel, setSel] = useState('edge')
  const reduced = useReducedMotion()
  const layer = LAYERS.find((l) => l.id === sel)!

  return (
    <section id='architecture' aria-labelledby='arch-title' className='on-paper relative py-[var(--section-y)]'>
      <div aria-hidden className='grid-bg-paper pointer-events-none absolute inset-0' />
      <div className='container-x relative'>
        <SectionHeader
          index={index}
          kicker='Technology architecture'
          id='arch-title'
          title={<>From electrons to intelligence, layer by layer.</>}
          lede='How a reading travels from a battery cell to a customer’s screen. Select a layer for the engineering detail — the protocol, the guarantees, what is built and what is still a concept.'
        />

        <div className='mt-14 grid gap-6 lg:grid-cols-12'>
          <ol className='relative lg:col-span-5' aria-label='Architecture layers'>
            <span aria-hidden className='absolute bottom-6 left-[23px] top-6 w-px bg-paper-line' />
            {!reduced &&
              [0, 1, 2].map((k) => (
                <motion.span
                  key={k}
                  aria-hidden
                  className='absolute left-[20px] h-[7px] w-[7px] rounded-full bg-brand'
                  initial={{ top: '3%' }}
                  animate={{ top: ['3%', '95%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: k * 2 }}
                />
              ))}
            {LAYERS.map((l, i) => (
              <li key={l.id} className='relative'>
                <button
                  type='button'
                  onClick={() => setSel(l.id)}
                  aria-pressed={sel === l.id}
                  className={cx('group flex w-full items-center gap-4 rounded-[8px] py-3 pl-1 pr-3 text-left transition-colors', sel === l.id ? 'bg-paper-ink text-paper' : 'hover:bg-paper-2')}
                >
                  <span className={cx('relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border text-[11px] num', sel === l.id ? 'border-brand bg-brand text-on-brand' : 'border-paper-line bg-paper text-paper-muted')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className='min-w-0'>
                    <span className='block text-[15px] font-medium tracking-[-0.01em]'>{l.name}</span>
                    <span className={cx('block truncate text-[12.5px]', sel === l.id ? 'text-paper/60' : 'text-paper-muted')}>{l.short}</span>
                  </span>
                  {l.status === 'concept' && <span className={cx('label ml-auto shrink-0 text-[9px]', sel === l.id ? 'text-ai' : 'text-paper-muted')}>Concept</span>}
                </button>
              </li>
            ))}
          </ol>

          <div className='lg:col-span-7'>
            <div className='sticky top-24 rounded-[12px] bg-paper-ink p-6 text-fg [--color-fg:#eceff4] [--color-fg-2:#b6becb] [--color-muted:#7c8696] [--color-line:rgb(255_255_255/0.075)] sm:p-8' style={{ colorScheme: 'dark' }}>
              <AnimatePresence mode='wait'>
                <motion.div key={layer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <p className='label text-[10px] text-brand'>Layer {String(LAYERS.indexOf(layer) + 1).padStart(2, '0')}</p>
                    <StatusTag status={layer.status} />
                  </div>
                  <h3 className='mt-4 text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium tracking-[-0.03em] text-[#eceff4]'>{layer.name}</h3>
                  <ul className='mt-5 grid gap-3'>
                    {layer.points.map((p) => (
                      <li key={p} className='flex gap-3 text-[15px] leading-relaxed text-[#b6becb]'>
                        <span aria-hidden className='mt-[10px] h-px w-3 shrink-0 bg-brand' />
                        {p}
                      </li>
                    ))}
                  </ul>
                  {layer.code && (
                    <pre className='num mt-6 overflow-x-auto rounded-[8px] border border-white/10 bg-black/40 p-4 text-[12px] leading-relaxed text-[#b6becb]'>
                      <code>{layer.code}</code>
                    </pre>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
