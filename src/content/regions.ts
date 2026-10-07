/**
 * Regional businesses of the CARBONOZ Group — VERIFIED content, real imagery.
 */
import { COPY, LINKS } from './company'
import type { AssetId } from './assets'
import type { RegionId } from './group'

export interface Region {
  id: RegionId
  name: string
  business: string
  headline: string
  copy: string
  /** Shown next to `copy` when the source attaches a claim to this business only. */
  note?: string
  focus: string[]
  hero: AssetId
  gallery: { asset: AssetId; caption: string }[]
  kits: string[]
  href: string
  site: string
}

export const REGIONS: Region[] = [
  {
    id: 'europe',
    name: 'Europe',
    business: 'HELIOS ENERGY',
    headline: 'Repowering solar plants into flexible energy systems.',
    copy: COPY.europe,
    focus: ['Solar repowering', 'Inverter upgrades', 'Modern monitoring', 'BESS integration', 'Energy trading & storage'],
    hero: 'carbonoz-pv-plant',
    gallery: [
      { asset: 'carbonoz-pv-plant', caption: 'Existing PV plant' },
      { asset: 'lixi-pro-rack', caption: 'LIXI Pro Rack · 112.5 kWh' },
      { asset: 'carbonoz-rooftop', caption: 'Commercial rooftop PV' },
    ],
    kits: [],
    href: '/group/europe/',
    site: LINKS.helios,
  },
  {
    id: 'africa',
    name: 'Africa',
    business: 'Solaire Mauritius',
    headline: 'Affordable hybrid solar with CATL lithium storage.',
    copy: COPY.africa,
    note: 'The 90% self-sufficiency figure is stated by Solaire Mauritius for many of its own customers; it is not a CARBONOZ-wide statistic.',
    focus: ['Hybrid solar systems', 'CATL lithium storage', 'EV charging', 'Solar Assistant monitoring', 'Off-grid options'],
    hero: 'solaire-house',
    gallery: [
      { asset: 'solaire-installation', caption: 'Rooftop installation, Mauritius' },
      { asset: 'solaire-carport', caption: 'Solar carport' },
      { asset: 'solaire-ev-charging', caption: 'EV charging option' },
      { asset: 'solaire-deye-inverter', caption: 'Deye hybrid inverter' },
      { asset: 'solaire-mpp-wiring', caption: 'Hybrid inverter wiring' },
    ],
    kits: ['solaire-1', 'solaire-2'],
    href: '/group/africa/',
    site: LINKS.solaire,
  },
  {
    id: 'caribbean',
    name: 'Caribbean',
    business: 'CAYTECH Cayman Islands',
    headline: 'On- and off-grid solar hybrid systems with battery storage.',
    copy: COPY.caribbean,
    focus: ['On-grid systems', 'Off-grid systems', 'Solar hybrid systems', 'Battery storage', 'Commercial systems'],
    hero: 'caytech-commercial',
    gallery: [
      { asset: 'caytech-railing', caption: 'Custom railing' },
      { asset: 'caytech-generac-pwrcell', caption: 'Generac & Growatt inverter' },
      { asset: 'caytech-carports', caption: 'Solar carports' },
      { asset: 'caytech-roof-sea', caption: 'Rooftop solar, Cayman Islands' },
    ],
    kits: ['sun-lizzard', 'sun-iguana'],
    href: '/group/caribbean/',
    site: LINKS.caytech,
  },
]

export const region = (id: RegionId) => REGIONS.find((r) => r.id === id)!
