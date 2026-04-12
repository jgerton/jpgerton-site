"use client";

import { PilotSidebar } from "./pilot-sidebar";
import { MobileContextBar } from "./mobile-context-bar";
import { useOnboarding } from "@/hooks/use-onboarding";
import { usePilotProfile } from "@/hooks/use-pilot-profile";

type Section = { id: string; title: string };
type ExerciseRef = { id: string; title: string };
type Module = {
  slug: string;
  title: string;
  sections: Section[];
  exercises: ExerciseRef[];
};

type PilotLayoutProps = {
  projectSlug: string;
  buildSlug: string;
  buildTitle: string;
  modules: Module[];
  children: React.ReactNode;
};

export function PilotLayout({
  projectSlug,
  buildSlug,
  buildTitle,
  modules,
  children,
}: PilotLayoutProps) {
  const { showWelcome, hasCompleted } = useOnboarding();
  const { preferredName } = usePilotProfile();

  // TODO: WelcomeModal integration (Task 14)
  const _shouldShowWelcome = showWelcome && !hasCompleted;
  void _shouldShowWelcome;
  void preferredName;

  return (
    <div className="flex min-h-screen">
      <PilotSidebar
        projectSlug={projectSlug}
        buildSlug={buildSlug}
        buildTitle={buildTitle}
        modules={modules}
      />
      <div className="flex-1 flex flex-col">
        <MobileContextBar modules={modules} />
        <main className="flex-1 px-6 md:px-10 py-8 max-w-3xl">
          {children}
        </main>
      </div>
    </div>
  );
}
