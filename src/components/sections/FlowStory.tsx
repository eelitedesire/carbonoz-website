'use client'

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import { storyDay } from '@/sim/story'
import { clock } from '@/sim/telemetry'
import { FlowBreakdown, FlowDiagram } from '@/components/homeos/EnergyFlow'
import { useReducedMotion } from '@/components/ui/useReducedMotion'
import { cx } from '@/components/ui/primitives'

const START = 4 * 60
const END = 23 * 60 + 59

/**
 * A day of the demo site, scrubbed by scrolling: sunrise, charging, full
 * battery, evening peak, reserve, and the plan for tomorrow. The visitor
 * drives the timeline; nothing plays on its own.
 */
export function FlowStory({ index = '02' }: { index?: string }) {
  const story = useMemo(() => storyDay(), [])
  const ref = useRef<HTMLElement>(null)
  const [minute, setMinute] = useState(START)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (p) => setMinute(Math.round(START + Math.min(1, Math.max(0, p)) * (END - START))))

  const s = story.states[minute]
  const chapterIdx = Math.max(0, story.chapters.findLastIndex((c) => c.at <= minute))
  const chapter = story.chapters[chapterIdx]

  const goTo = (m: number) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + ((m - START) / (END - START)) * span + 2, behavior: 'smooth' })
  }

  return (
    <section ref={ref} aria-labelledby='story-title' className='relative h-[560vh] border-t border-line md:h-[640vh]'>
      <div className='sticky top-0 flex h-[100svh] flex-col overflow-hidden pt-16'>
        <div aria-hidden className='grid-bg fade-edges pointer-events-none absolute inset-0 opacity-50' />
        <div className='container-x relative grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 py-4 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:py-8'>
          <div className='order-2 lg:order-1 lg:col-span-4'>
            <p className='label hidden items-center gap-3 text-muted lg:flex'>
              <span className='text-brand'>{index}</span>
              <span className='h-px w-8 bg-line-strong' aria-hidden />
              <span id='story-title'>One day, in real time</span>
            </p>
            <div className='lg:mt-10' aria-live='polite'>
              <AnimatePresence mode='wait'>
                <motion.div key={chapter.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                  <p className='num text-[13px] text-brand'>
                    {String(chapterIdx + 1).padStart(2, '0')} / {String(story.chapters.length).padStart(2, '0')} · {clock(chapter.at)}
                  </p>
                  <h3 className='mt-3 text-[clamp(1.7rem,3.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.04em]'>{chapter.title}</h3>
                  <p className='mt-4 max-w-[42ch] text-[15px] leading-relaxed text-fg-2 lg:text-[16px]'>{chapter.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <ol className='mt-8 hidden gap-1 lg:grid' aria-label='Chapters'>
              {story.chapters.map((c, i) => (
                <li key={c.id}>
                  <button type='button' onClick={() => goTo(c.at + 1)} className={cx('flex w-full items-center gap-3 py-1 text-left text-[13px] transition-colors', i === chapterIdx ? 'text-fg' : 'text-subtle hover:text-fg-2')}>
                    <span className={cx('h-px transition-all duration-500', i === chapterIdx ? 'w-8 bg-brand' : 'w-4 bg-line-strong')} aria-hidden />
                    <span className='num w-11'>{clock(c.at)}</span>
                    {c.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className='order-1 min-h-0 lg:order-2 lg:col-span-8'>
            <div className='relative mx-auto w-full max-w-[min(760px,66svh)] lg:max-w-[min(760px,84svh)]'>
              <StoryCard s={s} minute={minute} />
            </div>
          </div>
        </div>
        <DayStrip states={story.states} minute={minute} chapters={story.chapters} onPick={goTo} />
      </div>
    </section>
  )
}

/** The app's Energy Flow card at full size, scrubbed through the story day. */
function StoryCard({ s, minute }: { s: { pv: number; load: number; battery: number; grid: number; soc: number }; minute: number }) {
  const reduced = useReducedMotion()
  return (
    <div className='homeos @container rounded-xl border border-line bg-panel p-4 shadow-[var(--shadow-card)] sm:p-5'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-[15px] font-semibold tracking-[-0.01em] text-fg'>Energy Flow</p>
          <p className='text-[12px] text-muted'>Demo site · simulated day</p>
        </div>
        <p className='tabular text-[clamp(26px,3.6vw,40px)] font-semibold leading-none tracking-[-0.03em] text-fg'>{clock(minute)}</p>
      </div>
      <FlowDiagram s={s} animate={!reduced} className='mt-2' />
      <FlowBreakdown s={s} title='Live flows' className='mx-auto mt-1 hidden w-full max-w-[460px] @md:flex' />
    </div>
  )
}

function DayStrip({ states, minute, chapters, onPick }: { states: { pv: number; load: number; soc: number }[]; minute: number; chapters: { id: string; at: number; title: string }[]; onPick: (m: number) => void }) {
  const W = 1000
  const H = 64
  const x = (m: number) => ((m - START) / (END - START)) * W
  const max = 7
  const path = useMemo(() => {
    let pv = ''
    let load = ''
    let soc = ''
    for (let m = START; m <= END; m += 5) {
      const st = states[m]
      const cmd = m === START ? 'M' : 'L'
      pv += `${cmd}${x(m).toFixed(1)},${(H - (st.pv / max) * H).toFixed(1)}`
      load += `${cmd}${x(m).toFixed(1)},${(H - (st.load / max) * H).toFixed(1)}`
      soc += `${cmd}${x(m).toFixed(1)},${(H - (st.soc / 100) * H).toFixed(1)}`
    }
    return { pv: `${pv}L${W},${H}L0,${H}Z`, load, soc }
  }, [states])

  return (
    <div className='container-x relative pb-5'>
      <div className='relative'>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='none' className='h-12 w-full text-fg sm:h-16' role='img' aria-label='The simulated day: solar generation, demand and battery state of charge from 04:00 to midnight'>
          <path d={path.pv} fill='var(--color-solar)' fillOpacity='0.16' />
          <path d={path.load} fill='none' stroke='var(--color-load)' strokeWidth='1.2' vectorEffect='non-scaling-stroke' strokeOpacity='0.8' />
          <path d={path.soc} fill='none' stroke='var(--color-batt)' strokeWidth='1.2' vectorEffect='non-scaling-stroke' strokeDasharray='3 3' />
          <rect x={0} y={0} width={x(minute)} height={H} fill='var(--color-ink-950)' fillOpacity='0' />
          <line x1={x(minute)} x2={x(minute)} y1={0} y2={H} stroke='var(--color-brand)' strokeWidth='1.5' vectorEffect='non-scaling-stroke' />
        </svg>
        {chapters.map((c) => (
          <button
            key={c.id}
            type='button'
            onClick={() => onPick(c.at + 1)}
            aria-label={`Go to ${c.title}, ${clock(c.at)}`}
            className='absolute top-0 h-full w-4 -translate-x-1/2'
            style={{ left: `${(x(c.at) / W) * 100}%` }}
          >
            <span className={cx('absolute left-1/2 top-0 h-full w-px -translate-x-1/2', c.at <= minute ? 'bg-fg/30' : 'bg-fg/12')} />
          </button>
        ))}
      </div>
      <div className='mt-2 flex items-center justify-between text-[10.5px] text-subtle'>
        <span className='num'>04:00</span>
        <span className='flex items-center gap-4'>
          <span className='flex items-center gap-1.5'><i className='h-2 w-2 rounded-sm bg-solar/40' />Solar</span>
          <span className='flex items-center gap-1.5'><i className='h-px w-3 bg-load' />Demand</span>
          <span className='flex items-center gap-1.5'><i className='h-px w-3 border-t border-dashed border-batt' />Battery SOC</span>
        </span>
        <span className='num'>24:00</span>
      </div>
    </div>
  )
}
