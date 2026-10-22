"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface FeatureCard {
  tag: string;
  title: string;
  description: string;
  icon: string;
  accentBg: string;
}

const features: FeatureCard[] = [
  {
    tag: "Instant Match",
    title: "Hyper-Local 2KM Radius",
    description:
      "Our dispatch engine pings only genuine, available drivers within 2km, eliminating phantom ETAs and endless waiting.",
    icon: "⚡",
    accentBg: "bg-[#FFE4E1]/50",
  },
  {
    tag: "Live Tracking",
    title: "Real-Time Journey Map",
    description:
      "Watch your driver arrive turn-by-turn with smooth simulated GPS markers and precise remaining minutes countdown.",
    icon: "🗺️",
    accentBg: "bg-[#E8EFE8]/60",
  },
  {
    tag: "Fair Fares",
    title: "Zero Surge Guarantee",
    description:
      "Transparent base fare plus flat per-km pricing. Whether it's peak rush hour or heavy rain, your rate never doubles.",
    icon: "🛡️",
    accentBg: "bg-[#EFEDF4]/60",
  },
  {
    tag: "Verified Safety",
    title: "100% Background Vetted",
    description:
      "Every driver partner is individually screened with national ID verification, valid license checks, and safety reviews.",
    icon: "✅",
    accentBg: "bg-[#FFE4E1]/40",
  },
  {
    tag: "Emergency First",
    title: "One-Tap SOS & Share",
    description:
      "Share your live trip status with loved ones in real time, with an instant emergency dispatch hotline always accessible.",
    icon: "🚨",
    accentBg: "bg-rose-50",
  },
  {
    tag: "Driver Welfare",
    title: "Flat 10% Platform Cut",
    description:
      "Drivers keep 90% of their hard-earned fares with same-day wallet withdrawals, keeping morale and service quality high.",
    icon: "🤝",
    accentBg: "bg-[#E8EFE8]/70",
  },
];

