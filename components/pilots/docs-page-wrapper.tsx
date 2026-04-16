"use client";

import { useParams } from "next/navigation";
import { useOnboarding } from "@/hooks/use-onboarding";
import { usePilotProfile } from "@/hooks/use-pilot-profile";
import { WelcomeModal } from "./welcome-modal";
import { ModuleFeedbackForm } from "./module-feedback-form";
import { UXFeedbackPrompt } from "./ux-feedback-prompt";
import { ProgressTracker } from "./progress-tracker";
import { useState, useEffect } from "react";

// Module manifest for welcome modal (minimal, just needs titles)
const buildModules = [
  {
    slug: "module-1",
    title: "The Economics of Free",
    sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }, { id: "s4", title: "" }, { id: "s5", title: "" }, { id: "s6", title: "" }, { id: "s7", title: "" }],
    exercises: [{ id: "ex1", title: "" }, { id: "ex2", title: "" }, { id: "ex3", title: "" }],
  },
  {
    slug: "module-2",
    title: "Your Two-Tier Architecture",
    sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }, { id: "s4", title: "" }, { id: "s5", title: "" }, { id: "s6", title: "" }],
    exercises: [{ id: "ex4", title: "" }, { id: "ex5", title: "" }, { id: "ex6", title: "" }],
  },
  {
    slug: "module-3",
    title: "Seed or Co-Create? Preparing to Launch",
    sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }],
    exercises: [{ id: "ex7", title: "" }, { id: "ex8", title: "" }, { id: "ex9", title: "" }],
  },
  {
    slug: "module-4",
    title: "The First 100 Members",
    sections: [{ id: "s1", title: "" }, { id: "s2", title: "" }, { id: "s3", title: "" }, { id: "s4", title: "" }],
    exercises: [{ id: "ex10", title: "" }, { id: "ex11", title: "" }, { id: "ex12", title: "" }],
  },
];

export function DocsPageWrapper({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug?: string[] }>();
  const slugParts = params.slug ?? [];
  const { showWelcome, hasCompleted, complete, skip, updateScreen } = useOnboarding();
  const { preferredName } = usePilotProfile();
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const shouldShowWelcome = showWelcome && !hasCompleted;

  // Determine if this is a module page (slug has 3+ parts: project/build/module)
  const isModulePage = slugParts.length >= 3;
  const projectSlug = slugParts[0] ?? "";
  const buildSlug = slugParts[1] ?? "";
  const moduleSlug = slugParts[2] ?? "";

  // Apply saved font preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("pilots-font-preference");
    if (saved === "sans") {
      const wrapper = document.querySelector("[data-font-toggle]");
      if (wrapper) wrapper.classList.add("font-sans-override");
    }
  }, []);

  return (
    <div data-font-toggle>
      {(shouldShowWelcome || welcomeOpen) && (
        <WelcomeModal
          preferredName={preferredName ?? undefined}
          modules={buildModules}
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

      <ProgressTracker />

      {children}

      {isModulePage && (
        <>
          <ModuleFeedbackForm
            projectSlug={projectSlug}
            buildSlug={buildSlug}
            moduleSlug={moduleSlug}
          />
          <UXFeedbackPrompt
            projectSlug={projectSlug}
            buildSlug={buildSlug}
            onOpen={() => {}}
          />
        </>
      )}
    </div>
  );
}
