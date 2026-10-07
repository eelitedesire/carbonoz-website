/**
 * Real image assets. Every image comes from an official CARBONOZ group or
 * product website (source below), optimised to WebP in public/images/.
 * Add or replace images here; components read only this registry.
 */

export interface Asset {
  /** Path without width suffix, e.g. /images/lixi-48v-stack */
  base: string
  /** Available widths (files are `${base}-${w}.webp`); empty = single file `${base}.webp` */
  widths: number[]
  /** Intrinsic aspect */
  w: number
  h: number
  alt: string
  /** Official site the image was taken from */
  source: string
  /** Viewer title, category and (only where the content config states it) description and related page. */
  title: string
  category: string
  description?: string
  href?: string
}

const a = (base: string, widths: number[], w: number, h: number, alt: string, source: string, title: string, category: string, description?: string, href?: string): Asset => ({ base: `/images/${base}`, widths, w, h, alt, source, title, category, description, href })

export const ASSETS = {
  'lixi-48v-stack': a('lixi-48v-stack', [640, 1280], 2560, 2560, "Two stacked LIXI 48 V lithium battery cases with display and connectors", 'en.lixibattery.com', "LIXI Stack", "Battery storage \u00b7 48 V", "Stackable 48 V LFP battery cases with a JK BMS \u2014 up to 14 cases.", "/solutions/lixi/"),
  'lixi-catl-cells': a('lixi-catl-cells', [640, 1081], 1081, 1560, "Inside a LIXI battery: 16 CATL LiFePO4 cells with busbars", 'en.lixibattery.com', "CATL LFP cells", "Battery cells \u00b7 LIXI", "16 individually replaceable CATL LiFePO4 cells inside a LIXI pack.", "/solutions/lixi/"),
  'lixi-hv-192v-rack': a('lixi-hv-192v-rack', [640, 952], 952, 1436, "LIXI high-voltage rack with four 51.2 V battery packs and the BMU on top", 'en.lixibattery.com', "LIXI HV Rack 192V 100A", "Battery storage \u00b7 200 V", "20.48 kWh \u2014 four 51.2 V / 100 Ah packs with a BMU and active cell balancing.", "/solutions/lixi/"),
  'lixi-pro-rack': a('lixi-pro-rack', [640, 913], 913, 1322, "LIXI Pro Rack energy-storage cabinet, open, showing battery packs and control electronics", 'en.lixibattery.com', "LIXI Pro Rack", "Battery storage \u00b7 400 V", "Air-cooled 112.5 kWh LFP cabinet with an integrated 50 kW PCS, for electricity trading.", "/solutions/lixi/"),
  'caytech-commercial': a('caytech-commercial', [640, 1280], 1467, 1239, "Aerial view of a commercial rooftop solar installation in the Cayman Islands, shown by CAYTECH", 'caytech.biz', "Commercial rooftop solar", "Solar installation \u00b7 Caribbean", undefined, "/group/caribbean/"),
  'caytech-carports': a('caytech-carports', [640, 1280], 3840, 1452, "Solar carport, shown by CAYTECH", 'caytech.biz', "Solar carports", "Solar installation \u00b7 Caribbean", undefined, "/group/caribbean/"),
  'caytech-generac-growatt': a('caytech-generac-growatt', [640, 1038], 1038, 984, "Generac PWRcell battery and inverter next to a solar panel", 'caytech.biz', "Generac & Growatt", "Inverter & battery \u00b7 Caribbean", "Hybrid Growatt or Generac split-phase inverters with LIXI Solar Storage or Generac PWRcell (SUN IGUANA).", "/group/caribbean/"),
  'caytech-generac-pwrcell': a('caytech-generac-pwrcell', [640, 1166], 1166, 1388, "Generac PWRcell battery cabinet and inverters mounted on a wall", 'caytech.biz', "Generac PWRcell", "Inverter & battery \u00b7 Caribbean", undefined, "/group/caribbean/"),
  'caytech-railing': a('caytech-railing', [640, 1280], 1421, 837, "Installers mounting panels on a custom railing system on a Cayman roof", 'caytech.biz', "Custom railing", "Solar installation \u00b7 Caribbean", undefined, "/group/caribbean/"),
  'caytech-roof': a('caytech-roof', [640, 1280], 1600, 1200, "Residential rooftop solar array in the Cayman Islands", 'caytech.biz', "Rooftop solar", "Solar installation \u00b7 Caribbean", undefined, "/group/caribbean/"),
  'caytech-roof-sea': a('caytech-roof-sea', [640, 1280], 2560, 1576, "Rooftop solar array overlooking the sea, Cayman Islands", 'caytech.biz', "Rooftop solar by the sea", "Solar installation \u00b7 Caribbean", undefined, "/group/caribbean/"),
  'solaire-house': a('solaire-house', [640, 1228], 1228, 921, "House in Mauritius with rooftop solar panels, shown by Solaire Mauritius", 'en.solaire.mu', "Residential rooftop solar", "Solar installation \u00b7 Africa", undefined, "/group/africa/"),
  'solaire-installation': a('solaire-installation', [640, 1280], 1500, 1309, "Installers on a rooftop solar array in Mauritius", 'en.solaire.mu', "Rooftop installation", "Solar installation \u00b7 Africa", undefined, "/group/africa/"),
  'solaire-panels': a('solaire-panels', [640, 1280], 1500, 991, "Mono solar panels on a roof in Mauritius", 'en.solaire.mu', "450 W mono panels", "Solar panels \u00b7 Africa", undefined, "/group/africa/"),
  'solaire-carport': a('solaire-carport', [640, 1280], 3305, 1462, "Solar carport in Mauritius", 'en.solaire.mu', "Solar carport", "Solar installation \u00b7 Africa", undefined, "/group/africa/"),
  'solaire-ev-charging': a('solaire-ev-charging', [640, 801], 801, 661, "22 kW electric vehicle charging point", 'en.solaire.mu', "EV charging option", "EV charging \u00b7 Africa", undefined, "/group/africa/"),
  'solaire-deye-inverter': a('solaire-deye-inverter', [395], 395, 500, "Deye hybrid inverter installed on a wall", 'en.solaire.mu', "Deye hybrid inverter", "Inverter \u00b7 Africa", "High Performance Hybrid Deye Inverter(s), as used in the Solaire 2 kit.", "/group/africa/"),
  'solaire-mpp-wiring': a('solaire-mpp-wiring', [640, 1280], 1500, 1271, "Wiring diagram of a hybrid inverter with solar array, battery module, grid and loads", 'en.solaire.mu', "Hybrid inverter wiring", "System design", "Solar array, battery module, grid input, critical and main family loads around a hybrid inverter.", "/group/africa/"),
  'solarautopilot-dashboard': a('solarautopilot-dashboard', [640, 1280], 1680, 990, "CARBONOZ SolarAutopilot dashboard with load, solar, battery and grid gauges", 'carbonoz.com', "SolarAutopilot", "Product screenshot \u00b7 Software", "Inverter automation and energy performance monitoring with customised alerts.", "/platform/solarautopilot/"),
  'carbonoz-pv-plant': a('carbonoz-pv-plant', [640, 1280], 1679, 797, "Ground-mounted solar PV plant", 'carbonoz.com', "PV plant", "Solar plant \u00b7 Europe", undefined, "/solutions/repowering/"),
  'carbonoz-rooftop': a('carbonoz-rooftop', [640, 1280], 1679, 1298, "Aerial view of a flat-roof solar installation", 'carbonoz.com', "Commercial rooftop PV", "Solar installation", undefined, undefined),
  'logo-helios': a('logo-helios', [], 203, 160, "HELIOS ENERGY logo", 'heliosnrg.eu', "HELIOS ENERGY", "Logo", undefined, undefined),
  'logo-caytech': a('logo-caytech', [], 156, 160, "CAYTECH logo", 'caytech.biz', "CAYTECH", "Logo", undefined, undefined),
  'logo-lixi': a('logo-lixi', [], 148, 160, "LIXI logo", 'en.lixibattery.com', "LIXI", "Logo", undefined, undefined),
} satisfies Record<string, Asset>

export type AssetId = keyof typeof ASSETS
