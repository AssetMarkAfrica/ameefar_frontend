import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Contact Us | Ameefar",
  description: "Get in touch with the Ameefar team for any inquiries about our commodity marketplace or energy solutions.",
};

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function ContactPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-[#030d0d] text-white antialiased`}>
      {/* ── NAV ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#030d0d]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3">
            <Image alt="Ameefar logo" className="rounded-lg object-cover" height={36} width={36} src="/ameefarLogo.png" />
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[16px] font-bold tracking-tight text-white`}>Ameefar</span>
              <span className={`${jetbrains.className} text-[9px] font-medium tracking-[0.15em] text-[#00bfa5] uppercase mt-0.5`}>Contact Us</span>
            </div>
          </Link>
          <nav className="hidden gap-7 md:flex text-[13.5px] font-medium text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="/energy" className="hover:text-white transition-colors">Energy Solutions</Link>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-24 md:px-12 min-h-[90vh] flex items-center">
          {/* ambient glows */}
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#00bfa5]/10 blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-[#006d40]/15 blur-[120px] pointer-events-none" />

          <div className="relative z-10 mx-auto w-full max-w-[1440px]">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
              
              {/* Left Column: Text & Info */}
              <div>
                <span className={`${jetbrains.className} inline-flex items-center gap-2 rounded-full border border-[#00bfa5]/40 bg-[#00bfa5]/10 px-3.5 py-1.5 text-[11px] text-[#80cbc4] tracking-widest uppercase mb-6`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5] animate-pulse" />
                  We are here to help
                </span>
                
                <h1 className={`${hanken.className} text-[44px] font-extrabold leading-[1.1] tracking-tight md:text-[64px]`}>
                  Let's Build the <br />
                  <span className="bg-gradient-to-r from-[#00bfa5] to-[#006d40] bg-clip-text text-transparent">
                    Future Together
                  </span>
                </h1>
                
                <p className="mt-6 text-[17px] leading-relaxed text-white/70 max-w-lg">
                  Whether you're looking to trade commodities on our protected marketplace or deploy clean energy solutions across Africa, our team is ready to support you.
                </p>

                <div className="mt-14 space-y-10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
                      📍
                    </div>
                    <div>
                      <h3 className={`${hanken.className} text-[18px] font-bold text-white`}>Headquarters</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-white/60">
                        No. 9 Ecuador Street, Agbogba Assemblies.<br />
                        GE.164.1559 Accra, Ghana
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
                      📞
                    </div>
                    <div>
                      <h3 className={`${hanken.className} text-[18px] font-bold text-white`}>Contact Numbers</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-white/60">
                        <a href="tel:+233268808886" className="hover:text-white transition-colors">(+233) 268808886</a><br />
                        <a href="tel:+233244062988" className="hover:text-white transition-colors">(+233) 244062988</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
                      ✉️
                    </div>
                    <div>
                      <h3 className={`${hanken.className} text-[18px] font-bold text-white`}>Email Support</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-white/60">
                        <a href="mailto:info@ameefarenergy.com" className="hover:text-[#00bfa5] transition-colors">
                          info@ameefarenergy.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00bfa5]/30 to-[#006d40]/30 blur-lg" />
                <div className="relative rounded-3xl border border-white/10 bg-[#030d0d] p-8 md:p-12 shadow-2xl">
                  <h3 className={`${hanken.className} text-[24px] font-bold text-white mb-2`}>Send us a message</h3>
                  <p className="text-[14px] text-white/50 mb-8">We usually respond within 24 hours.</p>

                  <form className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-white/70 uppercase`}>First Name</label>
                        <input
                          type="text"
                          required
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white placeholder-white/30 outline-none transition focus:border-[#00bfa5] focus:bg-white/10"
                          placeholder="Jane"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-white/70 uppercase`}>Last Name</label>
                        <input
                          type="text"
                          required
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white placeholder-white/30 outline-none transition focus:border-[#00bfa5] focus:bg-white/10"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-white/70 uppercase`}>Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white placeholder-white/30 outline-none transition focus:border-[#00bfa5] focus:bg-white/10"
                        placeholder="jane@company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-white/70 uppercase`}>Subject Area</label>
                      <select
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#0a1717] px-4 py-3.5 text-[14px] text-white outline-none transition focus:border-[#00bfa5]"
                      >
                        <option value="energy">Energy Solutions Inquiry</option>
                        <option value="marketplace">Commodity Marketplace Inquiry</option>
                        <option value="partnership">Partnership & Investment</option>
                        <option value="support">General Support</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-white/70 uppercase`}>Message</label>
                      <textarea
                        required
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white placeholder-white/30 outline-none transition focus:border-[#00bfa5] focus:bg-white/10 resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <button
                      type="button"
                      className={`${hanken.className} w-full rounded-xl bg-gradient-to-r from-[#00bfa5] to-[#006d40] px-8 py-4 text-[16px] font-bold text-white shadow-[0_0_20px_rgba(0,191,165,0.2)] transition hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,191,165,0.3)]`}
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
