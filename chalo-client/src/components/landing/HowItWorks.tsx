"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Step {
  stepNumber: string;
  title: string;
  description: string;
  badge: string;
  icon: string;
  uiPreview: React.ReactNode;
}

const riderSteps: Step[] = [
  {
    stepNumber: "01",
    title: "Choose Route & Vehicle",
    description:
      "Enter your pickup and destination spots. Choose between agile Bike or comfortable Car, and preview your fixed, zero-surge fare upfront.",
    badge: "Upfront Fare",
    icon: "📍",
    uiPreview: (
      <div className="bg-white/90 border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
          <span>Vehicle Selection</span>
          <span className="text-emerald-700 font-bold">No Surge</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-[#292524] text-white rounded-xl p-2 text-center text-xs font-bold shadow-xs">
            🏍️ Bike • $2.40
          </div>
          <div className="flex-1 bg-stone-100 text-[#78716C] rounded-xl p-2 text-center text-xs font-semibold">
            🚗 Car • $5.50
          </div>
        </div>
      </div>
    ),
  },
  {
    stepNumber: "02",
    title: "Instant 2KM Driver Match",
    description:
      "Nearby verified drivers within a 2km radius are notified instantly. A driver accepts your trip with full knowledge of your route.",
    badge: "< 30s Match",
    icon: "⚡",
    uiPreview: (
      <div className="bg-white/90 border border-[#FFB7B2]/70 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#FFB7B2] flex items-center justify-center text-[#292524] font-bold text-xs">
          KH
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-[#292524]">Kamal Hossain</div>
          <div className="text-[11px] text-[#78716C]">Yamaha FZ • 4.95 ★</div>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
          Accepted
        </span>
      </div>
    ),
  },
  {
    stepNumber: "03",
    title: "Live Tracking & Safety OTP",
    description:
      "Track your driver approaching on the map in real-time. Verify your 4-digit security PIN before starting the ride for complete safety.",
    badge: "4-Digit PIN",
    icon: "🗺️",
    uiPreview: (
      <div className="bg-white/90 border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#78716C]">Driver ETA</span>
          <span className="font-bold text-[#292524]">2 minutes</span>
        </div>
        <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl p-2">
          <span className="text-xs text-[#78716C]">Share with driver:</span>
          <span className="text-sm font-extrabold tracking-widest text-[#292524]">
            OTP: 5821
          </span>
        </div>
      </div>
    ),
  },
  {
    stepNumber: "04",
    title: "Smooth Arrival & Auto-Pay",
    description:
      "Reach your destination comfortably. Payment is held and captured seamlessly with zero awkward cash bargaining or change issues.",
    badge: "100% Cashless",
    icon: "✨",
    uiPreview: (
      <div className="bg-[#F9FBF9] border border-emerald-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-emerald-800">
            Trip Completed!
          </div>
          <div className="text-[11px] text-[#78716C]">
            Fare settled via Card/bKash
          </div>
        </div>
        <span className="text-base font-bold text-[#292524]">$2.40 ✓</span>
      </div>
    ),
  },
];

const driverSteps: Step[] = [
  {
    stepNumber: "01",
    title: "Go Online with One Tap",
    description:
      "Open your driver dashboard and toggle your status to Online whenever you're ready to hit the road. You set your own hours.",
    badge: "Flexible Schedule",
    icon: "🟢",
    uiPreview: (
      <div className="bg-white/90 border border-stone-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#292524]">
            Status: Online
          </span>
        </div>
        <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
          Ready for rides
        </span>
      </div>
    ),
  },
  {
    stepNumber: "02",
    title: "Review Transparent Requests",
    description:
      "See the customer's pickup, exact destination, and earnings before you accept. You have 30 seconds to review with zero blind penalties.",
    badge: "30s Countdown",
    icon: "📲",
    uiPreview: (
      <div className="bg-white/90 border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-bold text-[#292524]">
            Gulshan 2 → Dhanmondi
          </span>
          <span className="font-bold text-emerald-700">$3.80</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-rose-500 h-full w-2/3" />
        </div>
        <div className="text-[10px] text-right text-rose-600 font-semibold">
          18s remaining to accept
        </div>
      </div>
    ),
  },
  {
    stepNumber: "03",
    title: "Navigate & Pick Up Rider",
    description:
      "Follow built-in turn-by-turn routing directly to the rider. Confirm their OTP code on your phone to start the live trip meter.",
    badge: "OTP Verified",
    icon: "🧭",
    uiPreview: (
      <div className="bg-white/90 border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#78716C]">Passenger:</span>
          <span className="font-bold text-[#292524]">Sarah Khan (5.0 ★)</span>
        </div>
        <div className="bg-emerald-50 text-emerald-800 rounded-xl p-2 text-center text-xs font-bold">
          ✓ OTP Verified • En Route
        </div>
      </div>
    ),
  },
  {
    stepNumber: "04",
    title: "Instant 90% Earnings Payout",
    description:
      "Keep 90% of your earnings with our flat 10% platform fee. Fares are deposited directly to your driver wallet immediately after drop-off.",
    badge: "Instant Withdrawal",
    icon: "💳",
    uiPreview: (
      <div className="bg-white/90 border border-stone-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-[#292524]">
            Earnings Credited
          </div>
          <div className="text-[11px] text-[#78716C]">
            10% platform fee deducted
          </div>
        </div>
        <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
          + $3.42
        </span>
      </div>
    ),
  },
];

export const HowItWorks: React.FC = () => {
  const [role, setRole] = useState<"rider" | "driver">("rider");
  const activeSteps = role === "rider" ? riderSteps : driverSteps;

  return (
    <section
      id="how-it-works"
      className="relative py-28 px-4 sm:px-6 bg-[#FDFCF8] border-t border-stone-200/60 overflow-hidden"
    >
      {/* Ambient background blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/4 w-150 h-75 bg-[#E8EFE8]/50 rounded-full blur-[110px] -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 right-1/4 w-125 h-75 bg-[#FFE4E1]/40 rounded-full blur-[100px] -z-10"
      />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FF9E98]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#78716C]">
              Step-by-Step Experience
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#292524] leading-tight">
            How Chalo works{" "}
            <span className="font-handwriting text-[#FF9E98] text-4xl sm:text-5xl md:text-6xl font-normal inline-block -rotate-2 transition-transform hover:rotate-0 duration-300 cursor-default">
              for you
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#78716C] leading-relaxed">
            Straightforward, reliable, and transparent every step of the way.
            Select your journey below to see how simple it is.
          </p>

          {/* Role Toggle Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-stone-100/90 border border-stone-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setRole("rider")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                role === "rider"
                  ? "bg-[#292524] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#292524]"
              }`}
            >
              <span>🚶</span>
              <span>For Riders</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("driver")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                role === "driver"
                  ? "bg-[#292524] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#292524]"
              }`}
            >
              <span>🏍️</span>
              <span>For Driver Partners</span>
            </button>
          </div>
        </div>

        {/* 4 Steps Timeline / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white/85 backdrop-blur-sm border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Step Top Meta */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#292524] text-white flex items-center justify-center font-extrabold text-xs">
                      {step.stepNumber}
                    </span>
                    <span className="text-xl">{step.icon}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#78716C] bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                    {step.badge}
                  </span>
                </div>

                {/* Step Content */}
                <h3 className="text-lg font-bold text-[#292524] group-hover:text-[#FF9E98] transition-colors">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[#78716C] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Mini UI Snapshot */}
              <div className="mt-6 pt-5 border-t border-stone-100">
                {step.uiPreview}
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout Bar */}
        <div className="mt-16 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="w-10 h-10 rounded-full bg-[#FFE4E1] flex items-center justify-center text-lg">
              ✨
            </span>
            <div>
              <div className="text-sm font-bold text-[#292524]">
                {role === "rider"
                  ? "Want to see how easy it is to book?"
                  : "Ready to start earning on your own terms?"}
              </div>
              <div className="text-xs text-[#78716C]">
                {role === "rider"
                  ? "Try the customer booking prototype in live simulated mode."
                  : "Explore the driver dashboard with live request simulations."}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {role === "rider" ? (
              <Link
                href="/customer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#292524] hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm text-center shadow-xs transition-all hover:scale-105"
              >
                Launch Rider Demo →
              </Link>
            ) : (
              <Link
                href="/driver"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#292524] hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm text-center shadow-xs transition-all hover:scale-105"
              >
                Launch Driver Demo →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
