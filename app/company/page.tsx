"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { LogoutButton } from "@/components/auth/LogoutButton";
import SiteFooter from "@/components/SiteFooter";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectIsAuthenticated } from "@/store/auth/authSelectors";
import { FeaturedListings } from "@/components/product/FeaturedListings";
import { FeaturedArticles } from "@/components/content/FeaturedArticles";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

/* ─── Data ─────────────────────────────────────────── */

const trustSignals = [
  { label: "KYC Verified Suppliers", icon: "✦" },
  { label: "International Escrow Protected", icon: "✦" },
  { label: "Mandatory On-Site Inspections", icon: "✦" },
  { label: "Enforceable Quality Contracts", icon: "✦" },
  { label: "2M Tonnes Recycled", icon: "✦" },
];

const pillars = [
  {
    number: "01",
    title: "Vetted African Partners",
    tagline: "Every supplier is verified before they can list.",
    stat: "100%",
    statLabel: "On-the-ground verification",
    highlight: "Facility audits & comprehensive background checks",
    text: "Every African supplier undergoes rigorous on-the-ground verification — facility audits and comprehensive background checks — before any listing goes live. We do not allow anonymous or unverified sellers on our platform.",
    icon: "🛡️",
    img: "/images/heroSlides/recycle.jpg",
  },
  {
    number: "02",
    title: "Ironclad Escrow",
    tagline: "Your capital stays protected until conditions are met.",
    stat: "100%",
    statLabel: "Funds protected in escrow",
    highlight: "Release only after inspection & port loading confirmation",
    text: "Your capital is protected in secure international escrow accounts. Funds release only after materials pass physical inspection and port loading is confirmed. Neither party can access the funds unilaterally.",
    icon: "🔒",
    img: "/images/heroSlides/ban3.jpg",
  },
  {
    number: "03",
    title: "Guaranteed Quality",
    tagline: "If the inspection fails, the trade is halted.",
    stat: "Zero",
    statLabel: "Compromise on quality standards",
    highlight: "Independent pre-shipment inspection on every deal",
    text: "If the independent pre-shipment inspection doesn't match your contract, the trade is halted and your funds stay protected. No exceptions. You only pay for material that meets your specifications.",
    icon: "✅",
    img: "/images/heroSlides/ban2.jpeg",
  },
];

// Exact products from ameefarenergy.com/what-we-sell/
const whatWeSell = [
  {
    name: "rPET Resins",
    tagline: "Premium recycled PET resins",
    desc: "Premium materials derived from recycled plastic bottles using an advanced bottle-to-bottle (EREMA) recycling process. Food-grade quality available.",
    img: "/images/whatWeSell/p3.jpg",
    color: "from-teal-500 to-emerald-600",
    badge: "Best Seller",
  },
  {
    name: "PET Flakes",
    tagline: "High-grade washed PET flakes",
    desc: "Sourced from used water and soft drink bottles, available in various quality grades — clear, mixed colour, and washed — for multiple industrial applications.",
    img: "/images/whatWeSell/p2.jpg",
    color: "from-blue-500 to-cyan-600",
    badge: "High Demand",
  },
  {
    name: "UBC",
    tagline: "Used beverage cans — aluminium",
    desc: "Our Aluminum UBC is sourced from trusted suppliers, ensuring superior quality and a reliable, consistent supply for smelting operations worldwide.",
    img: "/images/whatWeSell/ubc.jpg",
    color: "from-slate-600 to-zinc-700",
    badge: "Global Export",
  },
  {
    name: "rPET Bottles",
    tagline: "Recycled PET bottle feedstock",
    desc: "Post-consumer PET bottles processed, sorted, and baled for direct reuse in manufacturing and packaging applications across industries.",
    img: "/images/Material_PET_bottles.jpg",
    color: "from-emerald-500 to-green-600",
    badge: "Sustainable",
  },
];

