"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/use-progress";

type SectionObserverProps = {
  projectSlug: string;
  buildSlug: string;
  moduleSlug: string;
  children: React.ReactNode;
};

export function SectionObserver({
  projectSlug,
  buildSlug,
  moduleSlug,
  children,
}: SectionObserverProps) {
  const { markVisited } = useProgress(projectSlug, buildSlug, moduleSlug);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            markVisited(entry.target.id);
          }
        }
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll("[data-section-id]");
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [moduleSlug, markVisited]);

  return <>{children}</>;
}
