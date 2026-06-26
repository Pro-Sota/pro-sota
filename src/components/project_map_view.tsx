"use client";

import type { Project } from "@/app/management/projects/page";

export default function ProjectMapView({
  projects,
}: {
  projects: Project[];
}) {
  const mapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.671057212929!2d-79.38318468519957!3d43.64306242217024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34d3b8b3b3d3%3A0x7e4b8f4f3e5a1b1b!2sCN%20Tower!5e0!3m2!1sen!2sca!4v1631025940134!5m2!1sen!2sca";

  return (
    <div className="w-full h-full flex  overflow-hidden">
      <iframe
        src={mapUrl}
        title="Project locations map"
        loading="lazy"
        className="fixed w-full h-full"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}