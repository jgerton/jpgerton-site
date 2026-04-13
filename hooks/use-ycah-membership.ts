import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useYCAHMembership(email: string | undefined) {
  const result = useQuery(
    api.ycahMembers.getByEmail,
    email ? { email } : "skip"
  );
  return {
    isLoading: result === undefined,
    isMember: result?.isMember === true,
  };
}
