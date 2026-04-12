"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useProgress } from "@/hooks/use-progress";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

type Section = { id: string; title: string };
type ExerciseRef = { id: string; title: string };
type Module = {
  slug: string;
  title: string;
  sections: Section[];
  exercises: ExerciseRef[];
};

type PilotSidebarProps = {
  projectSlug: string;
  buildSlug: string;
  modules: Module[];
  buildTitle: string;
};

export function PilotSidebar({
  projectSlug,
  buildSlug,
  modules,
  buildTitle,
}: PilotSidebarProps) {
  const params = useParams<{ module?: string }>();
  const pathname = usePathname();
  const activeModule = params.module;
  const { buildProgress } = useProgress(projectSlug, buildSlug);
  const buildExercises = useQuery(api.pilotExercises.getBuildExercises, {
    projectSlug,
    buildSlug,
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Scroll spy: observe section headings
  useEffect(() => {
    if (!activeModule) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    const headings = document.querySelectorAll("[data-section-id]");
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [activeModule, pathname]);

  // Calculate progress per module
  function getModuleProgress(moduleSlug: string, sections: Section[]) {
    const visited = new Set(
      buildProgress
        .filter((p) => p.moduleSlug === moduleSlug)
        .map((p) => p.sectionId)
    );
    return { visited: visited.size, total: sections.length };
  }

  function getExerciseCount(moduleExercises: ExerciseRef[]) {
    const submitted = (buildExercises ?? []).filter(
      (e) => moduleExercises.some((me) => me.id === e.exerciseId) && e.status === "submitted"
    );
    return { done: submitted.length, total: moduleExercises.length };
  }

  // Overall progress
  const totalSections = modules.reduce((sum, m) => sum + m.sections.length, 0);
  const totalVisited = buildProgress.length;
  const overallPercent = totalSections > 0 ? Math.round((totalVisited / totalSections) * 100) : 0;

  return (
    <nav className="w-[260px] min-w-[260px] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-border bg-card py-4 text-sm hidden lg:block">
      {/* Project/Build context */}
      <div className="px-4 pb-3 mb-3 border-b border-border">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
          {buildTitle}
        </div>
        <div className="text-xs text-muted-foreground">Build {buildSlug.replace("build-", "")}</div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%`, background: "#0D9488" }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{overallPercent}%</span>
        </div>
      </div>

      {/* Overview link */}
      <div className="px-4 py-1.5">
        <Link
          href={`/pilots/${projectSlug}/${buildSlug}`}
          className={`text-sm ${!activeModule ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          Overview
        </Link>
      </div>

      {/* Module list */}
      {modules.map((mod, i) => {
        const isActive = activeModule === mod.slug;
        const progress = getModuleProgress(mod.slug, mod.sections);
        const exercises = getExerciseCount(mod.exercises);
        const isComplete = progress.visited >= progress.total;

        return (
          <div key={mod.slug} className={`mt-1 ${isActive ? "bg-accent/30 border-l-2 border-primary" : ""}`}>
            <Link
              href={`/pilots/${projectSlug}/${buildSlug}/${mod.slug}`}
              className="flex items-center justify-between px-4 py-2"
            >
              <div className="flex items-center gap-2">
                {/* Progress indicator */}
                {isComplete ? (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground">✓</span>
                  </div>
                ) : progress.visited > 0 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: `${(progress.visited / progress.total) * 100}%`,
                        background: "rgba(13,148,136,0.3)",
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-border" />
                )}
                <span className={`text-xs opacity-50 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={isActive ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {mod.title}
                </span>
              </div>
            </Link>

            {/* Expanded sections for active module */}
            {isActive && (
              <div className="ml-10 pb-2 flex flex-col gap-0.5">
                {mod.sections.map((section) => {
                  const isVisited = buildProgress.some(
                    (p) => p.moduleSlug === mod.slug && p.sectionId === section.id
                  );
                  const isSectionActive = activeSection === section.id;

                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-1.5 py-0.5 text-xs"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isVisited ? "#0D9488" : "var(--border)" }}
                      />
                      <span className={
                        isSectionActive
                          ? "text-primary font-medium"
                          : isVisited
                            ? "text-muted-foreground"
                            : "text-muted-foreground opacity-60"
                      }>
                        {section.title}
                      </span>
                    </a>
                  );
                })}
                {exercises.total > 0 && (
                  <div className="text-[10px] mt-1" style={{ color: "#6366F1" }}>
                    {exercises.done}/{exercises.total} exercises
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
