import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { pilotsSource } from "@/lib/pilots-source";
import { PilotsAuthGate } from "@/components/pilots/pilots-auth-gate";

export default function PilotsDocsLayout({ children }: { children: ReactNode }) {
  return (
    <PilotsAuthGate>
      <DocsLayout
        tree={pilotsSource.pageTree}
        nav={{
          title: "Pilots Hub",
        }}
        sidebar={{
          defaultOpenLevel: 2,
        }}
      >
        {children}
      </DocsLayout>
    </PilotsAuthGate>
  );
}
