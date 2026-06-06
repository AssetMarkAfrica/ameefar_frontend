"use client";
import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser, selectIsAuthenticated } from "@/store/auth/authSelectors";
import { logoutThunk } from "@/store/auth/authThunks";
import { logout } from "@/store/auth/authSlice";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["500"] });

const trustSignals = [
  "KYC Verified African Suppliers",
  "Protected International Escrow",
  "Mandatory On-Site Inspections",
  "Enforceable Quality Contracts",
];

const pillars = [
  {
    title: "Vetted African Partners",
    text: "Every African supplier undergoes rigorous on-the-ground verification, including facility audits and comprehensive background checks, before listing.",
  },
  {
    title: "Ironclad Escrow",
    text: "Your capital is protected in secure international escrow accounts. Funds are only released when materials pass physical inspection and port loading is confirmed.",
  },
  {
    title: "Guaranteed Quality",
    text: "If the independent pre-shipment inspection does not match your contract, the trade is halted and your funds stay protected.",
  },
];

const categories = [
  {
    title: "Ferrous Metals",
    stats: "1.2k Active Listings",
    types: "HMS 1&2, Shredded",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAw-dFGdzaebKzIE4qFZZ8QKYB2KMwuE-jeV-9hK03pbuK1CynHqBiSrqU3N2d8cekpexTQnQng8TeAWha02e2crBzAhupa16ih4P3lr3ABmgwnsGhZg3vDaeOkJTjQ0yT1yqVZ8K1WFmxlnh_8PoBl6XFgKS7FGNpX86hWfRL0bjPYfeh8czRsJPLrDSTCdv2_sfEJascD4i-BEk7Vi6zROw0CAbm0ItgK6SGA5bZehZRl_sO1VPQ1NBENwV5zLpOZz9MiAavg9VO",
  },
  {
    title: "Plastics",
    stats: "850 Active Listings",
    types: "PET, HDPE, LDPE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwpdUcZU-1Iz7dTfvZu15DFRFH0VkbQ9-kEjtdCB2Qk1rkNIWHhhrOcQuIll27yL6b1Wdm9JUDYsWGBA-azzHMZkQe8iGWEdJi49tU43UKZXBIdM1ET9X4XOIqkIiC0696XfWf4glqZaem6Yhw_f1cRA1M69DASiMYl16FHjvIvvS4vY3McbzZKfld1Rm69SxgQ1mp5lIFp65WnS3oboMpWdUo6clULy3mwaeeYA1NG5CTtlxgeYXW3S39jqEXULWvvm5tV91K_fIS",
  },
  {
    title: "Recovered Paper",
    stats: "620 Active Listings",
    types: "OCC, ONP",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrmJaCUYrMFmK92wEPRbHokWjt8upVtrCqAfIHFyc9eMuCOuJphxgGo5JS9_CO5LpB3jCA6Y9yxD6U6xjjgNI7531cvHjtFC6z7ipmF3Lb7Ug-XNEBKFCp0_jiBrZIac328UEMxBKC0zyswraInUa8EWnOPxmjvpttSi6LKVRQCZ1GH5Lb1RFoO5OXINKFXPf8NIvAmBR5Nxy2equmKqlY6UtvLa6QLSsOd0AjyE120361nbz09ja070xaIJAqSlWefFKA8CtQM6EQ",
  },
];

