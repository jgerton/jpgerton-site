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
    <div
      className="rounded-r-lg my-5 px-5 py-4"
      style={{
        borderLeft: "3px solid #6366F1",
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🔨</span>
        <span
          className="font-semibold text-xs uppercase tracking-wider"
          style={{ color: "#6366F1" }}
        >
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
