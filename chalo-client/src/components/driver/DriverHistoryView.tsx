"use client";

import React, { useState, useEffect } from "react";
import { DriverRideOffer } from "./AvailableRequestsView";
import api from "@/lib/axios";

interface DriverHistoryViewProps {
  completedRides?: DriverRideOffer[];
}

export const DriverHistoryView: React.FC<DriverHistoryViewProps> = ({
  completedRides: initialRides = [],
}) => {
  const [tripsList, setTripsList] = useState<DriverRideOffer[]>(initialRides);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate persistent driver ride history from backend
  useEffect(() => {
    let isMounted = true;
    api
      .get("/rides/history?role=DRIVER")
      .then((res) => {
        if (isMounted && res.data?.success && Array.isArray(res.data.data)) {
          const mapped: DriverRideOffer[] = res.data.data.map((r: any) => ({
            id: r.id,
            customerName: r.customer?.name || "Customer",
            customerRating: r.customer?.rating || "5.0 ★",
            pickup: r.pickup || "Pickup Location",
            destination: r.destination || "Destination",
            pickupLat: r.pickupLat,
            pickupLng: r.pickupLng,
            destinationLat: r.destinationLat,
            destinationLng: r.destinationLng,
            distanceKm: Number(r.distanceKm),
            pickupDistanceKm: 0.5,
            grossFare: Number(r.grossFare || r.fare),
            netEarnings: Number(r.netEarnings || (r.fare * 0.9)),
            vehicleType: r.vehicleType,
            expiresInSeconds: 0,
          }));
          setTripsList(mapped);
        }
      })
      .catch((err) => {
        console.warn("Could not load driver ride history:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const allTrips = tripsList;
  const totalEarnings = allTrips.reduce((acc, t) => acc + t.netEarnings, 0);
  const totalDistance = allTrips.reduce((acc, t) => acc + t.distanceKm, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
            Performance &amp; Trips
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524]">
            Driver Trip History
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Every completed ride with transparent 90% take-home calculations.
          </p>
        </div>

        <div className="bg-[#E8EFE8] border border-emerald-200 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
          <span className="text-[11px] text-emerald-800 font-bold block uppercase">
            Total Historical Earnings
          </span>
          <div className="text-3xl font-black text-emerald-800">
            ${totalEarnings.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-center">
          <span className="text-xs text-stone-500 uppercase tracking-wider block">
            Completed Rides
          </span>
          <div className="text-2xl font-black text-[#292524] mt-1">
            {allTrips.length} Rides
          </div>
        </div>
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-center">
          <span className="text-xs text-stone-500 uppercase tracking-wider block">
            Total Distance Covered
          </span>
          <div className="text-2xl font-black text-[#292524] mt-1">
            {totalDistance.toFixed(1)} km
          </div>
        </div>
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-center">
          <span className="text-xs text-stone-500 uppercase tracking-wider block">
            Average Passenger Rating
          </span>
          <div className="text-2xl font-black text-[#292524] mt-1 flex items-center justify-center gap-1">
            {allTrips.length === 0 ? (
              <span className="text-stone-400 text-base font-bold">
                New Partner
              </span>
            ) : (
              <>
                <span className="text-amber-500">★</span> 5.0
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trip List or Clean Empty State */}
      {allTrips.length === 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 text-3xl flex items-center justify-center mx-auto shadow-inner">
            📜
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#292524]">
              No completed rides yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              Go online from the Available Requests tab to receive nearby ride
              offers. Your completed trip logs and 90% net earnings will appear
              here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {allTrips.map((trip, idx) => (
            <div
              key={trip.id + idx}
              className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-sm">
                    {trip.vehicleType === "BIKE" ? "🏍️" : "🚗"}
                  </span>
                  <span className="font-bold text-[#292524] text-sm">
                    Passenger: {trip.customerName}
                  </span>
                  <span className="text-xs text-stone-600 font-semibold flex items-center gap-0.5">
                    <span className="text-amber-500">★</span>{" "}
                    {trip.customerRating}
                  </span>
                </div>

                <div className="text-xs text-stone-600 pl-10">
                  <span className="text-emerald-700 font-semibold">
                    {trip.pickup}
                  </span>
                  <span className="mx-2 text-stone-400">&rarr;</span>
                  <span className="text-rose-700 font-semibold">
                    {trip.destination}
                  </span>
                </div>

                <div className="text-[11px] text-stone-400 pl-10 flex gap-3">
                  <span>Trip: {trip.distanceKm} km</span>
                  <span>&bull;</span>
                  <span>Gross Fare: ${Number(trip.grossFare).toFixed(2)}</span>
                  <span>&bull;</span>
                  <span>
                    10% Platform Cut: -${(Number(trip.grossFare) * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-left md:text-right border-t md:border-t-0 border-stone-200 pt-2 md:pt-0 shrink-0">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">
                  Net Deposited
                </span>
                <div className="text-2xl font-black text-emerald-700">
                  + ${Number(trip.netEarnings).toFixed(2)}
                </div>
                <span className="text-[10px] text-stone-400">
                  Payment Captured ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverHistoryView;
