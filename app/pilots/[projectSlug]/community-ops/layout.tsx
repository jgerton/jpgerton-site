import { PilotsAuthGate } from "@/components/pilots/pilots-auth-gate";

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PilotsAuthGate>{children}</PilotsAuthGate>;
}
