"use client";

import { useState } from "react";
import { PilotSidebar } from "./pilot-sidebar";
import { MobileContextBar } from "./mobile-context-bar";
import { WelcomeModal } from "./welcome-modal";
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
  const { showWelcome, hasCompleted, complete, skip, updateScreen } = useOnboarding();
  const { preferredName } = usePilotProfile();
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const shouldShowWelcome = showWelcome && !hasCompleted;

  return (
    <>
      {(shouldShowWelcome || welcomeOpen) && (
        <WelcomeModal
          preferredName={preferredName ?? undefined}
          modules={modules}
          onComplete={async () => {
            await complete();
            setWelcomeOpen(false);
          }}
          onSkip={async () => {
            await skip();
            setWelcomeOpen(false);
          }}
          onScreenChange={(screen) => updateScreen({ screen })}
        />
      )}

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
    </>
  );
}
