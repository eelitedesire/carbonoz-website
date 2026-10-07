import Link from 'next/link'
import { ReactNode } from 'react'
import { Status } from '@/content/site'
import { StatusTag } from '@/components/ui/primitives'

export function PageHero({ crumb, title, lede, status, children }: { crumb: { label: string; href?: string }[]; title: ReactNode; lede: ReactNode; status?: Status; children?: ReactNode }) {
  return (
    <section className='relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44'>
      <div aria-hidden className='grid-bg fade-edges pointer-events-none absolute inset-0 opacity-60' />
      <div className='container-x relative'>
        <nav aria-label='Breadcrumb'>
          <ol className='label flex flex-wrap items-center gap-2 text-muted'>
            <li>
              <Link href='/' className='hover:text-fg'>
                CARBONOZ
              </Link>
            </li>
            {crumb.map((c) => (
              <li key={c.label} className='flex items-center gap-2'>
                <span aria-hidden className='h-px w-5 bg-line-strong' />
                {c.href ? (
                  <Link href={c.href} className='hover:text-fg'>
                    {c.label}
                  </Link>
                ) : (
                  <span className='text-brand' aria-current='page'>
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className='mt-8 grid gap-8 lg:grid-cols-12 lg:items-end'>
          <h1 className='display text-[clamp(2.6rem,6.4vw,5.6rem)] text-balance lg:col-span-8'>{title}</h1>
          <div className='lg:col-span-4 lg:pb-2'>
            <p className='lede text-pretty'>{lede}</p>
            {status && <StatusTag status={status} className='mt-5' />}
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}
