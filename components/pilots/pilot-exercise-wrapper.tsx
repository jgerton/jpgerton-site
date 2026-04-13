"use client";

import { useParams } from "next/navigation";
import { ExerciseCallout } from "./exercise-callout";
import { exerciseConfigs } from "@/content/pilots/freemium-playbook/exercise-configs";

export function PilotExerciseWrapper({
  exerciseId,
  children,
}: {
  exerciseId: string;
  children: React.ReactNode;
}) {
  const params = useParams<{ slug?: string[] }>();
  const slugParts = params.slug ?? [];

  // URL: /pilots/docs/freemium-playbook/build-1/module-1
  // slugParts: ["freemium-playbook", "build-1", "module-1"]
  const projectSlug = slugParts[0] ?? "";
  const buildSlug = slugParts[1] ?? "";

  const config = exerciseConfigs[exerciseId];
  if (!config) return <div>Unknown exercise: {exerciseId}</div>;

  return (
    <ExerciseCallout
      exerciseId={exerciseId}
      title={config.title}
      fields={config.fields}
      prompt={config.prompt}
      emailBody={config.emailBody}
      emailSubject={config.emailSubject}
      projectSlug={projectSlug}
      buildSlug={buildSlug}
    >
      {children}
    </ExerciseCallout>
  );
}