export const Solution: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(1); // Default to Center Phone
  const carouselRef = useRef<HTMLDivElement>(null);

  // Initialize mobile carousel centered on Slide 1 (Center Phone)
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const scrollToCenter = () => {
      const slideWidth = el.clientWidth; // Full container width for single active card view
      el.scrollTo({
        left: slideWidth * 1, // Index 1 is the center phone
        behavior: "smooth",
      });
    };

    const timer = setTimeout(scrollToCenter, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleMobileScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const itemWidth = el.clientWidth;
    const current = Math.round(scrollLeft / itemWidth);
    setMobileSlide(Math.min(Math.max(current, 0), 2));
  };

  const scrollToSlide = (idx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const itemWidth = el.clientWidth;
    el.scrollTo({
      left: itemWidth * idx,
      behavior: "smooth",
    });
    setMobileSlide(idx);
  };

  /* Reusable Phone Component 1: Upfront Fare & Booking */
  const renderLeftPhone = (isMobile = false) => (
    <div
      className={`${
        isMobile
          ? "w-70 sm:w-75 h-135 shrink-0 snap-center rounded-[2.6rem] bg-white border-[3px] border-[#292524] shadow-2xl overflow-hidden transition-all duration-300 mx-auto"
          : "hidden md:block absolute left-4 lg:left-12 top-12 w-67.5 h-135 rounded-[2.5rem] bg-white border-[2.5px] border-[#292524] shadow-xl opacity-85 transition-transform duration-500 hover:opacity-100 hover:scale-105 hover:z-20 -rotate-3 overflow-hidden"
      }`}
      style={
        !isMobile ? { transform: "translateY(36px) rotate(-3deg)" } : undefined
      }
    >
      <div className="w-24 h-4 bg-[#292524] rounded-full mx-auto mt-2.5 mb-3" />
      <div className="h-full bg-[#E8EFE8]/70 p-4 flex flex-col justify-between pb-10">
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#292524] mb-3">
            <span>9:41 AM</span>
            <span>5G • 100%</span>
          </div>
          <div className="bg-white/90 rounded-2xl p-3 border border-stone-200/60 shadow-xs mb-3">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Guaranteed Upfront Fare
            </span>
            <div className="text-xl font-bold text-[#292524] mt-0.5">
              $4.20
            </div>
            <div className="text-[11px] text-[#78716C]">
              Dhanmondi → Gulshan 1 (8.4 km)
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-3 border border-stone-200/50 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#78716C]">
              <span>Base Fare</span>
              <span className="font-semibold text-[#292524]">$1.00</span>
            </div>
            <div className="flex justify-between text-[#78716C]">
              <span>Distance (8.4km × $0.20)</span>
              <span className="font-semibold text-[#292524]">$1.68</span>
            </div>
            <div className="flex justify-between text-[#78716C]">
              <span>Service Fee</span>
              <span className="font-semibold text-[#292524]">$1.52</span>
            </div>
            <div className="border-t border-stone-200 pt-1.5 flex justify-between font-bold text-emerald-700">
              <span>Surge Multiplier</span>
              <span>0.0x (Free)</span>
            </div>
          </div>
        </div>
        <div className="w-full py-2.5 rounded-full bg-[#292524] text-white text-center text-xs font-semibold shadow-xs">
          Confirm Pickup Spot
        </div>
      </div>
    </div>
  );

  /* Reusable Phone Component 2: Main Live Tracking */
  const renderCenterPhone = (isMobile = false) => (
    <div
      className={`${
        isMobile
          ? "w-70 sm:w-75 h-135 shrink-0 snap-center rounded-[2.6rem] bg-white border-[3px] border-[#292524] shadow-2xl overflow-hidden transition-all duration-300 mx-auto"
          : "relative z-10 w-75 sm:w-[320px] h-145 sm:h-155 rounded-[2.8rem] bg-white border-[3px] border-[#292524] shadow-2xl overflow-hidden animate-float-slow"
      }`}
    >
      <div className="w-28 h-5 bg-[#292524] rounded-full mx-auto mt-2.5 mb-2 shadow-xs" />
      <div className="h-full bg-linear-to-b from-[#FFF5F4] to-[#FFE4E1] p-4 sm:p-5 flex flex-col justify-between pb-12">
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#292524] mb-3">
            <span>9:42 AM</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4caf50]" />
              Live GPS
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#FFB7B2]/60 shadow-sm mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFB7B2] flex items-center justify-center font-bold text-sm text-[#292524] shadow-xs">
                RA
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-[#292524]">
                  Rafiqul Alam
                </div>
                <div className="text-xs text-[#78716C]">
                  Honda CB 150 • 4.9 ★ (1,420 trips)
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-700">
                ⚡ Arriving in 2.1 mins
              </span>
              <span className="text-[#78716C]">0.6 km away</span>
            </div>
          </div>

          <div className="relative h-40 sm:h-44 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shadow-inner flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#292524_1px,transparent_1px)] bg-size-[12px_12px]" />
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 50 120 Q 130 60 230 40"
                fill="none"
                stroke="#FF9E98"
                strokeWidth="4"
                strokeDasharray="6,4"
              />
            </svg>
            <div className="absolute left-10 bottom-6 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                P
              </div>
              <span className="text-[9px] font-bold bg-white/90 px-1.5 rounded shadow-2xs mt-0.5">
                You
              </span>
            </div>
            <div className="absolute right-12 top-7 flex flex-col items-center animate-bounce">
              <div className="w-7 h-7 rounded-full bg-[#292524] border-2 border-[#FFB7B2] shadow-md flex items-center justify-center text-white text-xs">
                🏍️
              </div>
              <span className="text-[9px] font-bold bg-[#FFB7B2] text-[#292524] px-1.5 rounded shadow-2xs mt-0.5">
                2 min
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="w-full py-3 sm:py-3.5 rounded-full bg-[#292524] text-white text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md animate-pulse-subtle">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB7B2] animate-ping" />
            <span>Breathe • Your driver is on the way</span>
          </div>
          <span className="text-[10px] text-[#78716C] text-center">
            Trip OTP: <strong className="text-[#292524]">4892</strong> •
            Verified Partner
          </span>
        </div>
      </div>
    </div>
  );

  /* Reusable Phone Component 3: Driver Earnings & Instant Payout */
  const renderRightPhone = (isMobile = false) => (
    <div
      className={`${
        isMobile
          ? "w-70 sm:w-75 h-135 shrink-0 snap-center rounded-[2.6rem] bg-white border-[3px] border-[#292524] shadow-2xl overflow-hidden transition-all duration-300 mx-auto"
          : "hidden md:block absolute right-4 lg:right-12 top-16 w-67.5 h-135 rounded-[2.5rem] bg-white border-[2.5px] border-[#292524] shadow-xl opacity-85 transition-transform duration-500 hover:opacity-100 hover:scale-105 hover:z-20 rotate-3 overflow-hidden"
      }`}
      style={
        !isMobile ? { transform: "translateY(56px) rotate(3deg)" } : undefined
      }
    >
      <div className="w-24 h-4 bg-[#292524] rounded-full mx-auto mt-2.5 mb-3" />
      <div className="h-full bg-[#EFEDF4]/70 p-4 flex flex-col justify-between pb-10">
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#292524] mb-3">
            <span>9:41 AM</span>
            <span className="text-emerald-700 font-bold">Online 🟢</span>
          </div>
          <div className="bg-white/90 rounded-2xl p-3 border border-stone-200/60 shadow-xs mb-3">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
              Today&apos;s Earnings
            </span>
            <div className="text-2xl font-bold text-[#292524] mt-0.5">
              $142.50
            </div>
            <div className="text-[11px] text-[#78716C]">
              9 Completed Rides • 10% Flat Cut
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-3 border border-stone-200/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#78716C]">Available Balance</span>
              <span className="font-bold text-[#292524]">$142.50</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 font-medium">
              <span>Instant Bank/Debit</span>
              <span>✓ Ready</span>
            </div>
          </div>
        </div>
        <div className="w-full py-2.5 rounded-full bg-emerald-700 text-white text-center text-xs font-semibold shadow-xs">
          Withdraw to bKash (0 Fees)
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="solution"
      className="relative py-28 px-4 sm:px-6 bg-[#FDFCF8] border-t border-stone-200/60 overflow-hidden"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-212.5 h-112.5 bg-linear-to-r from-[#E8EFE8]/40 via-[#FFE4E1]/40 to-[#EFEDF4]/50 rounded-full blur-[130px] -z-10"
      />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#4caf50]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#78716C]">
              The Chalo Solution
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#292524] leading-tight">
            Designed for{" "}
            <span className="font-handwriting text-[#FF9E98] text-4xl sm:text-5xl md:text-6xl font-normal inline-block -rotate-2 transition-transform hover:rotate-0 duration-300 cursor-default">
              peace of mind
            </span>
            , from pickup to arrival
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#78716C] leading-relaxed">
            A ride-hailing experience stripped of deceitful surge algorithms and
            frustrating cancellations. Calm, transparent, and respectful of your
            time.
          </p>
        </div>

        {/* 1. Mobile Screen Horizontal Snap-Scroll Carousel (md:hidden) - One active display at a time */}
        <div className="md:hidden mb-20">
          <div className="text-center mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] bg-white border border-stone-200/80 px-3 py-1 rounded-full shadow-2xs">
              ← Swipe sideways to switch screens →
            </span>
          </div>

          <div
            ref={carouselRef}
            onScroll={handleMobileScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth py-6 px-4 gap-0 items-center no-scrollbar w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Phone 1 */}
            <div className="w-full min-w-full snap-center flex justify-center px-4">
              {renderLeftPhone(true)}
            </div>
            {/* Phone 2 */}
            <div className="w-full min-w-full snap-center flex justify-center px-4">
              {renderCenterPhone(true)}
            </div>
            {/* Phone 3 */}
            <div className="w-full min-w-full snap-center flex justify-center px-4">
              {renderRightPhone(true)}
            </div>
          </div>

          {/* Interactive Pagination Indicators on Mobile */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[
              { label: "Upfront Fare", icon: "💰" },
              { label: "Live Tracking", icon: "🗺️" },
              { label: "Driver Earnings", icon: "💳" },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToSlide(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  mobileSlide === idx
                    ? "bg-[#292524] text-white shadow-xs scale-105"
                    : "bg-white text-[#78716C] border border-stone-200/80 hover:bg-stone-50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Desktop 3-Phone Cascade App Preview (hidden on mobile, visible md:flex) */}
        <div className="hidden md:flex relative py-10 mb-24 items-center justify-center">
          <div className="relative w-full max-w-4xl flex items-center justify-center min-h-145 sm:min-h-160">
            {renderLeftPhone(false)}
            {renderCenterPhone(false)}
            {renderRightPhone(false)}
          </div>
        </div>

        {/* Feature Grid / Cards ("Why Chalo?") */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#292524]">
              Everything you need for a stress-free commute
            </h3>
            <p className="text-sm text-[#78716C] mt-1">
              Built with precision engineering and thoughtful human design
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveFeature(idx)}
                className={`relative bg-white border rounded-3xl p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                  activeFeature === idx
                    ? "border-[#FFB7B2] shadow-md shadow-[#FFB7B2]/10"
                    : "border-stone-200/80 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${feature.accentBg}`}
                  >
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] bg-stone-100 px-3 py-1 rounded-full">
                    {feature.tag}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#292524] transition-colors group-hover:text-[#FF9E98]">
                  {feature.title}
                </h4>
                <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Value Proposition CTA Banner */}
        <div className="relative bg-linear-to-br from-[#292524] to-[#1c1917] rounded-[2.5rem] p-8 sm:p-14 text-white overflow-hidden shadow-2xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-10 w-96 h-96 bg-[#FFB7B2]/20 rounded-full blur-3xl"
          />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFB7B2] mb-3">
              Ready to ride calmer?
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Say goodbye to surge prices and cancelled rides today.
            </h3>
            <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed">
              Experience the difference of upfront flat rates and respected
              drivers. Your first ride is only a click away.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/register?role=CUSTOMER"
                className="h-12 px-8 rounded-full bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <span>Book Your First Ride</span>
                <svg
                  className="w-4 h-4"
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
              <Link
                href="/register?role=DRIVER"
                className="h-12 px-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm sm:text-base flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <span>Join as a Driver Partner</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
