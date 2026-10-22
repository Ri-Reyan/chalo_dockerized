"use client";

import React, { useState } from "react";

interface ProblemPoint {
  id: string;
  category: string;
  icon: string;
  traditional: {
    title: string;
    description: string;
    badge: string;
  };
  chalo: {
    title: string;
    description: string;
    badge: string;
  };
}

const problemPoints: ProblemPoint[] = [
  {
    id: "pricing",
    category: "Pricing & Billing",
    icon: "💰",
    traditional: {
      title: "Predatory Surge Multipliers",
      description:
        "A sudden drizzle or 5:30 PM rush hour triples your fare. You pay 2.5x - 3.5x more just to get home.",
      badge: "Up to 3.5x Surge",
    },
    chalo: {
      title: "Guaranteed Flat & Transparent Fares",
      description:
        "Honest per-kilometer rates calculated upfront. No algorithmic surge penalties, rain or shine.",
      badge: "Zero Surge Always",
    },
  },
  {
    id: "cancellations",
    category: "Ride Reliability",
    icon: "🚫",
    traditional: {
      title: "'Kothay Jaben?' Phone Interrogations",
      description:
        "Drivers call to ask your destination before deciding whether to cancel your ride, leaving you stranded.",
      badge: "High Cancellation",
    },
    chalo: {
      title: "Upfront Destination & Direct Acceptance",
      description:
        "Drivers see the route before accepting. Once matched, your ride is locked with zero destination haggling.",
      badge: "Guaranteed Dispatch",
    },
  },
  {
    id: "driver-welfare",
    category: "Fair Economics",
    icon: "🤝",
    traditional: {
      title: "Crushing 25% – 30% Platform Cuts",
      description:
        "Corporate platforms siphon off massive commissions, leaving drivers overworked, underpaid, and frustrated.",
      badge: "28% Average Cut",
    },
    chalo: {
      title: "Driver-First 10% Flat Commission",
      description:
        "Drivers keep 90% of every fare with instant wallet payouts. Satisfied drivers provide safer, calmer rides.",
      badge: "Keep 90% Earnings",
    },
  },
  {
    id: "matching",
    category: "ETA & Dispatch",
    icon: "⏱️",
    traditional: {
      title: "Ghost Drivers & False 2-Minute ETAs",
      description:
        "Apps match drivers 5 kilometers away stuck in standstill gridlock while claiming they're 'arriving in 2 mins'.",
      badge: "Unreliable ETAs",
    },
    chalo: {
      title: "Strict 2KM Hyper-Local Radius",
      description:
        "Rides are dispatched strictly to genuine, online drivers within a 2km radius for authentic 2-3 min pickups.",
      badge: "Real <3m Pickups",
    },
  },
];

export const ProblemStatement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "comparison" | "traditional" | "chalo"
  >("comparison");

  return (
    <section
      id="problem"
      className="relative py-24 px-4 sm:px-6 bg-[#FDFCF8] border-t border-stone-200/60 overflow-hidden"
    >
      {/* Decorative ambient background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-10 w-96 h-96 bg-[#FFE4E1]/40 rounded-full blur-3xl -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-10 w-96 h-96 bg-[#E8EFE8]/50 rounded-full blur-3xl -z-10"
      />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FF9E98]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#78716C]">
              The Problem & Our Mission
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#292524] leading-tight">
            Ride-hailing shouldn&apos;t feel like a{" "}
            <span className="font-handwriting text-[#FF9E98] text-4xl sm:text-5xl md:text-6xl font-normal inline-block -rotate-3 transition-transform hover:rotate-0 duration-300 cursor-default">
              gamble
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#78716C] leading-relaxed">
            Existing ride apps pit riders against drivers with hidden algorithm
            surges, painful cancellations, and corporate greed. We built Chalo
            to restore fairness.
          </p>

          {/* View Mode Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-stone-100/90 border border-stone-200/70 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("comparison")}
              className={`px-4 sm:px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === "comparison"
                  ? "bg-[#292524] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#292524]"
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("traditional")}
              className={`px-4 sm:px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === "traditional"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#292524]"
              }`}
            >
              Traditional Apps
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chalo")}
              className={`px-4 sm:px-5 py-2 rounded-full transition-all duration-200 ${
                activeTab === "chalo"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#292524]"
              }`}
            >
              With Chalo
            </button>
          </div>
        </div>

        {/* 1. Side-by-Side Comparison Grid */}
        {activeTab === "comparison" && (
          <div className="space-y-6">
            <div className="hidden lg:grid grid-cols-2 gap-8 px-4 text-xs font-bold uppercase tracking-wider text-[#78716C]">
              <div className="flex items-center gap-2 text-rose-800">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                The Broken Status Quo (Conventional Apps)
              </div>
              <div className="flex items-center gap-2 text-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                The Chalo Standard (Fair & Transparent)
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {problemPoints.map((item) => (
                <React.Fragment key={item.id}>
                  {/* Traditional Card */}
                  <div className="relative bg-white border border-rose-200/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between pb-3 border-b border-rose-100/70">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-800/80">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                        {item.traditional.badge}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-[#292524] group-hover:text-rose-950 transition-colors">
                        {item.traditional.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                        {item.traditional.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-rose-600">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>Frustrating & unpredictable daily commute</span>
                    </div>
                  </div>

                  {/* Chalo Card */}
                  <div className="relative bg-[#F9FBF9] border border-emerald-200/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-100/70">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">✨</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        {item.chalo.badge}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-[#292524] group-hover:text-emerald-950 transition-colors">
                        {item.chalo.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                        {item.chalo.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      <span>Calm, upfront, and guaranteed every time</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* 2. Traditional Apps Single View */}
        {activeTab === "traditional" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {problemPoints.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-rose-200 rounded-3xl p-7 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700">
                    {item.traditional.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#292524]">
                  {item.traditional.title}
                </h3>
                <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                  {item.traditional.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 3. Chalo Single View */}
        {activeTab === "chalo" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {problemPoints.map((item) => (
              <div
                key={item.id}
                className="bg-[#F9FBF9] border border-emerald-200 rounded-3xl p-7 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
                    {item.chalo.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#292524]">
                  {item.chalo.title}
                </h3>
                <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                  {item.chalo.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Callout Banner */}
        <div className="mt-16 bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-xl sm:text-2xl font-bold text-[#292524]">
              Ready for a ride without the surprises?
            </h4>
            <p className="mt-2 text-sm text-[#78716C]">
              Experience fair fares and direct dispatch. Try booking your first
              ride in under 30 seconds.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#hero"
              className="px-6 py-3 rounded-full bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-semibold text-sm shadow-sm transition-all hover:scale-[1.02]"
            >
              Calculate Fare
            </a>
            <a
              href="/register?role=CUSTOMER"
              className="px-6 py-3 rounded-full bg-[#292524] hover:bg-stone-800 text-white font-semibold text-sm shadow-sm transition-all hover:scale-[1.02]"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
