"use client";

import { useEffect, useRef } from "react";
import {
  importLibrary,
  setOptions,
} from "@googlemaps/js-api-loader";

import type { Database } from "../lib/supabase/models";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const DEFAULT_CENTER: google.maps.LatLngLiteral = {
  lat: -9.0121,
  lng: 13.3844,
};

export default function ProjectMapView({
  projects,
}: {
  projects: Project[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey || !mapRef.current || cancelled) return;

      try {
        setOptions({ key: apiKey });

        const { Map, InfoWindow } =
          (await importLibrary("maps")) as google.maps.MapsLibrary;

        const { Marker } =
          (await importLibrary("marker")) as google.maps.MarkerLibrary;

        if (cancelled || !mapRef.current) return;

        const map =
          mapInstanceRef.current ??
          new Map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            mapTypeId: "roadmap",
          });

        mapInstanceRef.current = map;

        // Remove markers from the previous render.
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new InfoWindow();
        let validCoordinates = 0;

        projects.forEach((project) => {
          // Read optional coordinates without assuming they exist
          // in the current Supabase projects table.
          const record = project as Project & {
            latitude?: number | string | null;
            longitude?: number | string | null;
          };

          const lat = Number(record.latitude);
          const lng = Number(record.longitude);

          // Do not place projects at invented locations.
          if (
            record.latitude == null ||
            record.longitude == null ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
          ) {
            return;
          }

          const position = { lat, lng };

          const marker = new Marker({
            map,
            position,
            title: project.title,
          });

          marker.addListener("click", () => {
            infoWindow.setContent(
              `<div style="padding: 4px 8px;">
                <strong>${escapeHtml(project.title ?? "Projecto")}</strong>
              </div>`,
            );

            infoWindow.open({ map, anchor: marker });
          });

          markersRef.current.push(marker);
          bounds.extend(position);
          validCoordinates += 1;
        });

        if (validCoordinates > 0) {
          map.fitBounds(bounds);

          if (validCoordinates === 1) {
            map.setZoom(15);
          }
        } else {
          map.setCenter(DEFAULT_CENTER);
          map.setZoom(12);
        }

        initializedRef.current = true;
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao carregar o Google Maps:", error);
        }
      }
    }

    function escapeHtml(value: string | null): string {
      return (value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    void initializeMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [projects]);

  return (
    <div
      ref={mapRef}
      className="h-full min-h-[320px] w-full overflow-hidden rounded-lg"
      aria-label="Mapa dos projectos"
      role="region"
    />
  );
}
