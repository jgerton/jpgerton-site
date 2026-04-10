import { PilotNav } from "@/components/pilot-nav";

export default function PilotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="max-w-3xl mx-auto px-6 pt-4">
        <PilotNav />
      </div>
      {children}
    </div>
  );
}
