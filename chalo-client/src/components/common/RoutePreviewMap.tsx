"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteCoords {
  lat: number;
  lng: number;
  address?: string;
}

interface RoutePreviewMapProps {
  pickup: RouteCoords | null;
  destination: RouteCoords | null;
}

const createPinIcon = (type: "pickup" | "destination") => {
  const color = type === "pickup" ? "#059669" : "#e11d48";
  const label = type === "pickup" ? "P" : "D";

  return L.divIcon({
    className: "custom-leaflet-pin",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);">
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
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
    iconSize: [30, 38],
    iconAnchor: [15, 38],
  });
};

export const RoutePreviewMap: React.FC<RoutePreviewMapProps> = ({
  pickup,
  destination,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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
        scrollWheelZoom: false,
      });
      mapInstanceRef.current = map;
    } catch (e) {
      console.warn("Leaflet init warning:", e);
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
        L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(
          map,
        );
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
          },
        ).addTo(map);

        const bounds = L.latLngBounds(
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng],
        );
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
      }
    } catch (err) {
      console.warn("Leaflet layers render warning:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Safe catch against React 19 unmount race conditions
        }
        mapInstanceRef.current = null;
      }
    };
  }, [
    pickup?.lat,
    pickup?.lng,
    destination?.lat,
    destination?.lng,
  ]);

  return (
    <div className="relative w-full h-full min-h-55 rounded-2xl overflow-hidden shadow-inner border border-stone-200 isolation-auto z-0">
      <div ref={mapContainerRef} className="w-full h-full min-h-55 z-0" />
    </div>
  );
};

export default RoutePreviewMap;
