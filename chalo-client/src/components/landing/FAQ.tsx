"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface FAQItem {
  id: string;
  category: "all" | "riders" | "drivers" | "safety";
  question: string;
  answer: string;
}

const faqList: FAQItem[] = [
  {
    id: "faq-1",
    category: "riders",
    question:
      "Does Chalo truly have zero surge pricing during peak hours and rain?",
    answer:
      "Yes, absolutely. Our core philosophy is predictable, honest mobility. Your fare is calculated strictly using a transparent base fee plus a flat per-kilometer rate. Whether it's a sudden monsoon downpour or 6:00 PM rush hour gridlock, your per-km price will never be inflated by algorithmic surge multipliers.",
  },
  {
    id: "faq-2",
    category: "riders",
    question:
      "Why don't Chalo drivers call to ask 'Where are you going?' before cancelling?",
    answer:
      "On traditional apps, drivers are blinded to the destination and fare, causing them to call riders and decline unprofitable routes. On Chalo, drivers see the full route, distance, and exact fare upfront before accepting. When a driver accepts your trip, they have already committed to your destination.",
  },
  {
    id: "faq-3",
    category: "safety",
    question:
      "How does Chalo ensure passenger safety, particularly for late-night travel?",
    answer:
      "Every driver undergoes a comprehensive background check including verified National ID (NID), valid driving license, and vehicle registration. Furthermore, every trip requires a unique 4-digit passenger OTP code before the ride can commence, and riders can share their live GPS route with family alongside a prominent One-Tap Emergency SOS button.",
  },
  {
    id: "faq-4",
    category: "riders",
    question: "What vehicle types are currently supported on the platform?",
    answer:
      "Chalo currently supports two primary vehicle classes: agile Bikes (ideal for solo commuters cutting through dense city traffic swiftly and affordably) and comfortable Cars (perfect for group travel, luggage, rainy days, or executive commutes).",
  },
  {
    id: "faq-5",
    category: "safety",
    question: "How does payment work? Do I need to carry exact cash change?",
    answer:
      "No awkward bargaining or hunting for cash change. Chalo is 100% cashless. Payment is held securely when your ride starts and captured automatically when you arrive at your destination via linked debit/credit cards or mobile banking (bKash/Nagad).",
  },
  {
    id: "faq-6",
    category: "drivers",
    question: "How much commission does Chalo take from driver partners?",
    answer:
      "Traditional ride-hailing services deduct 25% to 30% of each fare. Chalo charges a flat 10% platform fee. This means drivers keep 90% of their gross earnings, allowing them to earn a dignified living while keeping fares affordable for riders.",
  },
  {
    id: "faq-7",
    category: "drivers",
    question:
      "How fast do drivers receive their earnings after completing trips?",
    answer:
      "Earnings are credited to the driver's in-app wallet immediately upon ride completion. Drivers can withdraw their available balance to their verified bKash, Nagad, or bank accounts with same-day settlements and zero hidden processing deductions.",
  },
  {
    id: "faq-8",
    category: "riders",
    question:
      "What should I do if I accidentally leave an item behind in a vehicle?",
    answer:
      "Your ride receipt and driver contact channel remain active in your Ride History for 24 hours after completion. You can call the driver directly or tap 'Report an Item' in the app to connect with our 24/7 dedicated local support team.",
  },
];

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>("faq-1");
  const [filter, setFilter] = useState<"all" | "riders" | "drivers" | "safety">(
    "all",
  );
  const [hasTriggered, setHasTriggered] = useState(false);
  const faqContainerRef = useRef<HTMLDivElement>(null);

  // Scroll trigger observer: fires once when the FAQ list enters the viewport
  useEffect(() => {
    if (hasTriggered) return;
    const el = faqContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasTriggered]);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredFAQs =
    filter === "all"
      ? faqList
      : faqList.filter((item) => item.category === filter);

  return (
    <section
      id="faq"
      className="relative py-28 px-4 sm:px-6 bg-[#FDFCF8] border-t border-stone-200/60 overflow-hidden"
    >
      {/* Decorative ambient background blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-10 w-137.5 h-87.5` bg-[#FFE4E1]/30 rounded-full blur-[120px] -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-10 w-137.5 h-87.5 bg-[#E8EFE8]/40 rounded-full blur-[120px] -z-10"
      />

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#4caf50]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#78716C]">
              Clear Answers
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#292524] leading-tight">
            Frequently asked{" "}
            <span className="font-handwriting text-[#FF9E98] text-4xl sm:text-5xl md:text-6xl font-normal inline-block -rotate-2 transition-transform hover:rotate-0 duration-300 cursor-default">
              questions
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#78716C] leading-relaxed">
            Everything you need to know about our fair pricing, driver partner
            welfare, and safety standards.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { id: "all", label: "All Questions" },
              { id: "riders", label: "For Riders" },
              { id: "drivers", label: "For Drivers" },
              { id: "safety", label: "Safety & Payments" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  filter === tab.id
                    ? "bg-[#292524] text-white shadow-xs"
                    : "bg-white text-[#78716C] hover:text-[#292524] border border-stone-200/80 hover:bg-stone-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List with Scroll-Triggered Staggered Animation */}
        <div ref={faqContainerRef} className="space-y-4">
          {filteredFAQs.map((item, idx) => {
            const isOpen = openId === item.id;
            // Stagger delay: 0ms, 90ms, 180ms, 270ms...
            const delayMs = idx * 90;

            return (
              <div
                key={item.id}
                style={{
                  transitionDelay: hasTriggered ? `${delayMs}ms` : "0ms",
                }}
                className={`bg-white border border-[#c8b5a0]/40 rounded-2xl overflow-hidden shadow-2xs hover:border-[#c8b5a0]/80 transition-all duration-600 ease-out transform ${
                  hasTriggered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-7 pointer-events-none"
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-6 sm:px-7 sm:py-6 flex items-center justify-between gap-4 font-medium text-base sm:text-lg text-[#292524] hover:bg-[#fefaf3] transition-colors duration-200 cursor-pointer focus:outline-none"
                >
                  <span className="font-semibold">{item.question}</span>

                  {/* Plus icon rotating 45 degrees into an 'x' on open */}
                  <span
                    className={`w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-[#292524] transition-transform duration-200 ${
                      isOpen ? "rotate-45 bg-[#FFE4E1]" : "rotate-0"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </span>
                </button>

                {/* Accordion Content with smooth transition */}
                {isOpen && (
                  <div className="px-6 pb-6 sm:px-7 sm:pb-7 text-sm sm:text-base text-[#78716C] leading-relaxed border-t border-stone-100/80 pt-4 bg-[#fefaf3]/30 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions? Help Card */}
        <div className="mt-14 bg-white/90 border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E8EFE8] flex items-center justify-center text-xl">
              💬
            </div>
            <div>
              <div className="text-base font-bold text-[#292524]">
                Still have questions?
              </div>
              <div className="text-xs sm:text-sm text-[#78716C]">
                Our local support team is ready to help 24 hours a day, 7 days a
                week.
              </div>
            </div>
          </div>
          <Link
            href="/register"
            className="px-6 py-3 rounded-full bg-[#292524] hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all hover:scale-105 shrink-0"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
