"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.context";

export type DriverTab =
  | "requests"
  | "ongoing"
  | "history"
  | "withdraw"
  | "profile";

interface DriverSidebarProps {
  activeTab: DriverTab;
  setActiveTab: (tab: DriverTab) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  hasActiveRide: boolean;
  driverName: string;
  vehicleType: "BIKE" | "CAR";
  balance: number;
  currentAddress?: string;
  onOpenLocationModal?: () => void;
}

export const DriverSidebar: React.FC<DriverSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  setIsOnline,
  hasActiveRide,
  driverName,
  vehicleType,
  balance,
  currentAddress,
  onOpenLocationModal,
}) => {
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

  const navItems: {
    id: DriverTab;
    label: string;
    icon: string;
    badge?: string;
  }[] = [
    {
      id: "requests",
      label: "Available Requests",
      icon: "📲",
    },
    {
      id: "ongoing",
      label: "Ongoing Ride",
      icon: "📍",
      badge: hasActiveRide ? "Active" : undefined,
    },
    {
      id: "history",
      label: "Ride History",
      icon: "📜",
    },
    {
      id: "withdraw",
      label: "Withdraw",
      icon: "💳",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-stone-200/80 flex flex-col justify-between shrink-0 shadow-xs">
      <div className="p-5 sm:p-6">
        {/* Brand Logo */}
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
              Driver Partner Hub
            </span>
          </div>
        </Link>

        {/* Driver Profile Card */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 mb-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFB7B2] text-[#292524] flex items-center justify-center font-bold text-sm shadow-xs">
              {driverName ? driverName.charAt(0).toUpperCase() : "D"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-[#292524] truncate">
                {driverName || "Driver Partner"}
              </div>
              <div className="text-[11px] text-stone-600 font-semibold flex items-center gap-1">
                <span>{vehicleType === "BIKE" ? "🏍️ Bike" : "🚗 Car"}</span>
                <span className="text-emerald-700">&bull; Verified</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Balance:</span>
            <span className="font-extrabold text-[#292524]">
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Online / Offline Availability Toggle */}
        <div className="mb-6 bg-stone-50 border border-stone-200/80 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isOnline ? "bg-emerald-500 animate-ping" : "bg-stone-400"
                }`}
              />
              <span className="text-xs font-bold text-[#292524]">
                {isOnline ? "You are Online" : "You are Offline"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isOnline ? "bg-emerald-500" : "bg-stone-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isOnline ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="mt-1 text-[10px] text-stone-500">
            {isOnline
              ? "Ready to receive nearby customer ride requests"
              : "Toggle online to start receiving ride offers"}
          </div>

          {/* Location Setup Trigger */}
          {onOpenLocationModal && (
            <div className="mt-2.5 pt-2 border-t border-stone-200/60">
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="w-full flex items-center justify-between gap-1.5 p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-left transition-all group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-sm shrink-0">📍</span>
                  <div className="overflow-hidden">
                    <span className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                      Starting Location
                    </span>
                    <span className="block text-xs font-semibold text-[#292524] truncate">
                      {currentAddress || "Set location on map"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                  Edit &rarr;
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Driver Navigation">
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

      {/* Sign Out */}
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

export default DriverSidebar;
