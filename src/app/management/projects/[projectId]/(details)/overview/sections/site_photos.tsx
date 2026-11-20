import { Camera } from "lucide-react";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import { formatMilestoneDate } from "../components/format";
import type { SitePhoto } from "../types";

export default function SitePhotosSection({ items }: { items: SitePhoto[] }) {
  return (
    <SectionCard title={LABELS.sitePhotos}>
      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((photo) => (
            <li key={photo.id} className="min-w-0">
              {/* Plain <img>: swap for next/image once your photo host is
                  listed in next.config images.remotePatterns. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption || LABELS.sitePhotos}
                loading="lazy"
                className="aspect-square w-full rounded-md bg-gray-100 object-cover"
              />
              {(photo.caption || photo.takenAt) && (
                <p className="mt-1 truncate text-xs text-gray-500">
                  {photo.caption || formatMilestoneDate(photo.takenAt)}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Camera} title={LABELS.emptySitePhotos} />
      )}
    </SectionCard>
  );
}