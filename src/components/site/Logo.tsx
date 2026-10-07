import { cx } from '@/components/ui/cx'

/**
 * The CARBONOZ logo — the same artwork the CARBONOZ app, the SolarAutopilot
 * add-on and the desktop app use (login.carbonoz.com/offsettingdashboard/src/assets/1.jpg),
 * shown as a rounded tile with the CARBONOZ wordmark, like the app's BrandMark.
 */
export function Logo({ className, mark = true, name = true, size = 30 }: { className?: string; mark?: boolean; name?: boolean; size?: number }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      {mark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src='/brand/carbonoz-mark.jpg' alt={name ? '' : 'CARBONOZ'} width={size} height={size} className='shrink-0 rounded-[9px] object-cover ring-1 ring-brand/40' style={{ width: size, height: size }} />
      )}
      {name && <span className='text-[17px] font-semibold tracking-[-0.01em]'>CARBONOZ</span>}
    </span>
  )
}
