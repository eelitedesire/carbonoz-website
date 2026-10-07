/**
 * CARBONOZ Group structure — VERIFIED.
 * Sources: carbonoz.com (CARBONOZ GROUP), heliosnrg.eu, en.solaire.mu, caytech.biz.
 */
import { CONTACTS, LINKS } from './company'
import type { AssetId } from './assets'

export type RegionId = 'europe' | 'africa' | 'caribbean'

export interface Entity {
  region: RegionId
  regionLabel: string
  legalName: string
  brand: string
  address: string[]
  registration?: string
  website: string
  websiteLabel: string
  logo?: AssetId
  contact?: { email?: string; phone?: string; tel?: string; whatsapp?: string }
}

export const GROUP: Entity[] = [
  {
    region: 'europe',
    regionLabel: 'Europe',
    legalName: 'Helios Academy GmbH',
    brand: 'HELIOS ENERGY',
    address: ['Flughafenstr. 75', '41066 Mönchengladbach', 'Germany'],
    website: LINKS.helios,
    websiteLabel: 'heliosnrg.eu',
    logo: 'logo-helios',
  },
  {
    region: 'africa',
    regionLabel: 'Africa',
    legalName: 'buyAfraction Limited',
    brand: 'Solaire Mauritius',
    address: ['Château La Mare Ronde, Avenue Du Château', 'Chemin Vingt Pieds', '30513 Grand Baie', 'Mauritius'],
    registration: 'BRN: C20173696',
    website: LINKS.solaire,
    websiteLabel: 'solaire.mu',
    contact: CONTACTS.solaire,
  },
  {
    region: 'caribbean',
    regionLabel: 'Caribbean',
    legalName: 'Caytech Limited',
    brand: 'CAYTECH Cayman Islands',
    address: ['P.O. BOX 8', 'Cayman Brac', 'KY2-2201', 'Cayman Islands'],
    website: LINKS.caytech,
    websiteLabel: 'caytech.biz',
    logo: 'logo-caytech',
    contact: CONTACTS.caytech,
  },
]

export const entity = (r: RegionId) => GROUP.find((e) => e.region === r)!
