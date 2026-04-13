"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useProgress } from "@/hooks/use-progress";

export function ProgressTracker() {
  const params = useParams<{ slug?: string[] }>();
  const slugParts = params.slug ?? [];

  const projectSlug = slugParts[0] ?? "";
  const buildSlug = slugParts[1] ?? "";
  const moduleSlug = slugParts[2];

  const { markVisited } = useProgress(projectSlug, buildSlug, moduleSlug);

  useEffect(() => {
    if (!moduleSlug) return;

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

    // Fumadocs generates heading IDs automatically via rehype-slug
    const headings = document.querySelectorAll("h2[id], h3[id]");
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [moduleSlug, markVisited]);

  return null;
}
