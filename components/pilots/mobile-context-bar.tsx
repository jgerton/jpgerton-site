"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

type Section = { id: string; title: string };
type Module = {
  slug: string;
  title: string;
  sections: Section[];
  exercises: { id: string; title: string }[];
};

export function MobileContextBar({ modules }: { modules: Module[] }) {
  const params = useParams<{ module?: string }>();
  const [open, setOpen] = useState(false);
  const activeModule = modules.find((m) => m.slug === params.module);

  if (!activeModule) return null;

  return (
    <div className="lg:hidden border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div>
          <div className="text-xs text-muted-foreground">
            Module {modules.indexOf(activeModule) + 1} of {modules.length}
          </div>
          <div className="text-sm font-medium">{activeModule.title}</div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-3 py-1.5 rounded bg-accent/30 text-primary font-medium"
        >
          Sections {open ? "▴" : "▾"}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-3 border-t border-border">
          {activeModule.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setOpen(false)}
              className="block py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {section.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
