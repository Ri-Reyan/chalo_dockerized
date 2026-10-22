"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log unexpected errors for client monitoring
    console.error("Chalo App Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#292524] flex flex-col justify-between p-4 sm:p-8 font-sans bg-grain relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#FFE4E1]/50 blur-[100px] -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 w-88 h-88 rounded-full bg-[#E8EFE8]/60 blur-[100px] -z-10"
      />

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pt-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#292524]">
            Chalo
          </span>
        </Link>
      </header>

      {/* Center Error Card */}
      <main className="max-w-xl w-full mx-auto my-auto text-center py-12 px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
          <span>⚠️</span>
          <span>Temporary Roadblock Detected</span>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-[#FFB7B2]/40 text-[#292524] flex items-center justify-center text-3xl mx-auto mb-5 shadow-xs border border-[#FFB7B2]/60">
          🛠️
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] mb-3">
          We hit an unexpected bump in the road.
        </h1>

        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
          Something didn&apos;t go quite right on our end. Your ride data and
          account balance are safely preserved. Please try again.
        </p>

        {/* Technical Error Details (Compact) */}
        {error.message && (
          <div className="mb-8 p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-left max-w-md mx-auto text-[11px] font-mono text-stone-600 truncate">
            <span className="font-bold text-stone-700">Notice: </span>
            {error.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-sm tracking-wide shadow-sm hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <span>↻</span>
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-[#292524] font-bold text-sm border border-stone-200 shadow-2xs transition-all text-center"
          >
            Return to Homepage &rarr;
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-stone-400 pb-2">
        If this issue persists, contact our 24/7 hotline at{" "}
        <span className="font-semibold text-stone-600">support@chalo.app</span>
      </footer>
    </div>
  );
}

