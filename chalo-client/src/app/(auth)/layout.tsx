import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#292524] flex flex-col justify-between relative overflow-hidden bg-grain selection:bg-[#FFB7B2] selection:text-[#292524]">
      {/* Decorative Warm Ambient Blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FFE4E1]/60 blur-[110px] animate-float-slow -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#E6E6FA]/60 blur-[120px] animate-float-slow-reverse -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-[#E8EFE8]/40 blur-[90px] -z-10"
      />

      {/* Auth Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB7B2] rounded-full"
        >
          {/* Circular 32px avatar in Coral #FFB7B2 with white dot center */}
          <div className="relative w-8 h-8 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
            <div className="absolute inset-0 rounded-full border border-white/40" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#292524] leading-none">
              Chalo
            </span>
            <span className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider">
              Mobility
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#292524] px-4 py-2 rounded-full bg-white/80 border border-stone-200/80 shadow-xs hover:border-stone-300 transition-all flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        {children}
      </main>

      {/* Auth Bottom Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-6 text-center text-xs text-stone-500">
        <p>
          &copy; 2026 Chalo Technologies Inc. Guaranteed flat fares & fair
          driver earnings.
        </p>
      </footer>
    </div>
  );
}
