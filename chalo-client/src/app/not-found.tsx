"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#292524] flex flex-col justify-between p-4 sm:p-8 font-sans bg-grain relative overflow-hidden">
      {/* Ambient background blur blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#FFE4E1]/50 blur-[100px] -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 w-88 h-88 rounded-full bg-[#E8EFE8]/60 blur-[100px] -z-10"
      />

      {/* Top Header Logo */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pt-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#292524]">
            Chalo
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-bold text-stone-600 hover:text-[#292524] transition-colors"
        >
          &larr; Back to Safety
        </Link>
      </header>

      {/* Center 404 Hero Card */}
      <main className="max-w-xl w-full mx-auto my-auto text-center py-12 px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE8] border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
          <span>📍</span>
          <span>404 • Destination Not Found</span>
        </div>

        {/* Big stylized 404 */}
        <div className="text-7xl sm:text-9xl font-black text-[#292524] tracking-tight leading-none mb-4 select-none">
          4<span className="text-[#FF9E98] inline-block rotate-6">0</span>4
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] mb-3">
          Looks like you took an uncharted detour.
        </h1>

        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
          The stop or page you are looking for doesn&apos;t exist on our route
          map or has been moved to a new destination. Let&apos;s get your journey
          back on schedule.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-sm tracking-wide shadow-sm hover:scale-105 active:scale-95 transition-all text-center"
          >
            Return to Homepage &rarr;
          </Link>
          <Link
            href="/customer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-[#292524] font-bold text-sm border border-stone-200 shadow-2xs transition-all text-center"
          >
            Open Customer Hub
          </Link>
        </div>

        {/* Quick Links Footer */}
        <div className="mt-12 pt-6 border-t border-stone-200/70 flex items-center justify-center gap-6 text-xs text-stone-500">
          <Link href="/login" className="hover:text-[#292524] transition-colors">
            Sign In
          </Link>
          <span>&bull;</span>
          <Link
            href="/register"
            className="hover:text-[#292524] transition-colors"
          >
            Create Account
          </Link>
          <span>&bull;</span>
          <Link href="/driver" className="hover:text-[#292524] transition-colors">
            Driver Hub
          </Link>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-stone-400 pb-2">
        &copy; 2026 Chalo Mobility Inc. All rights reserved.
      </footer>
    </div>
  );
}
