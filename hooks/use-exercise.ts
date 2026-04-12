import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useExercise(
  exerciseId: string,
  projectSlug: string,
  buildSlug: string
) {
  const response = useQuery(api.pilotExercises.getExerciseResponse, {
    exerciseId,
  });
  const saveResponse = useMutation(api.pilotExercises.saveResponse);

  return {
    response: response?.response ?? "",
    status: response?.status ?? null,
    isSubmitted: response?.status === "submitted",
    isDraft: response?.status === "draft",
    save: (text: string, status: "draft" | "submitted" = "draft") =>
      saveResponse({
        projectSlug,
        buildSlug,
        exerciseId,
        response: text,
        channel: "web",
        status,
      }),
    submit: (text: string) =>
      saveResponse({
        projectSlug,
        buildSlug,
        exerciseId,
        response: text,
        channel: "web",
        status: "submitted",
      }),
  };
}
