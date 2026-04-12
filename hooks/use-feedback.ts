import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useFeedback(
  projectSlug: string,
  buildSlug: string,
  moduleSlug: string
) {
  const feedback = useQuery(api.pilotFeedback.getModuleFeedback, {
    projectSlug,
    buildSlug,
    moduleSlug,
  });
  const submitFeedback = useMutation(api.pilotFeedback.submitModuleFeedback);

  return {
    submitted: feedback !== null && feedback !== undefined,
    response: feedback,
    submit: (data: {
      readiness: "not-ready" | "getting-there" | "ready";
      whatLanded?: string;
      whatsMissing?: string;
      situation?: string;
    }) =>
      submitFeedback({
        projectSlug,
        buildSlug,
        moduleSlug,
        ...data,
      }),
  };
}
