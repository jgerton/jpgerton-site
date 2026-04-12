"use client";

import { SectionObserver } from "./section-observer";
import { ResumeBanner } from "./resume-banner";
import { ModuleFeedbackForm } from "./module-feedback-form";
import { UXFeedbackPrompt } from "./ux-feedback-prompt";

type Section = { id: string; title: string };

type SectionObserverWrapperProps = {
  projectSlug: string;
  buildSlug: string;
  moduleSlug: string;
  sections: Section[];
  children: React.ReactNode;
};

export function SectionObserverWrapper({
  projectSlug,
  buildSlug,
  moduleSlug,
  sections,
  children,
}: SectionObserverWrapperProps) {
  return (
    <SectionObserver
      projectSlug={projectSlug}
      buildSlug={buildSlug}
      moduleSlug={moduleSlug}
    >
      <UXFeedbackPrompt projectSlug={projectSlug} buildSlug={buildSlug} onOpen={() => {}} />
      <ResumeBanner
        projectSlug={projectSlug}
        buildSlug={buildSlug}
        moduleSlug={moduleSlug}
        sections={sections}
      />
      {children}
      <ModuleFeedbackForm
        projectSlug={projectSlug}
        buildSlug={buildSlug}
        moduleSlug={moduleSlug}
      />
    </SectionObserver>
  );
}
