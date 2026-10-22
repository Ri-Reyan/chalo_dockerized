"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "@/lib/toast";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const rideId = searchParams.get("ride_id");

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#292524] flex flex-col justify-between p-4 sm:p-8 font-sans bg-grain relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#FFE4E1]/50 blur-[100px] -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 w-88 h-88 rounded-full bg-stone-200/50 blur-[100px] -z-10"
      />

      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pt-2">
        <Link href="/customer" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#292524]">
            Chalo
          </span>
        </Link>
      </header>

      {/* Main Cancellation Card */}
      <main className="max-w-lg w-full mx-auto my-auto text-center py-10 px-4">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-xs">
            🛑
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs uppercase tracking-wider border border-amber-200">
              Payment Cancelled
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524]">
              Checkout Session Aborted
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
              You chose to cancel your Stripe checkout session. No charge or hold
              has been placed on your card.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 text-left space-y-1">
            <div className="font-bold text-[#292524]">What happens next?</div>
            <div>
              &bull; Your route selections are saved in your session.
            </div>
            <div>
              &bull; You can modify your pickup or destination and re-request a ride
              at any time.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/customer"
              onClick={() => {
                toast.info(
                  "Checkout Cancelled",
                  "You can request a ride whenever you are ready.",
                );
              }}
              className="flex-1 py-4 px-6 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-sm tracking-wide shadow-sm hover:scale-[1.01] active:scale-95 transition-all block text-center"
            >
              Return to Customer Hub &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-stone-400 pb-2">
        &copy; 2026 Chalo Mobility Inc. Safe, transparent urban mobility.
      </footer>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
          <div className="flex items-center gap-3 text-stone-600 font-bold text-sm">
            <div className="w-5 h-5 border-2 border-stone-700 border-t-transparent rounded-full animate-spin" />
            <span>Loading cancellation status...</span>
          </div>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}

