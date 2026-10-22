"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Drive", href: "#driver" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 rounded-full border px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between ${
          isScrolled
            ? "bg-white/85 backdrop-blur-xl border-stone-200/80 shadow-md shadow-stone-900/5"
            : "bg-white/70 backdrop-blur-md border-stone-200/50 shadow-sm"
        }`}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB7B2] rounded-full"
        >
          {/* Circular 32px avatar in Coral #FFB7B2 with white dot center */}
          <div className="relative w-8 h-8 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-105">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <div className="absolute inset-0 rounded-full border border-white/40" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#292524] leading-none">
              Chalo
            </span>
            <span className="text-[10px] font-medium text-[#78716C] tracking-wide uppercase">
              Mobility
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#78716C] hover:text-[#292524] px-3 py-1.5 rounded-full transition-colors duration-200 hover:bg-stone-100/60"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-[#292524] hover:text-stone-950 px-3.5 py-2 rounded-full transition-colors duration-200 hover:bg-stone-100/70"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-white bg-[#292524] hover:bg-stone-800 px-5 py-2 rounded-full transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#292524] px-2.5 py-1.5 rounded-full bg-stone-100"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#292524] bg-stone-100 hover:bg-stone-200 transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-4 h-4"
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
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-16 left-4 right-4 sm:hidden bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-3xl p-5 shadow-xl shadow-stone-900/10 flex flex-col gap-3 transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-1 pb-3 border-b border-stone-100">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#292524] px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <Link
              href="/register?role=CUSTOMER"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-semibold text-white bg-[#292524] hover:bg-stone-800 py-3 rounded-full transition-colors"
            >
              Book a Ride
            </Link>
            <Link
              href="/register?role=DRIVER"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-semibold text-[#292524] border border-stone-300 hover:bg-stone-50 py-3 rounded-full transition-colors"
            >
              Drive with Chalo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
