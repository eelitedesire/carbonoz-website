/**
 * CARBONOZ services — VERIFIED. Each service is grounded in the official
 * copy (see `basis`); no category is added beyond the source material.
 */
export interface Service {
  id: string
  name: string
  line: string
  /** Where the source material states it. */
  basis: string
  /** Where on this site it is shown or demonstrated. */
  href: string
}

export const SERVICES: Service[] = [
  { id: 'solar', name: 'Solar energy systems', line: 'Designing and installing hybrid AC/DC solar inverter systems for homes and businesses, on- and off-grid.', basis: 'carbonoz.com · solaire.mu · caytech.biz', href: '/solutions/#kits' },
  { id: 'storage', name: 'Battery energy storage', line: 'Low- and high-voltage LIXI storage — 48 V, 200 V and 400 V systems with CATL-class cells.', basis: 'carbonoz.com · lixibattery.com', href: '/solutions/lixi/' },
  { id: 'repowering', name: 'Solar repowering', line: 'Turn-key repowering of existing PV plants: finance, inverter upgrades, optimised design, modern monitoring.', basis: 'carbonoz.com · heliosnrg.eu', href: '/solutions/repowering/' },
  { id: 'bess', name: 'BESS integration', line: 'Turning traditional solar assets into flexible energy systems: trading, peak shaving, self-consumption, backup.', basis: 'carbonoz.com · lixibattery.com', href: '/solutions/repowering/#bess' },
  { id: 'monitoring', name: 'Energy monitoring', line: 'Real-time performance monitoring of inverters, batteries and BMS — down to the cell.', basis: 'carbonoz.com · login.carbonoz.com', href: '/platform/solarbms/' },
  { id: 'datahub', name: 'Data Hub', line: 'Aggregating verified, real-time project data from hybrid inverters, storage and third-party solutions.', basis: 'carbonoz.com', href: '/data-hub/' },
  { id: 'analytics', name: 'Analytics', line: 'Data-driven project insights for operators, investors and financial institutions.', basis: 'carbonoz.com', href: '/data-hub/#features' },
  { id: 'predictive', name: 'Predictive monitoring', line: 'Predictive maintenance, anti-fraud and real-time asset monitoring.', basis: 'carbonoz.com', href: '/data-hub/#features' },
  { id: 'intelligence', name: 'Energy intelligence', line: 'Inverter automation, tested automation algorithms and predictive analysis engines.', basis: 'carbonoz.com', href: '/intelligence/' },
  { id: 'advisory', name: 'Project advisory', line: 'An energy-performance project advisory toolkit.', basis: 'carbonoz.com', href: '/data-hub/#features' },
]
