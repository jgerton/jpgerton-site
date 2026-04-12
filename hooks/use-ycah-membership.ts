import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useYCAHMembership(email: string | undefined) {
  const member = useQuery(
    api.ycahMembers.getByEmail,
    email ? { email } : "skip"
  );
  return {
    isMember: member !== null && member !== undefined,
    isPending: member === undefined,
    memberData: member,
  };
}
