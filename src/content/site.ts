/**
 * CARBONOZ website — site-level content and labels.
 *
 * Content sources and how they are labelled:
 *  - VERIFIED  supplied by CARBONOZ: carbonoz.com and the group sites
 *              (company.ts, group.ts, regions.ts, products.ts, services.ts),
 *              and the platform repositories (VERIFIED below).
 *  - DEMO      simulated values on the interactive demos — always from src/sim,
 *              never from these files.
 *  - CONCEPT   product behaviour shown in the demo but not confirmed as a
 *              production feature.
 *  - PENDING   information CARBONOZ still has to provide (rendered as
 *              "to be confirmed" or not rendered at all).
 */
import { COPY, LINKS } from './company'

export type Status = 'verified' | 'demo' | 'concept' | 'pending'

/** How each status is labelled on the site. */
export const STATUS_LABEL: Record<Status, string> = {
  verified: 'CARBONOZ verified',
  demo: 'Interactive simulation',
  concept: 'Concept · simulated',
  pending: 'Details pending',
}

export const COMPANY = {
  name: 'CARBONOZ',
  legalName: 'CARBONOZ',
  groupName: 'CARBONOZ Group',
  tagline: COPY.tagline,
  /** Canonical origin of this site (carbonoz.com is the group's official domain). */
  url: 'https://carbonoz.com',
  platformUrl: LINKS.platform,
  /** TODO: a group-wide contact address. Regional contacts live in company.ts → CONTACTS. */
  contactEmail: null as string | null,
  /** TODO: founding year, team — not part of the supplied material. */
  founded: null as string | null,
}

/** Facts about the CARBONOZ platform software, traceable to the platform repositories. */
export const VERIFIED = {
  platform: [
    'Customers sign in to the CARBONOZ platform and see every site and installation they belong to.',
    'A customer can have several sites; each site holds one or more SolarBMS installations.',
    'Each installation reports its system totals, inverters, batteries, BMS units and individual cells.',
    'Alarms are recorded when they appear and when they clear.',
    'Energy history is integrated from measured power — hourly, daily, monthly and yearly — in the site’s own time zone.',
    'The dashboard is available in English, French, Spanish and German.',
  ],
  ingestion: [
    'A SolarBMS system — a Raspberry Pi at the site — sends readings to CARBONOZ over HTTPS every 10–60 seconds.',
    'Every installation has its own machine credential; it can only write data for that installation.',
    'Retries are safe: every message carries an id and is stored once.',
    'Unknown fields are accepted and kept, so new metrics need no platform change.',
    'Nothing is silently dropped: a message that cannot be processed is kept and can be re-run.',
    'An installation is online when it reported within the last five minutes.',
  ],
  redex: 'CARBONOZ helps customers register their installation with Redex to receive renewable energy certificates for the solar power they produce.',
}

export interface Product {
  id: string
  name: string
  status: Status
  line: string
  href: string
}

export const PRODUCTS: Product[] = [
  { id: 'datahub', name: 'CARBONOZ Data Hub', status: 'verified', line: 'Verified, real-time project data and insights for operators, investors and financial institutions.', href: '/data-hub/' },
  { id: 'solarautopilot', name: 'SolarAutopilot', status: 'verified', line: 'Inverter automation and energy performance monitoring with customised alerts.', href: '/platform/solarautopilot/' },
  { id: 'solarbms', name: 'SolarBMS', status: 'verified', line: 'Battery, BMS and cell-level monitoring from a Raspberry Pi gateway at the site.', href: '/platform/solarbms/' },
  { id: 'lixi', name: 'LIXI batteries', status: 'verified', line: 'Low- and high-voltage LFP storage — 48 V, 200 V and 400 V — with CATL-class cells.', href: '/solutions/lixi/' },
  { id: 'kits', name: 'Hybrid solar systems', status: 'verified', line: 'Solar kits with hybrid inverters, 450 W mono panels and lithium storage, by region.', href: '/solutions/#kits' },
  { id: 'repowering', name: 'Solar repowering & BESS', status: 'verified', line: 'Modernising existing PV plants and turning them into flexible energy systems.', href: '/solutions/repowering/' },
]

/**
 * Applications, shown as simulated scenarios of the demo model. `confirmed`
 * marks sectors the group's own material names.
 */
export const SECTORS = [
  { id: 'residential', name: 'Residential', confirmed: true, line: 'Homes in Mauritius and the Cayman Islands: hybrid solar, lithium storage, evening demand on the battery.' },
  { id: 'commercial', name: 'Commercial', confirmed: true, line: 'Businesses and offices; commercial PV that no longer receives subsidies can trade its electricity.' },
  { id: 'industrial', name: 'Industrial', confirmed: true, line: 'Commercial, industrial and micro-grid storage such as the 112.5 kWh LIXI Pro Rack.' },
  { id: 'backup', name: 'Backup power', confirmed: true, line: 'Power outages and cyclone season: the battery carries the site until the grid returns.' },
  { id: 'remote', name: 'Off-grid systems', confirmed: true, line: 'Off-grid solutions that run a house without the utility, depending on peak load.' },
] as const

export const NAV = [
  {
    label: 'Platform',
    href: '/platform/',
    children: [
      { label: 'Platform overview', href: '/platform/', line: 'Sites, installations, live data' },
      { label: 'CARBONOZ Data Hub', href: '/data-hub/', line: 'Verified real-time project data' },
      { label: 'SolarAutopilot', href: '/platform/solarautopilot/', line: 'Inverter automation & monitoring' },
      { label: 'SolarBMS', href: '/platform/solarbms/', line: 'Battery & cell monitoring' },
      { label: 'Live demo', href: '/demo/', line: 'Full interactive product' },
    ],
  },
  {
    label: 'Solutions',
    href: '/solutions/',
    children: [
      { label: 'Solar & storage', href: '/solutions/', line: 'Services, solar kits, storage' },
      { label: 'LIXI batteries', href: '/solutions/lixi/', line: '48 V · 200 V · 400 V storage' },
      { label: 'Solar repowering', href: '/solutions/repowering/', line: 'Modernise PV plants, add BESS' },
      { label: 'Applications', href: '/solutions/#applications', line: 'By site type' },
    ],
  },
  { label: 'Energy Intelligence', href: '/intelligence/' },
  { label: 'Hardware', href: '/hardware/' },
  { label: 'Technology', href: '/technology/' },
  {
    label: 'Company',
    href: '/company/',
    children: [
      { label: 'About CARBONOZ', href: '/company/', line: 'Data is key · Impact now' },
      { label: 'CARBONOZ Group', href: '/group/', line: 'Europe, Africa, Caribbean' },
      { label: 'Europe · HELIOS ENERGY', href: '/group/europe/', line: 'Repowering & storage' },
      { label: 'Africa · Solaire Mauritius', href: '/group/africa/', line: 'Hybrid solar & CATL storage' },
      { label: 'Caribbean · CAYTECH', href: '/group/caribbean/', line: 'On- & off-grid solar' },
      { label: 'Contact', href: '/contact/', line: 'Regional contacts' },
    ],
  },
] as const

export const SEO = {
  title: 'CARBONOZ — Renewable, solar and battery energy group for Europe, Africa and the Caribbean',
  description:
    'CARBONOZ designs, installs and controls hybrid AC/DC solar inverter systems with 48V, 200V and 400V battery storage, and monitors system performance with SolarBMS, SolarAutopilot and the CARBONOZ Data Hub.',
}
