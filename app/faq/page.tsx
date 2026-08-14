"use client";

import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import Image from "next/image";
import { useEffect, useState } from "react";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const faqs = [
  {
    category: "General & Account",
    questions: [
      {
        q: "What is Ameefar Energy Africa?",
        a: "Ameefar Energy Africa is Africa's premier B2B marketplace for recycled commodities, including rPET, HMS scrap, and recovered paper. We connect verified African suppliers with global buyers, ensuring secure and transparent trades through our African Trade Protection Protocol."
      },
      {
        q: "How do I create an account?",
        a: "Click on 'Get Started Free' or 'Register' at the top right of the page. You will need to provide your business details and undergo our KYC (Know Your Business) verification before you can start trading."
      },
      {
        q: "Is there a fee to join?",
        a: "Joining the marketplace and browsing listings is completely free. We only charge a small transaction fee once a successful trade is completed and the payment is settled."
      }
    ]
  },
  {
    category: "Trading & Marketplace",
    questions: [
      {
        q: "How does the African Trade Protection Protocol work?",
        a: "Our protocol is built on three pillars: KYC-verified suppliers, secure payment processing via Paystack, and independent pre-shipment inspections. This ensures that the buyer's payment is processed safely until the material is verified to match the contract specifications."
      },
      {
        q: "What types of materials can I buy or sell?",
        a: "Our marketplace currently supports various secondary raw materials, prominently rPET resins, PET Flakes, UBC, PET Bottles, and HMS scrap. We are constantly expanding our categories based on demand."
      },
      {
        q: "Can I negotiate prices with a supplier?",
        a: "Yes. Our platform includes a built-in negotiation feature. Once you find a listing, you can send an offer to the seller, and they can accept, reject, or counter your offer."
      }
    ]
  },
  {
    category: "Payments & Security",
    questions: [
      {
        q: "How are payments handled?",
        a: "All trades are securely processed through Paystack. Buyers' payments are processed when a contract is signed. The final payment settlement is made to the seller after the independent pre-shipment inspection confirms the quality and quantity."
      },
      {
        q: "What payment methods are accepted?",
        a: "We support major bank transfers (SWIFT/SEPA), Paystack, and various corporate payment solutions depending on your region and the transaction size."
      },
      {
        q: "What happens if a dispute arises?",
        a: "If the material fails the pre-shipment inspection or there is a breach of contract, the trade is halted. The payment settlement is paused while our dedicated dispute resolution team works with both parties based on the terms agreed upon in the digital contract."
      }
    ]
  }
];

export default function FAQPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleFaq = (idx: string) => {
    if (openIndex === idx) {
      setOpenIndex(null);
    } else {
      setOpenIndex(idx);
    }
  };

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col`}>
      {/* ── NAV ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-slate-200 bg-white shadow-sm" : "border-b border-transparent bg-slate-50"
        }`}
      >
        <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3.5 shrink-0 group">
            <div className="relative">
              <Image
                alt="Ameefar logo"
                className="relative rounded-xl object-cover ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105"
                height={44}
                width={44}
                src="/ameefarLogo.png"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[18px] font-bold tracking-tight text-[#002627]`}>
                Ameefar
              </span>
              <span className={`${jetbrains.className} text-[9px] font-medium tracking-[0.16em] uppercase mt-0.5 text-[#006d40]`}>
                Energy Africa
              </span>
            </div>
          </Link>
          <Link
            href="/product"
            className={`${hanken.className} rounded-xl px-6 py-2.5 text-[13px] font-bold transition-all duration-300 bg-[#beebeb] text-[#002627] hover:bg-white shadow-[0_0_24px_rgba(190,235,235,0.35)]`}
          >
            Visit Marketplace
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-24 px-6 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className={`${jetbrains.className} inline-block rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-[11px] tracking-[0.18em] text-[#006d40] uppercase font-medium mb-4`}>
              Support Center
            </span>
            <h1 className={`${hanken.className} text-[36px] font-bold text-[#002627] md:text-[54px] leading-tight mb-6`}>
              Frequently Asked Questions
            </h1>
            <p className="text-[16px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about trading, payments, and the Ameefar marketplace. If you can't find what you're looking for, feel free to contact our support team.
            </p>
          </div>

          <div className="space-y-12">
            {faqs.map((category, catIdx) => (
              <div key={category.category}>
                <h2 className={`${hanken.className} text-[24px] font-bold text-[#002627] mb-6 border-b border-slate-200 pb-2`}>
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, qIdx) => {
                    const idx = `${catIdx}-${qIdx}`;
                    const isOpen = openIndex === idx;
                    return (
                      <div 
                        key={idx}
                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#00bfa5] bg-white shadow-md' : 'border-slate-200 bg-white hover:border-[#beebeb]'}`}
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full flex items-center justify-between p-6 text-left"
                        >
                          <span className={`${hanken.className} text-[18px] font-bold ${isOpen ? 'text-[#006d40]' : 'text-slate-800'}`}>
                            {faq.q}
                          </span>
                          <span className={`shrink-0 ml-4 flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 ${isOpen ? 'bg-[#00bfa5]/10 text-[#00bfa5] rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>
                        <div 
                          className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="px-6 pb-6 pt-0 text-[15px] leading-relaxed text-slate-600">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 bg-[#001a1a] rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#00bfa5]/10 blur-[80px]" />
            <h3 className={`${hanken.className} relative z-10 text-[28px] font-bold text-white mb-4`}>
              Still have questions?
            </h3>
            <p className="relative z-10 text-[15px] text-slate-300 mb-8 max-w-lg mx-auto">
              Our support team is always ready to help you navigate our marketplace or assist with your specific trading needs.
            </p>
            <div className="relative z-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className={`${hanken.className} rounded-xl px-8 py-3.5 text-[15px] font-bold transition-all duration-300 bg-[#00bfa5] text-white hover:bg-[#00a693]`}
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
