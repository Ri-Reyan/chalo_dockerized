"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DriverRideOffer } from "./AvailableRequestsView";
import ConfirmModal from "@/components/common/ConfirmModal";
import toast from "@/lib/toast";
import api, { getErrorMessage } from "@/lib/axios";
import { getSocket, joinRideRoom, leaveRideRoom } from "@/lib/socket";

// Dynamically import LiveRideMap with SSR disabled for Leaflet safety
const LiveRideMap = dynamic(() => import("@/components/common/LiveRideMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
      <div className="w-8 h-8 border-3 border-stone-300 border-t-[#FFB7B2] rounded-full animate-spin" />
      <span className="text-xs font-semibold">Loading live navigation map...</span>
    </div>
  ),
});

interface DriverOngoingRideViewProps {
  ride: DriverRideOffer | null;
  onRideCompleted: (earnings: number, completedOffer: DriverRideOffer) => void;
  onRideCancelled: () => void;
}

export const DriverOngoingRideView: React.FC<DriverOngoingRideViewProps> = ({
  ride,
  onRideCompleted,
  onRideCancelled,
}) => {
  // 1: En Route to Pickup -> 2: Arrived at Pickup -> 3: In Transit to Destination -> 4: Completed
  const [tripStep, setTripStep] = useState<1 | 2 | 3 | 4>(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const pickupLat = ride?.pickupLat ?? 23.7925;
  const pickupLng = ride?.pickupLng ?? 90.4078;
  const destinationLat = ride?.destinationLat ?? 23.7808;
  const destinationLng = ride?.destinationLng ?? 90.4192;

  // Manual driver coordinates (initialized ~400m before pickup)
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number }>({
    lat: Number((pickupLat - 0.0035).toFixed(6)),
    lng: Number((pickupLng - 0.0028).toFixed(6)),
  });

  const [inputLat, setInputLat] = useState<string>((pickupLat - 0.0035).toFixed(6));
  const [inputLng, setInputLng] = useState<string>((pickupLng - 0.0028).toFixed(6));

  // Broadcast driver position via Socket.IO
  const broadcastLocation = (newLat: number, newLng: number) => {
    setDriverCoords({ lat: newLat, lng: newLng });
    setInputLat(newLat.toFixed(6));
    setInputLng(newLng.toFixed(6));

    if (ride?.id) {
      const socket = getSocket();
      socket.emit("driver:location", {
        rideId: ride.id,
        lat: newLat,
        lng: newLng,
      });
    }
  };

  // Real-time synchronization via Socket.IO (No automatic setInterval GPS loops)
  useEffect(() => {
    if (!ride?.id) return;
    joinRideRoom(ride.id);

    // Initial location broadcast to ride room
    const socket = getSocket();
    socket.emit("driver:location", {
      rideId: ride.id,
      lat: driverCoords.lat,
      lng: driverCoords.lng,
    });

    const handleRemoteCompleted = () => {
      setTripStep(4);
      toast.success(
        "Trip Completed!",
        `Passenger confirmed arrival. $${Number(ride.netEarnings).toFixed(2)} deposited to wallet.`
      );
    };

    const handleRemoteCancelled = () => {
      toast.info("Ride Cancelled", "This ride was cancelled by the passenger.");
      onRideCancelled();
    };

    socket.on("ride:completed", handleRemoteCompleted);
    socket.on("ride:cancelled", handleRemoteCancelled);

    return () => {
      leaveRideRoom(ride.id);
      socket.off("ride:completed", handleRemoteCompleted);
      socket.off("ride:cancelled", handleRemoteCancelled);
    };
  }, [ride?.id, onRideCancelled, driverCoords.lat, driverCoords.lng]);

  if (!ride) {
    return (
      <div className="bg-white border border-stone-200/80 rounded-3xl p-10 text-center shadow-sm space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 text-3xl flex items-center justify-center mx-auto">
          🏍️
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#292524]">
          No Active Ride In Progress
        </h2>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          You don&apos;t currently have an accepted ride. Check the Available
          Requests tab to accept new incoming offers.
        </p>
      </div>
    );
  }

  // --- Button 1: Arrived at Pickup ---
  const handleArrivedAtPickup = async () => {
    setIsActionLoading(true);
    const toastId = toast.loading("Updating status...", "Notifying passenger of arrival");

    try {
      await api.post(`/rides/${ride.id}/arrived`);
      setTripStep(2);

      // Snap coordinates to pickup location and broadcast
      broadcastLocation(pickupLat, pickupLng);

      const socket = getSocket();
      socket.emit("driver:arrived", {
        rideId: ride.id,
        status: "DRIVER_ARRIVED",
        message: "Your driver has arrived at the pickup point.",
      });

      toast.dismiss(toastId);
      toast.success("Arrived at Pickup", "Passenger has been notified via Socket.IO.");
    } catch (e) {
      toast.dismiss(toastId);
      console.warn("Backend arrived fallback:", e);
      setTripStep(2);
      broadcastLocation(pickupLat, pickupLng);
      toast.success("Arrived at Pickup", "Switched to passenger boarding step.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- Button 2: Start Trip / In Transit ---
  const handleStartTrip = async () => {
    setIsActionLoading(true);
    const toastId = toast.loading("Starting trip...", "Setting route to drop-off destination");

    try {
      await api.post(`/rides/${ride.id}/start`);
      setTripStep(3);

      const socket = getSocket();
      socket.emit("ride:started", {
        rideId: ride.id,
        status: "IN_TRANSIT",
        message: "Your trip has officially started.",
      });

      // Broadcast current position to ride room
      broadcastLocation(driverCoords.lat, driverCoords.lng);

      toast.dismiss(toastId);
      toast.info("Trip Started", "Heading towards destination safely.");
    } catch (e) {
      toast.dismiss(toastId);
      console.warn("Backend start trip fallback:", e);
      setTripStep(3);
      toast.info("Trip Started", "Trip is now in progress.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- Button 3 / Simulation Control: Move 25% closer towards target ---
  const handleSimulateNextStep = () => {
    const targetLat = tripStep <= 2 ? pickupLat : destinationLat;
    const targetLng = tripStep <= 2 ? pickupLng : destinationLng;

    const nextLat = Number((driverCoords.lat + (targetLat - driverCoords.lat) * 0.25).toFixed(6));
    const nextLng = Number((driverCoords.lng + (targetLng - driverCoords.lng) * 0.25).toFixed(6));

    broadcastLocation(nextLat, nextLng);
    toast.info(
      "Position Broadcasted",
      `Stepped closer to ${tripStep <= 2 ? "pickup" : "drop-off"}: (${nextLat}, ${nextLng})`
    );
  };

  // --- Manual Coordinate Custom Update ---
  const handleManualCoordsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(inputLat);
    const parsedLng = parseFloat(inputLng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      toast.error("Invalid Coordinates", "Please enter valid numeric latitude and longitude.");
      return;
    }

    broadcastLocation(parsedLat, parsedLng);
    toast.success("Custom Location Broadcasted", `Updated to: (${parsedLat}, ${parsedLng})`);
  };

  const handleReturnToDashboard = () => {
    onRideCompleted(ride.netEarnings, ride);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Step Progress Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB7B2] animate-pulse" />
              {tripStep === 1 && "Step 1 of 4: En Route to Pickup"}
              {tripStep === 2 && "Step 2 of 4: At Pickup Point"}
              {tripStep === 3 && "Step 3 of 4: In Transit to Destination"}
              {tripStep === 4 && "Step 4 of 4: Trip Completed"}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#292524] mt-0.5">
              {tripStep === 1 && "Driving to passenger pickup point"}
              {tripStep === 2 && "Passenger boarding • Ready to begin trip"}
              {tripStep === 3 && "Passenger on board • Navigating to destination"}
              {tripStep === 4 && "Earnings deposited to your wallet!"}
            </h1>
          </div>

          <div className="bg-[#E8EFE8] border border-emerald-200 rounded-2xl px-5 py-2.5 text-center sm:text-right shrink-0">
            <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
              Net Fare Take-Home
            </span>
            <div className="text-2xl font-black text-emerald-800">
              + ${Number(ride.netEarnings).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
          <div
            className="h-full bg-[#FFB7B2] transition-all duration-500 ease-out"
            style={{ width: `${(tripStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Interactive Map + Manual Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map & Manual GPS Controller (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Map Card */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span>
                {tripStep < 3
                  ? `Target: ${ride.pickup}`
                  : `Target: ${ride.destination}`}
              </span>
              <span className="text-[#292524] bg-stone-100 px-2.5 py-1 rounded-lg">
                {tripStep < 3 ? "Approaching pickup" : `${ride.distanceKm} km trip`}
              </span>
            </div>

            {/* Interactive Leaflet Navigation Map Surface */}
            <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-sm">
              <LiveRideMap
                pickup={{
                  lat: pickupLat,
                  lng: pickupLng,
                  address: ride.pickup,
                }}
                destination={{
                  lat: destinationLat,
                  lng: destinationLng,
                  address: ride.destination,
                }}
                driver={driverCoords}
                vehicleType={ride.vehicleType}
                interactive={true}
              />
            </div>

            {/* Current Coordinate Status Banner */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-stone-500">Live Driver Pin:</span>
                <span className="font-mono font-bold text-[#292524]">
                  {driverCoords.lat.toFixed(5)}, {driverCoords.lng.toFixed(5)}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold">
                Socket Synced
              </span>
            </div>
          </div>

          {/* Manual Location & Simulation Controller Card */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#292524] uppercase tracking-wider flex items-center gap-2">
                  <span>🕹️</span>
                  <span>Manual Location Controls</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Click below to broadcast simulated progress or enter custom GPS coordinates without hardware errors.
                </p>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Manual Mode
              </span>
            </div>

            {/* Quick Step & Snap Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSimulateNextStep}
                className="py-3 px-3 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>⏩</span>
                <span>Simulate Next Step</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  broadcastLocation(pickupLat, pickupLng);
                  toast.success("Snapped to Pickup", `Coords: (${pickupLat}, ${pickupLng})`);
                }}
                className="py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-200 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>📍</span>
                <span>Snap to Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  broadcastLocation(destinationLat, destinationLng);
                  toast.success("Snapped to Destination", `Coords: (${destinationLat}, ${destinationLng})`);
                }}
                className="py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-200 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🏁</span>
                <span>Snap to Drop-off</span>
              </button>
            </div>

            {/* Manual Lat/Lng Inputs Form */}
            <form
              onSubmit={handleManualCoordsSubmit}
              className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row gap-3 items-end"
            >
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={inputLat}
                  onChange={(e) => setInputLat(e.target.value)}
                  placeholder="23.792500"
                  className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:bg-white focus:border-[#FFB7B2]"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={inputLng}
                  onChange={(e) => setInputLng(e.target.value)}
                  placeholder="90.407800"
                  className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:bg-white focus:border-[#FFB7B2]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto h-10 px-4 rounded-xl bg-[#292524] hover:bg-stone-800 text-white font-bold text-xs transition-colors shrink-0"
              >
                Broadcast Coordinates
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Passenger Card & Lifecycle Action Buttons (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Passenger Info Card */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Passenger Details
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-[#E8EFE8] border border-emerald-200 px-2.5 py-0.5 rounded-md">
                ★ {ride.customerRating}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#FFB7B2] text-[#292524] flex items-center justify-center text-lg font-black shadow-xs">
                {ride.customerName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#292524]">
                  {ride.customerName}
                </h3>
                <div className="text-xs text-stone-500">Verified Passenger</div>
              </div>
            </div>

            {/* Cancel Trip Button */}
            {tripStep < 4 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>✕ Cancel Ride</span>
                </button>
              </div>
            )}
          </div>

          {/* Manual Ride Lifecycle Action Panel */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Ride Lifecycle Controls
            </h3>

            {/* STEP 1: Arrived at Pickup */}
            {tripStep === 1 && (
              <div className="space-y-3">
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-center">
                  <div className="text-sm font-bold text-[#292524]">
                    Driving to Passenger
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Once you arrive at the pickup spot, click below to notify the passenger.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleArrivedAtPickup}
                  className="w-full h-14 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-base tracking-wide transition-all shadow-sm hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {isActionLoading ? "Updating..." : "1. Arrived at Pickup Spot →"}
                </button>
              </div>
            )}

            {/* STEP 2: Start Trip */}
            {tripStep === 2 && (
              <div className="space-y-3">
                <div className="bg-[#E8EFE8] border border-emerald-200 rounded-2xl p-4 text-center">
                  <div className="text-sm font-bold text-emerald-900">
                    At Pickup Point
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    Passenger is boarding. Confirm passenger is safely in vehicle and start journey.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleStartTrip}
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base tracking-wide transition-all shadow-md hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {isActionLoading ? "Starting..." : "2. Start Trip & Begin Journey →"}
                </button>
              </div>
            )}

            {/* STEP 3: Trip In Progress (Waiting for customer confirmation) */}
            {tripStep === 3 && (
              <div className="space-y-3">
                <div className="bg-[#E8EFE8] border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
                  <div className="text-sm font-bold text-emerald-900 flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Trip In Progress
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Navigating to destination. Upon arrival, the passenger will confirm arrival on their screen to release and credit your earnings.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: Summary & Return to Dashboard */}
            {tripStep === 4 && (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="bg-[#E8EFE8] border border-emerald-300 rounded-2xl p-5 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-2xl flex items-center justify-center mx-auto shadow-xs">
                    ✓
                  </div>
                  <div className="text-lg font-black text-[#292524]">
                    Trip Completed!
                  </div>
                  <div className="text-2xl font-black text-emerald-800">
                    + ${Number(ride.netEarnings).toFixed(2)}
                  </div>
                  <div className="text-xs text-stone-600">
                    Gross: ${Number(ride.grossFare).toFixed(2)} | 10% Chalo Cut: -${(Number(ride.grossFare) * 0.1).toFixed(2)}
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold block pt-1">
                    ✓ Deposited into your driver wallet
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleReturnToDashboard}
                  className="w-full h-14 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-base tracking-wide transition-all shadow-sm active:scale-95"
                >
                  Done • Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Driver Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={async () => {
          setIsCancelModalOpen(false);
          const toastId = toast.loading("Cancelling ride...", "Notifying passenger and resetting status");
          try {
            await api.post(`/rides/${ride.id}/cancel`);
            toast.dismiss(toastId);
            toast.info("Ride Cancelled", "You cancelled the ongoing trip. The customer has been refunded.");
            onRideCancelled();
          } catch (err: any) {
            toast.dismiss(toastId);
            toast.error(
              "Cancellation Failed",
              getErrorMessage(err) || "Could not cancel ride"
            );
          }
        }}
        title="Cancel Accepted Ride?"
        message="Are you sure you want to cancel this ride? The passenger will be notified immediately and refunded."
        confirmText="Yes, Cancel Ride"
        cancelText="Continue Trip"
        variant="danger"
      />
    </div>
  );
};

export default DriverOngoingRideView;
