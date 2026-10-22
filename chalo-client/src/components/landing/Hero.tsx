"use client";

import React, { useState } from "react";
import Link from "next/link";

export const Hero: React.FC = () => {
  const [pickup, setPickup] = useState("Gulshan 2, Circle");
  const [destination, setDestination] = useState("Dhanmondi 27");
  const [vehicle, setVehicle] = useState<"BIKE" | "CAR">("BIKE");

  // Calculate realistic mock distance and fare based on pickup/destination
  const distanceKm = 8.4;
  const estimatedFare =
    vehicle === "BIKE"
      ? (1.0 + distanceKm * 0.2).toFixed(2)
      : (3.0 + distanceKm * 0.5).toFixed(2);

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 overflow-hidden bg-grain"
    >
      {/* Ambient Floating Blobs (#FFE4E1 and #E6E6FA at 60% opacity) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -left-20 w-80 h-80 sm:w-120 sm:h-120 rounded-full bg-[#FFE4E1]/60 blur-[110px] animate-float-slow -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -right-20 w-88 h-88 sm:w-130 sm:h-130 rounded-full bg-[#E6E6FA]/60 blur-[120px] animate-float-slow-reverse -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-1/3 w-72 h-72 rounded-full bg-[#E8EFE8]/50 blur-[90px] animate-float-slow -z-10"
      />

      {/* Main Content Container */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-stone-200/80 shadow-xs mb-8 transition-transform hover:scale-[1.02] cursor-default">
          <span className="w-2 h-2 rounded-full bg-[#FFB7B2] animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-[#292524] tracking-wide">
            Next-generation urban mobility • Fair, calm & transparent
          </span>
        </div>

        {/* 72px Headline with handwritten Reenie Beanie cursive accent */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#292524] leading-[1.12] sm:leading-[1.15] max-w-3xl">
          Skip the wait,{" "}
          <span className="font-handwriting text-[#FF9E98] text-5xl sm:text-7xl md:text-8xl font-normal inline-block -rotate-3 transition-transform hover:rotate-0 duration-300">
            embrace
          </span>{" "}
          the journey
        </h1>

        {/* 18px Sub-headline (#78716C, max-width 500-540px, line-height 1.6) */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#78716C] max-w-xl leading-relaxed">
          Transparent fares with zero surprise surges. Connect instantly with
          verified nearby riders and drivers for a calmer, everyday commute.
        </p>

        {/* CTAs: Two 48px Pill Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Primary Coral CTA */}
          <Link
            href="/register?role=CUSTOMER"
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-semibold text-base flex items-center justify-center gap-2.5 shadow-md shadow-[#FFB7B2]/30 hover:shadow-lg hover:shadow-[#FFB7B2]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Book a Ride</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>

          {/* Secondary White/Stone CTA */}
          <Link
            href="/register?role=DRIVER"
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-white hover:bg-stone-50 text-[#292524] font-semibold text-base border border-[#292524] flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Drive with Chalo</span>
          </Link>
        </div>

        {/* Interactive Quick Estimate Card */}
        <div className="mt-14 w-full max-w-xl bg-white/80 backdrop-blur-md border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-lg shadow-stone-900/5 text-left transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4caf50]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Instant Fare Calculator
              </span>
            </div>
            <div className="flex bg-stone-100/90 p-1 rounded-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => setVehicle("BIKE")}
                className={`px-3 py-1 rounded-full transition-all ${
                  vehicle === "BIKE"
                    ? "bg-[#292524] text-white shadow-xs"
                    : "text-[#78716C] hover:text-[#292524]"
                }`}
              >
                🏍️ Bike
              </button>
              <button
                type="button"
                onClick={() => setVehicle("CAR")}
                className={`px-3 py-1 rounded-full transition-all ${
                  vehicle === "CAR"
                    ? "bg-[#292524] text-white shadow-xs"
                    : "text-[#78716C] hover:text-[#292524]"
                }`}
              >
                🚗 Car
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                Pickup Spot
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-[#292524] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FFB7B2] focus:border-transparent transition-all"
                  placeholder="Enter pickup location"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                Destination Spot
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-[#292524] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FFB7B2] focus:border-transparent transition-all"
                  placeholder="Enter destination"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#78716C]">Estimated Total:</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#292524]">
                  ${estimatedFare}
                </span>
                <span className="text-xs text-[#78716C]">
                  (~{distanceKm} km • no surge)
                </span>
              </div>
            </div>
            <Link
              href="/customer"
              className="text-xs font-semibold px-4 py-2.5 rounded-full bg-[#292524] hover:bg-stone-800 text-white transition-all shadow-xs"
            >
              Test Ride Now →
            </Link>
          </div>
        </div>

        {/* Trust Badges / Social Proof Counters */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl pt-8 border-t border-stone-200/60">
          <div className="flex flex-col items-center text-center p-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#292524]">
              2.4{" "}
              <span className="text-sm font-normal text-[#78716C]">min</span>
            </span>
            <span className="text-xs font-medium text-[#78716C] mt-1">
              ⚡ Avg Pickup Time
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#292524]">
              4.9{" "}
              <span className="text-sm font-normal text-[#78716C]">/ 5</span>
            </span>
            <span className="text-xs font-medium text-[#78716C] mt-1">
              ⭐ Rider Satisfaction
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#292524]">
              100%
            </span>
            <span className="text-xs font-medium text-[#78716C] mt-1">
              🛡️ Vetted Drivers
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#292524]">
              $0
            </span>
            <span className="text-xs font-medium text-[#78716C] mt-1">
              🚫 Surge Multipliers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
