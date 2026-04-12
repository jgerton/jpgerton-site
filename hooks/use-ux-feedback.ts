import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useProgress } from "./use-progress";

export function useUXFeedback(projectSlug: string, buildSlug: string) {
  const existing = useQuery(api.pilotFeedback.getMyUXFeedback);
  const submitUX = useMutation(api.pilotFeedback.submitUXFeedback);
  const { buildProgress } = useProgress(projectSlug, buildSlug);

  const modulesWithProgress = new Set(
    buildProgress.map((p) => p.moduleSlug)
  ).size;

  return {
    shouldPrompt: modulesWithProgress >= 2 && existing === null,
    submitted: existing !== null && existing !== undefined,
    submit: (data: {
      navigation?: number;
      readability?: number;
      exerciseTools?: number;
      openText?: string;
    }) => submitUX(data),
  };
}
