"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markerPosition: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
  markerType?: "pickup" | "destination" | "driver" | "default";
}

const createPinIcon = (type: "pickup" | "destination" | "driver" | "default") => {
  const color =
    type === "pickup"
      ? "#059669"
      : type === "destination"
        ? "#e11d48"
        : type === "driver"
          ? "#2563eb"
          : "#292524";
  const label =
    type === "pickup"
      ? "P"
      : type === "destination"
        ? "D"
        : type === "driver"
          ? "🏍️"
          : "📍";

  return L.divIcon({
    className: "custom-leaflet-pin",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
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
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 13,
  markerPosition,
  onLocationSelect,
  markerType = "pickup",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
        center,
        zoom,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;
    } catch (e) {
      console.warn("Leaflet map init warning:", e);
      return;
    }

    try {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", (e: L.LeafletMouseEvent) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
    } catch (err) {
      console.warn("Leaflet tilelayer warning:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Safe catch against React 19 unmount race condition
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      try {
        map.removeLayer(markerRef.current);
      } catch {}
      markerRef.current = null;
    }

    if (markerPosition) {
      try {
        const pinIcon = createPinIcon(markerType);
        const marker = L.marker(markerPosition, { icon: pinIcon }).addTo(map);
        markerRef.current = marker;
      } catch (e) {
        console.warn("Marker update error:", e);
      }
    }
  }, [markerPosition, markerType]);

  // Recenter Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      map.flyTo(center, zoom, { duration: 0.8 });
    } catch {}
  }, [center[0], center[1], zoom]);

  return (
    <div className="relative w-full h-full min-h-80 rounded-2xl overflow-hidden shadow-inner border border-stone-200 isolation-auto z-0">
      <div ref={mapContainerRef} className="w-full h-full min-h-80 z-0" />
    </div>
  );
};

export default LeafletMap;
