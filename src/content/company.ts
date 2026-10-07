/**
 * CARBONOZ company copy — VERIFIED.
 *
 * Source: carbonoz.com (fetched 1 October 2026). Grammar lightly edited for
 * the web; factual meaning unchanged. Update here, not in components.
 */

export const LINKS = {
  carbonoz: 'https://carbonoz.com/',
  platform: 'https://login.carbonoz.com',
  helios: 'https://heliosnrg.eu/',
  solaire: 'https://en.solaire.mu/',
  caytech: 'https://caytech.biz/',
  lixi: 'https://en.lixi.de/',
  lixiBattery: 'https://en.lixibattery.com/',
  solarAssistant: 'https://solar-assistant.io/',
  solarAutopilot: 'https://solarautopilot.com',
  calendly: 'https://calendly.com/felix-zuckschwerdt-diplomatic-council/meeting-felix-zuckschwerdt',
  linkedin: 'https://www.linkedin.com/company/carbonoz',
} as const

export const CONTACTS = {
  solaire: { label: 'Solaire Mauritius', email: 'mu-office@carbonoz.com', phone: '+230 70181147', tel: '+23070181147' },
  caytech: { label: 'CAYTECH Cayman Islands', email: 'support@caytech.biz', phone: '+1-345-928-7623', tel: '+13459287623', whatsapp: 'https://wa.me/13459287623' },
} as const

export const COPY = {
  /** Core group statement. */
  statement:
    'CARBONOZ group offers easy to use renewable and battery energy solutions. We are specialised in designing, installing and controlling hybrid AC/DC solar inverter systems with 48V, 200V and 400V battery storage systems. Our custom-tailored tools monitor and aggregate data on system performance to help owners and investors to make informed decisions every day.',

  tagline: 'Renewable Energy Group for Europe, Africa and the Caribbean',

  solarStorage:
    'The future of energy is closely tied to lithium batteries due to their high energy density. They are crucial for the EV revolution and renewable energy integration, enabling efficient storage and electricity trade. Continuous advancements in technology are driving down costs and increasing performance, while their environmental benefits support a reduction in greenhouse gas emissions. They are essential in the transition to a more sustainable and energy-efficient future.',
  solarStorageCta: 'Meet our low- and high-voltage LIXI battery solutions. Available in the EU, Africa and the Caribbean.',

  europe:
    'Solar plants lose efficiency and revenue potential over time. We repower existing PV systems by offering turn-key solutions including finance, upgrading inverters, optimising system design and modernising monitoring. We are improving plant performance to current state-of-the-art technology. By integrating battery energy storage (BESS), we transform traditional solar assets into flexible energy systems. This allows owners to unlock new revenue streams through energy trading, peak shaving, higher self-consumption and backup capability.',

  solarAutopilot:
    'Solar Autopilot is offering homeowners and commercial operators a comprehensive suite of tools for inverter automation and energy performance monitoring. We are your first line of defence against overconsuming devices, drowning batteries and cloudy days. We allow you to set customised alerts to be sent to any device. Learn more about its rich feature set, its Home Assistant / Solar Assistant integrations and the many supported hybrid inverter models and batteries.',

  caribbean:
    'CAYTECH Cayman Islands is a CARBONOZ group member and your trustworthy Solar System partner in the Cayman Islands. We install your on- and off-grid Solar Hybrid System including an affordable, reliable and efficient battery storage to make your electricity bill fun again. Work with us on a more eco-friendly way of living in the Cayman Islands.',

  africa:
    'Solaire Mauritius is a CARBONOZ group member committed in spearheading the renewable energy revolution in Africa. As a solar installer we offer affordable hybrid systems including powerful lithium storage systems from market leader CATL. Many of our customers manage a self-sufficiency rate of 90% including EV charging facility. Be part of the future of decentralised energy now!',

  dataIsKey:
    'The push toward sustainability is on its way to change society as much as the industrial revolution did in the 19th century and the Internet revolution did in the 20th century. Data increasingly becomes a commodity as we pivot towards a more sustainable and resilient future. The vast reservoirs of data available today provide unparalleled insights into energy performance and environmental impact, allowing us to identify areas of improvement and implement effective solutions. As industries evolve and societies grow, data serves as the bedrock upon which we can build strategies that benefit us and our planet.',

  dataHub:
    'CARBONOZ Data Hub is empowering renewable operators, investors as well as financial institutions by providing data-driven project insights.',
  dataHubSensors:
    'Our offered soft- and hardware sensors collect real-time project data from residential and commercial hybrid inverters, battery storage systems, and third-party solutions to provide verified performance data with integrity. Data is collected through the participation of private solar system owners as well as through our solar system installer partnership programme.',
  dataHubApplications:
    'Our platform technology can be applied on commercial-grade renewable energy projects and help build innovative financing models and decentralised energy storage solutions based on available real-time performance data. We can also assist in contributing data for regulatory ESG reportings and Carbon tax filings.',

  makingItReal:
    'We are addressing scalability, accountability, and just transition concerns to ensure projects’ long-term effectiveness and sustainability. Our products help to unite public and private interests. We encourage use of market mechanisms and help to amplify funding through de-risking, co- and crowd investment.',

  impactNow:
    'CARBONOZ actively drives the clean energy transition. By leveraging data-driven performance indicators as well as voluntary and mandatory carbon markets, philanthropic resources, and collaboration between governments and the private sector, our platform aims to de-risk fossil-free energy investments, ultimately contributing to global efforts in combating climate change.',
  impactNow2:
    'We take great pride in our commitment to environmental sustainability. With our expertise, organisations and property owners can effectively reduce their carbon footprint, contribute to global climate goals, and achieve long-term sustainability objectives.',
} as const

/** Data Hub features, verbatim from carbonoz.com "Hub Features". */
export const HUB_FEATURES = [
  { id: 'verified', title: 'Verified project data', text: 'Verified project data can be traded on voluntary Carbon markets through trusted third parties.', demo: { label: 'How data arrives, once', href: '/technology/#architecture' } },
  { id: 'warehousing', title: 'Certifications & data warehousing', text: 'Outsource certifications and data warehousing capabilities through us.', demo: { label: 'Raw and normalised storage', href: '/technology/#architecture' } },
  { id: 'automation', title: 'Automation algorithms', text: 'Tested automation algorithms and predictive analyses AI engines.', demo: { label: 'See the planner reason', href: '/intelligence/#intelligence' } },
  { id: 'antifraud', title: 'Anti-fraud & asset monitoring', text: 'Anti-fraud and real-time asset monitoring capabilities.', demo: { label: 'Live event stream', href: '/platform/#monitoring' } },
  { id: 'maintenance', title: 'Predictive maintenance', text: 'Predictive maintenance monitoring.', demo: { label: 'Weak-cell detection', href: '/platform/solarbms/#solarbms' } },
  { id: 'api', title: 'API access', text: 'API to access vast project data for investment research and ratings.', demo: { label: 'The ingestion contract', href: '/technology/' } },
  { id: 'analysis', title: 'Tailor-made analysis', text: 'Tailor-made analysing tools for streamlined data analyses. Run models against peer groups.', demo: { label: 'History and charts', href: '/demo/' } },
  { id: 'advisory', title: 'Energy-performance advisory', text: 'Energy-performance project advisory toolkit.', demo: { label: 'Forecast and plan', href: '/intelligence/#forecast' } },
] as const
