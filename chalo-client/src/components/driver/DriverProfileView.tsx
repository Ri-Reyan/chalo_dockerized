"use client";

import React, { useState, useEffect } from "react";

interface DriverProfileViewProps {
  driverName: string;
  driverEmail: string;
  vehicleType: "BIKE" | "CAR";
  setVehicleType: (vt: "BIKE" | "CAR") => void;
  isOnline: boolean;
  balance: number;
}

export const DriverProfileView: React.FC<DriverProfileViewProps> = ({
  driverName,
  driverEmail,
  vehicleType,
  setVehicleType,
  isOnline,
  balance,
}) => {
  const [name, setName] = useState(driverName || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (driverName) {
      setName(driverName);
    }
  }, [driverName]);

  const handleSave = (e: React.FormEvent) => {
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
              {name ? name.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E8EFE8] border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <span>Verified Driver Partner</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#292524]">{name}</h1>
              <p className="text-xs text-stone-500">{driverEmail}</p>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
            <span className="text-[11px] text-stone-500 block">
              Available Balance
            </span>
            <div className="text-2xl font-black text-[#292524]">
              ${balance.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Status: {isOnline ? "Online 🟢" : "Offline ⏸️"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Driver Info & Vehicle Assignment (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[#292524] uppercase tracking-wider">
            Driver &amp; Vehicle Configuration
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Legal Driver Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Registered Email (Prisma User ID)
              </label>
              <input
                type="email"
                disabled
                value={driverEmail}
                className="w-full h-11 px-3.5 bg-stone-100 text-stone-500 rounded-xl border border-stone-200 text-sm font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Active Vehicle Class (Prisma Enum: BIKE | CAR)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVehicleType("BIKE")}
                  className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    vehicleType === "BIKE"
                      ? "bg-[#FFB7B2]/25 text-[#292524] border-[#FFB7B2] shadow-2xs font-bold scale-[1.01]"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span>🏍️</span>
                  <span>Motorbike (BIKE)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleType("CAR")}
                  className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    vehicleType === "CAR"
                      ? "bg-[#FFB7B2]/25 text-[#292524] border-[#FFB7B2] shadow-2xs font-bold scale-[1.01]"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span>🚗</span>
                  <span>Car / Sedan (CAR)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Assigned Platform Role
              </label>
              <div className="h-11 px-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center text-sm font-bold text-[#292524]">
                DRIVER
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-bold text-xs uppercase tracking-wide transition-all shadow-xs"
              >
                Save Driver Settings
              </button>
              {isSaved && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                  <span>✓</span> Settings updated!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Verification & Policy Badges (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#292524]">
              Platform Compliance
            </h3>

            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Driver License Check:
                </span>
                <span className="text-emerald-700 font-bold">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  National ID (NID):
                </span>
                <span className="text-emerald-700 font-bold">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Vehicle Fitness Certificate:
                </span>
                <span className="text-emerald-700 font-bold">✓ Passed</span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-200 pt-2">
                <span className="text-stone-600 font-medium">
                  Platform Commission Rate:
                </span>
                <span className="text-emerald-700 font-bold">10% Flat Cut</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfileView;
