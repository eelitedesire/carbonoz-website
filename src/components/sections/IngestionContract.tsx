import { SectionHeader } from '@/components/ui/primitives'

/** Summary of docs/solarbms-ingestion.md (version 1) for engineers. */
const RESPONSES = [
  ['202 · queued', 'Accepted', 'Done'],
  ['202 · duplicate', 'Already received', 'Done — don’t resend'],
  ['400', 'Not a JSON object, invalid JSON, or more than 100 messages', 'Fix the payload'],
  ['401', 'Credential missing, wrong, expired or revoked', 'Refresh the token'],
  ['409', 'systemId belongs to a different installation', 'Check configuration'],
  ['413', 'Request larger than 100 kB', 'Split the request'],
  ['503 / 5xx', 'Temporary problem or ingestion backlog', 'Retry with backoff, keep data buffered'],
]

const FIELDS = [
  ['messageId', 'Unique per message; makes retries safe. Missing → a hash of the body is used.'],
  ['systemId', 'The installation’s own id; must match its registration.'],
  ['timestamp', 'ISO 8601 with Z or an offset, or epoch seconds / milliseconds.'],
  ['measurements', 'System totals: pvPower, loadPower, gridPower, batteryPower, soc.'],
  ['inverters · batteries · bms', 'Arrays or objects keyed by id; each BMS may report its own cell count.'],
  ['cells', 'Numbers or objects {id, voltage, temperature?, balancing?}; values above 100 are read as mV.'],
  ['alarms · events · forecast', 'Alarms are tracked from appearance to clearance; forecast points carry a timestamp each.'],
]

export function IngestionContract() {
  return (
    <section aria-labelledby='contract-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          kicker='SolarBMS ingestion · version 1'
          id='contract-title'
          title={<>A contract the gateway can rely on.</>}
          lede='Names in camelCase or snake_case, units in the field name when they are not W, V, A, °C or %. Sign convention: positive grid power is import, positive battery power is charging — to be confirmed against the real SolarBMS payload.'
        />
        <div className='mt-14 grid gap-4 lg:grid-cols-2'>
          <div className='panel overflow-hidden'>
            <p className='border-b border-line px-5 py-3 text-[13px] font-medium text-fg-2'>Responses</p>
            <div className='scroll-x'>
              <table className='w-full min-w-[520px] text-[13px]'>
                <thead>
                  <tr className='text-left text-muted'>
                    <th scope='col' className='px-5 py-2.5 font-normal'>Status</th>
                    <th scope='col' className='px-5 py-2.5 font-normal'>Meaning</th>
                    <th scope='col' className='px-5 py-2.5 font-normal'>Gateway action</th>
                  </tr>
                </thead>
                <tbody>
                  {RESPONSES.map(([a, b, c]) => (
                    <tr key={a} className='border-t border-line'>
                      <td className='num whitespace-nowrap px-5 py-2.5 text-fg'>{a}</td>
                      <td className='px-5 py-2.5 text-fg-2'>{b}</td>
                      <td className='px-5 py-2.5 text-muted'>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className='panel overflow-hidden'>
            <p className='border-b border-line px-5 py-3 text-[13px] font-medium text-fg-2'>Message fields</p>
            <dl>
              {FIELDS.map(([k, v]) => (
                <div key={k} className='grid gap-1 border-t border-line px-5 py-3 first:border-0 sm:grid-cols-[190px_1fr] sm:gap-4'>
                  <dt className='num text-[12.5px] text-fg'>{k}</dt>
                  <dd className='text-[13px] text-fg-2'>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
