"use client";

import React, { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/axios";
import toast from "@/lib/toast";
import { getSocket } from "@/lib/socket";

export interface DriverRideOffer {
  id: string;
  customerName: string;
  customerRating: string;
  pickup: string;
  destination: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  distanceKm: number;
  pickupDistanceKm: number;
  grossFare: number;
  netEarnings: number;
  vehicleType: "BIKE" | "CAR";
  expiresInSeconds: number;
}

interface AvailableRequestsViewProps {
  isOnline: boolean;
  onGoOnline: () => void;
  onAcceptRide: (offer: DriverRideOffer) => void;
  vehicleType: "BIKE" | "CAR";
  incomingOffer?: DriverRideOffer | null;
}

export const AvailableRequestsView: React.FC<AvailableRequestsViewProps> = ({
  isOnline,
  onGoOnline,
  onAcceptRide,
  vehicleType,
  incomingOffer = null,
}) => {
  const [activeOffer, setActiveOffer] = useState<DriverRideOffer | null>(
    incomingOffer,
  );
  const [countdown, setCountdown] = useState(30);
  const activeOfferRef = React.useRef<DriverRideOffer | null>(activeOffer);

  useEffect(() => {
    activeOfferRef.current = activeOffer;
  }, [activeOffer]);

  useEffect(() => {
    if (incomingOffer) {
      setActiveOffer(incomingOffer);
      setCountdown(30);
    }
  }, [incomingOffer]);

  const formatOffer = (raw: any): DriverRideOffer => {
    const grossFare = Number(raw.grossFare || raw.fare || 0);
    const netEarnings = Number(
      raw.netEarnings || (grossFare * 0.9).toFixed(2),
    );
    return {
      id: raw.id || raw.rideId,
      customerName: raw.customerName || raw.customer?.name || "Passenger",
      customerRating: raw.customerRating || raw.customer?.rating || "4.9 ★",
      pickup: raw.pickup || "Pickup Location",
      destination: raw.destination || "Destination Drop-off",
      pickupDistanceKm:
        typeof raw.pickupDistanceKm === "number" ? raw.pickupDistanceKm : 0.5,
      distanceKm: Number(raw.distanceKm) || 0,
      grossFare,
      netEarnings,
      vehicleType: raw.vehicleType || vehicleType,
      pickupLat: raw.pickupLat ? Number(raw.pickupLat) : undefined,
      pickupLng: raw.pickupLng ? Number(raw.pickupLng) : undefined,
      destinationLat: raw.destinationLat ? Number(raw.destinationLat) : undefined,
      destinationLng: raw.destinationLng ? Number(raw.destinationLng) : undefined,
      expiresInSeconds: raw.expiresInSeconds || 30,
    };
  };

  // Real-time socket listener for incoming ride requests within radius + 4s polling fallback
  useEffect(() => {
    if (!isOnline) return;
    const socket = getSocket();

    // Explicitly join driver pool room
    socket.emit("join:driver", { vehicleType });

    // Initial and event-driven check for available rides from backend
    const fetchAvailable = () => {
      if (activeOfferRef.current) return;
      api
        .get(`/rides/available?vehicleType=${vehicleType}`)
        .then((res) => {
          if (res.data?.success && res.data?.data?.length > 0) {
            if (!activeOfferRef.current) {
              const first = formatOffer(res.data.data[0]);
              setActiveOffer(first);
              setCountdown(30);
            }
          }
        })
        .catch(() => {});
    };

    let lastHandledOfferId = "";

    const handleNewRide = (offer: any) => {
      if (offer) {
        const offerId = offer.id || offer.rideId;
        if (offerId && lastHandledOfferId === offerId) {
          return;
        }
        lastHandledOfferId = offerId;

        const formatted = formatOffer(offer);
        setActiveOffer(formatted);
        setCountdown(30);
        toast.info(
          "New Ride Offer Available!",
          `Passenger nearby. Take-home pay: $${Number(formatted.netEarnings).toFixed(2)}`,
        );
      } else {
        fetchAvailable();
      }
    };

    const handleRideTaken = (data: { rideId: string }) => {
      if (activeOfferRef.current && activeOfferRef.current.id === data.rideId) {
        setActiveOffer(null);
        toast.info("Offer Taken", "Another driver accepted this trip.");
      }
    };

    socket.on("ride:requested", handleNewRide);
    socket.on("ride:broadcast", handleNewRide);
    socket.on("ride:taken", handleRideTaken);

    fetchAvailable();

    const pollInterval = setInterval(fetchAvailable, 5000);

    return () => {
      clearInterval(pollInterval);
      socket.off("ride:requested", handleNewRide);
      socket.off("ride:broadcast", handleNewRide);
      socket.off("ride:taken", handleRideTaken);
    };
  }, [isOnline, vehicleType]);

  // 30-second countdown for decision when active offer is present
  useEffect(() => {
    if (!isOnline || !activeOffer) return;

    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time expired, clear offer
          setActiveOffer(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnline, activeOffer]);

  const handleDecline = () => {
    setActiveOffer(null);
    setCountdown(30);
  };

  const handleAccept = async () => {
    if (!activeOffer) return;
    const toastId = toast.loading("Accepting trip offer...");

    try {
      const response = await api.post(`/rides/${activeOffer.id}/accept`);
      toast.dismiss(toastId);
      if (response.data?.success) {
        toast.success(
          "Trip Accepted!",
          `Earn $${Number(activeOffer.netEarnings).toFixed(2)} upon completion.`,
        );
        const data = response.data.data;
        const acceptedOffer: DriverRideOffer = {
          ...activeOffer,
          id: data?.id || data?.rideId || activeOffer.id,
          pickup: data?.pickup || activeOffer.pickup,
          destination: data?.destination || activeOffer.destination,
          customerName: data?.customer?.name || activeOffer.customerName,
          customerRating: data?.customer?.rating || activeOffer.customerRating,
          distanceKm: Number(data?.distanceKm) || activeOffer.distanceKm,
          grossFare: Number(data?.fare) || activeOffer.grossFare,
          netEarnings: Number(
            data?.fare
              ? (Number(data.fare) * 0.9).toFixed(2)
              : activeOffer.netEarnings,
          ),
          vehicleType:
            data?.vehicleType || activeOffer.vehicleType || vehicleType,
        };
        onAcceptRide(acceptedOffer);
      } else {
        toast.error(
          "Could Not Accept Trip",
          response.data?.message || "Trip is no longer available.",
        );
      }
    } catch (err) {
      toast.dismiss(toastId);
      const errMsg = getErrorMessage(err);
      toast.error("Could Not Accept Trip", errMsg);
      if (
        errMsg.toLowerCase().includes("already") ||
        errMsg.toLowerCase().includes("not found")
      ) {
        setActiveOffer(null);
      }
      console.warn("Backend accept error:", err);
    }
  };

  if (!isOnline) {
    return (
      <div className="bg-white border border-stone-200/80 rounded-3xl p-10 text-center shadow-sm space-y-5 animate-in fade-in">
        <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 text-4xl flex items-center justify-center mx-auto shadow-inner">
          ⏸️
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#292524]">
          You are currently Offline
        </h2>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Go online to start receiving nearby ride offers within your 2km
          radius. You maintain total control over your schedule.
        </p>
        <button
          type="button"
          onClick={onGoOnline}
          className="h-14 px-8 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-base tracking-wide transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          Go Online Now 🟢
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE8] border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Active &amp; Ready for Rides</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524]">
            Available Requests
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Incoming dispatch offers with full upfront destination disclosure.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
          <span className="text-[11px] text-stone-500 block">
            Dispatch Coverage
          </span>
          <div className="text-xl font-bold text-[#292524]">Active</div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            All Online Drivers
          </span>
        </div>
      </div>

      {/* Active Request Notification Card */}
      {activeOffer ? (
        <div className="bg-white border-2 border-[#FFB7B2] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Top 30-Second Countdown Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-stone-100">
            <div
              className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 30) * 100}%` }}
            />
          </div>

          {/* Header Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl shadow-2xs">
                👤
              </div>
              <div>
                <h3 className="text-base font-bold text-[#292524]">
                  {activeOffer.customerName}
                </h3>
                <div className="text-xs text-stone-600 font-semibold">
                  <span className="text-amber-500">★</span>{" "}
                  {activeOffer.customerRating} &bull; Verified Passenger
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 text-xs font-black text-rose-700">
              <span>⏱️</span>
              <span>{countdown}s remaining</span>
            </div>
          </div>

          {/* Route Details */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-base mt-0.5">🟢</span>
              <div>
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Pickup Location ({activeOffer.pickupDistanceKm} km away)
                </div>
                <div className="text-sm font-semibold text-[#292524]">
                  {activeOffer.pickup}
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200/80 pt-3 flex items-start gap-3">
              <span className="text-base mt-0.5">📍</span>
              <div>
                <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                  Destination Drop-off ({activeOffer.distanceKm} km trip)
                </div>
                <div className="text-sm font-semibold text-[#292524]">
                  {activeOffer.destination}
                </div>
              </div>
            </div>
          </div>

          {/* Upfront Fare Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3">
              <span className="text-[11px] text-stone-500 block">
                Gross Fare
              </span>
              <span className="text-base font-bold text-[#292524]">
                ${Number(activeOffer.grossFare).toFixed(2)}
              </span>
            </div>
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3">
              <span className="text-[11px] text-stone-500 block">
                Platform Fee (Flat 10%)
              </span>
              <span className="text-base font-bold text-stone-600">
                -${(activeOffer.grossFare * 0.1).toFixed(2)}
              </span>
            </div>
            <div className="bg-[#E8EFE8] border border-emerald-300 rounded-xl p-3 shadow-2xs">
              <span className="text-[11px] text-emerald-800 font-bold block uppercase">
                Your Net Take-Home (90%)
              </span>
              <span className="text-xl font-black text-emerald-800">
                + ${Number(activeOffer.netEarnings).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Decision Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleDecline}
              className="h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold text-sm tracking-wide transition-all"
            >
              Pass Offer
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base tracking-wide transition-all shadow-md hover:scale-[1.01]"
            >
              Accept Trip (Earn ${Number(activeOffer.netEarnings).toFixed(2)}) →
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-stone-300 rounded-3xl p-12 sm:p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-3xl shadow-inner animate-pulse">
            📡
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#292524]">
              Scanning for nearby ride requests...
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              You are online and ready. You will hear an alert and receive a
              30-second decision offer as soon as a customer requests a ride in
              your 2km radius.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableRequestsView;
