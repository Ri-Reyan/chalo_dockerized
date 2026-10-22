"use client";

import React, { useState, useEffect } from "react";

interface CustomerProfileViewProps {
  customerName: string;
  customerEmail: string;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  customerName,
  customerEmail,
}) => {
  const [name, setName] = useState(customerName || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (customerName) {
      setName(customerName);
    }
  }, [customerName]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FFB7B2] text-[#292524] flex items-center justify-center text-2xl font-black shadow-xs">
              {name ? name.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E8EFE8] border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <span>Verified Customer</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#292524]">{name}</h1>
              <p className="text-xs text-stone-500">{customerEmail}</p>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
            <span className="text-[11px] text-stone-500 block">
              Customer Balance
            </span>
            <div className="text-2xl font-black text-[#292524]">$0.00</div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Cashless Auto-Billing Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Details (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[#292524] uppercase tracking-wider">
            Account Information
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address (Prisma Unique Identifier)
              </label>
              <input
                type="email"
                disabled
                value={customerEmail}
                className="w-full h-11 px-3.5 bg-stone-100 text-stone-500 rounded-xl border border-stone-200 text-sm font-medium cursor-not-allowed"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Email address is linked to your authenticated session.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Assigned Platform Role
              </label>
              <div className="h-11 px-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center text-sm font-bold text-[#292524]">
                CUSTOMER
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-bold text-xs uppercase tracking-wide transition-all shadow-xs"
              >
                Save Profile Changes
              </button>
              {isSaved && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                  <span>✓</span> Changes saved!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Platform Compliance & Safety (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Safety & Protection Settings */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#292524]">
              Safety &amp; Protection
            </h3>
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Emergency SOS Hotline
                </span>
                <span className="text-emerald-700 font-bold">
                  ✓ 24/7 Monitored
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Live GPS Route Tracking
                </span>
                <span className="text-emerald-700 font-bold">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Verified Drivers (NID &amp; License)
                </span>
                <span className="text-emerald-700 font-bold">✓ Enforced</span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-200 pt-2">
                <span className="text-stone-600 font-medium">
                  Guaranteed Zero Surge Pricing
                </span>
                <span className="text-emerald-700 font-bold">
                  ✓ 100% Locked
                </span>
              </div>
            </div>
          </div>

          {/* Ride & Billing Preferences */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#292524]">
              Trip &amp; Billing Preferences
            </h3>
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Default Payment
                </span>
                <span className="text-[#292524] font-semibold">
                  Cashless / Auto-Captured
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Digital Ride Invoices
                </span>
                <span className="text-[#292524] font-semibold">
                  Instant Download
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Cancellation Window
                </span>
                <span className="text-emerald-700 font-semibold">
                  Free within 3 mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileView;
