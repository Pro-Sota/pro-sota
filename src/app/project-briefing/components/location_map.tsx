"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

import { isValidCoordinate } from "../validation";
import { btnSecondary, focusOutline, inputCls, linkBtn } from "../styles";

const DEFAULT_CENTER: [number, number] = [-8.839, 13.289];

const MARKER_SVG = `
<svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 1C8.6 1 1 8.6 1 18C1 30 18 44 18 44C18 44 35 30 35 18C35 8.6 27.4 1 18 1Z" fill="#002950" stroke="white" stroke-width="2"/>
  <circle cx="18" cy="18" r="6" fill="#BD9655" stroke="white" stroke-width="2"/>
</svg>`;

export default function LandLocationMap({
  latitude,
  longitude,
  onChangeAction,
}: {
  latitude: string;
  longitude: string;
  onChangeAction: (name: "latitude" | "longitude", value: string) => void;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onChangeRef = useRef(onChangeAction);
  const initial = useRef({ latitude, longitude });

  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    onChangeRef.current = onChangeAction;
  }, [onChangeAction]);

  const publish = useCallback((lat: number, lng: number) => {
    if (!isValidCoordinate(lat, lng)) return;
    onChangeRef.current("latitude", lat.toFixed(7));
    onChangeRef.current("longitude", lng.toFixed(7));
  }, []);

  /* Create the map once */
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    (async () => {
      try {
        const L = await import("leaflet");
        if (cancelled || !mapEl.current) return;

        const lat = Number(initial.current.latitude);
        const lng = Number(initial.current.longitude);
        const has =
          initial.current.latitude.trim() !== "" &&
          initial.current.longitude.trim() !== "" &&
          isValidCoordinate(lat, lng);

        map = L.map(mapEl.current, { scrollWheelZoom: true }).setView(
          has ? [lat, lng] : DEFAULT_CENTER,
          has ? 15 : 11
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        map.on("click", (e) => publish(e.latlng.lat, e.latlng.lng));

        leafletRef.current = L;
        mapRef.current = map;
        setReady(true);
      } catch (error) {
        console.error("Erro ao inicializar o mapa:", error);
        setStatus("Não foi possível carregar o mapa. Pode indicar o endereço nos campos acima.");
      }
    })();

    return () => {
      cancelled = true;
      setReady(false);
      markerRef.current = null;
      mapRef.current = null;
      leafletRef.current = null;
      map?.remove();
    };
  }, [publish]);

  /* Keep the marker in sync with the coordinates */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const valid =
      latitude.trim() !== "" && longitude.trim() !== "" && isValidCoordinate(lat, lng);

    if (!valid) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const existing = markerRef.current;

    if (!existing) {
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({
          className: "pro-sota-map-marker",
          html: MARKER_SVG,
          iconSize: [36, 46],
          iconAnchor: [18, 44],
        }),
      }).addTo(map);

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        publish(p.lat, p.lng);
      });

      markerRef.current = marker;
      map.setView([lat, lng], Math.max(map.getZoom(), 15));
    } else {
      existing.setLatLng([lat, lng]);
      if (!map.getBounds().contains([lat, lng])) map.panTo([lat, lng]);
    }
  }, [ready, latitude, longitude, publish]);

  /* Search by place name (Nominatim, submitted searches only) */
  async function search() {
    const q = query.trim();
    if (!q || searching) return;

    setSearching(true);
    setStatus("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ao&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error("search failed");

      const data = (await res.json()) as { lat: string; lon: string }[];
      if (!data.length) {
        setStatus("Nenhum resultado encontrado. Tente outro nome ou clique no mapa.");
        return;
      }

      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      publish(lat, lng);
      mapRef.current?.setView([lat, lng], 16);
    } catch {
      setStatus("Não foi possível pesquisar agora. Clique no mapa para indicar o local.");
    } finally {
      setSearching(false);
    }
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("O seu dispositivo não suporta geolocalização.");
      return;
    }
    setStatus("A obter a sua localização...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        publish(pos.coords.latitude, pos.coords.longitude);
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 17);
        setStatus("Localização obtida. Arraste o marcador para ajustar.");
      },
      () =>
        setStatus(
          "Não foi possível obter a sua localização. Verifique as permissões ou clique no mapa."
        ),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const hasLocation = latitude !== "" && longitude !== "";

  return (
    <div className="overflow-hidden rounded border border-[#cfd2cf]">
      <div className="flex flex-col gap-2 border-b border-[#ecebe7] bg-[#fafaf8] p-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // do not submit the brief form
              search();
            }
          }}
          placeholder="Pesquisar bairro ou local (ex.: Talatona)"
          aria-label="Pesquisar local no mapa"
          className={`${inputCls} flex-1`}
        />
        <div className="flex gap-2">
          <button type="button" className={btnSecondary} onClick={search} disabled={searching}>
            {searching ? "A pesquisar..." : "Pesquisar"}
          </button>
          <button type="button" className={btnSecondary} onClick={useMyLocation}>
            Usar a minha localização
          </button>
        </div>
      </div>

      <div
        ref={mapEl}
        className="z-0 h-[300px] w-full sm:h-[360px]"
        role="application"
        tabIndex={0}
        aria-label="Mapa interactivo para seleccionar a localização do terreno. Em alternativa, use a pesquisa ou o botão de localização acima."
      />

      <div className="grid grid-cols-1 gap-3 bg-[#fafaf8] p-3 sm:grid-cols-2">
        {[
          ["Latitude", latitude],
          ["Longitude", longitude],
        ].map(([label, value]) => (
          <div key={label}>
            <span className="block text-[10px] font-bold uppercase tracking-wide text-[#737a7e]">
              {label}
            </span>
            <span className="text-sm font-semibold tabular-nums text-[#002950]">
              {value || "Não seleccionada"}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ecebe7] bg-[#fafaf8] px-3 py-3 text-[11px] text-[#737a7e]">
        <span aria-live="polite">
          {status ||
            (hasLocation
              ? "Localização seleccionada. Arraste o marcador para ajustar."
              : "Clique no mapa, pesquise um local ou use a sua localização. O centro inicial é apenas uma referência.")}
        </span>

        {hasLocation && (
          <button
            type="button"
            className={`${linkBtn} ${focusOutline}`}
            onClick={() => {
              onChangeAction("latitude", "");
              onChangeAction("longitude", "");
              setStatus("");
            }}
          >
            Limpar localização
          </button>
        )}
      </div>
    </div>
  );
}