// Exact materials from ameefarenergy.com/what-we-buy/
const whatWeBuy = [
  {
    name: "PET Bottles",
    tagline: "Post-consumer PET bottles",
    desc: "We purchase used PET bottles — baled or loose — from collectors, recyclers, and municipalities across Africa. Competitive pricing, reliable offtake.",
    img: "/images/whatWeBuy/b1.jpg",
    color: "from-sky-500 to-blue-600",
  },
  {
    name: "PET Chips & Flakes",
    tagline: "Processed PET scrap",
    desc: "We buy washed and unwashed PET chips and flakes, suitable for reprocessing into virgin-grade rPET resins. Both clear and mixed grades accepted.",
    img: "/images/whatWeBuy/b3.jpg",
    color: "from-teal-500 to-cyan-600",
  },
  {
    name: "UBC Bales",
    tagline: "Used beverage can bales",
    desc: "We source aluminium UBC bales from verified suppliers — clean, shredded or whole, ready for smelting. Consistent volumes, fair market pricing.",
    img: "/images/whatWeBuy/b2.jpg",
    color: "from-slate-500 to-gray-700",
  },
];


const otherMaterials = [
  { name: "Recovered Paper", types: "OCC · ONP · Mixed Paper", desc: "Old corrugated containers, newsprint, and mixed office paper — feedstock for recycled paperboard, tissue, and packaging.", icon: "📄" },
  { name: "Aluminium Ingot", types: "A380 · ADC12 · 6063", desc: "Cast and extruded aluminium ingot produced from secondary smelting. Used in automotive, construction, and consumer goods.", icon: "🔩" },
  { name: "UBC Cans", types: "Used Beverage Cans", desc: "Post-consumer aluminium beverage cans — a high-value, infinitely recyclable material stream with strong global demand.", icon: "🥫" },
  { name: "Ferrous Metals", types: "HMS 1&2 · Shredded", desc: "Heavy melting steel and shredded scrap — the backbone of electric arc furnace steelmaking. Sourced from end-of-life vehicles.", icon: "⚙️" },
  { name: "Tyres & Rubber", types: "End-of-Life Tyres · Rubber Crumb", desc: "Used tyres processed into crumb rubber, TDF (tyre-derived fuel), and reclaimed material for asphalt, moulded goods.", icon: "🔘" },
];

const heroSlides = [
  {
    bg: "/images/heroSlides/ban2.jpeg",
    badge: "Ameefar Energy Africa",
    title: "Powering the Circular Economy",
    subtitle: "From Waste to Resource",
    text: "Ameefar Energy Africa is a passionate advocate for sustainable recycling, driven by the belief that waste does not exist. We connect buyers and sellers of recyclable commodities across the globe.",
    cta: "Visit Marketplace",
    ctaLink: "/product",
    secondaryCta: "Start Buying & Selling",
    secondaryLink: "/auth/register",
    gradient: "from-[#001a1a] via-[#001a1a]/80 to-transparent",
    accent: "from-emerald-400 to-teal-300",
  },
  {
    bg: "/images/heroSlides/ban3.jpg",
    badge: "Reimagining Waste",
    title: "Rebuilding the Future",
    subtitle: "Circular Economy in Action",
    text: "We strive to create a circular economy where waste is not just discarded, but repurposed, recycled, and reintegrated into the production cycle. Every tonne diverted from landfill is a win for the planet.",
    cta: "Explore Materials",
    ctaLink: "/product",
    secondaryCta: "Learn More",
    secondaryLink: "/about",
    gradient: "from-[#0a1a1a] via-[#0a1a1a]/75 to-transparent",
    accent: "from-amber-400 to-orange-300",
  },
  {
    bg: "/images/heroSlides/recycle.jpg",
    badge: "100% Secure Trading",
    title: "Secure African Trade. Guaranteed Quality.",
    subtitle: "Protected Every Step",
    text: "The first B2B recycling marketplace built on the African Trade Protection protocol — with mandatory inspections, international escrow, and verified suppliers on every deal.",
    cta: "Visit Marketplace",
    ctaLink: "/product",
    secondaryCta: "Start Buying & Selling",
    secondaryLink: "/auth/register",
    gradient: "from-[#001a1a] via-[#001a1a]/80 to-transparent",
    accent: "from-[#00bfa5] to-[#80cbc4]",
  },

];

/* ─── Hero Carousel ─────────────────────────────────── */

