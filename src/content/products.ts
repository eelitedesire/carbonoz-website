/**
 * Real CARBONOZ group products — VERIFIED.
 * Configurations and specifications are copied from the official pages named
 * in `source`. Do not edit values without a new source; missing values stay
 * absent rather than estimated.
 */
import type { AssetId } from './assets'
import type { RegionId } from './group'

export interface SolarKit {
  id: string
  name: string
  tier: 'Solar Kit Basic' | 'Solar Kit Advanced'
  brand: string
  region: RegionId
  ideal: string
  config: string[]
  pvPower: string
  image: AssetId
  source: string
}

export const SOLAR_KITS: SolarKit[] = [
  {
    id: 'solaire-1',
    name: 'Solaire 1',
    tier: 'Solar Kit Basic',
    brand: 'Solaire Mauritius',
    region: 'africa',
    ideal: 'Ideal for small Mauritian households with 2 air-conditioning devices, refrigerator, washer and a water pump. No pool and dishwasher.',
    config: [
      'Hybrid MPP or Growatt On-Grid Solar Inverter',
      '450 Watt Mono Panels',
      'Works with and without selected CATL lithium batteries (not included)',
      'Storage battery can be installed at a later stage',
      'Charge your electric scooter',
      'Smartphone-friendly Solar Assistant monitoring — your private data stays on your own device',
    ],
    pvPower: '5,000 W',
    image: 'solaire-panels',
    source: 'en.solaire.mu',
  },
  {
    id: 'solaire-2',
    name: 'Solaire 2',
    tier: 'Solar Kit Advanced',
    brand: 'Solaire Mauritius',
    region: 'africa',
    ideal: 'Ideal for larger Mauritian households and offices with 3+ air-conditioning devices, a dishwasher, washer, refrigerator, a water pump and a pool.',
    config: [
      'High Performance Hybrid Deye Inverter(s)',
      '450 Watt Mono Panels',
      'High Performance CATL Lithium battery, 14 kWh',
      'Charge your electric car or scooter',
      'Selling electricity back to CEB is optional',
      'Going off-grid is a real option, depending on your peak load requirements and other factors',
      'Smartphone-friendly Solar Assistant monitoring — your private data stays on your own device',
    ],
    pvPower: '5,000 – 50,000 W',
    image: 'solaire-house',
    source: 'en.solaire.mu',
  },
  {
    id: 'sun-lizzard',
    name: 'SUN LIZZARD',
    tier: 'Solar Kit Basic',
    brand: 'CAYTECH',
    region: 'caribbean',
    ideal: 'Ideal for small, low to medium energy Caymanian households and businesses with a 3 split AC unit (or 4 small AC window units), refrigerator, washer and water pump.',
    config: [
      'Hybrid MPP Infinisolar On-Grid Inverter',
      '450 Watt Mono Panels',
      'Works without lithium batteries',
      'Storage battery can be installed at a later stage',
      'Smartphone-friendly Solar Assistant monitoring — your private data stays on your own device',
    ],
    pvPower: '6,000 W',
    image: 'caytech-roof',
    source: 'caytech.biz',
  },
  {
    id: 'sun-iguana',
    name: 'SUN IGUANA',
    tier: 'Solar Kit Advanced',
    brand: 'CAYTECH',
    region: 'caribbean',
    ideal: 'Ideal for low energy, medium sized Caymanian households and businesses with more than one bedroom and power requirements for a 5-ton split AC device, refrigerator, washer and water pump.',
    config: [
      'Hybrid Growatt or Generac Split-Phase Inverter(s)',
      '450 Watt Mono Panels',
      'Stackable High Performance Lithium battery — LIXI Solar Storage or Generac PWRcell',
      'Charge your electric car',
      'Going off-grid is a real option, depending on your peak load requirements and other factors',
    ],
    pvPower: '8,000 – 50,000 W',
    image: 'caytech-generac-growatt',
    source: 'caytech.biz',
  },
]

export interface Spec {
  label: string
  value: string
}

export interface LixiProduct {
  id: string
  name: string
  voltageClass: 'Low voltage · 48 V' | 'High voltage · 200 V' | 'High voltage · 400 V'
  summary: string
  image: AssetId
  specs: Spec[]
  notes?: string[]
  source: string
}

