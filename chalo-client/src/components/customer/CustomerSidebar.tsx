"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.context";

export type CustomerTab = "request" | "tracking" | "history" | "profile";

interface CustomerSidebarProps {
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
  hasActiveRide: boolean;
  customerName: string;
  customerEmail: string;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveRide,
  customerName,
  customerEmail,
}) => {
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

  const navItems: {
    id: CustomerTab;
    label: string;
    icon: string;
    badge?: string;
  }[] = [
    {
      id: "request",
      label: "Request Ride",
      icon: "🚗",
    },
    {
      id: "tracking",
      label: "Ongoing Ride",
      icon: "📍",
      badge: hasActiveRide ? "Live" : undefined,
    },
    {
      id: "history",
      label: "Ride History",
      icon: "📜",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-stone-200/80 flex flex-col justify-between shrink-0 shadow-xs">
      {/* Top Branding & Profile Summary */}
      <div className="p-5 sm:p-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none mb-6"
        >
          <div className="relative w-8 h-8 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
            <div className="absolute inset-0 rounded-full border border-white/40" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#292524] leading-none">
              Chalo
            </span>
            <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
              Customer Hub
            </span>
          </div>
        </Link>

        {/* Customer Info Card */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 mb-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFB7B2] text-[#292524] flex items-center justify-center font-bold text-sm shadow-xs">
              {customerName ? customerName.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-[#292524] truncate">
                {customerName || "Customer"}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                {customerEmail || "No email connected"}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Role:</span>
            <span className="font-bold text-[#292524] bg-stone-200/80 px-2 py-0.5 rounded-md text-[10px] uppercase">
              Customer
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1.5" aria-label="Customer Dashboard Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#FFB7B2]/25 text-[#292524] border border-[#FFB7B2]/70 shadow-2xs font-bold scale-[1.01]"
                    : "text-stone-600 hover:text-[#292524] hover:bg-stone-100/80 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-[#292524] text-white"
                        : "bg-emerald-600 text-white animate-pulse"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sign Out Bar */}
      <div className="p-5 sm:p-6 border-t border-stone-200/70">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#292524] bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
