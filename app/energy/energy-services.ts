export type EnergyService = {
  slug: string;
  icon: string;
  title: string;
  tagline: string;
  description: string;
  body: string;
  highlights: string[];
  image: string;
  gradient: string;
  accentColor: string;
};

export const energyServices: EnergyService[] = [
  {
    slug: "solar-energy-solutions",
    icon: "☀️",
    title: "Solar Energy Solutions",
    tagline: "Harness the power of the sun",
    description:
      "Design, installation, and maintenance of solar power systems tailored to residential, commercial, and industrial needs — from rooftop installations to large-scale solar farms.",
    body: `At Ameefar Energy, we are dedicated to transforming the future of energy with cutting-edge renewable solutions. Our solar services focus on harnessing the power of the sun to provide clean, efficient, and sustainable energy.

We offer end-to-end solar project delivery — from the initial site survey and system design through to installation, grid connection, and ongoing preventive maintenance. Whether you need a modest rooftop system for a family home or a multi-megawatt utility-scale plant, our engineers size and configure every project for maximum yield and lowest lifecycle cost.

Our monitoring platform gives operators real-time visibility into generation, consumption, and export — enabling proactive fault detection and remote diagnostics before issues affect output.`,
    highlights: [
      "Residential Rooftop Installations",
      "Commercial & Industrial Systems",
      "Utility-Scale Solar Farms",
      "Off-Grid & Hybrid Solutions",
      "Solar + Battery Storage",
      "Performance Monitoring & Maintenance",
    ],
    image: "https://ameefarenergy.com/energy/wp-content/uploads/2021/10/solar.jpg",
    gradient: "from-amber-500 to-orange-500",
    accentColor: "#f59e0b",
  },
  {
    slug: "wind-energy-solutions",
    icon: "💨",
    title: "Wind Energy Solutions",
    tagline: "Capture the wind, power the future",
    description:
      "Development and deployment of wind turbine systems that capture wind energy to generate electricity — from site assessment and turbine selection to installation and ongoing support.",
    body: `Ameefar Energy's wind solutions bring reliable, emission-free power generation to communities and businesses across Africa. We combine global turbine technology with deep local knowledge to identify the best sites, select the right equipment, and deliver projects on time and on budget.

Our wind assessment teams conduct detailed resource surveys using modern anemometry and modelling tools, ensuring every project is bankable and financially sound from day one. We manage all permitting, civil works, turbine erection, grid connection, and commissioning — handing over a fully operational asset.

Post-commissioning, our operations and maintenance teams keep turbines running at peak performance through planned servicing schedules and rapid-response field support.`,
    highlights: [
      "Wind Resource Assessment & Feasibility",
      "Residential Small-Scale Turbines",
      "Commercial & Industrial Wind Projects",
      "Hybrid Wind-Solar Systems",
      "Grid-Connected & Off-Grid Solutions",
      "Turbine Operations & Maintenance",
    ],
    image: "https://ameefarenergy.com/energy/wp-content/uploads/2024/09/wind.jpg",
    gradient: "from-sky-400 to-blue-600",
    accentColor: "#38bdf8",
  },
  {
    slug: "battery-manufacturing-plant",
    icon: "🔋",
    title: "Battery Manufacturing Plant",
    tagline: "Store energy. Deliver reliability.",
    description:
      "Advanced battery manufacturing for energy storage systems that complement renewable installations — enabling reliable round-the-clock clean energy delivery for homes, businesses, and the grid.",
    body: `Energy storage is the missing link in Africa's renewable transition. Ameefar Energy's battery manufacturing facility produces high-quality lithium-ion battery packs engineered for tropical climates, variable load profiles, and limited grid infrastructure.

Our batteries are used in residential backup systems, commercial UPS applications, and large grid-scale storage installations that smooth renewable intermittency and reduce peak-demand charges. Every pack undergoes rigorous electrical and thermal testing before leaving the facility.

We also offer battery-as-a-service models that allow operators to access storage capacity without upfront capital, paying only for the energy services delivered.`,
    highlights: [
      "Lithium-Ion Battery Pack Manufacturing",
      "Residential Backup Power Systems",
      "Commercial & Industrial UPS Solutions",
      "Grid-Scale Energy Storage",
      "Battery-as-a-Service (BaaS) Models",
      "Battery Lifecycle Management & Recycling",
    ],
    image: "https://ameefarenergy.com/energy/wp-content/uploads/2024/09/WhatsApp-Image-2024-09-19-at-2.59.30-PM.jpeg",
    gradient: "from-emerald-400 to-green-600",
    accentColor: "#34d399",
  },
  {
    slug: "electric-motor-bike-manufacturing",
    icon: "🛵",
    title: "Electric Motor Bike Manufacturing",
    tagline: "Clean mobility, made in Africa",
    description:
      "Locally manufactured electric motor bikes designed for African urban and rural mobility — reducing emissions while supporting sustainable transportation ecosystems and creating local jobs.",
    body: `Africa's roads demand a different kind of electric bike — one built for high ambient temperatures, unpaved roads, heavy daily usage, and charging networks that are still developing. Ameefar Energy's electric motor bikes are engineered and assembled locally with exactly those realities in mind.

Our range covers urban commuter models optimised for city delivery, heavier cargo variants for last-mile logistics, and rugged terrain editions for rural access. All models feature swappable battery packs so riders are never stranded waiting for a charge.

By manufacturing in Africa, we keep production costs competitive, create skilled engineering and assembly jobs, and ensure a responsive local supply chain for parts and service.`,
    highlights: [
      "Urban Commuter E-Bikes",
      "Cargo & Last-Mile Delivery Models",
      "Rugged Rural-Terrain Editions",
      "Swappable Battery System",
      "Fleet Solutions for Businesses & Logistics",
      "After-Sales Service & Spare Parts",
    ],
    image: "https://ameefarenergy.com/energy/wp-content/uploads/2024/09/WhatsApp-Image-2024-09-19-at-2.59.30-PM.jpeg",
    gradient: "from-violet-500 to-purple-600",
    accentColor: "#8b5cf6",
  },
  {
    slug: "aviation-transportation-services",
    icon: "✈️",
    title: "Aviation Transportation Services",
    tagline: "Connecting Africa sustainably",
    description:
      "Sustainable aviation solutions and charter services supporting businesses, cargo movement, and passenger connectivity — with a focus on energy efficiency across the African continent.",
    body: `Ameefar Energy's aviation division bridges the gap between remote energy project sites and urban centres, providing reliable charter and cargo air services that keep projects running on schedule.

We work with energy developers, mining operators, and humanitarian organisations that need dependable, cost-effective air access to locations poorly served by commercial routes. Our fleet and partner network cover a wide range of aircraft categories, from light turboprops for short strips to larger cargo freighters.

Sustainability is central to our aviation operations — we actively track fuel burn, invest in efficiency upgrades, and are engaged with initiatives to pilot sustainable aviation fuel (SAF) on key routes.`,
    highlights: [
      "Charter Flight Services (Passenger & VIP)",
      "Cargo & Air Freight",
      "Remote Site Access for Energy Projects",
      "Aviation Fuel Efficiency Programs",
      "Sustainable Aviation Fuel (SAF) Initiatives",
      "Regional African Connectivity",
    ],
    image: "https://ameefarenergy.com/energy/wp-content/uploads/2024/09/WhatsApp-Image-2024-09-19-at-2.59.30-PM.jpeg",
    gradient: "from-cyan-400 to-teal-600",
    accentColor: "#22d3ee",
  },
  {
    slug: "electric-car-charging-terminals",
    icon: "⚡",
    title: "Electric Car Charging Terminals",
    tagline: "Power your journey, anywhere",
    description:
      "Installation and management of EV charging infrastructure across commercial centres, hotels, and public spaces — accelerating Africa's electric vehicle adoption.",
    body: `As electric vehicles gain momentum across Africa, the need for reliable public and semi-public charging is becoming critical. Ameefar Energy designs and deploys EV charging terminals that serve retail parks, hotels, office campuses, fuel forecourts, and public car parks.

Our turnkey service covers site selection and electrical assessment, hardware procurement, civil and electrical installation, network configuration, and handover. Chargers are integrated with a cloud management platform that provides real-time availability, remote diagnostics, access control, and billing.

We offer both outright purchase and a charging-as-a-service model where Ameefar owns and operates the infrastructure, sharing revenue with the site host.`,
    highlights: [
      "Public & Semi-Public Charging Stations",
      "Commercial Fleet Charging Hubs",
      "Hotel, Mall & Office Campus Deployments",
      "Cloud-Based Charger Management Platform",
      "Real-Time Availability & Remote Diagnostics",
      "Revenue-Share Charging-as-a-Service Model",
    ],
    image: "https://ameefarenergy.com/energy/wp-content/uploads/2024/09/WhatsApp-Image-2024-09-19-at-2.59.30-PM.jpeg",
    gradient: "from-yellow-400 to-lime-500",
    accentColor: "#facc15",
  },
  {
    slug: "evse-installation-solutions",
    icon: "🔌",
    title: "EVSE Installation Solutions",
    tagline: "Professional EV infrastructure deployment",
    description:
      "End-to-end Electric Vehicle Supply Equipment installation — from network planning and hardware supply to certified commissioning, compliance, and ongoing maintenance programs.",
    body: `EVSE installation is a specialised discipline that sits at the intersection of electrical engineering, network connectivity, and user experience design. Ameefar Energy's certified installation teams have the expertise to deliver Level 1, Level 2, and DC Fast Charging infrastructure to any commercial or public specification.

Every project begins with a detailed site survey covering electrical capacity, cable routing, civil requirements, and access control needs. We then design a system that meets current demand while leaving headroom for future expansion — avoiding costly retrofits as EV adoption grows.

Our post-installation service includes preventive maintenance contracts, software updates, fault response SLAs, and annual compliance inspections to keep infrastructure safe, operational, and compliant.`,
    highlights: [
      "Level 1, 2 & DC Fast Charger Installation",
      "Site Survey & Electrical Capacity Planning",
      "Cable Management & Civil Works",
      "Certified Commissioning & Compliance",
      "Charger Network Software Configuration",
      "Preventive Maintenance & Fault Response SLAs",
    ],
    image: "https://ameefarenergy.com/energy/wp-content/uploads/2024/09/WhatsApp-Image-2024-09-19-at-2.59.30-PM.jpeg",
    gradient: "from-rose-400 to-pink-600",
    accentColor: "#fb7185",
  },
];
