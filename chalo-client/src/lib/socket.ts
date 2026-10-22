"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api(\/v1)?\/?$/, "") ||
  "http://localhost:4000";

let userSubscription: { userId: string; role?: string } | null = null;
let driverSubscription: { vehicleType?: string; driverId?: string } | null = null;
let currentRideRoom: string | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      // Re-join user channel upon reconnect if previously registered
      if (userSubscription && socket) {
        socket.emit("join:user", userSubscription);
      }
      // Re-join driver pool upon reconnect if registered
      if (driverSubscription && socket) {
        socket.emit("join:driver", driverSubscription);
      }
      // Re-join active ride room upon reconnect if active
      if (currentRideRoom && socket) {
        socket.emit("ride:join", { rideId: currentRideRoom });
      }
    });
  }

  return socket;
};

export const joinRideRoom = (rideId: string) => {
  if (!rideId) return;
  currentRideRoom = rideId;
  const s = getSocket();
  s.emit("ride:join", { rideId });
};

export const leaveRideRoom = (rideId: string) => {
  if (currentRideRoom === rideId) {
    currentRideRoom = null;
  }
  const s = getSocket();
  s.emit("ride:leave", { rideId });
};

export const joinUserChannel = (userId: string, role?: string) => {
  if (!userId) return;
  userSubscription = { userId, role };
  const s = getSocket();
  s.emit("join:user", { userId, role });
};

export const joinDriverPool = (vehicleType?: string, driverId?: string) => {
  driverSubscription = { vehicleType, driverId };
  const s = getSocket();
  s.emit("join:driver", { vehicleType, driverId });
};

export default getSocket;

