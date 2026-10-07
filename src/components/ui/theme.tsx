'use client'

import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { cx } from './cx'

export type Theme = 'light' | 'dark'
export const THEME_KEY = 'carbonoz-theme'

/** Light is the default; dark only when the visitor chose it with the toggle. */
export const DEFAULT_THEME: Theme = 'light'

/** Runs in <head> before first paint, so a saved dark choice never flashes light. */
export const THEME_SCRIPT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('${THEME_KEY}');d.dataset.theme=t==='dark'||t==='light'?t:'light'}catch(e){d.dataset.theme='light'}})()`

function subscribe(cb: () => void) {
  const o = new MutationObserver(cb)
  o.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => o.disconnect()
}

const read = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => DEFAULT_THEME)
  const set = (t: Theme) => {
    document.documentElement.dataset.theme = t
    try {
      localStorage.setItem(THEME_KEY, t)
    } catch {
      /* private mode: the choice lasts for this page only */
    }
  }
  return { theme, set, toggle: () => set(theme === 'dark' ? 'light' : 'dark') }
}

/** Sun / moon button, like the CARBONOZ app's ThemeToggle. */
export function ThemeToggle({ className, size = 18 }: { className?: string; size?: number }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button type='button' onClick={toggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title='Toggle theme' className={cx('grid h-9 w-9 place-items-center rounded-lg text-fg-2 transition-colors hover:bg-fg/[0.06] hover:text-fg', className)}>
      {dark ? <Sun size={size} strokeWidth={1.7} /> : <Moon size={size} strokeWidth={1.7} />}
    </button>
  )
}
