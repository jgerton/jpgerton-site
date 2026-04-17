import { PilotsAuthGate } from "@/components/pilots/pilots-auth-gate";
import "@/components/command-center/community-ops.css";

export default function CommunityOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PilotsAuthGate>
      <div className="community-ops">{children}</div>
    </PilotsAuthGate>
  );
}
