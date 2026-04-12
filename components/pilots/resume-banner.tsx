"use client";

import { useState } from "react";
import { useProgress } from "@/hooks/use-progress";

type ResumeBannerProps = {
  projectSlug: string;
  buildSlug: string;
  moduleSlug: string;
  sections: { id: string; title: string }[];
};

export function ResumeBanner({
  projectSlug,
  buildSlug,
  moduleSlug,
  sections,
}: ResumeBannerProps) {
  const { visitedSections, lastVisitedSection } = useProgress(
    projectSlug,
    buildSlug,
    moduleSlug
  );
  const [dismissed, setDismissed] = useState(false);

  if (
    dismissed ||
    visitedSections.size === 0 ||
    visitedSections.size >= sections.length ||
    !lastVisitedSection
  ) {
    return null;
  }

  const sectionTitle = sections.find(
    (s) => s.id === lastVisitedSection.sectionId
  )?.title;

  function scrollToSection() {
    const el = document.getElementById(lastVisitedSection!.sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setDismissed(true);
  }

  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-base">📍</span>
        <div>
          <div className="text-sm font-medium">Pick up where you left off?</div>
          {sectionTitle && (
            <div className="text-xs text-muted-foreground">
              You were reading &quot;{sectionTitle}&quot;
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Dismiss
        </button>
        <button
          onClick={scrollToSection}
          className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
        >
          Resume
        </button>
      </div>
    </div>
  );
}
