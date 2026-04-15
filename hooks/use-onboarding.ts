import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useOnboarding() {
  const onboarding = useQuery(api.pilotOnboarding.getMyOnboarding);
  const updateScreen = useMutation(api.pilotOnboarding.updateScreen);
  const complete = useMutation(api.pilotOnboarding.complete);
  const skip = useMutation(api.pilotOnboarding.skip);

  const showWelcome =
    onboarding !== undefined &&
    onboarding === null;

  const hasCompleted =
    onboarding !== null &&
    onboarding !== undefined &&
    (onboarding.completedAt !== undefined || onboarding.skippedAt !== undefined);

  return {
    showWelcome: showWelcome || false,
    hasCompleted,
    lastScreen: onboarding?.lastScreenSeen ?? 1,
    updateScreen,
    complete,
    skip,
    reopen: () => {},
  };
}
