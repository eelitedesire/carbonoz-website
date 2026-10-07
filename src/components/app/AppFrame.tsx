'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Activity, BatteryCharging, Bell, ChartLine, ChevronDown, CloudSun, Cpu, House, ListTree, Menu, Plus, RefreshCw, Server, Sparkles, X, type LucideIcon } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { shallow, useSim } from '@/sim/hooks'
import { minuteOf } from '@/sim/model'
import { BrandMark, cn, ctrl, LiveStatusPill } from '@/components/homeos/ui'
import { ThemeToggle } from '@/components/ui/theme'
import { AutopilotTab, BatteryTab, ChartsTab, EnergyTab, EventsTab, ForecastTab, InvertersTab, OverviewTab, SystemTab } from './tabs'

export type AppTab = 'overview' | 'energy' | 'charts' | 'battery' | 'inverters' | 'forecast' | 'events' | 'autopilot' | 'system'

interface NavItem {
  id: AppTab
  label: string
  short?: string
  icon: LucideIcon
  description: string
  badge?: string
}

const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', icon: House, description: 'Live overview of your SolarBMS system.' },
  { id: 'energy', label: 'Energy', icon: Activity, description: 'Live energy flow and today’s energy.' },
  { id: 'charts', label: 'Charts', icon: ChartLine, description: 'Power, battery, grid and load over time.' },
  { id: 'battery', label: 'Battery & BMS', short: 'Battery', icon: BatteryCharging, description: 'Battery packs, BMS units and every cell.' },
  { id: 'inverters', label: 'Inverters', icon: Cpu, description: 'Inverter output, PV input and status.' },
  { id: 'forecast', label: 'Forecast', icon: CloudSun, description: 'Solar and consumption forecast with the battery plan.' },
  { id: 'events', label: 'Events', icon: ListTree, description: 'Alarms, state changes and decisions.' },
  { id: 'autopilot', label: 'SolarAutopilot', icon: Sparkles, description: 'Battery strategy and control.', badge: 'Concept' },
  { id: 'system', label: 'System', icon: Server, description: 'Your installation and site.' },
]
const BOTTOM: AppTab[] = ['overview', 'energy', 'battery']

