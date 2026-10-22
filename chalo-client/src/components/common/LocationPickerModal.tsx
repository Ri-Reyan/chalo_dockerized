"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

export interface SelectedLocation {
  address: string;
  lat: number;
  lng: number;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: SelectedLocation) => void;
  title: string;
  type: "pickup" | "destination" | "driver" | "default";
  initialLocation?: {
    address?: string;
    lat?: number;
    lng?: number;
  } | null;
}

// Dynamically import LeafletMap with SSR disabled to prevent window/document undefined errors
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
      <div className="w-8 h-8 border-3 border-stone-300 border-t-[#FFB7B2] rounded-full animate-spin" />
      <span className="text-xs font-semibold">Loading interactive map...</span>
    </div>
  ),
});

// Default center: Dhaka (Gulshan / Banani area)
const DEFAULT_DHAKA_CENTER: [number, number] = [23.7925, 90.4078];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  type,
  initialLocation,
}) => {
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    null,
  );
  const [center, setCenter] = useState<[number, number]>(DEFAULT_DHAKA_CENTER);
  const [addressText, setAddressText] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (
        initialLocation &&
        typeof initialLocation.lat === "number" &&
        typeof initialLocation.lng === "number"
      ) {
        setSelectedCoords([initialLocation.lat, initialLocation.lng]);
        setCenter([initialLocation.lat, initialLocation.lng]);
        setAddressText(initialLocation.address || "");
      } else {
        setSelectedCoords(DEFAULT_DHAKA_CENTER);
        setCenter(DEFAULT_DHAKA_CENTER);
        setAddressText(initialLocation?.address || "");
        // If no address was provided, reverse-geocode default center
        if (!initialLocation?.address) {
          fetchReverseGeocode(DEFAULT_DHAKA_CENTER[0], DEFAULT_DHAKA_CENTER[1]);
        }
      }
    }
  }, [isOpen, initialLocation]);

  const fetchReverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        },
      );

      if (!res.ok) throw new Error("Reverse geocoding request failed");

      const data = await res.json();
      const addr = data.address || {};
      const parts = [
        addr.road || addr.street || addr.pedestrian || addr.suburb,
        addr.neighbourhood || addr.suburb || addr.quarter,
        addr.city || addr.town || addr.district || "Dhaka",
      ].filter(Boolean);

      const formatted =
        parts.length > 0
          ? parts.join(", ")
          : data.display_name?.split(",").slice(0, 3).join(",") ||
            `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      setAddressText(formatted);
    } catch {
      setAddressText(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords([lat, lng]);
    setCenter([lat, lng]);
    fetchReverseGeocode(lat, lng);
  };

  const handleUseGps = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setIsLocatingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setSelectedCoords([lat, lng]);
          setCenter([lat, lng]);
          setIsLocatingGps(false);
          fetchReverseGeocode(lat, lng);
        },
        () => {
          setIsLocatingGps(false);
          // Graceful fallback to default center
          setSelectedCoords(DEFAULT_DHAKA_CENTER);
          setCenter(DEFAULT_DHAKA_CENTER);
          fetchReverseGeocode(DEFAULT_DHAKA_CENTER[0], DEFAULT_DHAKA_CENTER[1]);
        },
        { timeout: 5000, enableHighAccuracy: true },
      );
    }
  };

  const handleConfirm = () => {
    if (!selectedCoords) return;
    const finalAddress =
      addressText.trim() ||
      `Location (${selectedCoords[0].toFixed(4)}, ${selectedCoords[1].toFixed(4)})`;

    onConfirm({
      address: finalAddress,
      lat: selectedCoords[0],
      lng: selectedCoords[1],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 relative z-10">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                type === "pickup"
                  ? "bg-emerald-600"
                  : type === "destination"
                    ? "bg-rose-600"
                    : "bg-blue-600"
              }`}
            >
              {type === "pickup" ? "P" : type === "destination" ? "D" : "📍"}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#292524]">
                {title}
              </h2>
              <p className="text-xs text-stone-500">
                Click anywhere on the map to drop a pin, or use GPS.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-[#292524] flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Map + Address Controls */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Map Surface */}
          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden relative shadow-sm z-0">
            <LeafletMap
              center={center}
              markerPosition={selectedCoords}
              onLocationSelect={handleMapClick}
              markerType={type}
            />

            {/* GPS Floating Button */}
            <button
              type="button"
              onClick={handleUseGps}
              disabled={isLocatingGps}
              className="absolute top-3 right-3 z-30 bg-white hover:bg-stone-50 text-[#292524] border border-stone-300 font-bold text-xs px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <span>{isLocatingGps ? "⏳" : "🎯"}</span>
              <span>{isLocatingGps ? "Locating..." : "My GPS"}</span>
            </button>
          </div>

          {/* Selected Address Input with Reverse Geocoding indicator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Selected Address
              </label>
              {selectedCoords && (
                <span className="text-[11px] font-mono text-stone-400">
                  {selectedCoords[0].toFixed(5)}, {selectedCoords[1].toFixed(5)}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Click on the map or type human-readable address..."
                className="w-full h-11 pl-3.5 pr-10 bg-stone-50 text-[#292524] placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all"
              />
              {isGeocoding && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-stone-300 border-t-[#FFB7B2] rounded-full animate-spin" />
                </div>
              )}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">
              You can manually edit the street or landmark name before
              confirming.
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-stone-200/80 bg-stone-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedCoords || isGeocoding}
            className="px-6 py-2.5 rounded-xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-xs uppercase tracking-wider shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Location &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
