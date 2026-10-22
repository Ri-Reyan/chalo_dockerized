"use client";

import React, { useState, useEffect, useRef } from "react";

interface StatItem {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description: string;
}

const stats: StatItem[] = [
  {
    target: 50000,
    decimals: 0,
    suffix: "+",
    label: "Safe Trips Completed",
    description: "Navigating city streets with zero surge markups",
  },
  {
    target: 1250,
    decimals: 0,
    suffix: "+",
    label: "Verified Drivers",
    description: "Every driver vetted with national ID and background checks",
  },
  {
    target: 4.9,
    decimals: 1,
    suffix: " / 5.0",
    label: "Community Rating",
    description: "From over 18,000 authenticated rider reviews",
  },
  {
    target: 2.4,
    decimals: 1,
    suffix: " min",
    label: "Average Pickup Time",
    description: "Smart localized dispatch gets drivers to you swiftly",
  },
];

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  signature: string;
  rotation: string;
  bgTint: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "No surge pricing at 6 PM during heavy rain felt unreal. Chalo has made my daily office commute completely stress-free.",
    author: "Farhana Rahman",
    role: "Daily Commuter • Gulshan to Motijheel",
    signature: "Farhana Rahman",
    rotation: "-rotate-1 hover:rotate-0",
    bgTint: "bg-[#FDFCF8]",
    rating: 5,
  },
  {
    quote:
      "As a driver partner, fair commissions mean I actually take home what I earn. Withdrawals are instant and support is real.",
    author: "Kamal Hossain",
    role: "Chalo Driver Partner • 4.98 ★",
    signature: "Kamal Hossain",
    rotation: "rotate-1 hover:rotate-0",
    bgTint: "bg-[#FAF8F5]",
    rating: 5,
  },
  {
    quote:
      "The real-time driver tracking and SOS safety features give me complete confidence whenever I head home late from campus.",
    author: "Tahsin Ahmed",
    role: "Student, University of Dhaka",
    signature: "Tahsin Ahmed",
    rotation: "-rotate-1 sm:-rotate-2 hover:rotate-0",
    bgTint: "bg-[#FAF8F5]",
    rating: 5,
  },
  {
    quote:
      "The simplest ride-hailing experience I've used. Clean typography, transparent fares upfront, and respectful drivers every time.",
    author: "Nusrat Jahan",
    role: "Product Designer • Dhanmondi",
    signature: "Nusrat Jahan",
    rotation: "rotate-1 sm:rotate-2 hover:rotate-0",
    bgTint: "bg-[#FDFCF8]",
    rating: 5,
  },
];

/**
 * AnimatedCounter component
 * Starts at 0 and smoothly counts up to target using ease-out sine interpolation over 3000ms.
 * Runs once and preserves its final value permanently.
 */
const AnimatedCounter: React.FC<{
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  isVisible: boolean;
}> = ({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 3000,
  isVisible,
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out sine curve: gentle, visible, and gradual
      const easeProgress = Math.sin((progress * Math.PI) / 2);
      const value = easeProgress * target;

      setCurrent(value);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, isVisible]);

  const formattedNumber =
    decimals > 0
      ? current.toFixed(decimals)
      : Math.floor(current).toLocaleString();

  return (
    <span>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export const SocialProof: React.FC = () => {
  const [hasTriggered, setHasTriggered] = useState(false);
  const statsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If already triggered once, do not observe again
    if (hasTriggered) return;

    const el = statsContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          // Trigger the animation once
          setHasTriggered(true);
          // Disconnect permanently so it never re-triggers on scroll
          observer.disconnect();
        }
      },
      {
        threshold: 0.25, // Triggers when at least 25% of the stats container is visible
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasTriggered]);

  return (
    <section
      id="social-proof"
      className="relative py-24 px-4 sm:px-6 bg-[#FDFCF8] border-t border-stone-200/50 overflow-hidden"
    >
      {/* Background Decorative Gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 bg-linear-to-r from-[#E8EFE8]/40 via-[#EFEDF4]/30 to-[#FFE4E1]/40 rounded-full blur-3xl -z-10"
      />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#4caf50]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#78716C]">
              Real People • Honest Numbers
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#292524] leading-tight">
            Trusted by commuters across the city
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#78716C] leading-relaxed">
            From daily rush-hour commuters to dedicated driver partners, Chalo
            is built on respect, reliability, and fair economics.
          </p>
        </div>

        {/* 1. Numerical Stats Grid with One-Time Smooth Scroll-Triggered Count-Up */}
        <div
          ref={statsContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[#292524] tracking-tight group-hover:text-[#FF9E98] transition-colors tabular-nums min-h-11 flex items-center">
                <AnimatedCounter
                  target={stat.target}
                  decimals={stat.decimals}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={3000}
                  isVisible={hasTriggered}
                />
              </div>
              <div className="mt-2 text-sm font-bold text-[#292524]">
                {stat.label}
              </div>
              <p className="mt-1 text-xs text-[#78716C] leading-normal">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* 2. Sticky-Note Style Testimonials Grid */}
        <div className="relative">
          <div className="text-center mb-8">
            <span className="text-xs uppercase font-bold tracking-widest text-[#78716C]">
              What our community says
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className={`relative border border-stone-200/90 rounded-3xl p-7 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${item.bgTint} ${item.rotation}`}
              >
                {/* Subtle top sticky tape accent */}
                <div
                  aria-hidden="true"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-stone-200/60 rounded-xs shadow-2xs rotate-1"
                />

                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4 text-[#d4b454]">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote (18px Outfit, #292524, italic) */}
                <blockquote className="text-base sm:text-lg text-[#292524] italic leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                {/* 32px Horizontal Signature Line */}
                <div className="w-8 h-0.5 bg-[#292524]/20 my-5" />

                {/* Signature line in Reenie Beanie cursive + Name & Role */}
                <div>
                  <div className="font-handwriting text-2xl sm:text-3xl text-[#78716C] -mt-1 leading-none select-none">
                    {item.signature}
                  </div>
                  <div className="mt-2 text-sm font-bold text-[#292524]">
                    {item.author}
                  </div>
                  <div className="text-xs text-[#78716C]">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Assurance Strip */}
        <div className="mt-16 py-6 px-6 sm:px-10 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E8EFE8] flex items-center justify-center text-[#292524] font-bold text-sm">
              🛡️
            </div>
            <div>
              <div className="text-sm font-semibold text-[#292524]">
                100% Ride Safety Guarantee
              </div>
              <div className="text-xs text-[#78716C]">
                SOS emergency dispatch, verified vehicle documents, & 24/7
                hotline
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold text-[#78716C]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4caf50]" />
              Government Licensed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4caf50]" />
              Encrypted Data
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
