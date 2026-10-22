/**
 * Chalo Shared TypeScript Interfaces
 * Directly aligned with Prisma schemas in chalo-backend/prisma/schema/
 */

export type Role = "CUSTOMER" | "DRIVER";
export type VehicleType = "BIKE" | "CAR";

export type RideStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "COMPLETED"
  | "NO_DRIVER_FOUND"
  | "CANCELLED";

export type PaymentStatus = "HELD" | "CAPTURED" | "REFUNDED";

export type WithdrawalStatus = "PENDING" | "COMPLETED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  vehicleType: VehicleType | null;
  isOnline: boolean;
  lat?: number | null;
  lng?: number | null;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ride {
  id: string;
  customerId: string;
  customerName?: string;
  driverId?: string | null;
  driverName?: string | null;
  driverPlate?: string | null;
  driverRating?: string | null;
  driverModel?: string | null;
  pickupAddress: string;
  destinationAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  vehicleType: VehicleType;
  distanceKm: number;
  fare: number;
  netDriverEarnings: number;
  status: RideStatus;
  otp?: string;
  currentRadiusKm: number;
  createdAt: string;
  acceptedAt?: string | null;
  completedAt?: string | null;
}

export interface Payment {
  id: string;
  rideId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Withdrawal {
  id: string;
  driverId: string;
  amount: number;
  method: string;
  account: string;
  status: WithdrawalStatus;
  createdAt: string;
  updatedAt: string;
}
