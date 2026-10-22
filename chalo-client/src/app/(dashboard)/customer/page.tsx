"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CustomerSidebar, {
  CustomerTab,
} from "@/components/customer/CustomerSidebar";
import RequestRideView, {
  ActiveRideState,
} from "@/components/customer/RequestRideView";
import LiveTrackingView from "@/components/customer/LiveTrackingView";
import RideHistoryView from "@/components/customer/RideHistoryView";
import CustomerProfileView from "@/components/customer/CustomerProfileView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth, type UserRole } from "@/context/auth.context";
import toast from "@/lib/toast";
import api from "@/lib/axios";
import { getSocket, joinUserChannel, joinRideRoom, leaveRideRoom } from "@/lib/socket";

const ALLOWED_CUSTOMER_ROLES: UserRole[] = ["CUSTOMER"];

function CustomerDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<CustomerTab>("request");
  const [activeRide, setActiveRide] = useState<ActiveRideState | null>(null);
  const [completedRides, setCompletedRides] = useState<ActiveRideState[]>([]);

  // Unconditionally restore active ride state from server on mount
  useEffect(() => {
    let isMounted = true;

    // Check session storage first (for immediate post-checkout transition)
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("chalo_active_ride");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.status === "REQUESTED") {
            parsed.driver = null;
          }
          setActiveRide(parsed);
          setActiveTab("tracking");
          sessionStorage.removeItem("chalo_active_ride");
        } catch (e) {
          console.error("Failed to parse saved active ride:", e);
        }
      }
    }

    // Unconditionally fetch active ride from server to restore state on refresh
    api
      .get("/rides/active?role=CUSTOMER")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data?.data) {
          const ride = res.data.data;
          const isAccepted = ride.status === "ACCEPTED" && Boolean(ride.driver?.id);
          setActiveRide({
            id: ride.id,
            pickup: ride.pickup || "Pickup Location",
            destination: ride.destination || "Destination",
            pickupLat: ride.pickupLat,
            pickupLng: ride.pickupLng,
            destinationLat: ride.destinationLat,
            destinationLng: ride.destinationLng,
            vehicleType: ride.vehicleType || "BIKE",
            distanceKm: Number(ride.distanceKm) || 0,
            fare: Number(ride.fare) || 0,
            status: isAccepted ? "ACCEPTED" : "REQUESTED",
            driver: isAccepted ? ride.driver : null,
            createdAt: ride.createdAt || new Date().toISOString(),
          });
          setActiveTab("tracking");
        }
      })
      .catch((err) => {
        console.warn("Could not fetch active customer ride:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Synchronize tab if explicitly navigated via URL search param
  useEffect(() => {
    const tabParam = searchParams.get("tab") as CustomerTab | null;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Ensure active ride socket room is joined whenever activeRide is set
  useEffect(() => {
    if (!activeRide?.id) return;
    joinRideRoom(activeRide.id);
  }, [activeRide?.id]);

  // Real-time synchronization for customer ride updates
  useEffect(() => {
    if (!user?.id) return;
    joinUserChannel(user.id, "CUSTOMER");

    const socket = getSocket();
    const handleRideAccepted = (data: any) => {
      if (data?.driver) {
        setActiveRide((prev) => ({
          id: data.rideId || prev?.id || "",
          pickup: prev?.pickup || data.pickup || "Pickup Location",
          destination: prev?.destination || data.destination || "Destination",
          pickupLat: typeof data.pickupLat === "number" ? data.pickupLat : prev?.pickupLat,
          pickupLng: typeof data.pickupLng === "number" ? data.pickupLng : prev?.pickupLng,
          destinationLat: typeof data.destinationLat === "number" ? data.destinationLat : prev?.destinationLat,
          destinationLng: typeof data.destinationLng === "number" ? data.destinationLng : prev?.destinationLng,
          vehicleType: data.vehicleType || prev?.vehicleType || "BIKE",
          distanceKm: Number(data.distanceKm) || prev?.distanceKm || 0,
          fare: Number(data.fare) || prev?.fare || 0,
          status: "ACCEPTED",
          driver: data.driver,
          createdAt:
            prev?.createdAt ||
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        }));
        setActiveTab("tracking");
        toast.success(
          "Driver Assigned!",
          `${data.driver?.name || "A driver"} accepted your ride and is en route.`,
        );
      }
    };

    const handleNoDriverFound = () => {
      toast.error(
        "No Drivers Available",
        "Radius limit reached. Your upfront payment hold has been refunded.",
      );
      setActiveRide(null);
      setActiveTab("request");
    };

    const handleRideCancelled = (data?: { message?: string }) => {
      toast.info(
        "Ride Cancelled",
        data?.message || "The ride has been cancelled and held payment refunded."
      );
      setActiveRide(null);
      setActiveTab("request");
    };

    socket.on("ride:accepted", handleRideAccepted);
    socket.on("ride:no_driver", handleNoDriverFound);
    socket.on("ride:cancelled", handleRideCancelled);

    return () => {
      socket.off("ride:accepted", handleRideAccepted);
      socket.off("ride:no_driver", handleNoDriverFound);
      socket.off("ride:cancelled", handleRideCancelled);
    };
  }, [user?.id]);

  const customerName = user?.name || "Customer";
  const customerEmail = user?.email || "";

  const handleRideCreated = useCallback((newRide: ActiveRideState) => {
    setActiveRide(newRide);
    setActiveTab("tracking");
  }, []);

  const handleRideCompleted = useCallback((completedRide: ActiveRideState) => {
    setCompletedRides((prev) => [completedRide, ...prev]);
    setActiveRide(null);
    setActiveTab("history");
  }, []);

  const handleRideCancelled = useCallback(() => {
    setActiveRide(null);
    setActiveTab("request");
  }, []);

  const handleRebook = useCallback(() => {
    setActiveTab("request");
  }, []);

  const handleRideAcceptedByDriver = useCallback((data: any) => {
    if (data?.driver) {
      setActiveRide((prev) => ({
        id: data.rideId || prev?.id || "",
        pickup: prev?.pickup || data.pickup || "Pickup Location",
        destination: prev?.destination || data.destination || "Destination",
        pickupLat: typeof data.pickupLat === "number" ? data.pickupLat : prev?.pickupLat,
        pickupLng: typeof data.pickupLng === "number" ? data.pickupLng : prev?.pickupLng,
        destinationLat: typeof data.destinationLat === "number" ? data.destinationLat : prev?.destinationLat,
        destinationLng: typeof data.destinationLng === "number" ? data.destinationLng : prev?.destinationLng,
        vehicleType: data.vehicleType || prev?.vehicleType || "BIKE",
        distanceKm: Number(data.distanceKm) || prev?.distanceKm || 0,
        fare: Number(data.fare) || prev?.fare || 0,
        status: "ACCEPTED",
        driver: data.driver,
        createdAt:
          prev?.createdAt ||
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#292524] flex flex-col lg:flex-row font-sans bg-grain">
      {/* Sidebar Navigation */}
      <CustomerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveRide={activeRide !== null}
        customerName={customerName}
        customerEmail={customerEmail}
      />

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === "request" && (
            <RequestRideView onRideCreated={handleRideCreated} />
          )}

          {activeTab === "tracking" && (
            <LiveTrackingView
              ride={activeRide}
              onRideAccepted={handleRideAcceptedByDriver}
              onRideCompleted={handleRideCompleted}
              onRideCancelled={handleRideCancelled}
            />
          )}

          {activeTab === "history" && (
            <RideHistoryView rides={completedRides} onRebook={handleRebook} />
          )}

          {activeTab === "profile" && (
            <CustomerProfileView
              customerName={customerName}
              customerEmail={customerEmail}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={ALLOWED_CUSTOMER_ROLES}>
      <Suspense fallback={<div className="min-h-screen bg-[#FDFCF8]" />}>
        <CustomerDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
