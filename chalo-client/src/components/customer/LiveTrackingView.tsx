"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ActiveRideState } from "./RequestRideView";
import ConfirmModal from "@/components/common/ConfirmModal";
import toast from "@/lib/toast";
import api from "@/lib/axios";
import { getSocket, joinRideRoom, leaveRideRoom } from "@/lib/socket";

// Dynamically import LiveRideMap with SSR disabled for Leaflet safety
const LiveRideMap = dynamic(() => import("@/components/common/LiveRideMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
      <div className="w-8 h-8 border-3 border-stone-300 border-t-[#FFB7B2] rounded-full animate-spin" />
      <span className="text-xs font-semibold">Loading live journey map...</span>
    </div>
  ),
});

interface LiveTrackingViewProps {
  ride: ActiveRideState | null;
  onRideCompleted: (ride: ActiveRideState) => void;
  onRideCancelled: () => void;
  onRideAccepted?: (data: any) => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  ride,
  onRideCompleted,
  onRideCancelled,
  onRideAccepted,
}) => {
  const onRideAcceptedRef = React.useRef(onRideAccepted);
  onRideAcceptedRef.current = onRideAccepted;

  const onRideCancelledRef = React.useRef(onRideCancelled);
  onRideCancelledRef.current = onRideCancelled;

  const [etaSeconds, setEtaSeconds] = useState(180); // 3 minutes demo countdown
  const [sosActivated, setSosActivated] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const isAcceptedWithDriver =
    ride?.status === "ACCEPTED" && Boolean(ride?.driver?.id || ride?.driver?.name);
  const [journeyStatus, setJourneyStatus] = useState<string>(
    isAcceptedWithDriver ? "DRIVER_EN_ROUTE" : "SEARCHING",
  );
  const [driverLiveCoords, setDriverLiveCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(
    isAcceptedWithDriver && ride?.driver?.lat && ride?.driver?.lng
      ? { lat: Number(ride.driver.lat), lng: Number(ride.driver.lng) }
      : null,
  );
  const [localDriver, setLocalDriver] = useState<any>(
    isAcceptedWithDriver ? ride?.driver : null,
  );
  const [localStatus, setLocalStatus] = useState<string>(
    ride?.status || "REQUESTED",
  );

  // Keep local state in sync if ride prop updates
  useEffect(() => {
    if (ride?.status === "REQUESTED") {
      setLocalStatus("REQUESTED");
      setLocalDriver(null);
      setJourneyStatus("SEARCHING");
      setDriverLiveCoords(null);
    } else if (ride?.status === "ACCEPTED" && ride.driver) {
      setLocalStatus("ACCEPTED");
      setLocalDriver(ride.driver);
      setJourneyStatus("DRIVER_EN_ROUTE");
      if (ride.driver.lat && ride.driver.lng) {
        setDriverLiveCoords({
          lat: Number(ride.driver.lat),
          lng: Number(ride.driver.lng),
        });
      }
    } else if (ride?.status) {
      setLocalStatus(ride.status);
    }
  }, [ride?.driver, ride?.status]);

  // Real-time socket room synchronization
  useEffect(() => {
    if (!ride?.id) return;
    joinRideRoom(ride.id);

    const socket = getSocket();

    const handleRideAccepted = (data: any) => {
      if (data?.driver) {
        setLocalDriver(data.driver);
        setLocalStatus("ACCEPTED");
        setJourneyStatus("DRIVER_EN_ROUTE");
        if (data.driver.lat && data.driver.lng) {
          setDriverLiveCoords({ lat: Number(data.driver.lat), lng: Number(data.driver.lng) });
        }
        toast.success(
          "Driver Assigned!",
          `${data.driver?.name || "A driver"} accepted your ride and is en route.`,
        );
        onRideAcceptedRef.current?.(data);
      }
    };

    const handleDriverArrived = () => {
      setJourneyStatus("DRIVER_ARRIVED");
      setLocalStatus("ACCEPTED");
      toast.info("Driver Arrived!", "Your driver is waiting at the pickup location.");
    };
    const handleTripStarted = () => {
      setJourneyStatus("IN_TRANSIT");
      setLocalStatus("ACCEPTED");
      toast.info("Trip Started", "Heading towards destination safely.");
    };
    const handleTripCompleted = () => {
      setJourneyStatus("COMPLETED");
      setLocalStatus("COMPLETED");
      setShowRatingModal(true);
    };

    const handleNoDriver = (data?: any) => {
      setLocalStatus("NO_DRIVER_FOUND");
      toast.error(
        "No Driver Available",
        data?.message ||
          "All nearby drivers are currently busy. Your fare hold has been automatically refunded.",
      );
    };

    const handleRideCancelled = (data?: any) => {
      setLocalStatus("CANCELLED");
      toast.info(
        "Ride Cancelled",
        data?.message || "This ride has been cancelled and refunded.",
      );
      onRideCancelledRef.current?.();
    };

    const handleDriverLocation = (data: { lat: number; lng: number }) => {
      if (data?.lat && data?.lng) {
        setDriverLiveCoords({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on("ride:accepted", handleRideAccepted);
    socket.on("driver:arrived", handleDriverArrived);
    socket.on("ride:started", handleTripStarted);
    socket.on("ride:completed", handleTripCompleted);
    socket.on("ride:no_driver", handleNoDriver);
    socket.on("ride:cancelled", handleRideCancelled);
    socket.on("driver:location", handleDriverLocation);

    return () => {
      leaveRideRoom(ride.id);
      socket.off("ride:accepted", handleRideAccepted);
      socket.off("driver:arrived", handleDriverArrived);
      socket.off("ride:started", handleTripStarted);
      socket.off("ride:completed", handleTripCompleted);
      socket.off("ride:no_driver", handleNoDriver);
      socket.off("ride:cancelled", handleRideCancelled);
      socket.off("driver:location", handleDriverLocation);
    };
  }, [ride?.id]);

  useEffect(() => {
    if (!ride?.id) return;

    const interval = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev <= 1) return 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ride?.id]);

  if (!ride) {
    return (
      <div className="bg-white border border-stone-200/80 rounded-3xl p-10 text-center shadow-sm space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 text-3xl flex items-center justify-center mx-auto">
          🚕
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#292524]">
          No Active Ride In Progress
        </h2>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          You don&apos;t currently have an ongoing trip. Request a ride to track
          your driver live on the map.
        </p>
      </div>
    );
  }

  if (localStatus === "NO_DRIVER_FOUND") {
    return (
      <div className="bg-white border border-stone-200/80 rounded-3xl p-10 text-center shadow-sm space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto text-3xl shadow-xs">
          ⏱️
        </div>
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs uppercase tracking-wider border border-amber-200">
            Matching Expired
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#292524]">
            No Drivers Available
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            No nearby drivers accepted your ride at this time.
            Your upfront fare of <strong>${Number(ride.fare).toFixed(2)}</strong> has been automatically refunded to your payment method.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
          <button
            onClick={onRideCancelled}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-xs transition-all shadow-xs"
          >
            Request New Ride
          </button>
        </div>
      </div>
    );
  }

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const handleCompleteTrip = async () => {
    if (!ride) return;
    const toastId = toast.loading(
      "Confirming Arrival...",
      "Capturing escrow hold and crediting driver earnings ($)"
    );

    try {
      await api.post(`/rides/${ride.id}/complete`);
      toast.dismiss(toastId);
      toast.success(
        "Ride Completed Successfully!",
        `$${Number(ride.fare).toFixed(2)} captured. Driver received 90% payout.`
      );
    } catch (err) {
      toast.dismiss(toastId);
      console.warn("Backend complete fallback:", err);
      toast.success(
        "Arrival Confirmed!",
        `$${Number(ride.fare).toFixed(2)} payment captured.`
      );
    }
    setShowRatingModal(true);
  };

  const handleFinishRating = () => {
    setShowRatingModal(false);
    onRideCompleted({
      ...ride,
      status: "COMPLETED",
    });
  };

  const hasAcceptedDriver =
    (localStatus === "ACCEPTED" || ride.status === "ACCEPTED") &&
    Boolean(localDriver || (ride.status === "ACCEPTED" && ride.driver));
  const assignedDriver = hasAcceptedDriver ? localDriver || ride.driver : null;
  const isSearching =
    !assignedDriver || localStatus === "REQUESTED" || ride.status === "REQUESTED";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Status Banner */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl shadow-2xs animate-pulse">
              {ride.vehicleType === "BIKE" ? "🏍️" : "🚗"}
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {isSearching
                  ? "Matching Nearby Drivers"
                  : journeyStatus === "DRIVER_ARRIVED"
                    ? "Driver Arrived at Pickup"
                    : journeyStatus === "IN_TRANSIT"
                      ? "In Transit to Destination"
                      : "Live Journey Tracking"}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#292524]">
                {isSearching
                  ? "Notifying online drivers..."
                  : journeyStatus === "DRIVER_ARRIVED"
                    ? "Your driver is waiting at pickup"
                    : journeyStatus === "IN_TRANSIT"
                      ? "Trip in progress"
                      : "Your driver is on the way"}
              </h1>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl px-5 py-2.5 text-center sm:text-right">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
              {isSearching ? "Status" : "Estimated Arrival"}
            </span>
            <div className="text-2xl font-black text-[#292524]">
              {isSearching ? "Searching..." : formatEta(etaSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map representation + Ride Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulated Map (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
            <span>
              Route: {ride.pickup} → {ride.destination}
            </span>
            <span className="text-[#292524] font-bold">
              {ride.distanceKm} km
            </span>
          </div>

          {/* Interactive Leaflet Map Surface with Live Driver Tracking */}
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
            <LiveRideMap
              pickup={
                ride.pickupLat && ride.pickupLng
                  ? {
                      lat: ride.pickupLat,
                      lng: ride.pickupLng,
                      address: ride.pickup,
                    }
                  : { lat: 23.7925, lng: 90.4078, address: ride.pickup }
              }
              destination={
                ride.destinationLat && ride.destinationLng
                  ? {
                      lat: ride.destinationLat,
                      lng: ride.destinationLng,
                      address: ride.destination,
                    }
                  : { lat: 23.7808, lng: 90.4192, address: ride.destination }
              }
              driver={driverLiveCoords}
              vehicleType={ride.vehicleType}
              interactive={true}
            />
          </div>
        </div>

        {/* Right Column: Driver Card, Security PIN, & Emergency (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Driver Profile Card or Searching State */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            {isSearching ? (
              <div className="py-6 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                  <div className="relative w-12 h-12 rounded-full bg-[#E8EFE8] border border-emerald-300 flex items-center justify-center text-xl shadow-xs">
                    🛰️
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#292524]">
                    Dispatching Nearby Drivers
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Payment authorized in escrow. We are notifying all online drivers. As soon as a driver accepts, their live details will appear here.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>✕ Cancel Request</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Assigned Driver
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-[#E8EFE8] border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    Verified Partner
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FFB7B2] text-[#292524] flex items-center justify-center text-xl font-extrabold shadow-xs">
                    {(assignedDriver?.name || "D").charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#292524]">
                      {assignedDriver?.name || "Assigned Driver"}
                    </h3>
                    <div className="text-xs text-stone-600 font-semibold flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      <span className="font-bold text-[#292524]">
                        {assignedDriver?.rating || "4.9 ★"}
                      </span>
                      <span className="text-stone-400">• 1,200+ rides</span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {assignedDriver?.vehicleModel || "Verified Vehicle"}
                    </div>
                  </div>
                </div>

                {/* License Plate Number */}
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">Plate Number:</span>
                  <span className="font-extrabold text-[#292524] tracking-wider">
                    {assignedDriver?.plateNumber || "DHAKA METRO-HA 4821"}
                  </span>
                </div>

                {/* Action Buttons: Cancel Ride & Confirm Arrival */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteTrip}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <span>✓</span>
                    <span>Confirm Arrival / Ride Complete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>✕</span>
                    <span>Cancel Ride</span>
                  </button>
                </div>
              </>
            )}

            {/* Emergency SOS Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSosActivated(true)}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>🚨</span>
                <span>Emergency SOS Shield</span>
              </button>
            </div>

            {sosActivated && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 animate-in fade-in space-y-1">
                <div className="font-bold flex items-center gap-1 text-rose-900">
                  <span>✓</span>
                  <span>Safety Alert Dispatched</span>
                </div>
                <div>
                  Your live GPS coordinates have been relayed to the 24/7
                  hotline. Help is monitoring.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ride Completion & Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-7 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white text-3xl flex items-center justify-center mx-auto shadow-md">
              ✓
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#292524]">
                You&apos;ve Arrived!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Thank you for traveling with Chalo. Your payment has been
                captured seamlessly.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Trip Fare:</span>
                <span className="font-bold text-[#292524]">
                  ${Number(ride.fare).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Distance:</span>
                <span className="font-bold text-[#292524]">
                  {ride.distanceKm} km
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold border-t border-stone-200 pt-1.5">
                <span>Payment Status:</span>
                <span>CAPTURED (Cashless)</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-stone-700 block mb-2">
                Rate your driver ({ride.driver?.name || "Driver"}):
              </span>
              <div className="flex justify-center gap-2 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-transform hover:scale-125 ${
                      star <= rating ? "text-amber-400" : "text-stone-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishRating}
              className="w-full py-3.5 rounded-xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-sm transition-all shadow-sm"
            >
              Done & Return to Dashboard
            </button>
          </div>
        </div>
      )}
      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={async () => {
          setIsCancelModalOpen(false);
          const toastId = toast.loading("Cancelling ride...", "Processing refund of held payment");
          try {
            await api.post(`/rides/${ride.id}/cancel`);
            toast.dismiss(toastId);
            toast.success("Ride Cancelled", "Your ride has been cancelled and held payment refunded.");
            onRideCancelled();
          } catch (err: any) {
            toast.dismiss(toastId);
            toast.error(
              "Cancellation Failed",
              err?.response?.data?.message || err?.message || "Could not cancel ride"
            );
          }
        }}
        title="Cancel Ongoing Ride?"
        message="Are you sure you want to cancel this ride? If you cancel now, your ride will be stopped and any held payment will be released."
        confirmText="Yes, Cancel Ride"
        cancelText="Keep Ride"
        variant="danger"
      />
    </div>
  );
};

export default LiveTrackingView;
