import { Button } from '@/components/ui/primitives'

export default function NotFound() {
  return (
    <section className='container-x flex min-h-[80svh] flex-col items-start justify-center pt-24'>
      <p className='label text-brand'>404 · No reading</p>
      <h1 className='display mt-6 text-[clamp(2.4rem,6vw,5rem)]'>This page didn’t report in.</h1>
      <p className='lede mt-5 max-w-[48ch]'>The address may have changed. The rest of the system is online.</p>
      <div className='mt-8 flex gap-3'>
        <Button href='/'>Back to CARBONOZ</Button>
        <Button href='/demo/' variant='secondary'>
          Open the live demo
        </Button>
      </div>
    </section>
  )
}
