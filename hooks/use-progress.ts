import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useProgress(
  projectSlug: string,
  buildSlug: string,
  moduleSlug?: string
) {
  const moduleProgress = useQuery(
    api.pilotProgress.getModuleProgress,
    moduleSlug
      ? { projectSlug, buildSlug, moduleSlug }
      : "skip"
  );

  const buildProgress = useQuery(api.pilotProgress.getBuildProgress, {
    projectSlug,
    buildSlug,
  });

  const markVisited = useMutation(api.pilotProgress.markSectionVisited);

  const visitedSections = new Set(
    (moduleProgress ?? []).map((p) => p.sectionId)
  );

  const lastVisitedSection = (moduleProgress ?? []).reduce(
    (latest, p) =>
      !latest || p.lastVisitedAt > latest.lastVisitedAt ? p : latest,
    null as (typeof moduleProgress extends (infer T)[] | undefined ? T : never) | null
  );

  return {
    visitedSections,
    lastVisitedSection,
    buildProgress: buildProgress ?? [],
    markVisited: (sectionId: string) =>
      moduleSlug
        ? markVisited({ projectSlug, buildSlug, moduleSlug, sectionId })
        : Promise.resolve(),
  };
}
