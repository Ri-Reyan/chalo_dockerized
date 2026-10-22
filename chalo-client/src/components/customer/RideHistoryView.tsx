"use client";

import React, { useState, useEffect } from "react";
import { ActiveRideState } from "./RequestRideView";
import api from "@/lib/axios";

interface RideHistoryViewProps {
  rides?: ActiveRideState[];
  onRebook: (pickup: string, destination: string) => void;
}

export const RideHistoryView: React.FC<RideHistoryViewProps> = ({
  rides: initialRides = [],
  onRebook,
}) => {
  const [ridesList, setRidesList] = useState<ActiveRideState[]>(initialRides);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] =
    useState<ActiveRideState | null>(null);

  // Hydrate persistent ride history from backend
  useEffect(() => {
    let isMounted = true;
    api
      .get("/rides/history?role=CUSTOMER")
      .then((res) => {
        if (isMounted && res.data?.success && Array.isArray(res.data.data)) {
          const mapped: ActiveRideState[] = res.data.data.map((r: any) => ({
            id: r.id,
            pickup: r.pickup || "Pickup Location",
            destination: r.destination || "Destination",
            pickupLat: r.pickupLat,
            pickupLng: r.pickupLng,
            destinationLat: r.destinationLat,
            destinationLng: r.destinationLng,
            vehicleType: r.vehicleType,
            distanceKm: Number(r.distanceKm),
            fare: Number(r.fare),
            status: r.status,
            driver: r.driver,
            createdAt: new Date(r.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }));
          setRidesList(mapped);
        }
      })
      .catch((err) => {
        console.warn("Could not load backend ride history:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const allRides = ridesList;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
            Trip Records & Receipts
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524]">
            Ride History
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            View detailed trip breakdowns, driver details, and receipts for all
            your travels.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
          <span className="text-[11px] text-stone-500 block">
            Total Trips Completed
          </span>
          <div className="text-2xl font-black text-[#292524]">
            {allRides.length} Trips
          </div>
        </div>
      </div>

      {/* Rides List or Empty State */}
      {allRides.length === 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 text-3xl flex items-center justify-center mx-auto shadow-inner">
            📜
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#292524]">
              No rides completed yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              Your trip history, driver details, and locked fare receipts will
              appear here once you take your first ride with Chalo.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onRebook("", "")}
              className="px-6 py-3 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm hover:scale-105 active:scale-95"
            >
              Book a Ride Now &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {allRides.map((ride) => (
            <div
              key={ride.id}
              className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <span className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-lg shrink-0">
                  {ride.vehicleType === "BIKE" ? "🏍️" : "🚗"}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#292524]">
                      {ride.pickup} → {ride.destination}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E8EFE8] text-emerald-800 border border-emerald-200">
                      {ride.status}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                    <span>{ride.createdAt}</span>
                    <span>&bull;</span>
                    <span>{ride.distanceKm} km</span>
                    <span>&bull;</span>
                    <span>Driver: {ride.driver?.name || "Driver"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                <div className="text-right">
                  <span className="text-xs text-stone-500 block sm:hidden">
                    Fare:
                  </span>
                  <span className="text-base font-extrabold text-[#292524]">
                    ${Number(ride.fare).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(ride)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold border border-stone-200 transition-colors"
                  >
                    Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => onRebook(ride.pickup, ride.destination)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-bold shadow-2xs transition-colors"
                  >
                    Book Again
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded-full bg-[#FFB7B2] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-base font-bold text-[#292524]">
                  Chalo Trip Receipt
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-stone-400 hover:text-[#292524] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-stone-500 space-y-1">
              <div>
                Receipt ID:{" "}
                <span className="font-mono text-[#292524]">
                  {selectedReceipt.id}
                </span>
              </div>
              <div>
                Date &amp; Time:{" "}
                <span className="text-[#292524] font-medium">
                  {selectedReceipt.createdAt}
                </span>
              </div>
              <div>
                Vehicle:{" "}
                <span className="text-[#292524] font-medium">
                  {selectedReceipt.vehicleType === "BIKE" ? "Motorbike" : "Car"}
                </span>
              </div>
              <div>
                Driver:{" "}
                <span className="text-[#292524] font-medium">
                  {selectedReceipt.driver?.name || "Driver"} (
                  {selectedReceipt.driver?.plateNumber || "Verified"})
                </span>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>From:</span>
                <span className="font-semibold text-[#292524]">
                  {selectedReceipt.pickup}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>To:</span>
                <span className="font-semibold text-[#292524]">
                  {selectedReceipt.destination}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Distance:</span>
                <span className="font-semibold text-[#292524]">
                  {selectedReceipt.distanceKm} km
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold border-t border-stone-200 pt-2">
                <span>Surge Charge:</span>
                <span>$0.00 (Zero Surge Guaranteed)</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#292524] border-t border-stone-300 pt-2">
                <span>Total Amount Paid:</span>
                <span>${Number(selectedReceipt.fare).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-200 transition-colors"
              >
                🖨️ Print
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideHistoryView;
