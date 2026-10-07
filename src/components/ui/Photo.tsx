'use client'

import { Maximize2 } from 'lucide-react'
import { ASSETS, AssetId } from '@/content/assets'
import { cx } from './cx'
import { openViewer } from './Lightbox'

/**
 * A real CARBONOZ group image. Photography stays the focus: consistent
 * cropping, a quiet category + title caption, source credit, a slow zoom on
 * hover — and the whole image opens the full-screen viewer.
 */
export function Photo({
  id,
  className,
  imgClassName,
  aspect,
  position = 'center',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority,
  caption,
  credit = true,
  fit = 'cover',
  zoom = true,
}: {
  id: AssetId
  className?: string
  imgClassName?: string
  /** CSS aspect-ratio; defaults to the image's own. */
  aspect?: string
  position?: string
  sizes?: string
  priority?: boolean
  /** Overrides the registry title in the caption. */
  caption?: string
  credit?: boolean
  fit?: 'cover' | 'contain'
  /** Open the viewer on click (default). */
  zoom?: boolean
}) {
  const a = ASSETS[id]
  const src = a.widths.length ? `${a.base}-${a.widths[a.widths.length - 1]}.webp` : `${a.base}.webp`
  const srcSet = a.widths.length ? a.widths.map((w) => `${a.base}-${w}.webp ${w}w`).join(', ') : undefined
  const cover = fit === 'cover'
  const title = caption ?? a.title
  return (
    <figure
      className={cx(
        'group/photo relative isolate overflow-hidden rounded-[10px] border border-line shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_18px_40px_-28px_rgb(0_0_0/0.55)]',
        cover ? 'bg-ink-850' : 'bg-white',
        className,
      )}
      style={{ aspectRatio: aspect ?? `${a.w} / ${a.h}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={a.alt}
        width={a.w}
        height={a.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding='async'
        className={cx(
          'absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/photo:scale-[1.03]',
          cover ? 'object-cover' : 'object-contain px-5 pb-14 pt-5',
          imgClassName,
        )}
        style={{ objectPosition: position }}
      />
      {cover && <span aria-hidden className='pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/15 to-transparent' />}
      <span aria-hidden className={cx('pointer-events-none absolute left-2.5 top-2.5 h-3 w-3 border-l border-t', cover ? 'border-white/55' : 'border-black/20')} />
      <span aria-hidden className={cx('pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 border-r border-t transition-opacity group-hover/photo:opacity-0', cover ? 'border-white/55' : 'border-black/20')} />
      {zoom && (
        <span aria-hidden className={cx('pointer-events-none absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full opacity-0 transition-opacity duration-300 group-hover/photo:opacity-100 group-focus-within/photo:opacity-100', cover ? 'bg-black/45 text-white backdrop-blur-sm' : 'bg-[#0b0e13]/80 text-white')}>
          <Maximize2 size={14} />
        </span>
      )}
      <figcaption className={cx('pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-3.5 py-3', cover ? 'text-white' : 'text-[#0b0e13]')}>
        <span className='min-w-0'>
          <span className={cx('label block truncate text-[9px]', cover ? 'text-white/70' : 'text-[#5a6371]')}>{a.category}</span>
          <span className='mt-0.5 block truncate text-[13px] font-medium tracking-[-0.01em]'>{title}</span>
        </span>
        {credit && <span className={cx('label shrink-0 text-[8.5px]', cover ? 'text-white/60' : 'text-[#8a929e]')}>{a.source}</span>}
      </figcaption>
      {zoom && (
        <button
          type='button'
          data-zoom-id={id}
          onClick={(e) => openViewer(id, e.currentTarget)}
          aria-label={`Open image: ${title}`}
          className='absolute inset-0 z-10 cursor-zoom-in rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand'
        />
      )}
    </figure>
  )
}

/** A row of thumbnails that open the viewer — for products with several images. */
export function Thumbs({ ids, className }: { ids: AssetId[]; className?: string }) {
  return (
    <ul className={cx('grid grid-cols-4 gap-2', className)}>
      {ids.map((t) => {
        const a = ASSETS[t]
        return (
          <li key={t}>
            <button type='button' onClick={(e) => openViewer(t, e.currentTarget)} aria-label={`Open image: ${a.title}`} className='group/t relative block aspect-square w-full overflow-hidden rounded-[8px] border border-line bg-white transition-colors hover:border-line-strong'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.widths.length ? `${a.base}-${a.widths[0]}.webp` : `${a.base}.webp`} alt='' loading='lazy' className='h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover/t:scale-105' />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
