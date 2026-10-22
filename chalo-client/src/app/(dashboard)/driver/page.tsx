"use client";

import React, { useState, useEffect, useRef } from "react";
import DriverSidebar, { DriverTab } from "@/components/driver/DriverSidebar";
import AvailableRequestsView, {
  DriverRideOffer,
} from "@/components/driver/AvailableRequestsView";
import DriverOngoingRideView from "@/components/driver/DriverOngoingRideView";
import DriverWalletView from "@/components/driver/DriverWalletView";
import DriverHistoryView from "@/components/driver/DriverHistoryView";
import DriverProfileView from "@/components/driver/DriverProfileView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth, type UserRole } from "@/context/auth.context";
import api, { getErrorMessage } from "@/lib/axios";
import { getSocket, joinRideRoom } from "@/lib/socket";
import toast from "@/lib/toast";
import {
  LocationPickerModal,
  type SelectedLocation,
} from "@/components/common/LocationPickerModal";

const ALLOWED_DRIVER_ROLES: UserRole[] = ["DRIVER"];

function DriverDashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DriverTab>("requests");
  const [isOnline, setIsOnline] = useState(true);
  const [activeRide, setActiveRide] = useState<DriverRideOffer | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<DriverRideOffer | null>(
    null,
  );
  const [completedRides, setCompletedRides] = useState<DriverRideOffer[]>([]);
  const [balance, setBalance] = useState<number>(() =>
    typeof user?.balance === "number" ? user.balance : 0,
  );
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const driverName = user?.name || "Driver Partner";
  const driverEmail = user?.email || "";
  const [vehicleType, setVehicleType] = useState<"BIKE" | "CAR">(
    (user?.vehicleType as "BIKE" | "CAR") || "BIKE",
  );
  const lastOfferIdRef = useRef<string | null>(null);

  // Restore active ride state and driver live balance/status on mount
  useEffect(() => {
    let isMounted = true;

    // Fetch driver live balance and status from backend
    api
      .get("/drivers/balance")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data?.data) {
          if (typeof res.data.data.balance === "number") {
            setBalance(res.data.data.balance);
          }
          if (typeof res.data.data.isOnline === "boolean") {
            setIsOnline(res.data.data.isOnline);
          }
        }
      })
      .catch(() => {});

    // Unconditionally fetch active ongoing ride to restore state on refresh
    api
      .get("/rides/active?role=DRIVER")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data?.data) {
          const ride = res.data.data;
          const grossFare = Number(ride.fare) || 0;
          const netEarnings = Number((grossFare * 0.9).toFixed(2));
          const activeOffer: DriverRideOffer = {
            id: ride.id,
            customerName: ride.customer?.name || "Passenger",
            customerRating: ride.customer?.rating || "5.0 ★",
            pickup: ride.pickup || "Pickup Point",
            destination: ride.destination || "Destination",
            pickupLat: ride.pickupLat,
            pickupLng: ride.pickupLng,
            destinationLat: ride.destinationLat,
            destinationLng: ride.destinationLng,
            distanceKm: Number(ride.distanceKm) || 0,
            pickupDistanceKm: 0.5,
            grossFare,
            netEarnings,
            vehicleType: ride.vehicleType || "BIKE",
            expiresInSeconds: 0,
          };
          setActiveRide(activeOffer);
          setActiveTab("ongoing");
        }
      })
      .catch((err) => {
        console.warn("Could not fetch active driver ride:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Ensure active ride socket room is joined whenever activeRide is set
  useEffect(() => {
    if (!activeRide?.id) return;
    joinRideRoom(activeRide.id);
  }, [activeRide?.id]);

  // Synchronize online socket room & user channel
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket();

    // Ensure driver joins driver pool room and personal channel
    socket.emit("join:driver", {
      driverId: user.id,
      vehicleType: user.vehicleType || vehicleType,
    });
    socket.emit("join:user", {
      userId: user.id,
      role: "DRIVER",
      vehicleType: user.vehicleType || vehicleType,
    });

    if (isOnline) {
      socket.emit("driver:online", { driverId: user.id, vehicleType });
    } else {
      socket.emit("driver:offline", { vehicleType });
    }

    const handleRemoteCancelled = (data?: { message?: string }) => {
      toast.info(
        "Ride Cancelled",
        data?.message || "The passenger cancelled the ride request.",
      );
      setActiveRide(null);
      setIncomingOffer(null);
      setActiveTab("requests");
    };

    const fetchAvailableRides = async () => {
      try {
        const res = await api.get(`/rides/available?vehicleType=${vehicleType}`);
        if (res.data?.success && res.data?.data?.length > 0) {
          const first = res.data.data[0];
          const grossFare = Number(first.grossFare || first.fare || 0);
          const netEarnings = Number(
            first.netEarnings || (grossFare * 0.9).toFixed(2),
          );
          const formatted: DriverRideOffer = {
            id: first.id || first.rideId,
            customerName:
              first.customerName || first.customer?.name || "Passenger",
            customerRating:
              first.customerRating || first.customer?.rating || "4.9 ★",
            pickup: first.pickup || "Pickup Location",
            destination: first.destination || "Destination Drop-off",
            pickupDistanceKm:
              typeof first.pickupDistanceKm === "number"
                ? first.pickupDistanceKm
                : 0.5,
            distanceKm: Number(first.distanceKm) || 0,
            grossFare,
            netEarnings,
            vehicleType: first.vehicleType || vehicleType,
            pickupLat: first.pickupLat ? Number(first.pickupLat) : undefined,
            pickupLng: first.pickupLng ? Number(first.pickupLng) : undefined,
            destinationLat: first.destinationLat
              ? Number(first.destinationLat)
              : undefined,
            destinationLng: first.destinationLng
              ? Number(first.destinationLng)
              : undefined,
            expiresInSeconds: first.expiresInSeconds || 30,
          };
          setIncomingOffer(formatted);
          setActiveTab("requests");
        }
      } catch (err) {
        console.warn("Could not refetch available rides on socket event:", err);
      }
    };

    const handleIncomingRide = (offer: any) => {
      if (activeRide) return;
      if (offer) {
        const offerId = offer.id || offer.rideId;
        // Deduplicate rapid duplicate socket events for the same offer
        if (offerId && lastOfferIdRef.current === offerId) {
          return;
        }
        lastOfferIdRef.current = offerId;

        const grossFare = Number(offer.grossFare || offer.fare || 0);
        const netEarnings = Number(
          offer.netEarnings || (grossFare * 0.9).toFixed(2),
        );
        const formatted: DriverRideOffer = {
          id: offerId,
          customerName:
            offer.customerName || offer.customer?.name || "Passenger",
          customerRating:
            offer.customerRating || offer.customer?.rating || "4.9 ★",
          pickup: offer.pickup || "Pickup Location",
          destination: offer.destination || "Destination Drop-off",
          pickupDistanceKm:
            typeof offer.pickupDistanceKm === "number"
              ? offer.pickupDistanceKm
              : 0.5,
          distanceKm: Number(offer.distanceKm) || 0,
          grossFare,
          netEarnings,
          vehicleType: offer.vehicleType || vehicleType,
          pickupLat: offer.pickupLat ? Number(offer.pickupLat) : undefined,
          pickupLng: offer.pickupLng ? Number(offer.pickupLng) : undefined,
          destinationLat: offer.destinationLat
            ? Number(offer.destinationLat)
            : undefined,
          destinationLng: offer.destinationLng
            ? Number(offer.destinationLng)
            : undefined,
          expiresInSeconds: offer.expiresInSeconds || 30,
        };
        setIncomingOffer(formatted);
        setActiveTab("requests");
        toast.info(
          "New Ride Offer Available!",
          `Passenger nearby. Take-home pay: $${netEarnings.toFixed(2)}`,
        );
      }
    };

    socket.on("ride:cancelled", handleRemoteCancelled);
    socket.on("ride:requested", handleIncomingRide);
    socket.on("ride:broadcast", handleIncomingRide);

    return () => {
      socket.off("ride:cancelled", handleRemoteCancelled);
      socket.off("ride:requested", handleIncomingRide);
      socket.off("ride:broadcast", handleIncomingRide);
    };
  }, [user?.id, isOnline, activeRide?.id, vehicleType]);

  const handleToggleOnline = async (nextOnline: boolean) => {
    setIsOnline(nextOnline);
    const socket = getSocket();
    if (!nextOnline) {
      setIncomingOffer(null);
      socket.emit("driver:offline", { vehicleType });
    } else {
      socket.emit("driver:online", { driverId: user?.id, vehicleType });
      socket.emit("join:driver", {
        driverId: user?.id,
        vehicleType: user?.vehicleType || vehicleType,
      });
    }
    try {
      await api.patch("/drivers/status", { isOnline: nextOnline });
    } catch (e) {
      console.warn("Status toggle error:", e);
    }
  };

  const handleLocationConfirmed = async (loc: SelectedLocation) => {
    setDriverLocation({
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address,
    });

    const toastId = toast.loading("Updating driver location...");
    try {
      await api.patch("/drivers/location", {
        lat: loc.lat,
        lng: loc.lng,
      });
      toast.dismiss(toastId);
      toast.success(
        "Location Updated!",
        `Ready for nearby passenger matching around ${loc.address.split(",")[0]}.`
      );
    } catch (err) {
      toast.dismiss(toastId);
      console.warn("Failed to patch driver location:", err);
      toast.error("Location Update Failed", getErrorMessage(err));
    }
  };

  const handleAcceptRide = (offer: DriverRideOffer) => {
    setIncomingOffer(null);
    setActiveRide(offer);
    setActiveTab("ongoing");
  };

  const handleRideCompleted = (
    netEarnings: number,
    completedOffer: DriverRideOffer,
  ) => {
    setBalance((prev) => prev + netEarnings);
    setCompletedRides((prev) => [completedOffer, ...prev]);
    setActiveRide(null);
    setActiveTab("withdraw");
  };

  const handleRideCancelled = () => {
    setActiveRide(null);
    setActiveTab("requests");
  };

  const handleWithdrawSuccess = (withdrawAmount: number) => {
    setBalance((prev) => Math.max(0, prev - withdrawAmount));
    // Re-sync authoritative balance from backend
    api
      .get("/drivers/balance")
      .then((res) => {
        if (res.data?.success && typeof res.data.data?.balance === "number") {
          setBalance(res.data.data.balance);
        }
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#292524] flex flex-col lg:flex-row font-sans bg-grain">
      {/* Sidebar Navigation */}
      <DriverSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        setIsOnline={handleToggleOnline}
        hasActiveRide={activeRide !== null}
        driverName={driverName}
        vehicleType={vehicleType}
        balance={balance}
        currentAddress={driverLocation?.address}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
      />

      {/* Driver Location Setup Map Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleLocationConfirmed}
        title="Set Your Current Starting Location"
        type="driver"
        initialLocation={
          driverLocation
            ? {
                address: driverLocation.address,
                lat: driverLocation.lat,
                lng: driverLocation.lng,
              }
            : null
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === "requests" && (
            <AvailableRequestsView
              isOnline={isOnline}
              onGoOnline={() => setIsOnline(true)}
              onAcceptRide={handleAcceptRide}
              vehicleType={vehicleType}
              incomingOffer={incomingOffer}
            />
          )}

          {activeTab === "ongoing" && (
            <DriverOngoingRideView
              ride={activeRide}
              onRideCompleted={handleRideCompleted}
              onRideCancelled={handleRideCancelled}
            />
          )}

          {activeTab === "history" && (
            <DriverHistoryView completedRides={completedRides} />
          )}

          {activeTab === "withdraw" && (
            <DriverWalletView
              balance={balance}
              onWithdrawSuccess={handleWithdrawSuccess}
            />
          )}

          {activeTab === "profile" && (
            <DriverProfileView
              driverName={driverName}
              driverEmail={driverEmail}
              vehicleType={vehicleType}
              setVehicleType={setVehicleType}
              isOnline={isOnline}
              balance={balance}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function DriverDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={ALLOWED_DRIVER_ROLES}>
      <DriverDashboardContent />
    </ProtectedRoute>
  );
}