/** Source: en.lixibattery.com (LIXI SOLAR & ELECTRICITY STORAGE). */
export const LIXI_PRODUCTS: LixiProduct[] = [
  {
    id: 'lixi-48',
    name: 'LIXI Stack',
    voltageClass: 'Low voltage · 48 V',
    summary: 'Stackable 48 V LFP battery cases with a JK BMS. Stack up to 14 battery cases together. 48-volt batteries can be maintained by anybody after a short safety briefing and do not require certified high-voltage training.',
    image: 'lixi-48v-stack',
    specs: [
      { label: 'Nominal voltage', value: '51.2 V (200 V coming soon)' },
      { label: 'Storage per unit', value: '14 kWh with 280K cells (higher with 302K / 320K cells)' },
      { label: 'Current', value: '200 A' },
      { label: 'Stacking', value: 'Up to 14 battery cases' },
      { label: 'BMS', value: 'JK BMS, 48 V 16S — PYLONTECH protocol support' },
      { label: 'Communication', value: 'CANBUS / RS485; Bluetooth and CAN-bus for BMS monitoring' },
      { label: 'Cells', value: 'CATL LiFePO4 (LFP) 280K, 302K or 320K' },
      { label: 'Material', value: 'Stainless steel' },
      { label: 'Weight', value: '125 kg / 275 lb' },
      { label: 'Size', value: '415 × 700 × 263 mm' },
      { label: 'Warranty', value: '1 year' },
    ],
    notes: ['280K cell: real capacity ≥ 287 Ah, guaranteed cycle life 6000 cycles (80% DOD), charging −5 to +60 °C, discharging −30 to +60 °C.', 'Recommended inverters: DEYE / Sunsynk, Growatt, MPP / Voltronic and Victron.'],
    source: 'en.lixibattery.com',
  },
  {
    id: 'lixi-192',
    name: 'LIXI HV Rack 192V 100A',
    voltageClass: 'High voltage · 200 V',
    summary: 'Four 51.2 V / 100 Ah packs in series with a BMU on top of the rack and active cell balancing.',
    image: 'lixi-hv-192v-rack',
    specs: [
      { label: 'Model', value: '192V 100A-EJ-BUM' },
      { label: 'Energy content', value: '20.48 kWh (4 × 51.2 V / 100 Ah)' },
      { label: 'Nominal voltage', value: '204.8 V (160 – 233.6 V)' },
      { label: 'Cells', value: 'LiFePO4 (LFP), EVE LF100LA, 64S1P' },
      { label: 'BMS', value: 'EHVS500-BMU with active cell balancing' },
      { label: 'Max charge / discharge', value: '100 A' },
      { label: 'Communication', value: 'RS485 / CAN' },
      { label: 'Cooling', value: 'Active air cooling, automatic fan control' },
      { label: 'Parallel', value: 'Up to 20 systems, automatic addressing' },
      { label: 'Rack', value: '460 × 550 × 1018 mm, approx. 236.5 kg' },
    ],
    notes: ['CAN-based inverter compatibility: Deye, Growatt, Victron, GoodWe, SMA, Solis and others.'],
    source: 'en.lixibattery.com',
  },
  {
    id: 'lixi-pro-rack',
    name: 'LIXI Pro Rack',
    voltageClass: 'High voltage · 400 V',
    summary: 'Air-cooled 112.5 kWh LFP energy-storage cabinet for commercial, industrial and micro-grid environments, with an intelligent BMS and integrated 50 kW PCS. Built for selling and trading electricity — particularly for commercial PV installations no longer under subsidies.',
    image: 'lixi-pro-rack',
    specs: [
      { label: 'Energy capacity', value: '112.5 kWh' },
      { label: 'Integrated PCS', value: '50 kW rated, 80 kW max (2 s), AC 220/380 V 3/N/PE' },
      { label: 'Nominal voltage', value: '358.4 V (280 – 408.8 V)' },
      { label: 'Cells', value: 'LiFePO4 (LFP), 3.2 V / 314 Ah; 7 packs, 1P16S' },
      { label: 'BMS', value: 'Master / slave, full monitoring and protection' },
      { label: 'Cycle life', value: '> 8000 cycles (25 °C, 0.5C, 90% DoD, 70% EoL)' },
      { label: 'Communication', value: 'WiFi, 4G, LAN, CAN, RS485' },
      { label: 'Protection', value: 'IP55; −25 to +55 °C operating' },
      { label: 'Cabinet', value: '1510 × 1010 × 1830 mm, ≤ 1500 kg' },
    ],
    notes: ['Repowers older solar installations with minimal investment and gives them a new economic purpose through electricity trading.'],
    source: 'en.lixibattery.com',
  },
]

/** LIXI technology points, from en.lixibattery.com. */
export const LIXI_POINTS = [
  { k: 'Safety', v: 'Stable chemistry that reduces the risk of thermal runaway, making the cells less prone to overheating than other lithium-ion batteries.' },
  { k: 'Long cycle life', v: 'Endures a high number of charge and discharge cycles — exceeding 8000 cycles — which translates to a longer lifespan.' },
  { k: 'Performance', v: 'Stable voltage throughout the discharge cycle; high current ratings for solar-powered homes and backup power.' },
  { k: 'CATL cells', v: 'Certified high-quality cells from CATL, one of the world’s largest battery manufacturers.' },
  { k: 'Eco-friendly', v: 'Non-toxic, more recyclable LFP materials and 16 individually replaceable cells for easy maintenance.' },
  { k: 'Electricity trading', v: 'Now also available with an electricity-trading option over the CARBONOZ platform.' },
] as const
