"use client";

import { ExerciseForm } from "./exercise-form";
import { ExerciseAlternatives } from "./exercise-alternatives";

type Field = { label: string; placeholder?: string };

type ExerciseCalloutProps = {
  exerciseId: string;
  title: string;
  projectSlug: string;
  buildSlug: string;
  fields: Field[];
  prompt: string;
  emailBody: string;
  emailSubject: string;
  children: React.ReactNode;
};

export function ExerciseCallout({
  exerciseId,
  title,
  projectSlug,
  buildSlug,
  fields,
  prompt,
  emailBody,
  emailSubject,
  children,
}: ExerciseCalloutProps) {
  return (
    <div className="rounded-lg border border-callout-exercise/30 bg-callout-exercise/5 dark:border-callout-exercise/20 dark:bg-callout-exercise/5 my-5 px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🔨</span>
        <span className="font-semibold text-xs uppercase tracking-wider text-callout-exercise">
          {title}
        </span>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>

      <ExerciseForm
        exerciseId={exerciseId}
        projectSlug={projectSlug}
        buildSlug={buildSlug}
        fields={fields}
      />

      <ExerciseAlternatives
        prompt={prompt}
        emailBody={emailBody}
        emailSubject={emailSubject}
      />
    </div>
  );
}
