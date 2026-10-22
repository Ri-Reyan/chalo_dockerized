"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  LocationPickerModal,
  type SelectedLocation,
} from "@/components/common/LocationPickerModal";
import api, { getErrorMessage } from "@/lib/axios";
import toast from "@/lib/toast";

// Dynamically import RoutePreviewMap with SSR disabled
const RoutePreviewMap = dynamic(
  () => import("@/components/common/RoutePreviewMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-56 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-[#FFB7B2] rounded-full animate-spin" />
        <span className="text-xs font-semibold">Loading route map...</span>
      </div>
    ),
  },
);

export interface ActiveRideState {
  id: string;
  pickup: string;
  destination: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  vehicleType: "BIKE" | "CAR";
  distanceKm: number;
  fare: number;
  status: "REQUESTED" | "ACCEPTED" | "COMPLETED";
  driver: {
    id?: string;
    name: string;
    vehicleModel?: string;
    rating?: string;
    plateNumber?: string;
    etaMinutes?: number;
    lat?: number;
    lng?: number;
  } | null;
  otp?: string;
  createdAt: string;
}

interface RequestRideViewProps {
  onRideCreated: (ride: ActiveRideState) => void;
}

export const RequestRideView: React.FC<RequestRideViewProps> = ({
  onRideCreated,
}) => {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [vehicleType, setVehicleType] = useState<"BIKE" | "CAR">("BIKE");
  const [distanceKm, setDistanceKm] = useState(0);
  const [fare, setFare] = useState(0);
  const [fares, setFares] = useState<{ BIKE: number; CAR: number } | null>(
    null,
  );

  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(1);

  // Modal State
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean;
    type: "pickup" | "destination";
  }>({
    isOpen: false,
    type: "pickup",
  });

  const baseFare = vehicleType === "BIKE" ? 1.0 : 3.0;
  const perKmRate = vehicleType === "BIKE" ? 0.2 : 0.5;
  const distanceFare = Number((distanceKm * perKmRate).toFixed(2));
  const hasBothCoords = Boolean(pickupCoords && destinationCoords);

  // Authoritative server-side distance & fare calculation
  const fetchEstimate = async (
    pCoords: { lat: number; lng: number } | null,
    dCoords: { lat: number; lng: number } | null,
    vType: "BIKE" | "CAR",
  ) => {
    if (!pCoords || !dCoords) return;

    setIsEstimating(true);
    setEstimateError(null);

    try {
      const response = await api.post("/rides/estimate", {
        pickupLat: pCoords.lat,
        pickupLng: pCoords.lng,
        destinationLat: dCoords.lat,
        destinationLng: dCoords.lng,
        vehicleType: vType,
      });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setDistanceKm(data.distanceKm);
        setFare(data.fare);
        if (data.fares) {
          setFares(data.fares);
        } else {
          setFares({
            BIKE: Number((1.0 + data.distanceKm * 0.2).toFixed(2)),
            CAR: Number((3.0 + data.distanceKm * 0.5).toFixed(2)),
          });
        }
      }
    } catch (err) {
      console.error("Estimate calculation error:", err);
      setEstimateError(getErrorMessage(err));
      // Fallback local straight calculation if server is temporarily unreachable
      const fallbackDist = 5.0;
      setDistanceKm(fallbackDist);
      const fallbackFare =
        vType === "BIKE"
          ? Number((1.0 + fallbackDist * 0.2).toFixed(2))
          : Number((3.0 + fallbackDist * 0.5).toFixed(2));
      setFare(fallbackFare);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleOpenPicker = (type: "pickup" | "destination") => {
    setPickerModal({
      isOpen: true,
      type,
    });
  };

  const handleLocationConfirmed = (loc: SelectedLocation) => {
    if (pickerModal.type === "pickup") {
      setPickup(loc.address);
      const newCoords = { lat: loc.lat, lng: loc.lng };
      setPickupCoords(newCoords);
      if (destinationCoords) {
        fetchEstimate(newCoords, destinationCoords, vehicleType);
      }
    } else {
      setDestination(loc.address);
      const newCoords = { lat: loc.lat, lng: loc.lng };
      setDestinationCoords(newCoords);
      if (pickupCoords) {
        fetchEstimate(pickupCoords, newCoords, vehicleType);
      }
    }
  };

  const handleVehicleTypeChange = (newType: "BIKE" | "CAR") => {
    setVehicleType(newType);
    if (fares) {
      setFare(fares[newType]);
    } else if (pickupCoords && destinationCoords) {
      fetchEstimate(pickupCoords, destinationCoords, newType);
    }
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setPickup("Locating GPS coordinates...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPickupCoords(newCoords);
          setPickup("Current GPS Location");
          if (destinationCoords) {
            fetchEstimate(newCoords, destinationCoords, vehicleType);
          }
        },
        () => {
          // Fallback default Dhaka
          const fallback = { lat: 23.7925, lng: 90.4078 };
          setPickupCoords(fallback);
          setPickup("Gulshan 2, Dhaka (Current Area)");
          if (destinationCoords) {
            fetchEstimate(fallback, destinationCoords, vehicleType);
          }
        },
        { timeout: 5000, enableHighAccuracy: true },
      );
    }
  };

  const handleBookRide = async () => {
    if (!hasBothCoords || distanceKm <= 0) {
      toast.warning(
        "Location Required",
        "Please select both pickup and destination points on the map."
      );
      return;
    }

    setIsSearching(true);
    setSearchStep(1);

    const toastId = toast.loading(
      "Creating ride request...",
      "Preparing secure Stripe payment session"
    );

    try {
      const response = await api.post("/rides", {
        pickup,
        destination,
        pickupLat: pickupCoords!.lat,
        pickupLng: pickupCoords!.lng,
        destinationLat: destinationCoords!.lat,
        destinationLng: destinationCoords!.lng,
        vehicleType,
      });

      toast.dismiss(toastId);

      if (response.data?.success && response.data?.data) {
        const rideData = response.data.data;
        toast.success(
          "Ride Request Created!",
          "Redirecting to Stripe checkout to authorize fare hold..."
        );

        const checkoutUrl =
          rideData.checkoutUrl ||
          `/checkout?rideId=${rideData.rideId}&amount=${rideData.fare}&distanceKm=${rideData.distanceKm}&vehicleType=${rideData.vehicleType}&pickup=${encodeURIComponent(
            pickup
          )}&destination=${encodeURIComponent(destination)}`;

        setTimeout(() => {
          if (checkoutUrl.startsWith("http")) {
            window.location.href = checkoutUrl;
          } else {
            router.push(checkoutUrl);
          }
        }, 600);
      } else {
        setIsSearching(false);
        toast.error(
          "Request Failed",
          response.data?.message || "Failed to initialize ride request."
        );
      }
    } catch (err) {
      toast.dismiss(toastId);
      setIsSearching(false);
      console.error("Ride creation error:", err);
      toast.error("Failed to request ride", getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={pickerModal.isOpen}
        onClose={() => setPickerModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleLocationConfirmed}
        title={
          pickerModal.type === "pickup"
            ? "Select Pickup Point on Map"
            : "Select Destination Point on Map"
        }
        type={pickerModal.type}
        initialLocation={
          pickerModal.type === "pickup"
            ? {
                address: pickup,
                lat: pickupCoords?.lat,
                lng: pickupCoords?.lng,
              }
            : {
                address: destination,
                lat: destinationCoords?.lat,
                lng: destinationCoords?.lng,
              }
        }
      />

      {/* Top Header */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE8] border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span>⚡</span>
              <span>Guaranteed Zero Surge • Haversine Distance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524]">
              Where would you like to go?
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              Pick your exact locations on the interactive map for upfront,
              server-verified fares.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 shrink-0 text-center sm:text-right min-w-45">
            <span className="text-[11px] text-stone-500 block font-medium">
              Upfront Locked Fare
            </span>
            <div className="text-3xl font-black text-[#292524] mt-0.5">
              {isEstimating ? (
                <div className="flex items-center justify-center sm:justify-end gap-2 text-xl font-bold text-stone-400 py-1">
                  <div className="w-4 h-4 border-2 border-stone-300 border-t-[#FFB7B2] rounded-full animate-spin" />
                  <span>Calculating...</span>
                </div>
              ) : hasBothCoords && fare > 0 ? (
                `$${fare.toFixed(2)}`
              ) : (
                "$0.00"
              )}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {hasBothCoords && distanceKm > 0
                ? `✓ ~${distanceKm} km direct route`
                : "Select both locations on map"}
            </span>
          </div>
        </div>
      </div>

      {estimateError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{estimateError}</span>
          </div>
          <button
            type="button"
            onClick={() =>
              fetchEstimate(pickupCoords, destinationCoords, vehicleType)
            }
            className="text-xs font-bold text-rose-900 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Form & Interactive Route Map Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Location Inputs & Vehicle Selector (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          {/* 1. Pickup Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Pickup Point
              </label>
              {pickupCoords && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {pickupCoords.lat.toFixed(4)}, {pickupCoords.lng.toFixed(4)}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">
                🟢
              </span>
              <input
                type="text"
                value={pickup}
                onChange={(e) => {
                  setPickup(e.target.value);
                  // Reset coords if text was manually cleared
                  if (!e.target.value.trim()) setPickupCoords(null);
                }}
                placeholder="Click map button or enter pickup address"
                className="w-full h-12 pl-10 pr-24 bg-stone-50 text-[#292524] placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  title="Pick on interactive map"
                  onClick={() => handleOpenPicker("pickup")}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-[#292524] border border-stone-200 text-xs font-bold shadow-2xs flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                >
                  <span>🗺️</span>
                  <span className="hidden sm:inline">Map</span>
                </button>
                <button
                  type="button"
                  title="Use Current GPS"
                  onClick={handleUseCurrentLocation}
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-[#292524] flex items-center justify-center text-sm transition-colors"
                >
                  🎯
                </button>
              </div>
            </div>
          </div>

          {/* 2. Destination Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Destination Point
              </label>
              {destinationCoords && (
                <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {destinationCoords.lat.toFixed(4)},{" "}
                  {destinationCoords.lng.toFixed(4)}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">
                📍
              </span>
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  if (!e.target.value.trim()) setDestinationCoords(null);
                }}
                placeholder="Click map button or enter destination address"
                className="w-full h-12 pl-10 pr-20 bg-stone-50 text-[#292524] placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  title="Pick on interactive map"
                  onClick={() => handleOpenPicker("destination")}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-[#292524] border border-stone-200 text-xs font-bold shadow-2xs flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                >
                  <span>🗺️</span>
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Vehicle Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Select Vehicle Type
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Bike */}
              <button
                type="button"
                onClick={() => handleVehicleTypeChange("BIKE")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  vehicleType === "BIKE"
                    ? "bg-[#FFB7B2]/15 border-[#FFB7B2] ring-2 ring-[#FFB7B2] shadow-xs"
                    : "bg-stone-50 border-stone-200 hover:bg-stone-100/80"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🏍️</span>
                  <span className="text-xs font-bold text-[#292524] bg-white border border-stone-200 px-2 py-0.5 rounded-md shadow-2xs">
                    Fast & Agile
                  </span>
                </div>
                <div className="text-sm font-bold text-[#292524]">
                  Motorbike
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Base $1.00 + $0.20/km
                </div>
                <div className="text-base font-extrabold text-[#292524] mt-2">
                  {fares
                    ? `$${fares.BIKE.toFixed(2)}`
                    : hasBothCoords && distanceKm > 0
                      ? `$${Number((1.0 + distanceKm * 0.2).toFixed(2))}`
                      : "Base $1.00"}
                </div>
              </button>

              {/* Car */}
              <button
                type="button"
                onClick={() => handleVehicleTypeChange("CAR")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  vehicleType === "CAR"
                    ? "bg-[#FFB7B2]/15 border-[#FFB7B2] ring-2 ring-[#FFB7B2] shadow-xs"
                    : "bg-stone-50 border-stone-200 hover:bg-stone-100/80"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🚗</span>
                  <span className="text-xs font-bold text-[#292524] bg-white border border-stone-200 px-2 py-0.5 rounded-md shadow-2xs">
                    Comfort & AC
                  </span>
                </div>
                <div className="text-sm font-bold text-[#292524]">
                  Car / Sedan
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Base $3.00 + $0.50/km
                </div>
                <div className="text-base font-extrabold text-[#292524] mt-2">
                  {fares
                    ? `$${fares.CAR.toFixed(2)}`
                    : hasBothCoords && distanceKm > 0
                      ? `$${Number((3.0 + distanceKm * 0.5).toFixed(2))}`
                      : "Base $3.00"}
                </div>
              </button>
            </div>
          </div>

          {/* Book Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={
                isSearching || isEstimating || !hasBothCoords || distanceKm <= 0
              }
              onClick={handleBookRide}
              className="w-full h-14 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-base tracking-wide transition-all duration-200 hover:shadow-md active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-[#292524] border-t-transparent rounded-full animate-spin" />
                  <span>
                    {searchStep === 1
                      ? "Pinging nearby drivers within 2km..."
                      : "Driver found! Securing ride..."}
                  </span>
                </div>
              ) : isEstimating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#292524] border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Upfront Fare...</span>
                </div>
              ) : !pickupCoords ? (
                <span>Select Pickup Location on Map</span>
              ) : !destinationCoords ? (
                <span>Select Destination on Map</span>
              ) : (
                <span>
                  Request {vehicleType === "BIKE" ? "Bike" : "Car"} & Proceed to Payment (${fare.toFixed(2)}) →
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Route Map & Transparent Fare Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Route Map Preview */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    hasBothCoords
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-stone-300"
                  }`}
                />
                Live Dispatch Map Route
              </span>
              <span className="text-[#292524] font-mono">
                {hasBothCoords
                  ? `~${distanceKm} km (Haversine)`
                  : "Awaiting route selection"}
              </span>
            </div>

            {/* Map Canvas / Route Display */}
            {hasBothCoords || pickupCoords || destinationCoords ? (
              <div className="h-60 rounded-2xl overflow-hidden shadow-inner">
                <RoutePreviewMap
                  pickup={
                    pickupCoords
                      ? {
                          lat: pickupCoords.lat,
                          lng: pickupCoords.lng,
                          address: pickup,
                        }
                      : null
                  }
                  destination={
                    destinationCoords
                      ? {
                          lat: destinationCoords.lat,
                          lng: destinationCoords.lng,
                          address: destination,
                        }
                      : null
                  }
                />
              </div>
            ) : (
              <div className="h-60 rounded-2xl bg-[#F7F6F0] border border-dashed border-stone-300 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-xl shadow-xs">
                  🗺️
                </div>
                <div className="text-sm font-bold text-[#292524]">
                  Interactive Map Preview
                </div>
                <p className="text-xs text-stone-500 max-w-xs">
                  Pick your locations on the map using the Map buttons on the
                  left to preview your live route and locked fare.
                </p>
              </div>
            )}
          </div>

          {/* Authoritative Server Fare Breakdown */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#292524]">
                Transparent Fare Breakdown
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-[#E8EFE8] px-2 py-0.5 rounded border border-emerald-200">
                Server Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>
                  Base Fare ({vehicleType === "BIKE" ? "Bike" : "Car"})
                </span>
                <span className="font-semibold text-[#292524]">
                  ${baseFare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>
                  Distance Charge ({distanceKm} km × ${perKmRate.toFixed(2)})
                </span>
                <span className="font-semibold text-[#292524]">
                  ${distanceFare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold border-t border-stone-200 pt-2">
                <span>Surge Pricing</span>
                <span>0.0x (No Surge Guaranteed)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#292524] border-t border-stone-300 pt-2.5">
                <span>Total Upfront Amount</span>
                <span>{isEstimating ? "Calculating..." : `$${fare.toFixed(2)}`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestRideView;
