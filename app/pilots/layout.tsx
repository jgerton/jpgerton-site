import { PilotNav } from "@/components/pilot-nav";

export default function PilotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PilotNav />
      {children}
    </>
  );
}