function HeroCarousel({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 6000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(index);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
    setTimeout(() => setIsAnimating(false), 700);
  };

  return (
    <section className="relative min-h-[700px] md:min-h-[780px] overflow-hidden bg-[#001a1a]" style={{ paddingTop: 0 }}>
      {/* Slides */}
      {heroSlides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 10 : 0,
            transition: "opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <img
            src={slide.bg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: i === current ? "scale(1)" : "scale(1.07)",
              transition: "transform 6s ease-out",
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      {/* Ambient orbs */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-teal-500/8 blur-[140px] animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[140px] animate-pulse" style={{ animationDuration: "7s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 md:px-12 h-full min-h-[700px] md:min-h-[780px] flex items-center pt-20">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="w-full"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.8s ease-out 0.15s, transform 0.8s ease-out 0.15s",
              position: i === current ? "relative" : "absolute",
              pointerEvents: i === current ? "auto" : "none",
            }}
          >
            <div className="max-w-[680px]">
              {/* Badge */}
              <div
                className={`${jetbrains.className} inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-[11px] text-white/80 tracking-widest uppercase mb-5`}
                style={{ animation: i === current ? "heroFadeUp 0.6s ease-out 0.1s both" : "none" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {slide.badge}
              </div>

              {/* Subtitle */}
              <p
                className={`${jetbrains.className} text-[12px] font-medium tracking-[0.22em] text-white/50 uppercase`}
                style={{ animation: i === current ? "heroFadeUp 0.65s ease-out 0.25s both" : "none" }}
              >
                {slide.subtitle}
              </p>

              {/* Headline */}
              <h1
                className={`${hanken.className} mt-3 text-[40px] font-extrabold leading-[1.08] tracking-tight text-white md:text-[62px] lg:text-[72px]`}
                style={{ animation: i === current ? "heroFadeUp 0.75s ease-out 0.35s both" : "none" }}
              >
                {slide.title.split(".").map((part, j, arr) => (
                  <span key={j}>
                    {part}
                    {j < arr.length - 1 && (
                      <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>.</span>
                    )}
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </h1>

              {/* Body */}
              <p
                className="mt-6 max-w-[560px] text-[16px] md:text-[17px] leading-relaxed text-slate-300/90"
                style={{ animation: i === current ? "heroFadeUp 0.75s ease-out 0.5s both" : "none" }}
              >
                {slide.text}
              </p>

              {/* CTAs */}
              <div
                className="mt-9 flex flex-wrap items-center gap-4"
                style={{ animation: i === current ? "heroFadeUp 0.75s ease-out 0.65s both" : "none" }}
              >
                <Link
                  href={slide.ctaLink}
                  className={`${hanken.className} inline-flex items-center gap-2.5 rounded-xl bg-[#beebeb] px-8 py-3.5 text-[14px] font-bold text-[#002627] shadow-[0_0_40px_rgba(190,235,235,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#a3d6d6] hover:shadow-[0_0_60px_rgba(190,235,235,0.45)]`}
                >
                  {slide.cta}
                  <svg fill="none" height="16" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                {isAuthenticated ? (
                  <Link
                    href="/profile"
                    className="inline-flex items-center rounded-xl border border-white/25 bg-white/8 px-8 py-3.5 text-[14px] font-semibold !text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href={slide.secondaryLink}
                    className="inline-flex items-center rounded-xl border border-white/25 bg-white/8 px-8 py-3.5 text-[14px] font-semibold !text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5"
                  >
                    {slide.secondaryCta}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="group relative"
          >
            <div
              className={`rounded-full transition-all duration-500 ${i === current
                ? "w-10 h-2.5 bg-[#beebeb] shadow-[0_0_12px_rgba(190,235,235,0.5)]"
                : "w-2.5 h-2.5 bg-white/25 hover:bg-white/50"
                }`}
            />
          </button>
        ))}
      </div>

      {/* Arrow controls */}
      <div className="absolute bottom-8 right-6 md:right-12 z-20 flex items-center gap-2.5">
        {[
          { dir: -1, path: "M15.75 19.5L8.25 12l7.5-7.5" },
          { dir: 1, path: "M8.25 4.5l7.5 7.5-7.5 7.5" },
        ].map(({ dir, path }) => (
          <button
            key={dir}
            onClick={() => goTo((current + dir + heroSlides.length) % heroSlides.length)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/8 backdrop-blur-sm text-white/60 hover:text-white hover:bg-white/15 hover:border-white/40 transition-all duration-200"
          >
            <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
              <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
          </button>
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

/* ─── Animated section wrapper ──────────────────────── */
function FadeInSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.75s ease-out ${delay}ms, transform 0.75s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────── */

export default function Home() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased`}>

      {/* ── NAV ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isFooterVisible ? "-translate-y-full" : "translate-y-0"
          } ${scrolled
            ? "border-b border-slate-100 bg-white/98 backdrop-blur-xl shadow-sm"
            : "border-b border-white/10 bg-transparent backdrop-blur-sm"
          }`}
      >
        <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 shrink-0 group">
            <div className="relative">
              <div className={`absolute inset-0 rounded-xl bg-emerald-500/20 blur-md transition-all duration-300 ${scrolled ? "opacity-0" : "opacity-100 group-hover:opacity-100 group-hover:bg-emerald-500/30 group-hover:blur-lg"}`} />
              <Image
                alt="Ameefar logo"
                className="relative rounded-xl object-cover ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105"
                height={44}
                width={44}
                src="/ameefarLogo.png"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[18px] font-bold tracking-tight transition-colors duration-300 ${scrolled ? "text-[#002627]" : "text-white drop-shadow-sm"}`}>
                AMEEFAR
              </span>
              <span className={`${jetbrains.className} text-[9px] font-medium tracking-[0.16em] uppercase mt-0.5 transition-colors duration-300 ${scrolled ? "text-[#006d40]" : "text-emerald-300"}`}>
                Energy Africa
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={`hidden gap-7 md:flex text-[13.5px] font-medium transition-colors duration-300 ${scrolled ? "text-slate-500" : "text-white/80"}`}>
            {[
              { id: "about", label: "About Us" },
              { id: "protocol", label: "Protocol" },
              { id: "materials", label: "Materials" },
              { id: "news", label: "News" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                className={`transition-colors hover:text-emerald-500 ${scrolled ? "hover:text-emerald-600" : "hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {mounted && isAuthenticated && user ? (
              <>
                <span className={`${jetbrains.className} text-xs font-medium transition-colors duration-300 ${scrolled ? "text-[#006d40]" : "text-emerald-300"}`}>
                  {user.first_name}
                </span>
                <LogoutButton className={`rounded-lg border px-4 py-1.5 text-[13px] font-medium transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${scrolled ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/25 bg-white/10 text-white hover:bg-white/20"}`} />
              </>
            ) : (
              <Link
                href="/marketplace"
                className={`${hanken.className} rounded-xl px-6 py-2.5 text-[13px] font-bold transition-all duration-300 hover:-translate-y-0.5 ${scrolled ? "bg-[#002627] !text-white hover:bg-[#003a3c] shadow-sm" : "bg-[#beebeb] text-[#002627] hover:bg-white shadow-[0_0_24px_rgba(190,235,235,0.35)]"}`}
              >
                Visit Marketplace
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>

        {/* ── HERO ── */}
        <HeroCarousel isAuthenticated={mounted && isAuthenticated} />

        {/* ── FEATURED LISTINGS ── */}
        <FeaturedListings />

        {/* ── FEATURED ARTICLES ── */}
        <FeaturedArticles />

        {/* ── TRUST BAR ── */}
        <section className="border-b border-slate-100 bg-gradient-to-r from-[#f0faf9] via-white to-[#f0faf9] overflow-hidden relative">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 md:px-12 md:justify-between">
            {trustSignals.map((signal, i) => (
              <div
                key={signal.label}
                className="flex items-center gap-2.5 group"
                style={{ animation: `trustSlide 0.5s ease-out ${i * 80}ms both` }}
              >
                <span className="text-[#006d40] text-xs group-hover:scale-125 transition-transform duration-200">✦</span>
                <span className={`${jetbrains.className} text-[11.5px] font-medium tracking-wide text-slate-600 group-hover:text-[#006d40] transition-colors duration-200`}>
                  {signal.label}
                </span>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes trustSlide {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </section>




        <section id="materials" className="bg-[#0a1a1a] px-6 py-28 md:px-12 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-[#006d40]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/3 rounded-full bg-[#00bfa5]/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-[1440px]">
            <FadeInSection className="max-w-2xl mx-auto text-center mb-16">

              <h2 className={`${hanken.className} mt-6 text-[40px] font-bold leading-tight text-white md:text-[52px]`}>
                What We{" "}
                <span className="bg-gradient-to-r from-[#00bfa5] to-emerald-300 bg-clip-text text-transparent">Trade</span>
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-slate-400 max-w-xl mx-auto">
                We trade in all seven resin categories — from PET bottles to mixed engineering polymers — plus recovered paper, metals, and more.
              </p>
            </FadeInSection>

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4 mb-16">
              {whatWeSell.map((item, i) => (
                <FadeInSection key={item.name} delay={i * 100}>
                  <Link href="/marketplace" className="group block h-full">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-emerald-200/80 hover:shadow-[0_20px_60px_rgba(0,109,64,0.12)] h-full flex flex-col">
                      {/* Image area */}
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-55 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-70`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        {/* Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`${jetbrains.className} inline-block rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-wider text-[#006d40]`}>
                            {item.badge}
                          </span>
                        </div>
                        {/* Tagline pill */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className={`${jetbrains.className} inline-block rounded-full border border-white/25 bg-white/15 backdrop-blur-sm px-3 py-1 text-[10px] font-medium tracking-wider text-white/90`}>
                            {item.tagline}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className={`${hanken.className} text-[20px] font-bold text-[#002627]`}>{item.name}</h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-500 flex-1">{item.desc}</p>
                        <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-[#006d40] translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                          Enquire now
                          <svg fill="none" height="12" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeInSection>
              ))}
            </div>


            {/* Beyond Plastics */}
            <div className="mt-16 pt-14 border-t border-white/10">
              <FadeInSection className="flex flex-wrap items-end justify-between gap-4 mb-10">
                <div>
                  <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#00bfa5] uppercase font-medium`}>Beyond Plastics</span>
                  <h3 className={`${hanken.className} mt-1 text-[28px] font-bold text-white md:text-[36px]`}>
                    Paper, Metals & More
                  </h3>
                </div>
                <Link
                  href="/marketplace"
                  className={`${jetbrains.className} text-[12px] font-medium text-[#00bfa5] underline underline-offset-4 hover:text-white transition-colors`}
                >
                  Browse all listings →
                </Link>
              </FadeInSection>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {otherMaterials.map((material, i) => (
                  <FadeInSection key={material.name} delay={i * 80}>
                    <Link href="/marketplace" className="group block">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:bg-white/[0.07] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl">
                            {material.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`${hanken.className} text-[17px] font-bold text-white`}>{material.name}</h4>
                            <p className="text-[10px] font-mono font-medium text-[#00bfa5] tracking-wider mt-0.5">{material.types}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{material.desc}</p>
                        <p className="mt-3 text-[12px] font-semibold text-[#00bfa5] opacity-0 transition-all group-hover:opacity-100 inline-flex items-center gap-1">
                          View listings →
                        </p>
                      </div>
                    </Link>
                  </FadeInSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOUNDER VISION ── */}

        {/* ── TRUST PILLARS ── */}
        <section id="protocol" className="relative overflow-hidden bg-white px-6 py-28 md:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-emerald-50 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/3 rounded-full bg-teal-50 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-[1440px]">
            <FadeInSection className="mx-auto max-w-2xl text-center">
              <span className={`${jetbrains.className} inline-block rounded-full border border-emerald-200 bg-emerald-50 px-6 py-2 text-[13px] tracking-[0.18em] text-[#006d40] uppercase font-medium`}>
                Trust Protocol
              </span>
              <h2 className={`${hanken.className} mt-6 text-[40px] font-bold leading-tight text-[#002627] md:text-[52px]`}>
                The African Trade<br />Protection Protocol
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-slate-500">
                Three pillars that eliminate the historic risks of cross-border commodity trading — so you can buy from Africa with total confidence.
              </p>
            </FadeInSection>

            <div className="mt-16 grid gap-7 md:grid-cols-3">
              {pillars.map((pillar, i) => (
                <FadeInSection key={pillar.title} delay={i * 120}>
                  <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-emerald-200/60 hover:shadow-[0_20px_60px_rgba(0,109,64,0.1)]">
                    {/* Card image */}
                    <div className="relative h-[220px] overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${pillar.img})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#002627]/90 via-[#002627]/50 to-transparent" />
                      <div className="absolute left-5 top-5">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-[15px] font-bold tracking-wider text-white backdrop-blur-sm">
                          {pillar.number}
                        </span>
                      </div>
                      <div className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                        <span className="text-2xl">{pillar.icon}</span>
                      </div>
                      <div className="absolute bottom-5 left-5">
                        <span className="block text-[34px] font-black leading-none text-white drop-shadow-lg">{pillar.stat}</span>
                        <span className={`${jetbrains.className} mt-1 block text-[11px] font-medium tracking-wider text-white/60`}>{pillar.statLabel}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-7 pt-6">
                      <h3 className={`${hanken.className} text-[22px] font-bold text-[#002627]`}>{pillar.title}</h3>
                      <p className="mt-1.5 text-[15px] font-medium leading-snug text-[#006d40]">{pillar.tagline}</p>
                      <p className="mt-4 text-[14px] leading-relaxed text-slate-500">
                        <span className="font-semibold text-slate-700">{pillar.highlight}.</span>{" "}
                        {pillar.text}
                      </p>
                      <div className="mt-auto flex items-center gap-3 pt-6">
                        <div className="h-px flex-1 bg-slate-100" />
                        <div className="h-px w-0 bg-gradient-to-r from-[#00bfa5] to-[#006d40] transition-all duration-500 group-hover:w-16" />
                        <span className="translate-x-2 text-[12px] font-medium tracking-wider text-slate-400 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                          LEARN MORE →
                        </span>
                      </div>
                    </div>
                  </article>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT US ── */}
        <section id="about" className="relative overflow-hidden bg-[#001a1a] px-6 py-28 md:px-12">
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[140px]" />
            <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-500/8 blur-[140px]" />
          </div>

          <div className="relative mx-auto max-w-[1200px]">

            {/* Section header */}
            <FadeInSection className="mb-16 text-center">
              <span className={`${jetbrains.className} inline-block rounded-full border border-white/15 bg-white/5 px-5 py-2 text-[11px] tracking-[0.2em] text-emerald-400 uppercase font-medium mb-5`}>
                Our Story
              </span>
              <h2 className={`${hanken.className} text-[48px] md:text-[68px] font-extrabold text-white leading-[1.05] tracking-tight`}>
                About Us
              </h2>
              <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            </FadeInSection>

            {/* Two-column: logo card + intro text */}
            <FadeInSection className="grid md:grid-cols-2 gap-12 items-center mb-20">

              {/* Logo card */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] p-10 flex flex-col items-center text-center gap-6 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-2xl scale-110" />
                  <Image
                    src="/ameefarLogo.png"
                    alt="Ameefar Energy Africa"
                    width={120}
                    height={120}
                    className="relative rounded-3xl ring-2 ring-white/20 shadow-[0_0_60px_rgba(52,211,153,0.2)]"
                  />
                </div>
                <div>
                  <p className={`${hanken.className} text-[24px] font-extrabold text-white leading-tight`}>Ameefar Energy Africa</p>
                  <p className={`${jetbrains.className} text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-semibold mt-2`}>Sustainable Recycling Solutions</p>
                </div>
              </div>

          {/* Intro text */}
          <div>
            <h3 className={`${hanken.className} text-[28px] md:text-[36px] font-bold text-white leading-tight mb-5`}>
              Pioneering the Circular Economy in Africa
            </h3>
            <p className="text-[16px] leading-relaxed text-slate-300 mb-5">
              Ameefar Energy Africa is a passionate advocate for sustainable recycling, driven by the belief that waste does not exist — only resources waiting to be repurposed. We connect buyers and sellers of recyclable commodities across the globe, focusing on PET, aluminium UBC, and other high-value secondary raw materials.
            </p>
            <p className="text-[16px] leading-relaxed text-slate-400 mb-8">
              Based in Accra, Ghana, we operate at the intersection of environmental responsibility and commercial opportunity — eliminating the historic risks of cross-border commodity trading through our African Trade Protection protocol.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Circular Economy", "B2B Recycling", "Escrow Protected", "Ghana-Based", "Global Reach"].map((tag) => (
                <span key={tag} className={`${jetbrains.className} inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-wide text-emerald-300 uppercase`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* Mission / Vision / Values row */}
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: "🌍",
              title: "Our Mission",
              text: "To build a transparent, secure, and accessible recycling marketplace that powers the circular economy across Africa and beyond.",
            },
            {
              icon: "🔭",
              title: "Our Vision",
              text: "A future where every tonne of recyclable material is captured, traded fairly, and reintegrated into global supply chains — with zero waste to landfill.",
            },
            {
              icon: "🤝",
              title: "Our Values",
              text: "Transparency, integrity, and environmental accountability sit at the core of everything we do — from supplier vetting to trade execution.",
            },
          ].map((item, i) => (
            <FadeInSection key={item.title} delay={i * 100}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 h-full hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all duration-300">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h4 className={`${hanken.className} text-[18px] font-bold text-white mb-3`}>{item.title}</h4>
                <p className="text-[14px] leading-relaxed text-slate-400">{item.text}</p>
              </div>
            </FadeInSection>
          ))}
        </div>

    </div>
        </section>


    {/* ── FOUNDER VISION ── */ }
    <section className = "bg-gradient-to-br from-[#f0faf9] to-white px-6 py-24 md:px-12 border-t border-slate-100" >
      <div className="mx-auto max-w-[900px]">
        <FadeInSection className="text-center">
          {/* rPET Expertise block */}
          <div className="mb-12 rounded-2xl bg-white border border-slate-100 shadow-sm p-8 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] text-[#006d40] tracking-wider font-medium uppercase mb-4">
              rPET Expertise
            </div>
            <h2 className={`${hanken.className} text-[28px] md:text-[36px] font-bold text-[#002627] leading-tight mb-4`}>
              Redefining Recycling in Africa
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-600 max-w-2xl mx-auto">
              The global demand for recycled PET (rPET) is rapidly increasing, driven by growing consumer and business emphasis on sustainable products, along with emerging national regulations requiring recycled content in production. Ameefar Energy Africa is well-equipped to address this rising demand, thanks to our extensive industry expertise and cutting-edge rPET technologies.
            </p>
          </div>

          {/* Founder quote */}
          <div className="mx-auto mb-8 h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-[0_4px_30px_rgba(0,109,64,0.2)]">
            <Image
              src="https://res.cloudinary.com/dqwub0fhb/image/upload/v1782219057/pascal_nsd1sq.jpg"
              alt="Abdulai Pascal Mohammed"
              height={112}
              width={112}
              className="h-full w-full object-cover"
            />
          </div>
          <blockquote className={`${hanken.className} text-[20px] md:text-[28px] font-medium leading-relaxed text-[#002627] max-w-3xl mx-auto`}>
            "The transition to sustainable secondary raw materials requires a rigorous, data-driven marketplace. Ameefar provides exactly that — closing the loop on African sustainability."
          </blockquote>
          <div className="mt-7">
            <a href="https://www.linkedin.com/in/abdulai-pascal-mohammed-222059345/" target="_blank" rel="noreferrer" className="inline-block hover:underline">
              <strong className="block text-[18px] font-bold text-[#002627]">Abdulai Pascal Mohammed</strong>
            </a>
            <span className={`${jetbrains.className} mt-1.5 block text-[11px] text-[#006d40] uppercase tracking-widest font-medium`}>
              CEO · Sustainability | rPET | Recycling
            </span>
          </div>
        </FadeInSection>
      </div>
        </section>

    {/* ── ENERGY SOLUTIONS TEASER ── */ }
    <section className = "relative overflow-hidden bg-white px-6 py-28 md:px-12 border-t border-slate-100" >
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#00bfa5]/5 blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-[#006d40]/5 blur-[120px] pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-[1440px]">
            <FadeInSection className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end mb-14">
              <div className="max-w-xl">
                <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#00bfa5] font-semibold uppercase`}>
                  Ameefar Energy
                </span>
                <h2 className={`${hanken.className} mt-3 text-[36px] font-bold leading-tight text-slate-900 md:text-[48px]`}>
                  Clean Energy,{" "}
                  <span className="bg-gradient-to-r from-[#00bfa5] to-[#006d40] bg-clip-text text-transparent">
                    Built for Africa
                  </span>
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                  Beyond commodities — Ameefar powers communities with renewable energy, electric mobility, and green infrastructure across the continent.
                </p>
              </div>
              <Link
                href="/energy"
                className={`${jetbrains.className} shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#00bfa5]/20 bg-[#00bfa5]/10 px-5 py-2.5 text-[12px] font-semibold text-[#006d40] tracking-wide transition-all hover:bg-[#00bfa5]/20 hover:-translate-y-0.5`}
              >
                View all services →
              </Link>
            </FadeInSection>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: "☀️", title: "Solar Energy Solutions", desc: "Residential, commercial & industrial solar systems — from rooftop panels to utility-scale solar farms.", gradient: "from-amber-500 to-orange-500" },
                { icon: "⚡", title: "EV Charging & EVSE", desc: "End-to-end electric vehicle charging infrastructure — charger supply, installation, and smart management.", gradient: "from-[#00bfa5] to-[#006d40]" },
                { icon: "🛵", title: "Electric Motor Bikes", desc: "Locally manufactured e-bikes designed for African urban and rural roads — clean, affordable mobility.", gradient: "from-violet-500 to-purple-600" },
              ].map((service, i) => (
                <FadeInSection key={service.title} delay={i * 100}>
                  <Link
                    href="/energy"
                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 transition-all duration-400 hover:-translate-y-1.5 hover:border-slate-200 hover:shadow-[0_12px_40px_rgb(0,0,0,0.07)] block"
                  >
                    <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-2xl shadow-sm transition-all duration-300 group-hover:border-transparent group-hover:shadow-md" style={{ width: 52, height: 52 }}>
                      {service.icon}
                    </div>
                    <div className={`mb-4 h-0.5 w-10 rounded-full bg-gradient-to-r ${service.gradient} transition-all duration-500 group-hover:w-16`} />
                    <h3 className={`${hanken.className} text-[18px] font-bold text-slate-900`}>{service.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{service.desc}</p>
                    <p className={`mt-5 text-[12px] font-semibold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent inline-flex items-center gap-1`}>
                      Learn more →
                    </p>
                  </Link>
                </FadeInSection>
              ))}
            </div>

            <FadeInSection delay={200} className="mt-10">
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white px-8 py-5 shadow-sm">
                <span className="text-[13px] text-slate-600 font-medium">7 clean energy services across solar, wind, battery, EV mobility & aviation</span>
                <Link
                  href="/energy"
                  className={`${hanken.className} ml-4 shrink-0 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00bfa5] to-[#006d40] px-5 py-2 text-[13px] font-bold text-white transition hover:opacity-90 shadow-[0_2px_10px_rgba(0,191,165,0.2)]`}
                >
                  Explore All
                  <svg fill="none" height="13" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="13">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </FadeInSection>
          </div>
        </section>

    {/* ── CTA BAND ── */ }
    <section className = "bg-[#002627] px-6 py-24 md:px-12 relative overflow-hidden" >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/8 blur-[100px] rounded-full" />
          </div>
          <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
            <FadeInSection className="max-w-xl">
              <h2 className={`${hanken.className} text-[32px] font-bold text-white leading-tight md:text-[42px]`}>
                Ready to trade with confidence?
              </h2>
              <p className="mt-4 text-[15px] text-slate-300/80 leading-relaxed">
                Join verified buyers and sellers already using Ameefar's protected marketplace.
              </p>
            </FadeInSection>
            <FadeInSection delay={100} className="flex flex-wrap gap-4 justify-center md:justify-end shrink-0">
              <Link
                href="/marketplace"
                className={`${hanken.className} inline-flex items-center gap-2.5 rounded-xl bg-[#beebeb] px-8 py-4 text-[14px] font-bold text-[#002627] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a3d6d6] hover:shadow-[0_8px_30px_rgba(190,235,235,0.2)]`}
              >
                Browse Marketplace
                <svg fill="none" height="16" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/auth/register"
                  className="inline-flex items-center rounded-xl border border-white/25 px-8 py-4 text-[14px] font-medium !text-white transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
                >
                  Start Buying & Selling
                </Link>
              )}
            </FadeInSection>
          </div>
        </section>

      </main>

    <div ref={footerRef}>
      <SiteFooter />
    </div>
    </div>
  );
}
