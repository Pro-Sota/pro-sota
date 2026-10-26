
"use client";

import { useEffect, useMemo } from "react";
import * as L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type Coordinates = {
  latitude: number | null;
  longitude: number | null;
};

type ProjectLocationMapProps = Coordinates & {
  onChange: (coordinates: Coordinates) => void;
};

const ANGOLA_CENTER: [number, number] = [-12.5, 18.5];

function hasValidCoordinates({
  latitude,
  longitude,
}: Coordinates): boolean {
  return (
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function MapClickHandler({
  onChange,
}: {
  onChange: ProjectLocationMapProps["onChange"];
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapCenterSync({
  latitude,
  longitude,
}: Coordinates) {
  const map = useMap();

  useEffect(() => {
    if (hasValidCoordinates({ latitude, longitude })) {
      map.setView(
        [latitude as number, longitude as number],
        Math.max(map.getZoom(), 15),
        { animate: true }
      );
    }
  }, [latitude, longitude, map]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => map.invalidateSize(),
      100
    );

    return () => window.clearTimeout(timeout);
  }, [map]);

  return null;
}

export default function ProjectLocationMap({
  latitude,
  longitude,
  onChange,
}: ProjectLocationMapProps) {
  const hasCoordinates = hasValidCoordinates({
    latitude,
    longitude,
  });

  const center: [number, number] = hasCoordinates
    ? [latitude as number, longitude as number]
    : ANGOLA_CENTER;

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "project-location-marker",
        html: `
          <div style="
            width:22px;height:22px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            background:#002950;
            border:3px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,.3);
          ">
            <div style="
              width:6px;height:6px;
              margin:5px auto;
              border-radius:50%;
              background:#fff;
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      }),
    []
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">
            Mapa do projecto
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Clique para seleccionar o local ou arraste o marcador.
          </p>
        </div>

        <span className="text-xs text-slate-400">
          OpenStreetMap
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={hasCoordinates ? 15 : 5}
        scrollWheelZoom
        className="h-[320px] w-full"
        style={{ background: "#f1f5f9" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onChange={onChange} />

        <MapCenterSync
          latitude={latitude}
          longitude={longitude}
        />

        {hasCoordinates && (
          <Marker
            position={[
              latitude as number,
              longitude as number,
            ]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const position = event.target.getLatLng();

                onChange({
                  latitude: position.lat,
                  longitude: position.lng,
                });
              },
            }}
          />
        )}
      </MapContainer>

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {hasCoordinates
            ? "Localização seleccionada."
            : "Nenhum ponto seleccionado."}
        </p>

        {hasCoordinates && (
          <button
            type="button"
            onClick={() =>
              onChange({
                latitude: null,
                longitude: null,
              })
            }
            className="self-start text-xs font-medium text-rose-600 transition hover:text-rose-700 sm:self-auto"
          >
            Remover marcador
          </button>
        )}
      </div>
    </div>
  );
}
