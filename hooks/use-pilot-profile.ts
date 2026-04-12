import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePilotProfile() {
  const profile = useQuery(api.pilotProfiles.getMyProfile);
  const createProfile = useMutation(api.pilotProfiles.createProfile);
  const updateProfile = useMutation(api.pilotProfiles.updateProfile);

  return {
    profile,
    isLoading: profile === undefined,
    hasProfile: profile !== null && profile !== undefined,
    approvalStatus: profile?.approvalStatus,
    preferredName: profile?.preferredName,
    createProfile,
    updateProfile,
  };
}
