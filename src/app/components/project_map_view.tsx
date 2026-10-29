"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Database } from "../lib/supabase/models";

type Project = Database["public"]["Tables"]["projects"]["Row"];

type ProjectWithCoords = Project & {
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type MappedProject = { project: Project; lat: number; lng: number };

const DEFAULT_CENTER: L.LatLngTuple = [-9.0121, 13.3844];
const DEFAULT_ZOOM = 12;

const CLOSE_DELAY_MS = 250;
const TOP_OFFSET = L.point(0, -36); // card sits just above the pin
const BOTTOM_OFFSET = L.point(0, -6); // card sits just below the pin tip
const EDGE_MARGIN = 16; // keep the card this far from the map edge

const FIELDS = {
  image: ["image_url", "cover_url", "thumbnail_url", "image"],
  status: ["status", "estado"],
  description: ["description", "descricao", "summary"],
  location: ["address", "location", "localizacao", "city"],
  budget: ["budget", "orcamento", "value"],
  startDate: ["start_date", "data_inicio"],
  endDate: ["end_date", "data_fim"],
  client: ["client", "cliente", "owner"],
} as const;

const defaultHref = (project: Project) =>
  `/management/projects/${(project as unknown as { project_id: string | number }).project_id}`;

function parseCoord(value: unknown, min: number, max: number): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function pick(project: Project, keys: readonly string[]): unknown {
  const record = project as unknown as Record<string, unknown>;
  for (const key of keys) {
    const v = record[key];
    if (v != null && String(v).trim() !== "") return v;
  }
  return null;
}

function asText(value: unknown): string | null {
  return value == null ? null : String(value);
}

function formatDate(value: unknown): string | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function formatBudget(value: unknown): string | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n)
    ? new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0,
      }).format(n)
    : String(value);
}

function isSafeImageUrl(url: string): boolean {
  try {
    const u = new URL(url, window.location.origin);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text; // textContent: no HTML injection
  return node;
}

/** Builds the clickable project card. */
function buildProjectCard(
  project: Project,
  href: string,
  onNavigate: (href: string) => void,
): HTMLElement {
  const card = el(
    "a",
    "project-map-card group block w-64 overflow-hidden rounded-xl bg-white text-left shadow-xl ring-1 ring-black/10 whitespace-normal no-underline transition-shadow hover:ring-2 hover:ring-[#002955]/40 cursor-pointer",
  );
  card.href = href;
  card.setAttribute("aria-label", `Abrir projecto ${project.title ?? ""}`);

  // Plain click: client-side navigation. Modified clicks keep native behaviour.
  card.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onNavigate(href);
  });

  // Don't let clicks/scrolls on the card reach the map underneath.
  L.DomEvent.disableClickPropagation(card);
  L.DomEvent.disableScrollPropagation(card);

  const image = pick(project, FIELDS.image);
  if (typeof image === "string" && isSafeImageUrl(image)) {
    const img = el("img", "h-32 w-full object-cover bg-gray-100");
    img.src = image;
    img.alt = "";
    card.appendChild(img);
  }

  const body = el("div", "space-y-2 p-3");

  const header = el("div", "flex items-start justify-between gap-2");
  header.appendChild(
    el(
      "h3",
      "text-sm font-semibold leading-snug text-[#002955]",
      project.title ?? "Projecto",
    ),
  );
  const status = pick(project, FIELDS.status);
  if (status) {
    header.appendChild(
      el(
        "span",
        "shrink-0 rounded-full bg-[#002955]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#002955]",
        String(status),
      ),
    );
  }
  body.appendChild(header);

  const description = pick(project, FIELDS.description);
  if (description) {
    body.appendChild(
      el(
        "p",
        "text-xs leading-relaxed text-gray-600 line-clamp-3",
        String(description),
      ),
    );
  }

  const start = formatDate(pick(project, FIELDS.startDate));
  const end = formatDate(pick(project, FIELDS.endDate));
  const rows: [string, string | null][] = [
    ["Localização", asText(pick(project, FIELDS.location))],
    ["Cliente", asText(pick(project, FIELDS.client))],
    ["Orçamento", formatBudget(pick(project, FIELDS.budget))],
    ["Período", start && end ? `${start} – ${end}` : (start ?? end)],
  ];

  const visibleRows = rows.filter(([, v]) => v);
  if (visibleRows.length > 0) {
    const list = el("dl", "space-y-1 border-t border-gray-100 pt-2 text-xs");
    visibleRows.forEach(([label, value]) => {
      const row = el("div", "flex justify-between gap-3");
      row.appendChild(el("dt", "text-gray-500", label));
      row.appendChild(el("dd", "text-right font-medium text-gray-800", value!));
      list.appendChild(row);
    });
    body.appendChild(list);
  }

  body.appendChild(
    el(
      "div",
      "pt-1 text-xs font-medium text-[#002955] group-hover:underline",
      "Ver projecto →",
    ),
  );

  card.appendChild(body);
  return card;
}