function greeting(m: number) {
  const h = m / 60
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

/**
 * The CARBONOZ app (HomeOS design language), embedded and running on the
 * demo simulation: same shell, cards, energy flow and charts as the real
 * dashboard at login.carbonoz.com.
 */
export function AppFrame({ initial = 'overview', className, tall, chrome = true }: { initial?: AppTab; className?: string; tall?: boolean; chrome?: boolean }) {
  const [tab, setTab] = useState<AppTab>(initial)
  const [sheet, setSheet] = useState<'none' | 'quick' | 'more'>('none')
  const [spin, setSpin] = useState(false)
  const [user, setUser] = useState(false)
  const main = useRef<HTMLDivElement>(null)
  const s = useSim((x, d) => ({ m: Math.floor(minuteOf(x.core.t) / 15), alarms: d().alarms.filter((a) => a.severity !== 'info').length }), shallow)
  const current = NAV.find((n) => n.id === tab)!
  const isHome = tab === 'overview'
  const hello = greeting(s.m * 15)
  const go = (t: string) => {
    setTab(t as AppTab)
    setSheet('none')
  }
  // Each page starts at the top, like a route change in the app.
  useEffect(() => {
    main.current?.scrollTo({ top: 0 })
  }, [tab])
  const refresh = () => {
    setSpin(true)
    window.setTimeout(() => setSpin(false), 700)
  }

  const title: ReactNode = isHome ? (
    <>
      {hello}, Demo <span aria-hidden>👋</span>
    </>
  ) : (
    current.label
  )

  return (
    <div className={cn('homeos relative overflow-hidden rounded-[14px] border border-line-strong bg-app text-fg shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]', className)}>
      {chrome && (
        <div className='flex h-9 items-center gap-3 border-b border-line bg-panel px-4'>
          <div className='flex gap-1.5' aria-hidden>
            <span className='h-2.5 w-2.5 rounded-full bg-fg/10' />
            <span className='h-2.5 w-2.5 rounded-full bg-fg/10' />
            <span className='h-2.5 w-2.5 rounded-full bg-fg/10' />
          </div>
          <div className='mx-auto truncate rounded-md bg-fg/[0.04] px-3 py-0.5 text-[11px] text-muted'>CARBONOZ dashboard · Demo site</div>
          <span className='hidden text-[10.5px] font-medium uppercase tracking-[0.08em] text-accent-ink sm:block'>Simulation</span>
        </div>
      )}

      <div className={cn('relative flex bg-[radial-gradient(1200px_700px_at_30%_-20%,var(--app-glow),transparent_60%),radial-gradient(900px_600px_at_110%_110%,var(--app-glow),transparent_55%)]', tall ? 'h-[calc(100svh-150px)] min-h-[620px]' : 'h-[min(880px,calc(100svh-120px))] min-h-[640px]')}>
        {/* Sidebar */}
        <aside aria-label='Primary' className='relative z-20 hidden w-[76px] shrink-0 flex-col border-r border-line bg-panel/70 backdrop-blur-sm lg:flex xl:w-[232px]'>
          <button type='button' onClick={() => go('overview')} className='flex h-[72px] items-center px-[23px] xl:px-6' aria-label='CARBONOZ dashboard'>
            <BrandMark size={30} showName={false} className='xl:hidden' />
            <BrandMark size={30} className='hidden xl:flex' />
          </button>
          <nav className='px-3 pt-1'>
            <ul className='space-y-1'>
              {NAV.map((item) => {
                const active = item.id === tab
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      type='button'
                      onClick={() => go(item.id)}
                      aria-current={active ? 'page' : undefined}
                      title={item.label}
                      className={cn('relative flex h-[38px] w-full items-center justify-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors xl:justify-start', active ? 'text-on-accent' : 'text-fg-2 hover:bg-panel-3 hover:text-fg')}
                    >
                      {active && <motion.span layoutId='app-nav-active' className='absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8bc1c] to-[#c99d08] shadow-[0_8px_24px_-10px_rgb(222_175_11/0.8)]' transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                      <Icon size={17} strokeWidth={1.8} className='relative shrink-0' />
                      <span className='relative hidden flex-1 truncate text-left xl:inline'>{item.label}</span>
                      {item.badge && <span className={cn('relative hidden rounded-full px-1.5 py-px text-[10px] font-semibold xl:inline', active ? 'bg-black/15' : 'bg-accent/15 text-accent-ink')}>{item.badge}</span>}
                      {item.id === 'events' && s.alarms > 0 && <span className='relative hidden rounded-full bg-gridp/20 px-1.5 text-[10px] font-semibold text-gridp xl:inline'>{s.alarms}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
          <p className='mt-auto hidden px-6 pb-5 text-[11px] leading-relaxed text-subtle xl:block'>
            CARBONOZ Renewables
            <br />
            Intelligent solar energy management
          </p>
        </aside>

        {/* Main */}
        <div ref={main} className='relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden'>
          {/* Mobile top bar */}
          <header className='sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-app/85 px-4 py-2.5 backdrop-blur-md lg:hidden'>
            <button type='button' onClick={() => go('overview')} aria-label='CARBONOZ dashboard'>
              <BrandMark size={26} className='[&>span]:text-[16px]' />
            </button>
            <div className='flex items-center gap-1'>
              <ThemeToggle className='hover:bg-panel-3' />
              <span className='flex h-9 items-center gap-2 rounded-lg border border-line-strong px-2.5 text-[12px] text-fg-2'>
                <span className='h-2 w-2 rounded-full bg-batt' />
                Demo site
              </span>
              <span className='grid h-9 w-9 place-items-center rounded-full bg-accent/20 text-[12px] font-semibold text-accent-ink'>DC</span>
            </div>
          </header>

          <div className='@container mx-auto flex min-h-full max-w-[1760px] flex-col px-4 pb-28 sm:px-6 lg:px-5 lg:pb-6 xl:px-[22px]'>
            {/* Desktop header */}
            <header className='hidden items-center justify-between gap-6 pb-[17px] pt-[18px] lg:flex'>
              <motion.div key={String(tab)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className='min-w-0'>
                <h3 className='truncate text-[22px] font-semibold leading-tight tracking-[-0.02em] text-fg'>{title}</h3>
                <p className='mt-1 truncate text-[14px] text-fg-2'>{isHome && s.alarms === 0 ? 'Everything is running smoothly.' : current.description}</p>
              </motion.div>
              <div className='flex shrink-0 items-center gap-3'>
                <LiveStatusPill ago='just now' />
                <div className='flex items-center gap-1.5 px-1'>
                  <button type='button' className={ctrl} aria-label='Refresh data' onClick={refresh}>
                    <RefreshCw size={17} strokeWidth={1.7} className={cn(spin && 'animate-spin')} />
                  </button>
                  <ThemeToggle className='hover:bg-panel-3' />
                  <button type='button' className={cn(ctrl, 'relative')} aria-label={`Events, ${s.alarms} active alarms`} onClick={() => go('events')}>
                    <Bell size={17} strokeWidth={1.7} />
                    {s.alarms > 0 && <span className='absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9.5px] font-semibold text-white'>{s.alarms}</span>}
                  </button>
                </div>
                <div className='relative'>
                  <button type='button' onClick={() => setUser(!user)} aria-expanded={user} className='flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-panel-3'>
                    <span className='grid h-9 w-9 place-items-center rounded-full bg-accent/20 text-[12.5px] font-semibold text-accent-ink ring-2 ring-accent/30'>DC</span>
                    <span className='hidden text-left leading-tight xl:block'>
                      <span className='block text-[13px] font-semibold text-fg'>Demo Customer</span>
                      <span className='block text-[11.5px] text-muted'>Customer</span>
                    </span>
                    <ChevronDown size={15} className='text-muted' />
                  </button>
                  {user && (
                    <div className='absolute right-0 z-40 mt-1 w-56 rounded-xl border border-line-strong bg-panel p-1.5 text-[13px] shadow-[var(--shadow-pop)]'>
                      <p className='px-3 py-2 text-[11.5px] text-muted'>This is a demo account on simulated data.</p>
                      <button type='button' onClick={() => (go('system'), setUser(false))} className='w-full rounded-lg px-3 py-2 text-left text-fg-2 hover:bg-panel-3'>
                        System details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <AnimatePresence mode='wait' initial={false}>
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16, ease: 'easeOut' }} className='flex min-w-0 flex-1 flex-col pt-4 lg:pt-0'>
                <div className='mb-4 lg:hidden'>
                  {isHome ? (
                    <>
                      <p className='text-[16px] text-fg-2'>{hello},</p>
                      <h3 className='text-[24px] font-semibold tracking-[-0.02em] text-fg'>
                        Demo <span aria-hidden>👋</span>
                      </h3>
                    </>
                  ) : (
                    <>
                      <h3 className='text-[22px] font-semibold leading-tight tracking-[-0.02em] text-fg'>{current.label}</h3>
                      <p className='mt-1 text-[13px] text-fg-2'>{current.description}</p>
                    </>
                  )}
                </div>
                {tab === 'overview' && <OverviewTab go={go} />}
                {tab === 'energy' && <EnergyTab />}
                {tab === 'charts' && <ChartsTab />}
                {tab === 'battery' && <BatteryTab />}
                {tab === 'inverters' && <InvertersTab />}
                {tab === 'forecast' && <ForecastTab />}
                {tab === 'events' && <EventsTab />}
                {tab === 'autopilot' && <AutopilotTab />}
                {tab === 'system' && <SystemTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Phone bottom bar: two items, raised centre action, one item, More */}
        <nav aria-label='Primary' className='absolute inset-x-0 bottom-0 z-40 flex items-end justify-around border-t border-line bg-panel/90 px-2 pb-2 pt-1.5 backdrop-blur-lg lg:hidden'>
          {BOTTOM.slice(0, 2).map((id) => (
            <BottomItem key={id} n={NAV.find((n) => n.id === id)!} active={tab === id} onClick={() => go(id)} />
          ))}
          <button type='button' onClick={() => setSheet('quick')} aria-label='Quick actions' aria-haspopup='dialog' className='-mt-6 grid h-14 w-14 place-items-center rounded-full bg-accent text-on-accent shadow-[0_10px_28px_-8px_rgb(222_175_11/0.9)] ring-4 ring-app transition-transform active:scale-95'>
            <Plus size={26} />
          </button>
          <BottomItem n={NAV.find((n) => n.id === BOTTOM[2])!} active={tab === BOTTOM[2]} onClick={() => go(BOTTOM[2])} />
          <button type='button' onClick={() => setSheet('more')} aria-haspopup='dialog' className={cn('flex min-w-14 flex-col items-center gap-1 py-1 text-[10.5px] font-medium', !BOTTOM.includes(tab) ? 'text-accent-ink' : 'text-muted')}>
            <Menu size={20} strokeWidth={1.8} />
            More
          </button>
        </nav>

        <AnimatePresence>
          {sheet !== 'none' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='absolute inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm lg:hidden' onClick={() => setSheet('none')}>
              <motion.div role='dialog' aria-label={sheet === 'quick' ? 'Quick actions' : 'Menu'} initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className='w-full rounded-t-2xl border-t border-line-strong bg-panel p-4' onClick={(e) => e.stopPropagation()}>
                <div className='mb-3 flex items-center justify-between'>
                  <p className='text-[15px] font-semibold text-fg'>{sheet === 'quick' ? 'Quick actions' : 'Menu'}</p>
                  <button type='button' onClick={() => setSheet('none')} aria-label='Close' className={ctrl}>
                    <X size={18} />
                  </button>
                </div>
                {sheet === 'quick' ? (
                  <div className='grid grid-cols-2 gap-2.5'>
                    {[
                      { label: 'Refresh data', icon: <RefreshCw size={20} />, run: () => (refresh(), setSheet('none')) },
                      { label: 'Battery', icon: <BatteryCharging size={20} />, run: () => go('battery') },
                      { label: 'BMS & Cells', icon: <Activity size={20} />, run: () => go('battery') },
                      { label: 'Events', icon: <Bell size={20} />, run: () => go('events') },
                    ].map((a) => (
                      <button key={a.label} type='button' onClick={a.run} className='flex flex-col items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-5 text-[13px] font-medium text-fg transition-colors hover:border-line-strong'>
                        <span className='text-accent-ink'>{a.icon}</span>
                        {a.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <ul className='space-y-1'>
                    {NAV.map((n) => (
                      <li key={n.id}>
                        <button type='button' onClick={() => go(n.id)} aria-current={tab === n.id ? 'page' : undefined} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-colors', tab === n.id ? 'bg-accent/15 text-fg' : 'text-fg-2 hover:bg-panel-3')}>
                          <n.icon size={18} />
                          <span className='flex-1 text-left'>{n.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function BottomItem({ n, active, onClick }: { n: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button type='button' onClick={onClick} aria-current={active ? 'page' : undefined} className={cn('flex min-w-14 flex-col items-center gap-1 py-1 text-[10.5px] font-medium transition-colors', active ? 'text-accent-ink' : 'text-muted')}>
      <n.icon size={20} strokeWidth={1.8} />
      {n.short ?? n.label}
    </button>
  )
}
