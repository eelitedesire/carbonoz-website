# Carbonoz website

Marketing site, product showcase and interactive demo for Carbonoz. Next.js (App Router, static export), TypeScript, Tailwind CSS 4, Motion, Lucide.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/ (serve with Nginx like the platform SPA)
npm run preview    # build + serve the production site on http://localhost:3001
```

`npm run dev` compiles each page on first visit and runs React in development mode, so page changes there are several times slower than the real site. Judge speed with `npm run preview`.

```bash
npm run lint && npm run typecheck && npm test
```

## Where things live

| Path | What |
|---|---|
| `src/content/company.ts` · `group.ts` · `regions.ts` · `products.ts` · `services.ts` · `assets.ts` | **Real CARBONOZ content** from carbonoz.com, heliosnrg.eu, en.solaire.mu, caytech.biz and en.lixibattery.com: group statement, Data Hub, regional businesses and contacts, solar kits, LIXI specifications, services, and the image registry (with source per image). |
| `src/content/site.ts` | **Labels, navigation, SEO, platform facts.** Verified statements, product status (`platform` / `concept` / `pending`), LIXI specifications, sectors, navigation, SEO copy. Empty (`null`) fields render as "To be confirmed" or are hidden. |
| `src/content/meta.ts` | Per-page metadata helper and the route list used by the sitemap. |
| `src/sim/` | The deterministic demo engine (see below). |
| `src/components/sections/` | Page sections (Hero, FlowStory, SolarBMS, Architecture, …). Pages in `src/app/` compose them. |
| `src/components/homeos/` | Port of the Carbonoz app design system (login.carbonoz.com `src/design`, `features/dashboard/EnergyFlow.tsx`, solar cards): Card, StatusBadge, Tabs, MetricCard, HouseIllustration, FlowDiagram, BatteryCard, InverterCard, cell tiles, chart panels. Every product surface and live animation uses it inside a `.homeos` scope (app tokens + Inter). |
| `src/components/app/` | The embedded app (HomeOS shell, overview, energy, charts, battery & BMS, inverters, forecast, events, SolarAutopilot, system) running on the simulation. |
| `src/components/viz/` | Website-level diagrams: flow lines (app style), forecast time chart, sparklines, simulation controls. |
| `src/app/globals.css` | Design tokens (colours, type, motion timings) and base utilities. |

## Demo engine (`src/sim`)

Every live value on the site comes from one simulated demo site — never `Math.random()` per frame.

- `model.ts` — physics: sun curve with deterministic clouds, load profile with appliance runs, LFP battery with charge taper and efficiency, export limit, peak shaving, and the planner (off-peak top-up only when the forecast surplus can't refill the battery; late-afternoon hold for the evening peak). Sign convention as the platform: battery `+` = charging, grid `+` = import.
- `telemetry.ts` — derived devices: 3 packs × 16 cells (OCV curve, per-cell fingerprint, balancing), inverters, alarms.
- `store.ts` — the single live store (4 ticks/s, paused when the tab is hidden), week of history, event detection from state transitions, controls and fault scenarios.
- `forecast.ts`, `decision.ts`, `story.ts`, `scenarios.ts` — 7-day forecast and plan vs. baseline, "what the strategy is doing and why", the scroll-story day, application scenarios.
- `model.test.ts` — determinism, energy balance, bounds, outage, cell alarms, plan never worse than baseline.

## Content still needed from CARBONOZ

Logo: `public/brand/` is generated from the Carbonoz logo used by the app (`offsettingdashboard/src/assets/1.jpg`); a vector version would sharpen small sizes.

Theme: dark and light (`html[data-theme]`), light by default; dark when the visitor picks it with the sun/moon toggle (saved as `carbonoz-theme`). Light product surfaces use the app's own light tokens.

See `src/content/site.ts` (`TODO` / `null`): public contact email (the contact form only works once `COMPANY.contactEmail` is set), company details, LIXI datasheet values and imagery, confirmed sectors, SolarAutopilot / control availability, canonical domain (assumed `https://carbonoz.com`).
