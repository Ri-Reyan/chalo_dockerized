"use client";

import React, { useState } from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsLoading(true);
    // Simulate instantaneous feedback
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setEmail("");
    }, 600);
  };

  return (
    <footer className="relative bg-[#292524] text-stone-300 overflow-hidden">
      {/* 1. Pre-Footer Waitlist / Community CTA Banner (As specified in design_spec.md) */}
      <div className="relative border-b border-stone-800 bg-stone-900/60 py-20 px-4 sm:px-6">
        {/* Subtle decorative inner ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-[#FFB7B2]/10 rounded-full blur-[100px]"
        />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center text-center">
          {/* 64px Icon with rounded corners, #292524 bg, Coral #FFB7B2 dot centered */}
          <div className="w-16 h-16 rounded-2xl bg-[#292524] border border-stone-700/80 shadow-lg flex items-center justify-center mb-6">
            <div className="w-4 h-4 rounded-full bg-[#FFB7B2] shadow-sm animate-pulse" />
          </div>

          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Join our{" "}
            <span className="font-handwriting text-[#FF9E98] text-4xl sm:text-5xl font-normal inline-block -rotate-3 transition-transform hover:rotate-0 duration-300 cursor-default">
              community
            </span>
          </h3>

          <p className="mt-3 text-sm sm:text-base text-stone-400 max-w-md leading-relaxed">
            Get early access to expanded coverage areas, seasonal fare perks,
            and transparent updates on fair mobility.
          </p>

          {/* Waitlist Subscription Form */}
          <div className="mt-8 w-full">
            {isSubscribed ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-full px-6 py-3.5 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in duration-300">
                <span className="text-base">✓</span>
                <span>
                  Check your email! You&apos;re now on the early VIP list.
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row items-center gap-3 w-full"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your personal or work email"
                  className="w-full h-12 px-5 rounded-full bg-stone-800/80 border border-stone-700 text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB7B2] focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-bold text-sm shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 shadow-md shadow-[#FFB7B2]/20"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#292524] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Join Now</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main 3-Column / 4-Column Footer Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Story & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Chalo
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Chalo is the future of calm, transparent urban mobility. Built to
              guarantee fair earnings for drivers and honest, zero-surge rides
              for passengers.
            </p>
            <div className="pt-2 text-xs text-stone-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Dhaka &bull; Chattogram &bull; Expanding Soon</span>
            </div>
          </div>

          {/* Column 2: Riders */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Riders
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li>
                <Link
                  href="/register?role=CUSTOMER"
                  className="hover:text-white transition-colors"
                >
                  Book a Ride
                </Link>
              </li>
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Instant Fare Estimator
                </a>
              </li>
              <li>
                <a
                  href="#problem"
                  className="hover:text-white transition-colors"
                >
                  Zero Surge Guarantee
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  Safety & SOS Shield
                </a>
              </li>
              <li>
                <Link
                  href="/customer"
                  className="text-[#FFB7B2] hover:underline font-semibold"
                >
                  Customer Dashboard →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Drivers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Drivers
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li>
                <Link
                  href="/register?role=DRIVER"
                  className="hover:text-white transition-colors"
                >
                  Become a Driver Partner
                </Link>
              </li>
              <li>
                <a
                  href="#solution"
                  className="hover:text-white transition-colors"
                >
                  10% Flat Platform Cut
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Instant Wallet Payouts
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  Requirements & Verification
                </a>
              </li>
              <li>
                <Link
                  href="/driver"
                  className="text-[#FFB7B2] hover:underline font-semibold"
                >
                  Driver Dashboard →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Socials */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Connect With Us
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400 mb-6">
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@chalo.app"
                  className="hover:text-white transition-colors"
                >
                  24/7 Safety Dispatch Desk
                </a>
              </li>
              <li>
                <span className="text-stone-500">Press & Media Kit</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* Twitter / X */}
              <a
                href="#social"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#social"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#social"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & Copyright Bar (12px, centered bottom, opacity 0.6) */}
        <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            &copy; 2026 Chalo Technologies Inc. Built for dignified urban
            transit.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-400 cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="hover:text-stone-400 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-stone-400 cursor-pointer transition-colors">
              Security & Trust
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
