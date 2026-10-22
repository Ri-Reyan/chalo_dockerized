"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface LatLngCoords {
  lat: number;
  lng: number;
  address?: string;
}

export interface LiveRideMapProps {
  pickup: LatLngCoords | null;
  destination: LatLngCoords | null;
  driver?: LatLngCoords | null;
  vehicleType?: "BIKE" | "CAR";
  interactive?: boolean;
}

const createPinIcon = (
  type: "pickup" | "destination" | "driver",
  vehicleType?: "BIKE" | "CAR"
) => {
  const color =
    type === "pickup" ? "#059669" : type === "destination" ? "#e11d48" : "#2563eb";
  const label =
    type === "pickup"
      ? "P"
      : type === "destination"
        ? "D"
        : vehicleType === "CAR"
          ? "🚗"
          : "🏍️";

  return L.divIcon({
    className: "custom-leaflet-live-pin",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);">
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: ${type === "driver" ? "16px" : "13px"};
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 2.5px solid white;
          background-color: ${color};
          color: white;
        ">
          ${label}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 7px solid ${color};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [34, 41],
    iconAnchor: [17, 41],
  });
};

export const LiveRideMap: React.FC<LiveRideMapProps> = ({
  pickup,
  destination,
  driver,
  vehicleType = "BIKE",
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center Dhaka
    const centerLat = pickup ? pickup.lat : destination ? destination.lat : 23.7925;
    const centerLng = pickup ? pickup.lng : destination ? destination.lng : 90.4078;

    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        scrollWheelZoom: interactive,
        dragging: interactive,
      });
      mapInstanceRef.current = map;
    } catch (e) {
      console.warn("Leaflet map initialization warning:", e);
      return;
    }

    try {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const pickupIcon = createPinIcon("pickup");
      const destIcon = createPinIcon("destination");

      if (pickup) {
        L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      }

      if (destination) {
        L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);
      }

      if (pickup && destination) {
        L.polyline(
          [
            [pickup.lat, pickup.lng],
            [destination.lat, destination.lng],
          ],
          {
            color: "#FF9E98",
            weight: 5,
            opacity: 0.9,
            dashArray: "6, 8",
          }
        ).addTo(map);

        const bounds = L.latLngBounds(
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng]
        );
        if (driver) {
          bounds.extend([driver.lat, driver.lng]);
        }
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
      } else if (driver) {
        map.setView([driver.lat, driver.lng], 14);
      }
    } catch (err) {
      console.warn("Leaflet layers render warning:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, interactive]);

  // Update dynamic driver marker without re-rendering entire map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (driverMarkerRef.current) {
      try {
        map.removeLayer(driverMarkerRef.current);
      } catch {}
      driverMarkerRef.current = null;
    }

    if (driver) {
      try {
        const driverIcon = createPinIcon("driver", vehicleType);
        const marker = L.marker([driver.lat, driver.lng], {
          icon: driverIcon,
          zIndexOffset: 1000,
        }).addTo(map);
        driverMarkerRef.current = marker;
      } catch (e) {
        console.warn("Driver marker update warning:", e);
      }
    }
  }, [driver?.lat, driver?.lng, vehicleType]);

  return (
    <div className="relative w-full h-full min-h-75 rounded-2xl overflow-hidden shadow-inner border border-stone-200 isolation-auto z-0">
      <div ref={mapContainerRef} className="w-full h-full min-h-75 z-0" />
    </div>
  );
};

export default LiveRideMap;