function createMarkerIcon() {
  return L.divIcon({
    className: "",
    html: `
      <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 27 15 27s15-15.8 15-27C30 6.7 23.3 0 15 0z"
              fill="#002955" stroke="#fff" stroke-width="2"/>
        <circle cx="15" cy="15" r="5.5" fill="#fff"/>
      </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}

export default function ProjectMapView({
  projects,
  getProjectHref = defaultHref,
}: {
  projects: Project[];
  getProjectHref?: (project: Project) => string;
}) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Keep latest callbacks in refs so the marker effect doesn't re-run for them.
  const navigateRef = useRef((href: string) => router.push(href));
  navigateRef.current = (href: string) => router.push(href);
  const hrefRef = useRef(getProjectHref);
  hrefRef.current = getProjectHref;

  const mapped = useMemo<MappedProject[]>(() => {
    return projects.flatMap((project) => {
      const { latitude, longitude } = project as ProjectWithCoords;
      const lat = parseCoord(latitude, -90, 90);
      const lng = parseCoord(longitude, -180, 180);
      return lat === null || lng === null ? [] : [{ project, lat, lng }];
    });
  }, [projects]);

  // 1) Initialise the map once, plus one shared hover-card tooltip.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);

    tooltipRef.current = L.tooltip({
      direction: "top",
      offset: TOP_OFFSET,
      opacity: 1,
      interactive: true, // makes the card receive pointer events
      permanent: false,
      className: "!border-0 !bg-transparent !p-0 !shadow-none before:!hidden",
    });

    mapRef.current = map;

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      tooltipRef.current = null;
    };
  }, []);

  // 2) Sync markers whenever the projects change.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    const tooltip = tooltipRef.current;
    if (!map || !layer || !tooltip) return;

    layer.clearLayers();
    map.closeTooltip(tooltip);

    const icon = createMarkerIcon();
    const canHover = window.matchMedia("(hover: hover)").matches;

    const clearCloseTimer = () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };

    const scheduleClose = () => {
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
        map.closeTooltip(tooltip);
      }, CLOSE_DELAY_MS);
    };

    const showCard = (marker: L.Marker, project: Project) => {
      clearCloseTimer();

      const card = buildProjectCard(
        project,
        hrefRef.current(project),
        navigateRef.current,
      );

      // Keep the card open while the pointer is on it.
      card.addEventListener("mouseenter", clearCloseTimer);
      card.addEventListener("mouseleave", scheduleClose);

      // Start above the pin.
      tooltip.options.direction = "top";
      tooltip.options.offset = TOP_OFFSET;
      tooltip.setContent(card);
      tooltip.setLatLng(marker.getLatLng());
      if (!map.hasLayer(tooltip)) map.openTooltip(tooltip);

      // Measure the real card; flip below the pin if there's no room above.
      const height = tooltip.getElement()?.offsetHeight ?? 300;
      const pinY = map.latLngToContainerPoint(marker.getLatLng()).y;
      const spaceNeeded = height + 42 + EDGE_MARGIN; // card + pin icon + margin

      if (pinY < spaceNeeded) {
        tooltip.options.direction = "bottom";
        tooltip.options.offset = BOTTOM_OFFSET;
        tooltip.update();
      }
    };

    mapped.forEach(({ project, lat, lng }) => {
      const name = project.title ?? "Projecto";
      const marker = L.marker([lat, lng], { icon, title: name, alt: name });

      if (canHover) {
        marker.on("mouseover", () => showCard(marker, project));
        marker.on("mouseout", scheduleClose);
      } else {
        // Touch: open the same clickable card in a popup on tap.
        marker.bindPopup(
          buildProjectCard(
            project,
            hrefRef.current(project),
            navigateRef.current,
          ),
          {
            className: "project-map-popup",
            minWidth: 256,
            maxWidth: 256,
            closeButton: false,
          },
        );
      }

      marker.addTo(layer);
    });

    if (mapped.length > 1) {
      map.fitBounds(
        L.latLngBounds(mapped.map((m) => [m.lat, m.lng] as L.LatLngTuple)),
        { padding: [40, 40], maxZoom: 15 },
      );
    } else if (mapped.length === 1) {
      map.setView([mapped[0].lat, mapped[0].lng], 15);
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }

    return () => {
      clearCloseTimer();
    };
  }, [mapped]);

  return (
    <div className="relative h-full w-full min-h-[320px] overflow-hidden rounded-lg">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        role="region"
        aria-label="Mapa dos projectos"
      />

      {mapped.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm text-gray-700 shadow">
          Nenhum projecto com localização definida
        </div>
      )}
    </div>
  );
}