"use client";

import { useEffect, useRef } from "react";
import { Database } from "../lib/supabase/models";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export default function ProjectMapView({ projects }: { projects: Project[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{ remove: () => void } | null>(null);
  const latitude = -9.0121;
  const longitude = 13.3844;

  useEffect(() => {
    if (!mapRef.current || projects.length === 0) return;

    // Import inside effect to avoid window is not defined error
    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default;

      // Fix marker icon paths
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
        iconUrl: "/leaflet/images/marker-icon.png",
        shadowUrl: "/leaflet/images/marker-shadow.png",
      });

      import("leaflet/dist/leaflet.css");
      const map = L.map(mapRef.current || "").setView(
        [latitude, longitude],
        13,
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("A pretty CSS popup.<br> Easily customizable.")
        .openPopup();
      projects.forEach((project) => {
        L.marker([latitude, longitude]).bindPopup(project.title).addTo(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
    };
  }, [projects]);

  return <div ref={mapRef} className="w-full h-full" />;
}
