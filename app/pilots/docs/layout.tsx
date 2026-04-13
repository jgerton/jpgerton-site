import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { pilotsSource } from "@/lib/pilots-source";

export default function PilotsDocsLayout({ children }: { children: ReactNode }) {
  return (
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
  );
}