export default function Home() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  const handleLogout = async () => {
    if (refreshToken) {
      await dispatch(logoutThunk({ refresh: refreshToken }));
    } else {
      dispatch(logout());
    }
  };

  return (
    <div className={`${inter.className} min-h-screen bg-[#f8f9ff] text-slate-900`}>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 md:px-10">
          <div className="flex items-center gap-8">
            <a className={`${hanken.className} text-2xl font-bold text-[#002627]`} href="#">Ameefar</a>
            <nav className="hidden gap-6 md:flex text-slate-600">
              <a href="#">Marketplace</a><a href="#">Inspections</a><a href="#">About</a>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-slate-600">
            <input className="w-56 rounded border border-slate-300 bg-slate-50 px-3 py-2" placeholder="Search materials..." />
            {isAuthenticated && user ? (
              <>
                <span className="font-semibold text-primary">Welcome, {user.first_name}</span>
                <button onClick={handleLogout} className="px-3 py-1 bg-surface-container rounded hover:bg-surface-gray">Logout</button>
              </>
            ) : (
              <>
                <span>Notifications</span><span>Settings</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative flex h-[600px] items-center overflow-hidden bg-slate-950">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoKCEotrgH9tJ7A7mWhRcNnwa9fNyVr576vaiX6J5EBQykMiZzUKvH_FC1Pua3Xer725MbtjidntdLd87hkz8MSldgGTYoR58OLOWPauCLK2HMaGF_q4PJ4SxkR4hg5rerxXnNHeOJXMLI6RxJKHbdVBSwquJ6eh99Zbc2BwAxLYEHbHhqJu4V_vdHN0vr_kvODYdQUBAymxhDu5PTWsffPq3sa8VH-thj_kLP1rgZ8cKqRPUtzH3YK0q4kgQHV5pkjUbsF_g88Hw6" alt="Industrial port" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 text-white md:px-10">
            <span className={`${jetbrains.className} inline-block rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200`}>100% Secure Trading Guaranteed</span>
            <h1 className={`${hanken.className} mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-6xl`}>Secure African Trade. Guaranteed Quality.</h1>
            <p className="mt-6 max-w-3xl text-lg text-slate-200">The first B2B recycling marketplace featuring the African Trade Protection protocol with inspections and escrow.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="rounded bg-[#002627] px-6 py-3 font-medium text-white hover:bg-[#003a3b] transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="rounded bg-[#002627] px-6 py-3 font-medium text-white hover:bg-[#003a3b] transition-colors"
                  >
                    Create Secure Account
                  </Link>
                  <Link
                    href="/auth/login"
                    className="rounded border border-white/40 px-6 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-[#e5eeff] px-4 py-6 md:px-10">
          <div className={`${jetbrains.className} mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-6 text-xs text-slate-700 md:justify-between`}>
            {trustSignals.map((signal) => (
              <div key={signal}>{signal}</div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] bg-slate-50 px-4 py-20 md:px-10">
          <h2 className={`${hanken.className} text-center text-4xl font-semibold`}>The African Trade Protection Protocol</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">We eliminate historic risks of international trade with a proprietary three-pillar protection system.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className={`${hanken.className} text-2xl font-semibold`}>{pillar.title}</h3>
                <p className="mt-3 text-slate-600">{pillar.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-10">
          <h2 className={`${hanken.className} mb-10 text-4xl font-semibold`}>Verified African Materials</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {categories.map((category) => (
              <article key={category.title} className="group">
                <div className="relative mb-4 h-64 overflow-hidden rounded-xl">
                  <img src={category.image} alt={category.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <h3 className={`${hanken.className} absolute bottom-4 left-4 text-2xl font-semibold text-white`}>{category.title}</h3>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{category.stats}</span>
                  <span className={`${jetbrains.className} text-xs`}>{category.types}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 px-4 py-12 text-slate-300 md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-4">
          <div>
            <div className={`${hanken.className} text-2xl font-semibold text-white`}>Ameefar</div>
            <p className="mt-4 text-sm">Trusted global B2B marketplace for secondary raw materials, protected by African Trade Protection.</p>
          </div>
          <div><h4 className="font-semibold text-white">Platform</h4><p className="mt-2 text-sm">Marketplace, Inspections, Pricing</p></div>
          <div><h4 className="font-semibold text-white">Legal</h4><p className="mt-2 text-sm">Terms, Privacy, Compliance</p></div>
          <div><h4 className="font-semibold text-white">Support</h4><p className="mt-2 text-sm">Contact, Help Center</p></div>
        </div>
        <p className="mx-auto mt-8 max-w-[1440px] border-t border-white/10 pt-6 text-center text-sm">(c) 2026 Ameefar B2B Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}